import { motion } from "motion/react";
import logo from "../assets/logo.svg";
import React, { useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../services/firebase";
import FileUploader from "../components/core/FileUploader";
import ConversionSelector from "../components/core/ConversionSelector";
import OptionsPanel from "../components/core/OptionsPanel";
import StatusIndicator from "../components/core/StatusIndicator";
import DownloadButton from "../components/core/DownloadButton";
import {
  conversionTypes,
  getOutputOptionsByCategory,
  getCategoryFromFile,
  isFileTypeSupported,
} from "../config/conversionTypes";
import { uploadFile } from "../services/storageService";
import {
  triggerImageConversion,
  triggerAudioConversion,
  triggerDocumentConversion,
  triggerVideoConversion,
} from "../services/conversionService";

export type ConversionStatus =
  | "idle"
  | "ready"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export interface ConversionOptions {
  [key: string]: any;
}

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const getFriendlyErrorMessage = (error: any): string => {
  if (error?.code && typeof error.code === "string") {
    const code = error.code;
    console.error("Firebase HttpsError details:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });

    switch (code) {
      case "invalid-argument":
        return `Invalid request: ${error.message || "Please check selected options."} Try selecting the file and format again.`;
      case "not-found":
        return `File not found: ${error.message || "The source file seems missing. Please re-upload."}`;
      case "resource-exhausted":
        return "Conversion failed: The process took too long or used too much memory. Please try a smaller file or simpler options.";
      case "unavailable":
        return "Service unavailable: The conversion service is temporarily down. Please try again later.";
      case "internal":
        return `Internal error: ${error.message || "An unexpected error occurred on the server. Please try again later."}`;
      case "unauthenticated":
        return "Authentication error: You must be logged in to perform this action.";
      default:
        return `Error: ${error.message || "An unknown error occurred."}`;
    }
  } else if (error instanceof Error) {
    return `Error: ${error.message}`;
  } else {
    console.error("Unknown error type:", error);
    return "An unknown error occurred. Please check the console for details.";
  }
};

const HomePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState<
    string | null
  >(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>(
    {},
  );
  const [conversionStatus, setConversionStatus] =
    useState<ConversionStatus>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const availableTypeValues = conversionTypes.map((cat) => cat.value);
  const availableFormats = selectedCategoryValue
    ? getOutputOptionsByCategory(selectedCategoryValue)
    : [];

  const handleFileSelected = (file: File | null) => {
    setErrorMsg(null);
    setDownloadUrl(null);
    setUploadProgress(0);
    setSelectedFile(null);
    setSelectedCategoryValue(null);
    setSelectedFormat(null);
    setConversionOptions({});
    setConversionStatus("idle");

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxSizeMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      setErrorMsg(`File is too large. Maximum size is ${maxSizeMB} MB.`);
      setConversionStatus("error");
      return;
    }

    if (!isFileTypeSupported(file)) {
      setErrorMsg(
        `File type (${file.type || "unknown"}) is not supported for conversion.`,
      );
      setConversionStatus("error");
      return;
    }

    const category = getCategoryFromFile(file);
    setSelectedFile(file);
    setSelectedCategoryValue(category ? category.value : null);
  };

  const handleTypeChange = (typeValue: string | null) => {
    setSelectedCategoryValue(typeValue);
    setSelectedFormat(null);
    setConversionOptions({});
    setConversionStatus("idle");
    setDownloadUrl(null);
    setErrorMsg(null);
    setUploadProgress(0);
  };

  const handleFormatChange = (format: string | null) => {
    setSelectedFormat(format);
    setConversionOptions({});
    setConversionStatus(
      selectedFile && format && selectedCategoryValue ? "ready" : "idle",
    );
    setDownloadUrl(null);
    setErrorMsg(null);
    setUploadProgress(0);
  };

  const handleOptionsChange = (newOptions: Partial<ConversionOptions>) => {
    setConversionOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  const handleConvertClick = async () => {
    if (!selectedFile || !selectedFormat || !selectedCategoryValue) return;

    console.log("Starting conversion:");
    console.log("File:", selectedFile.name);
    console.log("Category:", selectedCategoryValue);
    console.log("Output format:", selectedFormat);
    console.log("Options:", conversionOptions);

    setConversionStatus("uploading");
    setErrorMsg(null);
    setDownloadUrl(null);
    setUploadProgress(0);

    try {
      const uploadedFilePath = await uploadFile(
        selectedFile,
        setUploadProgress,
      );
      console.log("File uploaded, path:", uploadedFilePath);
      setUploadProgress(100);
      setConversionStatus("processing");

      let result;
      console.log(
        `Selected category: ${selectedCategoryValue}, starting function call...`,
      );

      if (selectedCategoryValue === "image") {
        result = await triggerImageConversion(
          uploadedFilePath,
          selectedFormat,
          conversionOptions,
        );
      } else if (selectedCategoryValue === "audio") {
        result = await triggerAudioConversion(
          uploadedFilePath,
          selectedFormat,
          conversionOptions,
        );
      } else if (selectedCategoryValue === "document") {
        result = await triggerDocumentConversion(
          uploadedFilePath,
          selectedFormat, // Will be 'pdf'
          conversionOptions,
        );
      } else if (selectedCategoryValue === "video") {
        result = await triggerVideoConversion(
          uploadedFilePath,
          selectedFormat,
          conversionOptions,
        );
      } else {
        throw new Error(`Unknown conversion type: ${selectedCategoryValue}`);
      }

      console.log("Conversion completed, getting download URL...");
      const convertedFileRef = ref(storage, result.convertedFile);
      const url = await getDownloadURL(convertedFileRef);
      console.log("Download URL obtained:", url);
      setDownloadUrl(url);

      setConversionStatus("success");
    } catch (error: any) {
      console.error("Error captured during conversion process:", error);
      setConversionStatus("error");
      setErrorMsg(getFriendlyErrorMessage(error));
      setDownloadUrl(null);
      setUploadProgress(0);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <>
        <div className="flex flex-col items-center justify-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backInOut" }}
          >
            <img
              src={logo}
              alt="OpenFiles Logo"
              className="mt-0 mb-3 size-17 pt-0"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "backInOut" }}
            className="mb-8"
          >
            <h1 className="font-['Nunito'] text-4xl font-bold">OpenFiles</h1>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "backInOut" }}
        >
          <div className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <FileUploader
              onFileSelect={handleFileSelected}
              selectedFile={selectedFile}
            />
            <ConversionSelector
              availableTypes={availableTypeValues}
              availableFormats={availableFormats}
              selectedType={selectedCategoryValue}
              selectedFormat={selectedFormat}
              onTypeChange={handleTypeChange}
              onFormatChange={handleFormatChange}
            />
            <OptionsPanel
              selectedType={selectedCategoryValue}
              selectedFormat={selectedFormat}
              options={conversionOptions}
              onOptionChange={handleOptionsChange}
            />
            <StatusIndicator
              status={conversionStatus}
              errorMsg={errorMsg}
              uploadProgress={uploadProgress}
            />

            <button
              type="button"
              onClick={handleConvertClick}
              className="btn w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition duration-150 ease-in-out hover:scale-101 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
              aria-label="Start conversion"
              disabled={conversionStatus !== "ready"}
            >
              {conversionStatus === "ready"
                ? "Convert"
                : conversionStatus === "uploading"
                  ? "Uploading..."
                  : conversionStatus === "processing"
                    ? "Processing..."
                    : conversionStatus === "success"
                      ? "Success!"
                      : conversionStatus === "error"
                        ? "Retry?"
                        : "Convert"}
            </button>
            <DownloadButton
              downloadUrl={downloadUrl}
              fileName={
                selectedFile && selectedFormat
                  ? `converted_${selectedFile.name.split(".").slice(0, -1).join(".")}.${selectedFormat}`
                  : undefined
              }
            />
          </div>
        </motion.div>
      </>
    </main>
  );
};

export default HomePage;
