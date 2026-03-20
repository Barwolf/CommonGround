import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig'; 


export const TAG_MAPPING = {
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

export const getDisplayCategories = (rawTags) => {
  if (!rawTags) return [];
  const categories = new Set();
  
  rawTags.forEach(tag => {
    for (const [category, mappedTags] of Object.entries(TAG_MAPPING)) {
      if (mappedTags.includes(tag)) {
        categories.add(category);
      }
    }
  });
  
  return Array.from(categories);
};

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
        // const { latitude, longitude } = position.coords;
        // 33.64794862863894, -117.82891618133397
        // Using a hardcoded location for testing purposes
        const latitude = 33.64794862863894;
        const longitude = -117.82891618133397;
        try {
          const functions = getFunctions(app);
          const recommendFunc = httpsCallable(functions, 'getPersonalizedRecommendations');

          const result = await recommendFunc({
            lat: latitude,
            lng: longitude,
            radiusInM: 15000
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