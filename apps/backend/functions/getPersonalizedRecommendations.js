import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import geofire from "geofire-common";

const db = getFirestore();

export const getPersonalizedRecommendations = onCall({minInstances: 1}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Unauthorized use of API.");
    }

    const uid = request.auth.uid;
    let userProfile;

    try {
        const profileDoc = await db.collection("profiles").doc(uid).get();

        if (!profileDoc.exists) {
            throw new HttpsError("not-found", "User profile does not exist.");
        }

        userProfile = profileDoc.data();
    

    } catch (error) {
        console.error("Firestore Error:", error);
        throw new HttpsError("internal", "Failed to fetch user profile.");
    }

    const { lat, lng, radiusM = 10000 } = request.data;
    const prefVector = FieldValue.vector([userProfile.socialBattery, userProfile.physicalEnergy]);

    const userTags = new Set(userProfile.interests);
    const center = [lat, lng];

    // This tells firestore "Only look for strings starting with these characters"
    const bounds = geofire.geohashQueryBounds(center, radiusM);
    const promises = [];
    for (const b of bounds) {
        const q = db.pipeline()
            .collection('locations')
            .where('geohash', '>=', b[0])
            .where('geohash', '<=', b[1])
            .findNearest({
                field: 'vibe_vector',
                vectorValue: prefVector,
                distanceMeasure: 'euclidean',
                limit: 40,
                distanceResultField: 'vibeScore'
            })
        promises.push(q.execute());
    }

    // fetching data
    const snapshots = await Promise.all(promises);
    const results = [];

    // Getting current time of query
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();

    const day = days[now.getDay()];
    const time = now.getHours() * 100 + now.getMinutes();

    snapshots.forEach(snap => {
        snap.documents.forEach(doc => {
            const data = doc.data();

            // Is it open?
            if (!isPlaceOpen(data.open_hours, day, time)) return;
            
            // Calculate actual distance from user
            const distanceInKm = geofire.distanceBetween([data.lat, data.lng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM > radiusM) return;

            // How far is the place (social/phys) from the user's preference?
            const matches = data.tags.filter(tag => userTags.has(tag)).length;
            const vibeScore = data.vibeScore / (1 + matches)

            results.push({
                ...data,
                vibeScore, // Lower is better
                distanceInM
            });
        });
    });

    // 5. RANKING: Sort by best mix of distance, social + phys difference, and if its open
    return results.sort((a, b) => a.vibeScore - b.vibeScore).slice(0, 20);
});

function isPlaceOpen(hoursMap, day, time) {
    if (!hoursMap || Object.keys(hoursMap).length === 0) return true; // Default to true if unknown

    if (hoursMap[day].length === 0)
        return false

    return hoursMap[day].some(window => {
            const { open, close } = window;

            if (close >= open) {
                return open <= time && time <= close;
            }

            return open <= time || time <= close;
        });
}