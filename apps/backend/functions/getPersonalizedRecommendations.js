const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const geofire = require("geofire-common");

exports.getPersonalizedRecommendations = onCall(async (request) => {
    const { lat, lng, userPrefSocial, userPrefPhys, radiusM = 10000 } = request.data;
    const db = getFirestore();
    const center = [lat, lng];

    // This tells firestore "Only look for strings starting with these characters"
    const bounds = geofire.geohashQueryBounds(center, radiusM);
    const promises = [];
    for (const b of bounds) {
        const q = db.collection('locations')
            .orderBy('geohash')
            .startAt(b[0])
            .endAt(b[1]);
        promises.push(q.get());
    }

    // fetching data
    const snapshots = await Promise.all(promises);
    const results = [];

    snapshots.forEach(snap => {
        snap.forEach(doc => {
            const data = doc.data();
            
            // Calculate actual distance from user
            const distanceInKm = geofire.distanceBetween([data.lat, data.lng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusM) {
                // How far is the place (social/phys) from the user's preference?
                const socialDiff = Math.abs(data.sociability - userPrefSocial);
                const physDiff = Math.abs(data.physicality - userPrefPhys);
                const vibeScore = Math.sqrt(Math.pow(socialDiff, 2) + Math.pow(physDiff, 2));

                // Is it open?
                const openNow = checkIsOpen(data.open_hours);

                if (openNow) {
                    results.push({
                        ...data,
                        vibeScore, // Lower is better
                        distanceInM
                    });
                }
            }
        });
    });

    // 5. RANKING: Sort by best mix of distance, social + phys difference, and if its open
    return results.sort((a, b) => a.vibeScore - b.vibeScore).slice(0, 20);
});

// Helper to parse your JSON's "Monday: 11:00 AM – 10:00 PM" format
function checkIsOpen(hoursMap) {
    if (!hoursMap || Object.keys(hoursMap).length === 0) return true; // Default to true if unknown

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    // Adjust for your local timezone if necessary
    const day = days[now.getDay()];
    const time = now.getHours() * 100 + now.getMinutes();

    if (hoursMap[day].length === 0)
        return false

    let is_in_bounds = true;

    hoursMap[day].forEach(hourMap => {
        if (hourMap["open"] > time || hourMap["close"] < time)
            is_in_bounds = false;
    });

    return is_in_bounds; 
}