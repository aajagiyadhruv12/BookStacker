from ..firebase import get_db
from datetime import datetime

class BookService:
    @staticmethod
    def get_books(search=None, category=None, page=1, per_page=12):
        db = get_db()
        if not db:
            return []
        query = db.collection('books')
        if search:
            query = query.where('title', '>=', search).where('title', '<=', search + '\uf8ff')
        if category:
            query = query.where('category', '==', category)
        books_ref = query.limit(per_page).offset((page - 1) * per_page).stream()
        books = []
        for doc in books_ref:
            book = doc.to_dict()
            book['id'] = doc.id
            books.append(book)
        return books

    @staticmethod
    def get_book_by_id(book_id):
        db = get_db()
        if not db:
            return None
        doc = db.collection('books').document(book_id).get()
        if doc.exists:
            book = doc.to_dict()
            book['id'] = doc.id
            return book
        return None

    @staticmethod
    def add_book(data):
        db = get_db()
        if not db:
            return None
        data['created_at'] = datetime.utcnow().isoformat()
        data['available_copies'] = int(data.get('total_copies', 1))
        _, doc_ref = db.collection('books').add(data)
        return doc_ref.id

    @staticmethod
    def update_book(book_id, data):
        db = get_db()
        if not db:
            return False
        db.collection('books').document(book_id).update(data)
        return True

    @staticmethod
    def delete_book(book_id):
        db = get_db()
        if not db:
            return False
        db.collection('books').document(book_id).delete()
        return True
