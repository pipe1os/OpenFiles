import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";

try {
  admin.initializeApp();
} catch (e) {
  console.log("Firebase Admin ya inicializado.");
}

import { logger } from "firebase-functions";

export { convertImage } from "./imageConverter";
export { convertAudio } from "./audioConverter";
export { convertDocument } from "./documentConverter";
export { convertVideo } from "./videoConverter";
