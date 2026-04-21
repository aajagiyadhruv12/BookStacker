from firebase_admin import firestore
from ..firebase import get_db
from datetime import datetime

class ReservationService:
    @staticmethod
    def create_reservation(user_id, book_id):
        db = get_db()
        if not db:
            return {"error": "Database unavailable"}, 503
        existing = db.collection('reservations')\
                     .where('user_id', '==', user_id)\
                     .where('book_id', '==', book_id)\
                     .where('status', '==', 'pending').get()
        if len(existing) > 0:
            return {"error": "Reservation already exists"}, 400
        book_doc = db.collection('books').document(book_id).get()
        if not book_doc.exists:
            return {"error": "Book not found"}, 404
        reservation_data = {
            'user_id': user_id,
            'book_id': book_id,
            'book_title': book_doc.to_dict().get('title'),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat()
        }
        _, doc_ref = db.collection('reservations').add(reservation_data)
        return {"id": doc_ref.id, "message": "Reservation created"}, 201

    @staticmethod
    def cancel_reservation(reservation_id):
        db = get_db()
        if not db:
            return {"error": "Database unavailable"}, 503
        db.collection('reservations').document(reservation_id).update({'status': 'cancelled'})
        return {"message": "Reservation cancelled"}, 200

    @staticmethod
    def get_user_reservations(user_id):
        db = get_db()
        if not db:
            return []
        reservations = []
        for doc in db.collection('reservations').where('user_id', '==', user_id).stream():
            res = doc.to_dict()
            res['id'] = doc.id
            reservations.append(res)
        return reservations

    @staticmethod
    def _serialize(obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: ReservationService._serialize(v) for k, v in obj.items()}
        return obj

    @staticmethod
    def get_all_reservations():
        db = get_db()
        if not db:
            return []
        user_map = {}
        for col in ('users', 'admins'):
            for doc in db.collection(col).stream():
                d = doc.to_dict()
                user_map[doc.id] = d.get('name') or d.get('email', doc.id)
        reservations = []
        for doc in db.collection('reservations').stream():
            res = doc.to_dict()
            res['id'] = doc.id
            res['user_name'] = user_map.get(res.get('user_id'), res.get('user_id', 'Unknown'))
            res = ReservationService._serialize(res)
            reservations.append(res)
        return reservations
