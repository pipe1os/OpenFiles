import React, { useCallback, useRef, useState } from "react";

// Definir las props
interface FileUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  selectedFile,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileSelect(file ?? null);
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleClickArea = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedFile) {
        setIsDragging(true);
      }
    },
    [selectedFile],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (
        event.relatedTarget &&
        event.currentTarget.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      setIsDragging(false);
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedFile) {
        setIsDragging(true);
      }
    },
    [selectedFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      if (selectedFile) return;

      const file = event.dataTransfer.files?.[0];
      onFileSelect(file ?? null);
    },
    [onFileSelect, selectedFile],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedFile && (event.key === "Enter" || event.key === " ")) {
      handleClickArea();
    }
  };

  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ease-in-out ${
        isDragging && !selectedFile
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : "border-gray-300 dark:border-gray-600"
      } ${
        !selectedFile
          ? "cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
          : "bg-gray-50 dark:bg-gray-700/30"
      }`}
      onClick={handleClickArea}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role={selectedFile ? undefined : "button"}
      aria-label={
        selectedFile ? "Selected file" : "Area to select or drag and drop file"
      }
      tabIndex={selectedFile ? -1 : 0}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        accept=".jpg,.jpeg,.png,.mp3,.wav"
      />
      {selectedFile ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="font-semibold">Selected file:</p>
          <p className="max-w-full truncate px-4 text-sm text-gray-600 dark:text-gray-400">
            {selectedFile.name}
          </p>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="btn btn-sm mt-2 rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
            aria-label="Remover archivo seleccionado"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3 flex space-x-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            (Image, Audio, Document, Video files)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
