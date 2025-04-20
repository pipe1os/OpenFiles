import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";

const bucket = admin.storage().bucket();

const gotenbergApiUrl =
  process.env.GOTENBERG_API_URL || "http://localhost:3000";

interface ConvertDocumentData {
  filePath: string;
  outputFormat: string;
  options?: { [key: string]: any };
}

const getContentType = (format: string): string => {
  switch (format.toLowerCase()) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
};

const SUPPORTED_OUTPUT_FORMATS = new Set(["pdf"]);

export const convertDocument = functions.https.onCall(
  async (data: any, context) => {
    // TODO: Auth check

    const { filePath, outputFormat, options } =
      data.data as ConvertDocumentData;

    if (!filePath || typeof filePath !== "string") {
      functions.logger.error(
        "Bad Request: Missing or invalid filePath",
        data.data
      );
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid filePath"
      );
    }

    if (!outputFormat || typeof outputFormat !== "string") {
      functions.logger.error(
        "Bad Request: Missing or invalid outputFormat",
        data.data
      );
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid outputFormat"
      );
    }

    const lowerOutputFormat = outputFormat.toLowerCase();
    if (!SUPPORTED_OUTPUT_FORMATS.has(lowerOutputFormat)) {
      functions.logger.error(
        `Bad Request: Unsupported document output format: ${outputFormat}`,
        data.data
      );
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unsupported document output format: ${outputFormat}. Supported: ${[
          ...SUPPORTED_OUTPUT_FORMATS,
        ].join(", ")}`
      );
    }

    const originalFile = bucket.file(filePath);
    const [exists] = await originalFile.exists();
    if (!exists) {
      functions.logger.error(`Document file not found in Storage: ${filePath}`);
      throw new functions.https.HttpsError(
        "not-found",
        `Source document file not found at path: ${filePath}`
      );
    }

    functions.logger.info(
      `Received request to convert ${filePath} to ${outputFormat}`
    );

    const originalFileName = path.basename(filePath);
    const tempFilePath = path.join(os.tmpdir(), originalFileName);
    const uniqueId = uuidv4();
    const convertedFileName = `converted_${
      path.parse(originalFileName).name
    }_${uniqueId}.${outputFormat}`;
    const tempConvertedPath = path.join(os.tmpdir(), convertedFileName);
    const targetStoragePath = `converted/${convertedFileName}`;

    try {
      functions.logger.info(`Downloading ${filePath} to ${tempFilePath}...`);
      await originalFile.download({ destination: tempFilePath });
      functions.logger.info(`Downloaded ${filePath} successfully.`);

      const gotenbergEndpoint = `${gotenbergApiUrl}/forms/libreoffice/convert`;
      functions.logger.info(`Using Gotenberg endpoint: ${gotenbergEndpoint}`);

      const formData = new FormData();
      formData.append(
        "files",
        fs.createReadStream(tempFilePath),
        originalFileName
      );

      functions.logger.info(
        `Sending multipart form to Gotenberg at ${gotenbergEndpoint}...`
      );
      const response = await axios.post(gotenbergEndpoint, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      });

      functions.logger.info(
        `Gotenberg conversion successful (Status: ${response.status}).`
      );

      fs.writeFileSync(tempConvertedPath, Buffer.from(response.data));
      functions.logger.info(
        `Saved converted file locally to ${tempConvertedPath}.`
      );

      const contentType = getContentType(outputFormat);
      functions.logger.info(
        `Uploading converted file to ${targetStoragePath} with Content-Type: ${contentType}...`
      );
      await bucket.upload(tempConvertedPath, {
        destination: targetStoragePath,
        metadata: {
          contentType: contentType,
          metadata: {
            originalFile: filePath,
            convertedBy: "gotenberg",
            requestedFormat: outputFormat,
            actualGotenbergContentType:
              response.headers?.["content-type"] || "unknown",
          },
        },
      });
      functions.logger.info(`Uploaded converted file successfully.`);

      return {
        message: `Document conversion to ${outputFormat} successful.`,
        originalFile: filePath,
        convertedFile: targetStoragePath,
      };
    } catch (error: any) {
      functions.logger.error("Error during document conversion:", error);
      let errorMessage = "Internal Server Error during document conversion.";
      let errorCode: functions.https.FunctionsErrorCode = "internal";

      if (axios.isAxiosError(error)) {
        errorMessage = `Gotenberg API error: ${error.message}`;
        if (error.response?.status === 404) {
          errorCode = "not-found";
        } else if (error.response?.status === 400) {
          errorCode = "invalid-argument";
        } else if (error.response?.status === 415) {
          errorCode = "invalid-argument";
          errorMessage =
            `Gotenberg API error: Unsupported Media Type (415). ` +
            `Check input file or Gotenberg endpoint/config.`;
        }
      } else if (error.code === "ENOENT" && error.syscall === "open") {
        errorMessage = `File system error: ${error.message}`;
        errorCode = "not-found";
      }

      throw new functions.https.HttpsError(errorCode, errorMessage, error);
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          functions.logger.info(`Cleaned up temporary file: ${tempFilePath}`);
        }
        if (fs.existsSync(tempConvertedPath)) {
          fs.unlinkSync(tempConvertedPath);
          functions.logger.info(
            `Cleaned up temporary converted file: ${tempConvertedPath}`
          );
        }
      } catch (cleanupError) {
        functions.logger.error(
          "Error cleaning up temporary files:",
          cleanupError
        );
      }
    }
  }
);
