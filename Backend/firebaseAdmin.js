import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

let db = null;

try {
  // Prevent double initialization
  if (!admin.apps.length) {
    let serviceAccount = null;

    // 1. Try Environment Variable (Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        console.log("Attempting to initialize Firebase from Environment Variable...");
        const parsedContext = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        const formattedKey = parsedContext.private_key.replace(/\\n/g, "\n");
        serviceAccount = {
          ...parsedContext,
          private_key: formattedKey,
          privateKey: formattedKey,
        };
      } catch (e) {
        console.error("CRITICAL: Error parsing FIREBASE_SERVICE_ACCOUNT env var:", e);
      }
    }

    // 2. Try Local File (Development) - Only if not already found
    if (!serviceAccount && fs.existsSync(serviceAccountPath)) {
      try {
        console.log("Attempting to initialize Firebase from Local File...");
        const parsedContext = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        const formattedKey = parsedContext.private_key.replace(/\\n/g, "\n");
        serviceAccount = {
          ...parsedContext,
          private_key: formattedKey,
          privateKey: formattedKey,
        };
      } catch (e) {
        console.error("CRITICAL: Error reading/parsing serviceAccountKey.json:", e);
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.error("CRITICAL: No valid Firebase credentials found in Env or File! Check your configuration.");
    }
  }

  // Get Firestore Instance (Safe to call multiple times)
  if (admin.apps.length) {
    db = admin.firestore();
    // Use try-catch for settings to avoid "settings already frozen" error
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Settings likely already applied, safe to ignore
    }
  }

} catch (error) {
  console.error("General Firebase Initialization Error:", error);
}

export { db, admin };
