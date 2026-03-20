from firebase_admin import auth, firestore

class UserService:
    @staticmethod
    def get_user_profile(user_id):
        db = firestore.client()
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            return user_data
        return None

    @staticmethod
    def update_user_profile(user_id, data):
        db = firestore.client()
        db.collection('users').document(user_id).set(data, merge=True)
        return True

    @staticmethod
    def get_all_users():
        db = firestore.client()
        # Fetch from 'users' collection
        users_ref = db.collection('users').stream()
        users = []
        for doc in users_ref:
            user = doc.to_dict()
            user['id'] = doc.id
            users.append(user)
            
        # Also fetch from 'admins' collection to show all roles
        admins_ref = db.collection('admins').stream()
        for doc in admins_ref:
            admin = doc.to_dict()
            admin['id'] = doc.id
            users.append(admin)
            
        return users

    @staticmethod
    def delete_user(user_id):
        # Delete from Firestore
        db = firestore.client()
        db.collection('users').document(user_id).delete()
        # Delete from Firebase Auth
        auth.delete_user(user_id)
        return True
