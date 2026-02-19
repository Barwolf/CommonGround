import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig'; 

export const getRecommendations = (userProfile) => {
  console.log("🏃 Utility started with profile:", userProfile);

  return new Promise((resolve, reject) => {
    // 1. Check if geolocation even exists
    if (!navigator.geolocation) {
      return reject("Geolocation not supported by browser");
    }

    console.log("🛰️ Requesting location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("📍 Location found:", position.coords.latitude, position.coords.longitude);
        const { latitude, longitude } = position.coords;

        try {
          const functions = getFunctions(app);
          const recommendFunc = httpsCallable(functions, 'getPersonalizedRecommendations');

          const result = await recommendFunc({
            lat: latitude,
            lng: longitude,
            radiusInM: 15000, 
            userPrefSocial: userProfile.socialBattery,
            userPrefPhys: userProfile.physicalEnergy,
          });

          console.log("✅ Success! Places received:", result.data.length);
          resolve(result.data);
        } catch (error) {
          console.error("❌ Cloud Function Error:", error);
          reject(error);
        }
      },
      (geoError) => {
        console.error("❌ Geolocation Error:", geoError.message);
        reject(geoError);
      },
      { timeout: 10000 } // Give up after 10 seconds
    );
  });
};