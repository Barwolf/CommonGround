import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp, getApps } from "firebase-admin/app";

// 1. Initialize the Admin SDK (required before using Firestore)
if (getApps().length === 0) {
    initializeApp();
}

// 2. Set global options (optional, e.g., region)
setGlobalOptions({ region: "us-central1" });

// 3. Export your function from the other file
export { getPersonalizedRecommendations } from './getPersonalizedRecommendations.js'