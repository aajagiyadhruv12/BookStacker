import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import os
import json
from flask import current_app

db = None
bucket = None

def init_firebase(app):
    global db, bucket
    
    # Check if Firebase is already initialized
    if not firebase_admin._apps:
        # Option 1: Use JSON string from ENV (Best for Render/Vercel)
        service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
        
        # Option 2: Use file path from Config/ENV
        service_account_path = app.config.get('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if service_account_json:
            try:
                # Load JSON string into a dict
                cred_dict = json.loads(service_account_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': 'bookstacker0.firebasestorage.app'
                })
            except Exception as e:
                print(f"Error initializing Firebase from JSON string: {e}")
                
        elif service_account_path and os.path.exists(service_account_path):
            try:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': 'bookstacker0.firebasestorage.app'
                })
            except Exception as e:
                print(f"Error initializing Firebase from path: {e}")
        else:
            # Fallback for local development if neither is provided
            try:
                firebase_admin.initialize_app(options={
                    'storageBucket': 'bookstacker0.firebasestorage.app'
                })
            except Exception as e:
                print(f"Warning: Firebase initialization failed. {e}")
            
    db = firestore.client()
    bucket = storage.bucket()

def get_db():
    return db

def get_bucket():
    return bucket
