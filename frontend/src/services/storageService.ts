import {
  ref,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./firebase";

export type ProgressCallback = (progress: number) => void;

/**
 *
 * @param file
 * @param onProgress
 * @returns
 */
const uploadFile = (
  file: File,
  onProgress?: ProgressCallback,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Error uploading file:", error);
        reject(error);
        reject(error);
      },
      () => {
        console.log(`File uploaded successfully to: ${filePath}`);
        resolve(filePath);
      },
    );
  });
};

export { uploadFile };
