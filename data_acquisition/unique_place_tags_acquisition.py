import json
import firebase_admin
from firebase_admin import credentials, firestore

def extract_unique_tags():
    cred = credentials.Certificate("commonground_key.json")
    if not firebase_admin._apps: 
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    collection_ref = db.collection('locations')
    
    print("Fetching documents from the 'locations' collection...")
    
    docs = collection_ref.stream()
    
    unique_tags = set()
    doc_count = 0
    
    for doc in docs:
        doc_count += 1
        data = doc.to_dict()
        
        tags = data.get('tags', []) 
        
        if isinstance(tags, list):
            unique_tags.update(tags) 
            
    tags_list = sorted(list(unique_tags))
    
    output_file = 'unique_tags.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(tags_list, f, indent=4)

    print(f"\nSuccess!")
    print(f"Processed {doc_count} documents.")
    print(f"Found {len(tags_list)} unique tags.")
    print(f"Saved results to {output_file}")

if __name__ == '__main__':
    extract_unique_tags()