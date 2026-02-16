const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const geofire = require("geofire-common");

exports.getPersonalizedRecommendations = onCall(async (request) => {
    const { lat, lng, userSocial, userPhys, radiusM = 10000 } = request.data;
    const db = getFirestore();
    const center = [lat, lng];

    // 1. USE THE INDEX: Calculate Geohash bounds
    // This tells Firestore: "Only look for strings starting with these characters"
    const bounds = geofire.geohashQueryBounds(center, radiusM);
    const promises = [];
    for (const b of bounds) {
        const q = db.collection('activities')
            .orderBy('geohash')
            .startAt(b[0])
            .endAt(b[1]);
        promises.push(q.get());
    }

    // 2. FETCH DATA
    const snapshots = await Promise.all(promises);
    const results = [];

    snapshots.forEach(snap => {
        snap.forEach(doc => {
            const data = doc.data();
            
            // Calculate actual distance from user
            const distanceInKm = geofire.distanceBetween([data.lat, data.lng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusM) {
                // 3. SCORING: Euclidean Distance for the "Vibe"
                // How far is the place (social/phys) from the user's preference?
                const socialDiff = Math.abs(data.sociability - userSocial);
                const physDiff = Math.abs(data.physicality - userPhys);
                const vibeScore = Math.sqrt(Math.pow(socialDiff, 2) + Math.pow(physDiff, 2));

                // 4. FILTERING: Is it open?
                const openNow = checkIsOpen(data.open_hours);

                if (openNow) {
                    results.push({
                        id: doc.id,
                        ...data,
                        vibeScore, // Lower is better
                        distanceInM
                    });
                }
            }
        });
    });

    // 5. RANKING: Sort by best vibe match (vibeScore)
    return results.sort((a, b) => a.vibeScore - b.vibeScore).slice(0, 20);
});

// Helper to parse your JSON's "Monday: 11:00 AM – 10:00 PM" format
function checkIsOpen(hoursArray) {
    if (!hoursArray || hoursArray.length === 0) return true; // Default to true if unknown
    
    const now = new Date();
    // Adjust for your local timezone if necessary
    const day = now.toLocaleString('en-US', { weekday: 'long' }); 
    const timeStr = hoursArray.find(s => s.startsWith(day));
    
    if (!timeStr || timeStr.includes("Closed")) return false;
    
    // Simple check: for production, you'd use a library like 'luxon' 
    // to compare the specific hours in the string to 'now'
    return true; 
}