import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

db = None
bucket = None
init_error = None

def init_firebase(app):
    global db, bucket, init_error

    if firebase_admin._apps:
        db = firestore.client()
        bucket = storage.bucket()
        return

    service_account_json_str = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    
    # Render puts secret files in /etc/secrets/ or the root
    possible_paths = [
        app.config.get('FIREBASE_SERVICE_ACCOUNT_PATH'),
        'serviceAccountKey.json',
        '/etc/secrets/serviceAccountKey.json',
        '../serviceAccountKey.json',
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'serviceAccountKey.json')
    ]
    
    cred = None
    try:
        if service_account_json_str:
            print("Attempting to initialize Firebase with JSON string...")
            # Clean the string in case it has extra quotes or escaping from environment variables
            service_account_json_str = service_account_json_str.strip()
            if service_account_json_str.startswith("'") and service_account_json_str.endswith("'"):
                service_account_json_str = service_account_json_str[1:-1]
            if service_account_json_str.startswith('"') and service_account_json_str.endswith('"'):
                service_account_json_str = service_account_json_str[1:-1]
            
            cred_dict = json.loads(service_account_json_str)
            cred = credentials.Certificate(cred_dict)
        else:
            for path in possible_paths:
                if path and os.path.exists(path):
                    print(f"Attempting to initialize Firebase with file: {path}")
                    cred = credentials.Certificate(path)
                    break
            
            if not cred:
                init_error = "No credentials found. Ensure FIREBASE_SERVICE_ACCOUNT_JSON or serviceAccountKey.json is set."
                print(f"WARNING: {init_error}")
                return

        bucket_name = app.config.get('FIREBASE_STORAGE_BUCKET') or os.getenv('FIREBASE_STORAGE_BUCKET') or 'bookstacker0.firebasestorage.app'
        
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        db = firestore.client()
        bucket = storage.bucket()
        init_error = None
        print("Firebase initialized successfully.")

    except Exception as e:
        init_error = str(e)
        print(f"FATAL: Firebase initialization failed: {e}")
        db = None
        bucket = None

def get_db():
    return db

def get_bucket():
    return bucket

def get_init_error():
    return init_error
