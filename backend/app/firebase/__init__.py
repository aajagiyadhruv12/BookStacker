import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

db = None
bucket = None

def init_firebase(app):
    global db, bucket

    if firebase_admin._apps:
        db = firestore.client()
        bucket = storage.bucket()
        return

    service_account_json_str = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    service_account_path = app.config.get('FIREBASE_SERVICE_ACCOUNT_PATH') or 'serviceAccountKey.json'

    # Resolve relative path to absolute based on this file's directory
    if service_account_path and not os.path.isabs(service_account_path):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        service_account_path = os.path.join(base_dir, service_account_path)

    cred = None
    try:
        if service_account_json_str:
            print("Attempting to initialize Firebase with JSON string...")
            cred_dict = json.loads(service_account_json_str)
            cred = credentials.Certificate(cred_dict)
        elif os.path.exists(service_account_path):
            print(f"Attempting to initialize Firebase with file: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
        else:
            print("WARNING: No Firebase credentials found in Environment Variables or serviceAccountKey.json")
            return

        firebase_admin.initialize_app(cred, {
            'storageBucket': app.config.get('FIREBASE_STORAGE_BUCKET')
        })
        db = firestore.client()
        bucket = storage.bucket()
        print("Firebase initialized successfully.")

    except Exception as e:
        print(f"FATAL: Firebase initialization failed: {e}")
        db = None
        bucket = None

def get_db():
    return db

def get_bucket():
    return bucket
