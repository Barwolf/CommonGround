import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig'; 

export const CATEGORY_IMAGES = {
    "Cafes & Treats": [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", // Cozy interior
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", // Coffee & plants
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800", // Latte art
        "https://images.unsplash.com/photo-1559925393-8be0ec41b5ec?w=800", // Window seating
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800"  // Pastries
    ],
    "Bars & Nightlife": [
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", // Cocktails
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800", // Moody bar
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800", // Craft beer
        "https://images.unsplash.com/photo-1541513200133-72064ec72c41?w=800", // Neon nightlife
        "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=800"  // Bar seating
    ],
    "Dining Out": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", // Restaurant vibe
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800", // Fine dining
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", // Outdoor dining
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", // Plated food
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"  // Rustic dinner
    ],
    "Nature & Parks": [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", // Forest trail
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800", // Scenic lake
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", // Park bench
        "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800", // Sunlit trees
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"  // Meadow
    ],
    "Active & Sports": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", // Weights/Gym
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800", // Yoga studio
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800", // Running path
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", // Swimming pool
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800"  // Basketball court
    ],
    "Arts & Culture": [
        "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800", // Art gallery
        "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800", // Museum hall
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", // Paint studio
        "https://images.unsplash.com/photo-1518998053502-51dd0c61cd2a?w=800", // Sculptures
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"  // Murals
    ],
    "Live Entertainment": [
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800", // Concert crowd
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", // Stage lights
        "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", // Live jazz
        "https://images.unsplash.com/photo-1514525253361-b83f8a9e27c0?w=800", // Theater stage
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"  // Outdoor event
    ],
    "Games & Amusement": [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800", // Arcade
        "https://images.unsplash.com/photo-1610890732551-21346f043686?w=800", // Board games
        "https://images.unsplash.com/photo-1538356111083-d211f122d80d?w=800", // Bowling
        "https://images.unsplash.com/photo-1533353416349-80dc4846a48e?w=800", // Theme park
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800"  // Billiards
    ],
    "Wellness & Spa": [
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", // Massage room
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800", // Aromatherapy
        "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800", // Spa products
        "https://images.unsplash.com/photo-1540555700478-4be289fbecee?w=800", // Zen space
        "https://images.unsplash.com/photo-1519415510236-85591bf593e6?w=800"  // Skincare/Treatments
    ],
    "Sightseeing": [
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800", // European street
        "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800", // Landmarks
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", // Viewpoint
        "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800", // City architecture
        "https://images.unsplash.com/photo-1503152394-c57de29ff10b?w=800"  // Historic building
    ],
    "Shopping & Retail": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800", // Boutique
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800", // Market stall
        "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800", // Minimalist shop
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800", // Clothing racks
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"  // Shopping center
    ],
    "Hobbies & Learning": [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", // Library/Books
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", // Studying
        "https://images.unsplash.com/photo-1528731708534-816fe59f90cb?w=800", // Pottery/Crafts
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800", // Classroom
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"  // Painting
    ],
    "Community Events": [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800", // Group gathering
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", // Picnics
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800", // Event hall
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800", // Volunteers
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800"  // Outdoor market
    ]
};

export const getCategoryImage = (tags) => {
    const categories = getDisplayCategories(tags);
    
    // Use first category found or default to Community Events
    const primary = categories[0] || "Community Events";
    
    // Grab the array for that category
    const imageList = CATEGORY_IMAGES[primary] || CATEGORY_IMAGES["Community Events"];

    // Just pick a random index between 0 and 4
    const randomIndex = Math.floor(Math.random() * imageList.length);

    return imageList[randomIndex];
};

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