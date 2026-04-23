from firebase_admin import firestore
from ..firebase import get_db
from datetime import datetime, timedelta

class LoanService:
    @staticmethod
    def issue_book(user_id, book_id):
        db = get_db()
        if not db:
            return {"error": "Database unavailable"}, 503
        book_ref = db.collection('books').document(book_id)
        book = book_ref.get()
        if not book.exists:
            return {"error": "Book not found"}, 404
        book_data = book.to_dict()
        if book_data['available_copies'] <= 0:
            return {"error": "No copies available"}, 400
        loan_data = {
            'user_id': user_id,
            'book_id': book_id,
            'book_title': book_data['title'],
            'issue_date': datetime.utcnow().isoformat(),
            'due_date': (datetime.utcnow() + timedelta(days=14)).isoformat(),
            'status': 'active',
            'returned': False
        }
        @firestore.transactional
        def create_loan_transaction(transaction, book_ref, loan_data):
            snapshot = book_ref.get(transaction=transaction)
            if snapshot.get('available_copies') > 0:
                transaction.update(book_ref, {'available_copies': snapshot.get('available_copies') - 1})
                new_loan_ref = db.collection('loans').document()
                transaction.set(new_loan_ref, loan_data)
                # Also save to issued_books collection
                issued_ref = db.collection('issued_books').document(new_loan_ref.id)
                transaction.set(issued_ref, loan_data)
                return new_loan_ref.id
            return None
        transaction = db.transaction()
        loan_id = create_loan_transaction(transaction, book_ref, loan_data)
        if loan_id:
            # Notification for issue
            db.collection('notifications').add({
                'user_id': user_id,
                'title': 'Book Issued',
                'message': f"'{book_data['title']}' has been issued. Due in 14 days.",
                'type': 'issue',
                'read': False,
                'created_at': datetime.utcnow().isoformat()
            })
            return {"id": loan_id, "message": "Book issued successfully"}, 201
        return {"error": "Failed to issue book"}, 400

    @staticmethod
    def return_book(loan_id):
        db = get_db()
        if not db:
            return {"error": "Database unavailable"}, 503
        try:
            loan_ref = db.collection('loans').document(loan_id)
            loan = loan_ref.get()
            if not loan.exists:
                return {"error": "Loan record not found"}, 404
            loan_data = loan.to_dict()
            if loan_data.get('returned') or loan_data.get('status') == 'returned':
                return {"error": "Book already returned"}, 400
            return_date = datetime.utcnow().isoformat()
            returned_payload = {
                'returned': True,
                'status': 'returned',
                'return_date': return_date
            }
            # Update main loan doc
            loan_ref.update(returned_payload)
            # Also update issued_books mirror so it no longer shows as active
            issued_ref = db.collection('issued_books').document(loan_id)
            if issued_ref.get().exists:
                issued_ref.update(returned_payload)
            # Increment available copies only if book still exists
            book_ref = db.collection('books').document(loan_data['book_id'])
            book = book_ref.get()
            if book.exists:
                book_data = book.to_dict()
                new_copies = book_data.get('available_copies', 0) + 1
                total = book_data.get('total_copies', new_copies)
                book_ref.update({
                    'available_copies': min(new_copies, total)
                })
            # Save to returned_books collection
            returned_doc = {
                'user_id': loan_data['user_id'],
                'book_id': loan_data['book_id'],
                'book_title': loan_data['book_title'],
                'issue_date': loan_data['issue_date'],
                'due_date': loan_data['due_date'],
                'return_date': return_date,
                'status': 'returned',
                'returned': True
            }
            db.collection('returned_books').document(loan_id).set(returned_doc)
            # Create notification for user
            db.collection('notifications').add({
                'user_id': loan_data['user_id'],
                'title': 'Book Returned',
                'message': f"You have successfully returned '{loan_data['book_title']}'",
                'type': 'return',
                'read': False,
                'created_at': datetime.utcnow().isoformat()
            })
            return {"message": "Book returned successfully"}, 200
        except Exception as e:
            return {"error": str(e)}, 500

    @staticmethod
    def get_user_loans(user_id):
        db = get_db()
        if not db:
            return []
        loans = []
        for doc in db.collection('loans').where('user_id', '==', user_id).stream():
            loan = doc.to_dict()
            loan['id'] = doc.id
            # Ensure all datetime objects are serialized
            for key, value in loan.items():
                if hasattr(value, 'isoformat'):
                    loan[key] = value.isoformat()
            loans.append(loan)
        return loans

    @staticmethod
    def _build_user_map(db):
        """Returns {uid: name} for all users and admins. Limited to speed up."""
        user_map = {}
        try:
            for col in ('users', 'admins'):
                # Limit to 500 users to prevent hanging on huge datasets
                for doc in db.collection(col).limit(500).stream():
                    d = doc.to_dict()
                    user_map[doc.id] = d.get('name') or d.get('email', doc.id)
        except Exception as e:
            print(f"Error building user map: {e}")
        return user_map

    @staticmethod
    def _serialize(obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: LoanService._serialize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [LoanService._serialize(i) for i in obj]
        return obj

    @staticmethod
    def get_all_loans():
        db = get_db()
        if not db:
            return []
        try:
            user_map = LoanService._build_user_map(db)
            loans = []
            # Fetch loans, sorted by date if possible
            loan_query = db.collection('loans').order_by('issue_date', direction=firestore.Query.DESCENDING).limit(1000)
            
            for doc in loan_query.stream():
                loan = doc.to_dict()
                loan['id'] = doc.id
                uid = loan.get('user_id')
                loan['user_name'] = user_map.get(uid, uid or 'Unknown')
                loans.append(LoanService._serialize(loan))
            return loans
        except Exception as e:
            print(f"Error fetching all loans: {e}")
            # Fallback if ordering fails (e.g. no index)
            try:
                loans = []
                for doc in db.collection('loans').limit(500).stream():
                    loan = doc.to_dict()
                    loan['id'] = doc.id
                    uid = loan.get('user_id')
                    loan['user_name'] = user_map.get(uid, uid or 'Unknown')
                    loans.append(LoanService._serialize(loan))
                return loans
            except:
                return []
