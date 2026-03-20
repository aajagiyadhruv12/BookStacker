from firebase_admin import firestore
from datetime import datetime, timedelta

class LoanService:
    @staticmethod
    def issue_book(user_id, book_id):
        db = firestore.client()
        
        # Check if book is available
        book_ref = db.collection('books').document(book_id)
        book = book_ref.get()
        
        if not book.exists:
            return {"error": "Book not found"}, 404
            
        book_data = book.to_dict()
        if book_data['available_copies'] <= 0:
            return {"error": "No copies available"}, 400
            
        # Create loan record
        loan_data = {
            'user_id': user_id,
            'book_id': book_id,
            'book_title': book_data['title'],
            'issue_date': datetime.utcnow().isoformat(),
            'due_date': (datetime.utcnow() + timedelta(days=14)).isoformat(),
            'status': 'active',
            'returned': False
        }
        
        # Update book availability and create loan in a transaction
        @firestore.transactional
        def create_loan_transaction(transaction, book_ref, loan_data):
            snapshot = book_ref.get(transaction=transaction)
            if snapshot.get('available_copies') > 0:
                transaction.update(book_ref, {
                    'available_copies': snapshot.get('available_copies') - 1
                })
                new_loan_ref = db.collection('loans').document()
                transaction.set(new_loan_ref, loan_data)
                return new_loan_ref.id
            return None

        transaction = db.transaction()
        loan_id = create_loan_transaction(transaction, book_ref, loan_data)
        
        if loan_id:
            return {"id": loan_id, "message": "Book issued successfully"}, 201
        return {"error": "Failed to issue book"}, 400

    @staticmethod
    def return_book(loan_id):
        db = firestore.client()
        loan_ref = db.collection('loans').document(loan_id)
        loan = loan_ref.get()
        
        if not loan.exists:
            return {"error": "Loan record not found"}, 404
            
        loan_data = loan.to_dict()
        if loan_data.get('returned'):
            return {"error": "Book already returned"}, 400
            
        book_id = loan_data['book_id']
        book_ref = db.collection('books').document(book_id)
        
        @firestore.transactional
        def return_book_transaction(transaction, loan_ref, book_ref):
            transaction.update(loan_ref, {
                'returned': True,
                'status': 'returned',
                'return_date': datetime.utcnow().isoformat()
            })
            book_snapshot = book_ref.get(transaction=transaction)
            transaction.update(book_ref, {
                'available_copies': book_snapshot.get('available_copies') + 1
            })
            return True

        transaction = db.transaction()
        return_book_transaction(transaction, loan_ref, book_ref)
        return {"message": "Book returned successfully"}, 200

    @staticmethod
    def get_user_loans(user_id):
        db = firestore.client()
        loans_ref = db.collection('loans').where('user_id', '==', user_id).stream()
        loans = []
        for doc in loans_ref:
            loan = doc.to_dict()
            loan['id'] = doc.id
            loans.append(loan)
        return loans

    @staticmethod
    def get_all_loans():
        db = firestore.client()
        loans_ref = db.collection('loans').stream()
        loans = []
        for doc in loans_ref:
            loan = doc.to_dict()
            loan['id'] = doc.id
            loans.append(loan)
        return loans
