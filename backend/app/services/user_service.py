from firebase_admin import auth
from ..firebase import get_db

class UserService:
    @staticmethod
    def get_user_profile(user_id):
        db = get_db()
        if not db:
            return None
        doc = db.collection('users').document(user_id).get()
        if not doc.exists:
            doc = db.collection('admins').document(user_id).get()
        if doc.exists:
            user_data = doc.to_dict()
            user_data['id'] = doc.id
            return UserService._serialize(user_data)
        return None

    @staticmethod
    def update_user_profile(user_id, data):
        db = get_db()
        if not db:
            return False
        db.collection('users').document(user_id).set(data, merge=True)
        return True

    @staticmethod
    def _serialize(obj):
        """Recursively convert Firestore timestamps to ISO strings."""
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: UserService._serialize(v) for k, v in obj.items()}
        return obj

    @staticmethod
    def get_all_users():
        db = get_db()
        if not db:
            return []
        users = []
        for col in ('users', 'admins'):
            for doc in db.collection(col).stream():
                user = doc.to_dict()
                user['id'] = doc.id
                user = UserService._serialize(user)
                users.append(user)
        return users

    @staticmethod
    def delete_user(user_id):
        db = get_db()
        if not db:
            return False
        db.collection('users').document(user_id).delete()
        auth.delete_user(user_id)
        return True