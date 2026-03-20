from firebase_admin import firestore

class DashboardService:
    @staticmethod
    def get_admin_stats():
        db = firestore.client()
        
        total_books = len(db.collection('books').get())
        
        # Count from both collections
        total_members = len(db.collection('users').get())
        total_admins = len(db.collection('admins').get())
        total_users = total_members + total_admins
        
        active_loans = len(db.collection('loans').where('status', '==', 'active').get())
        pending_reservations = len(db.collection('reservations').where('status', '==', 'pending').get())
        
        return {
            "total_books": total_books,
            "total_users": total_users,
            "active_loans": active_loans,
            "pending_reservations": pending_reservations
        }

    @staticmethod
    def get_user_stats(user_id):
        db = firestore.client()
        
        active_loans = len(db.collection('loans')\
                             .where('user_id', '==', user_id)\
                             .where('status', '==', 'active')\
                             .get())
                             
        reservations = len(db.collection('reservations')\
                             .where('user_id', '==', user_id)\
                             .where('status', '==', 'pending')\
                             .get())
                             
        return {
            "active_loans": active_loans,
            "pending_reservations": reservations
        }
