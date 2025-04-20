import { initializeApp } from "firebase/app";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket
) {
  console.error(
    "Error: Missing Firebase configuration variables in environment (.env.local).",
  );
}

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
const functionsInstance = getFunctions(app, "us-central1");

if (import.meta.env.DEV) {
  console.log("Development mode: Connecting to Firebase Emulators...");

  try {
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    console.log("- Storage Emulator connected on port 9199");
  } catch (error) {
    console.error("Error connecting to Storage Emulator:", error);
  }

  try {
    connectFunctionsEmulator(functionsInstance, "127.0.0.1", 5001);
    console.log("- Functions Emulator connected on port 5001");
  } catch (error) {
    console.error("Error connecting to Functions Emulator:", error);
  }
}

export { app, storage, functionsInstance as functions };
