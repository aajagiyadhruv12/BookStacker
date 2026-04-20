from flask import Blueprint, request, jsonify
from ..services.book_service import BookService

books_bp = Blueprint('books', __name__)

@books_bp.route('', methods=['GET'])
def get_books():
    search = request.args.get('search')
    category = request.args.get('category')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 12))
    
    books = BookService.get_books(search, category, page, per_page)
    return jsonify(books)

@books_bp.route('/<book_id>', methods=['GET'])
def get_book(book_id):
    book = BookService.get_book_by_id(book_id)
    if book:
        return jsonify(book)
    return jsonify({"error": "Book not found"}), 404

@books_bp.route('', methods=['POST'])
def add_book():
    data = request.json
    book_id = BookService.add_book(data)
    return jsonify({"id": book_id, "message": "Book added successfully"}), 201

@books_bp.route('/<book_id>', methods=['PUT'])
def update_book(book_id):
    data = request.json
    BookService.update_book(book_id, data)
    return jsonify({"message": "Book updated successfully"})

@books_bp.route('/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    BookService.delete_book(book_id)
    return jsonify({"message": "Book deleted successfully"})
