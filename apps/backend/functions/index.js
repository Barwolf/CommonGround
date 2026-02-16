const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");

// 1. Initialize the Admin SDK (required before using Firestore)
initializeApp();

// 2. Set global options (optional, e.g., region)
setGlobalOptions({ region: "us-central1" });

// 3. Export your function from the other file
const { getPersonalizedRecommendations } = require("./getPersonalizedRecommendations");
exports.getPersonalizedRecommendations = getPersonalizedRecommendations;