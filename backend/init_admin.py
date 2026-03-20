import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import json
from dotenv import load_dotenv

load_dotenv()

def init_admin():
    # Initialize Firebase
    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'serviceAccountKey.json')
    if not os.path.exists(service_account_path):
        print(f"Error: {service_account_path} not found. Please place it in the backend folder.")
        return

    cred = credentials.Certificate(service_account_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    admin_email = "admin@bookstacker.com"
    admin_password = "admin123"
    admin_name = "Admin"

    try:
        # Create user in Firebase Auth
        try:
            user = auth.get_user_by_email(admin_email)
            print(f"User {admin_email} already exists in Auth.")
            uid = user.uid
        except auth.UserNotFoundError:
            user = auth.create_user(
                email=admin_email,
                password=admin_password,
                display_name=admin_name
            )
            print(f"Successfully created admin user in Auth: {user.uid}")
            uid = user.uid

        # Create/Update profile in 'admins' collection
        db.collection('admins').document(uid).set({
            'name': admin_name,
            'email': admin_email,
            'password': admin_password,
            'role': 'admin',
            'created_at': firestore.SERVER_TIMESTAMP,
            'is_active': True
        }, merge=True)
        
        # Also remove from 'users' collection if it exists there to keep it separate
        db.collection('users').document(uid).delete()
        print(f"Successfully updated admin profile in 'admins' collection for {uid}")

    except Exception as e:
        print(f"Error initializing admin: {e}")

if __name__ == "__main__":
    init_admin()
