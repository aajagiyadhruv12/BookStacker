from ..firebase import get_db


class DashboardService:
    @staticmethod
    def _serialize(obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: DashboardService._serialize(v) for k, v in obj.items()}
        return obj

    @staticmethod
    def get_admin_stats():
        db = get_db()
        if not db:
            return {"total_books": 0, "total_users": 0, "active_loans": 0, "pending_reservations": 0, "recent_activity": []}

        total_books = len(db.collection('books').get())
        total_members = len(db.collection('users').get())
        total_admins = len(db.collection('admins').get())
        total_users = total_members + total_admins

        loans = db.collection('loans').get()
        reservations = db.collection('reservations').get()

        active_loans = sum(1 for doc in loans if doc.to_dict().get('status') == 'active')
        pending_reservations = sum(1 for doc in reservations if doc.to_dict().get('status') == 'pending')

        recent_activity = []
        for doc in loans:
            data = doc.to_dict()
            recent_activity.append({
                'id': doc.id,
                'action_text': f"{data.get('book_title', 'A book')} was issued",
                'action_type': 'loan',
                'date': DashboardService._serialize(data.get('issue_date', '')),
                'user_id': data.get('user_id')
            })

        for doc in reservations:
            data = doc.to_dict()
            recent_activity.append({
                'id': doc.id,
                'action_text': f"{data.get('book_title', 'A book')} was reserved",
                'action_type': 'reservation',
                'date': DashboardService._serialize(data.get('created_at', '')),
                'user_id': data.get('user_id')
            })

        recent_activity.sort(key=lambda x: x['date'] if x['date'] else '', reverse=True)

        return {
            "total_books": total_books,
            "total_users": total_users,
            "active_loans": active_loans,
            "pending_reservations": pending_reservations,
            "recent_activity": recent_activity[:5]
        }

    @staticmethod
    def get_user_stats(user_id):
        db = get_db()
        if not db:
            return {"active_loans": 0, "pending_reservations": 0, "recent_activity": []}

        user_loans = db.collection('loans').where('user_id', '==', user_id).get()
        user_reservations = db.collection('reservations').where('user_id', '==', user_id).get()

        active_loans = sum(1 for doc in user_loans if doc.to_dict().get('status') == 'active')
        reservations = sum(1 for doc in user_reservations if doc.to_dict().get('status') == 'pending')

        recent_activity = []
        for doc in user_loans:
            data = doc.to_dict()
            recent_activity.append({
                'id': doc.id,
                'action_text': f"{data.get('book_title', 'A book')} was issued",
                'action_type': 'loan',
                'date': DashboardService._serialize(data.get('issue_date', '')),
                'user_id': data.get('user_id')
            })

        for doc in user_reservations:
            data = doc.to_dict()
            recent_activity.append({
                'id': doc.id,
                'action_text': f"{data.get('book_title', 'A book')} was reserved",
                'action_type': 'reservation',
                'date': DashboardService._serialize(data.get('created_at', '')),
                'user_id': data.get('user_id')
            })

        recent_activity.sort(key=lambda x: x['date'] if x['date'] else '', reverse=True)

        return {
            "active_loans": active_loans,
            "pending_reservations": reservations,
            "recent_activity": recent_activity[:5]
        }
