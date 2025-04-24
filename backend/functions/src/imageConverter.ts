import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import sharp from "sharp";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

const bucket = admin.storage().bucket();

const SUPPORTED_OUTPUT_FORMATS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tiff",
]);

interface ConvertImageData {
  filePath: string;
  outputFormat: string;
  options?: {
    quality?: number;
  };
}

export const convertImage = functions.https.onCall(
  async (data: any, context) => {
    const { filePath, outputFormat, options } = data.data as ConvertImageData;
    logger.info("Solicitud onCall recibida:", {
      filePath,
      outputFormat,
      options,
    });

    if (!filePath || typeof filePath !== "string") {
      logger.error("Solicitud inválida: falta filePath", data.data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'filePath' argument."
      );
    }
    if (!outputFormat || typeof outputFormat !== "string") {
      logger.error("Solicitud inválida: falta outputFormat", data.data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'outputFormat' argument."
      );
    }

    const lowerOutputFormat = outputFormat.toLowerCase();
    if (!SUPPORTED_OUTPUT_FORMATS.has(lowerOutputFormat)) {
      logger.error(`Formato de salida no soportado: ${outputFormat}`);
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unsupported output format: ${outputFormat}. Supported: ${[
          ...SUPPORTED_OUTPUT_FORMATS,
        ].join(", ")}`
      );
    }

    if (options?.quality !== undefined) {
      if (
        typeof options.quality !== "number" ||
        options.quality < 1 ||
        options.quality > 100
      ) {
        logger.error(`Calidad inválida: ${options.quality}`);
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid quality option. Must be a number between 1 and 100."
        );
      }
    }

    const originalFile = bucket.file(filePath);
    const [exists] = await originalFile.exists();
    if (!exists) {
      logger.error(`Archivo no encontrado en Storage: ${filePath}`);
      throw new functions.https.HttpsError(
        "not-found",
        `Source file not found at path: ${filePath}`
      );
    }

    let tempOriginalPath: string | null = null;
    let tempOutputPath: string | null = null;

    try {
      logger.info(`Iniciando conversión de ${filePath} a ${outputFormat}`);

      tempOriginalPath = path.join(os.tmpdir(), path.basename(filePath));

      logger.info(`Descargando ${filePath} a ${tempOriginalPath}...`);
      await originalFile.download({ destination: tempOriginalPath });
      logger.info("Descarga completada.");

      const outputFileName = `${path.basename(
        filePath,
        path.extname(filePath)
      )}.${outputFormat}`;
      tempOutputPath = path.join(os.tmpdir(), outputFileName);

      logger.info(
        `Convirtiendo archivo a ${outputFormat} en ${tempOutputPath}...`
      );
      let sharpInstance = sharp(tempOriginalPath);

      if (outputFormat === "jpg" || outputFormat === "jpeg") {
        const quality = options?.quality ?? 80;
        sharpInstance = sharpInstance.jpeg({ quality });
        logger.info(`Aplicando calidad JPG: ${quality}`);
      } else if (outputFormat === "png") {
        sharpInstance = sharpInstance.png();
      } else if (outputFormat === "webp") {
        sharpInstance = sharpInstance.webp();
      }

      await sharpInstance.toFile(tempOutputPath);
      logger.info("Conversión completada.");

      const convertedFilePath = `converted/${outputFileName}`;
      logger.info(`Subiendo archivo convertido a ${convertedFilePath}...`);
      await bucket.upload(tempOutputPath, {
        destination: convertedFilePath,
        metadata: {
          contentType: `image/${
            outputFormat === "jpg" ? "jpeg" : outputFormat
          }`,
          cacheControl: "public, max-age=3600",
          contentDisposition: `attachment; filename="${outputFileName}"`,
        },
      });
      logger.info("Subida completada.");

      return {
        message: "Conversión completada con éxito!",
        originalFile: filePath,
        convertedFile: convertedFilePath,
      };
    } catch (error: any) {
      logger.error(`Error convirtiendo ${filePath}:`, error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Internal Server Error during conversion."
      );
    } finally {
      logger.info("Intentando limpiar archivos temporales...");
      if (tempOriginalPath) {
        fs.promises.unlink(tempOriginalPath).catch((err) => {
          logger.error(
            `Error limpiando archivo temporal ${tempOriginalPath}:`,
            err
          );
        });
      }
      if (tempOutputPath) {
        fs.promises.unlink(tempOutputPath).catch((err) => {
          if (err.code !== "ENOENT") {
            logger.error(
              `Error limpiando archivo temporal convertido ${tempOutputPath}:`,
              err
            );
          }
        });
      }
    }
  }
);
