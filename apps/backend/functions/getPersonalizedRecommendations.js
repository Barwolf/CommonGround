import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import geofire from "geofire-common";

if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();

// Paste the mapping directly in the global scope of the function
const TAG_MAPPING = {
    "Cafes & Treats": ["cafe", "coffee_shop", "coffee_roastery", "tea_house", "tea_store", "acai_shop", "confectionery", "dessert_restaurant", "dessert_shop", "ice_cream_shop", "juice_shop", "snack_bar"],
    "Bars & Nightlife": ["bar", "bar_and_grill", "beer_garden", "cocktail_bar", "comedy_club", "dance_hall", "gastropub", "hookah_bar", "irish_pub", "karaoke", "liquor_store", "lounge_bar", "night_club", "pub", "sports_bar", "wine_bar"],
    "Dining Out": ["american_restaurant", "asian_fusion_restaurant", "asian_restaurant", "brazilian_restaurant", "breakfast_restaurant", "brunch_restaurant", "buffet_restaurant", "californian_restaurant", "chinese_restaurant", "diner", "family_restaurant", "fast_food_restaurant", "fine_dining_restaurant", "fusion_restaurant", "hot_dog_restaurant", "japanese_restaurant", "latin_american_restaurant", "mexican_restaurant", "noodle_shop", "pizza_restaurant", "ramen_restaurant", "restaurant", "sandwich_shop", "vietnamese_restaurant", "food", "food_court", "food_truck"],
    "Nature & Parks": ["botanical_garden", "campground", "city_park", "dog_park", "farm", "garden", "hiking_area", "nature_preserve", "park", "picnic_ground", "rv_park", "state_park", "wildlife_refuge", "fishing_charter", "marina"],
    "Active & Sports": ["athletic_field", "bowling_alley", "fitness_center", "gym", "miniature_golf_course", "skateboard_park", "sports_activity_location", "sports_club", "sports_complex", "stadium", "swimming_pool", "tennis_court"],
    "Arts & Culture": ["art_gallery", "art_studio", "cultural_center", "history_museum", "museum", "sculpture", "historical_landmark", "historical_place"],
    "Live Entertainment": ["auditorium", "concert_hall", "live_music_venue", "movie_theater", "performing_arts_theater", "event_venue"],
    "Games & Amusement": ["amusement_center", "amusement_park", "go_karting_venue", "indoor_playground", "playground", "race_course", "video_arcade", "water_park"],
    "Wellness & Spa": ["beauty_salon", "hair_care", "health", "massage", "massage_spa", "sauna", "skin_care_clinic", "spa", "wellness_center"],
    "Sightseeing": ["cultural_landmark", "observation_deck", "scenic_spot", "tourist_attraction", "visitor_center"],
    "Shopping & Retail": ["bicycle_store", "book_store", "clothing_store", "cosmetics_store", "department_store", "discount_store", "electronics_store", "florist", "gift_shop", "home_goods_store", "market", "shoe_store", "shopping_mall", "sporting_goods_store", "sportswear_store", "thrift_store", "toy_store", "womens_clothing_store"],
    "Hobbies & Learning": ["library", "book_store", "university", "school", "educational_institution"],
    "Community Events": ["association_or_organization", "community_center", "non_profit_organization", "place_of_worship"]
};

