import React from "react";

interface DownloadButtonProps {
  downloadUrl?: string | null;
  fileName?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadUrl,
  fileName = "converted_file",
}) => {
  if (!downloadUrl) {
    return null;
  }

  return (
    <a
      href={downloadUrl}
      download={fileName}
      className="btn mt-4 block w-full rounded-md bg-green-600 px-4 py-2 text-center font-semibold text-white transition duration-150 ease-in-out hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
      aria-label={`Download ${fileName}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Download Converted File
    </a>
  );
};

export default DownloadButton;
