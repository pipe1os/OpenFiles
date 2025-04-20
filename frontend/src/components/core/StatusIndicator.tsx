import React from "react";
import { ConversionStatus } from "../../pages/HomePage";

interface StatusIndicatorProps {
  status: ConversionStatus;
  errorMsg?: string | null;
  uploadProgress?: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  errorMsg,
  uploadProgress,
}) => {
  const statusConfig: {
    [key in ConversionStatus]: { message: string; className: string };
  } = {
    idle: {
      message: "Select a file and format to start.",
      className: "text-gray-500 dark:text-gray-400",
    },
    ready: {
      message: "Ready to convert. Click 'Convert'.",
      className: "text-blue-600 dark:text-blue-400 font-semibold",
    },
    uploading: {
      message: "Uploading file...",
      className: "text-yellow-600 dark:text-yellow-400 animate-pulse",
    },
    processing: {
      message: "Processing conversion...",
      className: "text-yellow-600 dark:text-yellow-400 animate-pulse",
    },
    success: {
      message: "Conversion completed successfully!",
      className: "text-green-600 dark:text-green-400 font-semibold",
    },
    error: {
      message: `Error: ${errorMsg || "An error occurred."}`,
      className: "text-red-600 dark:text-red-400 font-semibold",
    },
  };

  const currentConfig = statusConfig[status];

  const getBorderColor = () => {
    switch (status) {
      case "ready":
        return "border-blue-500 dark:border-blue-400";
      case "uploading":
      case "processing":
        return "border-yellow-500 dark:border-yellow-400";
      case "success":
        return "border-green-500 dark:border-green-400";
      case "error":
        return "border-red-500 dark:border-red-400";
      default:
        return "border-gray-300 dark:border-gray-600"; // idle
    }
  };

  const renderProgressBar = () => {
    if (status !== "uploading" || uploadProgress === undefined) return null;
    const progressPercent = Math.round(uploadProgress);
    return (
      <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-600">
        <div
          className="h-2.5 rounded-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
        ></div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-[50px] rounded-md border bg-gray-100 p-4 transition-colors duration-300 dark:bg-gray-700 ${getBorderColor()}`}
    >
      <p className={`text-center text-sm ${currentConfig.className}`}>
        {status === "uploading" ? "Uploading file..." : currentConfig.message}
      </p>
      {renderProgressBar()}
    </div>
  );
};

export default StatusIndicator;
