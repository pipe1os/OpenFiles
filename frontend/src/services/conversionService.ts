import { ConversionOptions } from "../pages/HomePage";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

interface ConversionSuccessResponse {
  message: string;
  originalFile: string;
  convertedFile: string;
}

interface ConversionRequestData {
  filePath: string;
  outputFormat: string;
  options?: ConversionOptions;
}

/**
 *
 * @param filePath
 * @param outputFormat
 * @param options
 * @returns
 */
const triggerImageConversion = async (
  filePath: string,
  outputFormat: string,
  options?: ConversionOptions,
): Promise<ConversionSuccessResponse> => {
  console.log("Calling image function (onCall)...");
  console.log("Data sent:", { filePath, outputFormat, options });
  try {
    const convertImage = httpsCallable<
      ConversionRequestData,
      ConversionSuccessResponse
    >(functions, "convertImage");
    const result = await convertImage({ filePath, outputFormat, options });
    console.log("Image function response:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error calling image conversion function:", error);
    throw error;
  }
};

const triggerAudioConversion = async (
  filePath: string,
  outputFormat: string,
  options?: ConversionOptions,
): Promise<ConversionSuccessResponse> => {
  console.log("Calling audio function (onCall)...");
  console.log("Audio data sent:", { filePath, outputFormat, options });
  try {
    const convertAudio = httpsCallable<
      ConversionRequestData,
      ConversionSuccessResponse
    >(functions, "convertAudio");
    const result = await convertAudio({ filePath, outputFormat, options });
    console.log("Audio function response:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error calling audio conversion function:", error);
    throw error;
  }
};

/**
 *
 * @param filePath
 * @param outputFormat
 * @param options
 * @returns
 */
const triggerDocumentConversion = async (
  filePath: string,
  outputFormat: string, // Primarily 'pdf'
  options?: ConversionOptions,
): Promise<ConversionSuccessResponse> => {
  console.log("Calling document function (onCall)...");
  console.log("Document data sent:", { filePath, outputFormat, options });
  try {
    const convertDocument = httpsCallable<
      ConversionRequestData,
      ConversionSuccessResponse
    >(functions, "convertDocument");
    const result = await convertDocument({ filePath, outputFormat, options });
    console.log("Document function response:", result.data);
    return result.data;
  } catch (error) {
    console.error("Error calling document conversion function:", error);
    throw error;
  }
};

const triggerVideoConversion = async (
  filePath: string,
  outputFormat: string,
  options?: ConversionOptions,
): Promise<ConversionSuccessResponse> => {
  console.log("Calling video function (onCall)...");
  console.log("Video data sent:", { filePath, outputFormat, options });

  try {
    const convertVideo = httpsCallable<
      ConversionRequestData,
      ConversionSuccessResponse
    >(functions, "convertVideo");

    const result = await convertVideo({ filePath, outputFormat, options });

    console.log("Video function response:", result.data);
    return result.data;
  } catch (error: any) {
    console.error("Error calling video conversion function:", error);
    throw new Error(
      `Video conversion failed: ${error.message || "Unknown error"}`,
    );
  }
};

export {
  triggerImageConversion,
  triggerAudioConversion,
  triggerDocumentConversion,
  triggerVideoConversion,
};
