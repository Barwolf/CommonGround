import requests
import json
import gzip
import time
import random

from collections import defaultdict

import os
import dotenv

dotenv.load_dotenv('./.env')
API_KEY = os.getenv("GOOGLE_API_KEY")
SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

# Boundaries for Irvine, CA
LAT_MIN, LAT_MAX = 33.620, 33.765
LNG_MIN, LNG_MAX = -117.870, -117.700

# Comprehensive Social & Physicality Queries
QUERIES = [
    "card shops game nights", "hiking trails nature preserves", 
    "yoga pilates studios", "rock climbing gyms", "pickleball courts",
    "boba social cafes", "event centers and venues", "nightclubs dance clubs",
    "public parks", "community centers", "bowling arcade", 
    "water sports kayaking", "art studios workshops", "lifestyle centers",
    "renaissance fair and themed festivals"
]

# Lexicon Weights
SOC_LEXICON = {"packed": 4, "tournament": 5, "league": 3, "social": 3, "busy": 2, "quiet": -4, "solo": -4, "empty": -5}
PHYS_LEXICON = {"strenuous": 5, "climb": 4, "sweat": 3, "workout": 4, "hiking": 3, "sitting": -6, "indoor": -3, "reading": -7}

#Social & Physical Weights
SOCIAL_WEIGHTS = {
    # High Social / High People Density
    "night_club": 10, "dance_hall": 10, "karaoke": 10, "comedy_club": 10,
    "bar": 9, "pub": 9, "beer_garden": 9, "live_music_venue": 9,
    "stadium": 9, "community_center": 8, "event_venue": 8, "bowling_alley": 8,
    "amusement_park": 8, "dog_park": 8, "picnic_ground": 7, "bbq_area": 8,
    # Moderate Social / Conversation
    "cafe": 7, "coffee_shop": 7, "restaurant": 6, "ice_cream_shop": 5,
    "museum": 4, "art_gallery": 4, "book_store": 3,
    # Low Social / Solo Focus
    "library": 2, "spa": 2, "sauna": 2
}

PHYSICAL_WEIGHTS = {
    # High Physical Exertion (8-10)
    "gym": 10, "fitness_center": 10, "rock_climbing_gym": 10, 
    "hiking_area": 9, "sports_complex": 9, "swimming_pool": 8,
    "tennis_court": 9, "yoga_studio": 7, "cycling_park": 9,
    # Moderate Physical / Walking (4-7)
    "park": 6, "amusement_park": 6, "zoo": 5, "botanical_garden": 4,
    "golf_course": 6, "playground": 7, "scenic_spot": 4,
    # Low Physical / Stationary (0-3)
    "movie_theater": 1, "cafe": 1, "restaurant": 1, "bar": 1,
    "library": 0, "museum": 2, "night_club": 3 # Clubs get a 3 for dancing
}

# Negation and Intensity
NEGATIONS = {"not", "never", "no", "isnt", "wasnt", "dont"}
MODIFIERS = {"very": 1.5, "extremely": 2.0, "super": 1.5, "slightly": 0.5}


def get_grid_centers(steps=4):
    """Divides Irvine into {steps * steps} search zones."""
    lat_step = (LAT_MAX - LAT_MIN) / steps
    lng_step = (LNG_MAX - LNG_MIN) / steps
    return [{"lat": LAT_MIN + (lat_step * i) + (lat_step/2), 
             "lng": LNG_MIN + (lng_step * j) + (lng_step/2)} 
            for i in range(steps) for j in range(steps)]


def advanced_score(text, lexicon):
    """Scores text while handling 'not crowded' or 'very strenuous'."""
    tokens = text.lower().replace(".", "").split()
    seen_keywords = set()
    total_shift = 0.0

    for i, word in enumerate(tokens):
        if word in lexicon and not word in seen_keywords:
            val = lexicon[word]
            # Check for modifiers (e.g., 'very busy')
            if i > 0 and tokens[i-1] in MODIFIERS:
                val *= MODIFIERS[tokens[i-1]]
            # Check for negations (e.g., 'not busy')
            if i > 0 and tokens[i-1] in NEGATIONS or i > 1 and tokens[i-2] in NEGATIONS:
                val *= -1
            total_shift += val

            seen_keywords.add(word)
    return max(-3.5, min(3.5, total_shift * 0.5))