export const getPersonalizedRecommendations = onCall({minInstances: 1}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Unauthorized use of API.");

    const uid = request.auth.uid;
    let userProfile;

    // Getting user profile
    try {
        const profileDoc = await db.collection("profiles").doc(uid).get();
        if (!profileDoc.exists) throw new HttpsError("not-found", "User profile does not exist.");
        userProfile = profileDoc.data();
    } catch (error) {
        console.error("Firestore Error:", error);
        throw new HttpsError("internal", "Failed to fetch user profile.");
    }

    // Gets user location and preference data
    const { lat, lng, radiusM = 10000 } = request.data;
    const [userSocialBattery, userPhysicalEnergy] = [userProfile.socialBattery, userProfile.physicalEnergy];

    // Convert user's chosen meta-categories into a Set of raw tags
    const acceptableRawTags = new Set();
    const userCategories = userProfile.interests || [];
    
    userCategories.forEach(category => {
        if (TAG_MAPPING[category]) {
            TAG_MAPPING[category].forEach(tag => acceptableRawTags.add(tag));
        }
    });

    // Selects all locations that are within a radius of the user
    const center = [lat, lng];
    const bounds = geofire.geohashQueryBounds(center, radiusM);
    const promises = [];

    // Fetch using standard Geofire logic
    for (const b of bounds) {
        const q = db.collection('locations')
            .where('geohash', '>=', b[0])
            .where('geohash', '<=', b[1]);

        promises.push(q.get());
    }

    const snapshots = await Promise.all(promises);
    const results = [];

    // Create a Set to track IDs and prevent duplicates
    const seenDocumentIds = new Set();

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const day = days[now.getDay()];
    const time = now.getHours() * 100 + now.getMinutes();

    const WEIGHT_VIBE = 0.80;      // Vibe match multiplier
    const WEIGHT_TAGS = 0.15;      // Rewards matching interests
    const WEIGHT_DISTANCE = 0.05;  // Distance Multiplier

    const MAX_TAG_MATCHES = 3;
    const MAX_SCALE = 10;
    const MAX_VIBE_DIST = Math.pow(MAX_SCALE - 1, 2) + 
                        Math.pow(MAX_SCALE - 1, 2);
    const MAX_KM = radiusM / 1000;

    snapshots.forEach(snap => {
        snap.docs.forEach(doc => {
            if (seenDocumentIds.has(doc.id)) return;
            seenDocumentIds.add(doc.id);

            const data = doc.data();

            const placeLat = Number(data.lat)
            const placeLng = Number(data.lng)

            if (isNaN(placeLat) || isNaN(placeLng)) return;

            if (!isPlaceOpen(data.open_hours, day, time)) return;
            
            const distanceInKm = geofire.distanceBetween([placeLat, placeLng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM > radiusM) return;

            const distanceMatchPercent = 100 - ((distanceInKm / MAX_KM) * 100)

            // SCORING: Count how many of the place's tags are in our acceptable set
            let matches = 0;
            if (data.tags && Array.isArray(data.tags)) {
                matches = data.tags.filter(tag => acceptableRawTags.has(tag)).length;
            }

            const tagMatchPercent = Math.min(100, (matches / MAX_TAG_MATCHES) * 100)

            const vibeDistance = Math.pow(data.sociability - userSocialBattery, 2) + 
                            Math.pow(data.physicality - userPhysicalEnergy, 2);
            const vibeMatchPercent = 100 - ((vibeDistance / MAX_VIBE_DIST) * 100)

            // Adjust vector score based on tag matches
            const vibeScore = (vibeMatchPercent * WEIGHT_VIBE) + (distanceMatchPercent * WEIGHT_DISTANCE) + (tagMatchPercent * WEIGHT_TAGS);

            results.push({
                ...data,
                "tag_matches": matches,
                "vibeScore": vibeScore, 
                "distanceInM": distanceInM
            });
        });
    });

    return results.sort((a, b) => {
        const score_diff = b.vibeScore - a.vibeScore;
        
        if (score_diff === 0) {
            if (b.matches - a.matches === 0) {
                return b.distanceInM - a.distanceInM;
            }

            return b.matches - a.matches;
        }

        return score_diff;
    }).slice(0, 20);
});

function isPlaceOpen(hoursMap, day, time) {
    if (!hoursMap || Object.keys(hoursMap).length === 0) return true; 
    if (!hoursMap[day] || hoursMap[day].length === 0) return false;

    return hoursMap[day].some(window => {
        const { open, close } = window;
        if (close >= open) return open <= time && time <= close;
        return open <= time || time <= close;
    });
}

// Recursively searches an entire object for any NaN values and returns the exact path
function findNaN(obj, path = 'root') {
    if (typeof obj === 'number' && isNaN(obj)) return path;
    if (obj !== null && typeof obj === 'object') {
        for (const key in obj) {
            const badPath = findNaN(obj[key], `${path}.${key}`);
            if (badPath) return badPath;
        }
    }
    return null;
}