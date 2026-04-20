from firebase_admin import auth
from ..firebase import get_db

class UserService:
    @staticmethod
    def get_user_profile(user_id):
        db = get_db()
        if not db:
            return None
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            return user_data
        return None

    @staticmethod
    def update_user_profile(user_id, data):
        db = get_db()
        if not db:
            return False
        db.collection('users').document(user_id).set(data, merge=True)
        return True

    @staticmethod
    def get_all_users():
        db = get_db()
        if not db:
            return []
        users = []
        for doc in db.collection('users').stream():
            user = doc.to_dict()
            user['id'] = doc.id
            users.append(user)
        for doc in db.collection('admins').stream():
            admin = doc.to_dict()
            admin['id'] = doc.id
            users.append(admin)
        return users

    @staticmethod
    def delete_user(user_id):
        db = get_db()
        if not db:
            return False
        db.collection('users').document(user_id).delete()
        auth.delete_user(user_id)
        return True