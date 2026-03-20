import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

db = None
bucket = None

def init_firebase(app):
    global db, bucket

    if firebase_admin._apps:
        return

    service_account_json_str = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    service_account_path = app.config.get('FIREBASE_SERVICE_ACCOUNT_PATH')

    cred = None
    try:
        if service_account_json_str:
            # Production environment (Render): Load from environment variable
            cred_dict = json.loads(service_account_json_str)
            cred = credentials.Certificate(cred_dict)
        elif service_account_path and os.path.exists(service_account_path):
            # Local development: Load from file path
            cred = credentials.Certificate(service_account_path)
        else:
            raise ValueError("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON for production or FIREBASE_SERVICE_ACCOUNT_PATH for local development.")

        firebase_admin.initialize_app(cred, {
            'storageBucket': app.config.get('FIREBASE_STORAGE_BUCKET')
        })
        db = firestore.client()
        bucket = storage.bucket()
        print("Firebase initialized successfully.")

    except Exception as e:
        print(f"FATAL: Firebase initialization failed: {e}")
        # In a real app, you might want to exit or handle this more gracefully
        # For now, we print a fatal error to make it obvious.
        db = None
        bucket = None

def get_db():
    return db

def get_bucket():
    return bucket
