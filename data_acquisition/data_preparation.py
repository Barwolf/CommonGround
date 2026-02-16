import json
import firebase_admin
from firebase_admin import credentials, firestore
import gzip
import pygeohash as gh
import re


def parse_times_to_ints(time_str_1, time_str_2):
    time_str_1 = time_str_1.replace('\u202f', ' ').replace('\u2009', ' ').strip()
    match1 = re.search(r'(\d+):?(\d+)?\s*(?:(AM|PM))?', time_str_1, re.I)
    time_str_2 = time_str_2.replace('\u202f', ' ').replace('\u2009', ' ').strip()
    match2 = re.search(r'(\d+):?(\d+)?\s*(?:(AM|PM))?', time_str_2, re.I)
    
    h1 = int(match1.group(1))
    m1 = int(match1.group(2)) if match1.group(2) else 0
    ampm1 = match1.group(3).upper() if match1.group(3) != None else match2.group(3).upper()
    
    if ampm1 == 'PM' and h1 != 12: h1 += 12
    if ampm1 == 'AM' and h1 == 12: h1 = 0

    h2 = int(match2.group(1))
    m2 = int(match2.group(2)) if match2.group(2) else 0
    ampm2 = match2.group(3).upper()

    if ampm2 == 'PM' and h2 != 12: h2 += 12
    if ampm2 == 'AM' and h2 == 12: h2 = 0

    return (h1 * 100 + m1, h2 * 100 + m2)


def format_time_slots(hours_str: str) -> list:
    if ':' not in hours_str: return []
    time_part = hours_str.split(':', 1)[1]
    
    time_slots = time_part.split(',')
    day_slots = []

    for slot in time_slots:
        if 'Open 24 hours' in slot:
            day_slots.append({"open": 0, "close": 2400})
            continue

        # Split by various dash characters (–, -, —)
        parts = re.split(r'–|-|—', slot)
        open_time, close_time = parse_times_to_ints(parts[0], parts[1])

        if len(parts) == 2:
            day_slots.append({
                "open": open_time,
                "close": close_time
            })

    return day_slots


if __name__ == '__main__':
    cred = credentials.Certificate("commonground_key.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    with gzip.open('./irvine_social_data.json.gz', 'rt', encoding='utf-8') as f:
        data = json.load(f)

    batch = db.batch()
    collection_ref = db.collection('locations')
    count = 0

    for pref_key, places in data.items():
        for place in places:
            if not isinstance(place, dict):
                break

            # Create a new document reference
            doc_ref = collection_ref.document()
            
            place['geohash'] = gh.encode(place['lat'], place['lng'], precision=9)
            
            place['sociability'] = float(place['sociability'])
            place['physicality'] = float(place['physicality'])

            new_hours = {}

            if place['open_hours'] != 'Unknown':
                for hours in place['open_hours']:
                    day_name = hours.split(':')[0].strip()
                    if 'Closed' in hours:
                        new_hours[day_name] = ([])
                    else:
                        new_hours[day_name] = format_time_slots(hours)

            place['open_hours'] = new_hours
            
            # Add to batch
            batch.set(doc_ref, place)
            count += 1
            
            # Firestore batches have a 500 document limit
            if count % 500 == 0:
                batch.commit()
                batch = db.batch()

    # Final commit
    batch.commit()
    print(f"Successfully uploaded {count} places to Firestore.")