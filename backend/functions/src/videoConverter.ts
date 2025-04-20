import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = admin.storage().bucket();

const SUPPORTED_OUTPUT_FORMATS = new Set(["mp4", "webm", "avi", "mov", "mkv"]);

export const convertVideo = functions.https.onCall(
  async (data: any, context) => {
    const { filePath, outputFormat, options } = data.data;

    if (!filePath || typeof filePath !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'filePath' argument."
      );
    }
    if (!outputFormat || typeof outputFormat !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'outputFormat' argument."
      );
    }

    const lowerOutputFormat = outputFormat.toLowerCase();
    if (!SUPPORTED_OUTPUT_FORMATS.has(lowerOutputFormat)) {
      functions.logger.error(
        `Formato de salida de video no soportado: ${outputFormat}`
      );
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unsupported video output format: ${outputFormat}. Supported: ${[
          ...SUPPORTED_OUTPUT_FORMATS,
        ].join(", ")}`
      );
    }

    const originalFile = storage.file(filePath);
    const [exists] = await originalFile.exists();
    if (!exists) {
      functions.logger.error(
        `Archivo de video no encontrado en Storage: ${filePath}`
      );
      throw new functions.https.HttpsError(
        "not-found",
        `Source video file not found at path: ${filePath}`
      );
    }

    const baseFileName = path.basename(filePath);
    const inputFileName = baseFileName;
    const tempInputPath = path.join(os.tmpdir(), inputFileName);
    const outputFileName = `${path.parse(inputFileName).name}.${outputFormat}`;
    const tempOutputPath = path.join(os.tmpdir(), outputFileName);
    const outputFilePath = `converted/${outputFileName}`;

    console.log(`Starting video conversion for: ${filePath}`);
    console.log(`Input temp: ${tempInputPath}`);
    console.log(`Output temp: ${tempOutputPath}`);
    console.log(`Output storage: ${outputFilePath}`);
    console.log(`Target format: ${outputFormat}`);
    console.log(`Options: ${JSON.stringify(options)}`);

    try {
      console.log(`Downloading ${filePath} to ${tempInputPath}...`);
      await originalFile.download({ destination: tempInputPath });
      console.log("Download complete.");

      console.log("Starting ffmpeg conversion...");
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .toFormat(outputFormat)
          .on("end", () => {
            console.log("ffmpeg conversion finished.");
            resolve();
          })
          .on("error", (err) => {
            console.error("ffmpeg error:", err);
            reject(
              new functions.https.HttpsError(
                "internal",
                "Video conversion failed.",
                err.message
              )
            );
          })
          .save(tempOutputPath);
      });

      console.log(`Uploading ${outputFileName} to ${outputFilePath}...`);
      await storage.upload(tempOutputPath, {
        destination: outputFilePath,
        metadata: {
          contentType: `video/${outputFormat}`,
        },
      });
      console.log("Upload complete.");

      fs.unlinkSync(tempInputPath);
      fs.unlinkSync(tempOutputPath);
      console.log("Temporary files cleaned up.");

      return {
        message: "Video converted successfully!",
        originalFile: filePath,
        convertedFile: outputFilePath,
      };
    } catch (error: any) {
      console.error("Error during video conversion process:", error);

      try {
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
      } catch (cleanupError) {
        console.error(
          "Error cleaning up temporary files after error:",
          cleanupError
        );
      }

      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred during video conversion.",
          error.message
        );
      }
    }
  }
);
