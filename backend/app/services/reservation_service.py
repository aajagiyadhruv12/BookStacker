from firebase_admin import firestore
from datetime import datetime

class ReservationService:
    @staticmethod
    def create_reservation(user_id, book_id):
        db = firestore.client()
        
        # Check if already reserved
        existing = db.collection('reservations')\
                     .where('user_id', '==', user_id)\
                     .where('book_id', '==', book_id)\
                     .where('status', '==', 'pending')\
                     .get()
        
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
        db = firestore.client()
        db.collection('reservations').document(reservation_id).update({
            'status': 'cancelled'
        })
        return {"message": "Reservation cancelled"}, 200

    @staticmethod
    def get_user_reservations(user_id):
        db = firestore.client()
        res_ref = db.collection('reservations').where('user_id', '==', user_id).stream()
        reservations = []
        for doc in res_ref:
            res = doc.to_dict()
            res['id'] = doc.id
            reservations.append(res)
        return reservations