def fetch_places_with_retry(payload, headers, max_retries=5):
    """Refined request handler to deal with 429s and pagination."""
    next_token = None
    
    while True:
        for attempt in range(max_retries):
            if next_token:
                payload["pageToken"] = next_token
                
            response = requests.post(SEARCH_URL, json=payload, headers=headers)
            start_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                yield data.get("places", [])

                next_token = data.get("nextPageToken")
                
                # If no more pages, we are done with this specific query
                if not next_token:
                    break
                    
                # Wait 2 seconds before requesting the next page (Google requirement)
                fin_time = time.time()
                if fin_time - start_time < 2.0:
                    time.sleep(2.0 - (fin_time - start_time)) 

                break

            elif response.status_code == 429:
                wait = (2 ** attempt) + random.random()
                print(f"Rate limited. Waiting {round(wait, 2)}s...")
                time.sleep(wait)
            else:
                print(f"Error {response.status_code}: {response.text}")
                break
        
        if not next_token:
            return


def build_irvine_index(build_index_entry):
    all_places = set() # Place ID -> Data to prevent duplicates
    index = defaultdict(list)

    grid = get_grid_centers(8)
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.types,places.reviews,places.editorialSummary,places.priceLevel,places.formattedAddress,nextPageToken,places.regularOpeningHours"
    }

    total_count = 0

    for i, cell in enumerate(grid):
        for q in QUERIES:
            print(f"Scanning '{q}' in Cell {i}")
            payload = {
                "textQuery": q,
                "locationBias": {"circle": {"center": {"latitude": cell['lat'], "longitude": cell['lng']}, "radius": 1250}}
            }

            try:
                print("Successfuly got zone with query... adding to index...")

                for pages in fetch_places_with_retry(payload, headers):
                    for p in pages:
                        if p.get("id") not in all_places:
                            print("\t", p.get("displayName", {}).get("text"))
                            index_entry = build_index_entry(p)
                            index[f"{index_entry['sociability']}, {index_entry['physicality']}"].append(index_entry)

                            total_count += 1

                        all_places.add(p.get("id"))
                

                wait_time = random.uniform(0.3, 0.7)
                time.sleep(wait_time)
            
            except Exception as e:
                print(f"Error: {e}")

        print(f'Cell {i} complete!')

    index['total_count'].append(total_count)
    return index

def build_index_entry(place):

    price_map = {"PRICE_UNKNOWN": -1, "PRICE_LEVEL_FREE": 0, "PRICE_LEVEL_INEXPENSIVE": 1, "PRICE_LEVEL_MODERATE": 2, "PRICE_LEVEL_EXPENSIVE": 3, "PRICE_LEVEL_VERY_EXPENSIVE": 4}
    
    text = (place.get("editorialSummary", {}).get("text", "") + " " + 
            " ".join([r.get("text", {}).get("text", "") for r in place.get("reviews", [])])).lower()

    sociability = max([SOCIAL_WEIGHTS[type] for type in place.get("types", []) if type in SOCIAL_WEIGHTS], default=5)
    soc_score = max(1, min(sociability + advanced_score(text, SOC_LEXICON), 10))
    
    physicality = max([PHYSICAL_WEIGHTS[type] for type in place.get("types", []) if type in PHYSICAL_WEIGHTS], default=3)
    phys_score = max(1, min(physicality + advanced_score(text, PHYS_LEXICON), 10))

    if any(t in {"toy_store", "hobby_shop", "book_store", "library", "cafe"} for t in place.get("types", [])):
        phys_score = min(phys_score, 3) # Hard cap for sedentary types

    if any(t in {"night_club", "dance_hall", "karaoke", "comedy_club", "bar", "pub", "community_center", "amusement_park", "picnic_ground", "dog_park"} for t in place.get("types", [])):
        soc_score = max(soc_score, 7.0) # Vibe floor: a bar is always somewhat social

        

    index_entry = {
        "name": place.get("displayName", {}).get("text"),
        "address": place.get("formattedAddress"),
        "lat": place.get('location', {}).get('latitude'),
        "lng": place.get('location', {}).get('longitude'),
        "price_level": price_map.get(place.get("priceLevel"), "PRICE_UNKNOWN"),
        "sociability": soc_score,
        "physicality": phys_score,
        "open_hours": place.get("regularOpeningHours", {}).get("weekdayDescriptions", "Unknown"),
        "tags": [t for t in place.get("types", [])[:7] if not t in {"store", "point_of_interest", "establishment"}]
    }

    return index_entry

if __name__ == '__main__':
    print("Getting Irvine locations!!!")
    irvine_index = build_irvine_index(build_index_entry)

    #with open("irvine_social_data.json", "w") as f:
    #    json.dump(irvine_index, f, indent=2)

    with gzip.open("irvine_social_data.json.gz", "wt", encoding="UTF-8") as f:
        json.dump(irvine_index, f, indent=2)

    print(f"Index complete! Processed {irvine_index['total_count'][0]} unique locations.")