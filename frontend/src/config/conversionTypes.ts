export interface ConversionOption {
  value: string; 
  label: string; 

}

export interface ConversionCategory {
  label: string; 
  value: string; 
  acceptedMimeTypes: string[]; 
  outputOptions: ConversionOption[];
}

export const conversionTypes: ConversionCategory[] = [
  {
    label: "Image (JPG, PNG, WEBP, GIF)",
    value: "image",
    acceptedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ],
    outputOptions: [
    
      { value: "jpg", label: "JPG" /*  */ },
      { value: "png", label: "PNG" /*  */ },
      { value: "webp", label: "WEBP" },
      { value: "gif", label: "GIF" },
      { value: "bmp", label: "BMP" },
      { value: "tiff", label: "TIFF" },
    ],
  },
  {
    label: "Audio (MP3, WAV, OGG, AAC)",
    value: "audio",
    acceptedMimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
    ],
    outputOptions: [
      { value: "mp3", label: "MP3" },
      { value: "wav", label: "WAV" },
      { value: "ogg", label: "OGG" },
      { value: "aac", label: "AAC" },
      { value: "flac", label: "FLAC" },
    ],
  },
  {
    label: "Document (DOCX)",
    value: "document",
    acceptedMimeTypes: [
      "text/plain", 
      "text/markdown", 
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "application/rtf",
    ],
    outputOptions: [
      { value: "pdf", label: "PDF" },
    ],
  },

  {
    label: "Video (MP4, WEBM, AVI, MOV)",
    value: "video",
    acceptedMimeTypes: [
      "video/mp4",
      "video/webm",
      "video/avi",
      "video/quicktime", 
      "video/x-msvideo", 
      "video/x-matroska", 
    ],
    outputOptions: [
      { value: "mp4", label: "MP4" },
      { value: "webm", label: "WEBM" },
      { value: "avi", label: "AVI" },
      { value: "mov", label: "MOV" },
      { value: "mkv", label: "MKV" },
    ],
  },

];



export const getOutputOptionsByCategory = (
  categoryValue: string,
): ConversionOption[] => {
  const category = conversionTypes.find((c) => c.value === categoryValue);
  return category ? category.outputOptions : [];
};


export const getAcceptedMimeTypesByCategory = (
  categoryValue: string,
): string[] => {
  const category = conversionTypes.find((c) => c.value === categoryValue);
  return category ? category.acceptedMimeTypes : [];
};


export const isFileTypeSupported = (file: File | null): boolean => {
  if (!file) return false;
  return conversionTypes.some((category) =>
    category.acceptedMimeTypes.includes(file.type),
  );
};


export const getCategoryFromFile = (
  file: File | null,
): ConversionCategory | undefined => {
  if (!file) return undefined;
  return conversionTypes.find((category) =>
    category.acceptedMimeTypes.includes(file.type),
  );
};
