import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig'; 

export const getRecommendations = (userProfile) => {
  return new Promise((resolve, reject) => {
    const functions = getFunctions(app);
    const recommendFunc = httpsCallable(functions, 'getPersonalizedRecommendations');

    // 1. Get Location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 2. Call Cloud Function
          const result = await recommendFunc({
            lat: latitude,
            lng: longitude,
            radiusInM: 15000, 
            userPrefSocial: userProfile.socialBattery,
            userPrefPhys: userProfile.physicalEnergy,
          });

          resolve(result.data);
        } catch (error) {
          reject(error);
        }
      },
      (geoError) => reject(geoError)
    );
  });
};