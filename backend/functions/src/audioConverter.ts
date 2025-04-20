import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const bucket = admin.storage().bucket();

const SUPPORTED_OUTPUT_FORMATS = new Set(["mp3", "wav", "ogg", "aac", "flac"]);

interface ConvertAudioData {
  filePath: string;
  outputFormat: string;
  options?: {};
}

export const convertAudio = functions.https.onCall(
  async (data: any, context) => {
    const { filePath, outputFormat, options } = data.data as ConvertAudioData;
    logger.info("Solicitud onCall de audio recibida:", {
      filePath,
      outputFormat,
      options,
    });

    if (!filePath || typeof filePath !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Function must be called with a valid 'filePath' argument."
      );
    }
    if (!outputFormat || typeof outputFormat !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Function must be called with a valid 'outputFormat' argument."
      );
    }

    const lowerOutputFormat = outputFormat.toLowerCase();
    if (!SUPPORTED_OUTPUT_FORMATS.has(lowerOutputFormat)) {
      logger.error(`Formato de salida de audio no soportado: ${outputFormat}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unsupported audio output format: ${outputFormat}. Supported: ${[
          ...SUPPORTED_OUTPUT_FORMATS,
        ].join(", ")}`
      );
    }

    const originalFile = bucket.file(filePath);
    const [exists] = await originalFile.exists();
    if (!exists) {
      logger.error(`Archivo de audio no encontrado en Storage: ${filePath}`);
      throw new functions.https.HttpsError(
        "not-found",
        `Source audio file not found at path: ${filePath}`
      );
    }

    const tempOriginalPath = path.join(os.tmpdir(), path.basename(filePath));
    const outputFileName = `${path.basename(
      filePath,
      path.extname(filePath)
    )}.${outputFormat}`;
    const tempOutputPath = path.join(os.tmpdir(), outputFileName);
    const convertedFilePath = `converted/${outputFileName}`;

    try {
      logger.info(
        `Iniciando conversión de audio ${filePath} a ${outputFormat}`
      );

      logger.info(`Descargando ${filePath} a ${tempOriginalPath}...`);
      await originalFile.download({ destination: tempOriginalPath });
      logger.info("Descarga de audio completada.");

      logger.info(
        `Convirtiendo audio a ${outputFormat} en ${tempOutputPath}...`
      );
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempOriginalPath)
          .toFormat(outputFormat)
          .on("error", (err) => {
            logger.error("Error durante la conversión ffmpeg:", err);
            reject(
              new functions.https.HttpsError(
                "internal",
                err.message || "Audio conversion failed."
              )
            );
          })
          .on("end", () => {
            logger.info("Conversión ffmpeg finalizada.");
            resolve();
          })
          .save(tempOutputPath);
      });

      logger.info(`Subiendo audio convertido a ${convertedFilePath}...`);
      await bucket.upload(tempOutputPath, {
        destination: convertedFilePath,
        metadata: {
          contentType: `audio/${outputFormat}`,
          cacheControl: "public, max-age=3600",
        },
      });
      logger.info("Subida de audio completada.");

      return {
        message: "Conversión de audio completada con éxito!",
        originalFile: filePath,
        convertedFile: convertedFilePath,
      };
    } catch (error: any) {
      logger.error(`Error convirtiendo audio ${filePath}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      } else {
        throw new functions.https.HttpsError(
          "internal",
          error.message || "Internal Server Error during audio conversion."
        );
      }
    } finally {
      logger.info("Intentando limpiar archivos temporales de audio...");
      if (fs.existsSync(tempOriginalPath)) {
        fs.promises.unlink(tempOriginalPath).catch((err) => {
          logger.error(`Error limpiando ${tempOriginalPath}:`, err);
        });
      }
      if (fs.existsSync(tempOutputPath)) {
        fs.promises.unlink(tempOutputPath).catch((err) => {
          logger.error(`Error limpiando ${tempOutputPath}:`, err);
        });
      }
    }
  }
);
