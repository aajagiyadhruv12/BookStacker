from flask import Blueprint, request, jsonify
from ..services.loan_service import LoanService
from ..firebase import get_db
from ..utils.auth import verify_token

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/issue', methods=['POST'])
@verify_token
def issue_book():
    data = request.json
    user_id = data.get('user_id')
    book_id = data.get('book_id')
    
    if not user_id or not book_id:
        return jsonify({"error": "User ID and Book ID are required"}), 400
        
    result, status_code = LoanService.issue_book(user_id, book_id)
    return jsonify(result), status_code

@loans_bp.route('/return/<loan_id>', methods=['POST'])
@verify_token
def return_book(loan_id):
    result, status_code = LoanService.return_book(loan_id)
    return jsonify(result), status_code

@loans_bp.route('/user/<user_id>', methods=['GET'])
@verify_token
def get_user_loans(user_id):
    loans = LoanService.get_user_loans(user_id)
    return jsonify(loans)

@loans_bp.route('', methods=['GET'])
@verify_token
def get_all_loans():
    loans = LoanService.get_all_loans()
    return jsonify(loans)

@loans_bp.route('/issued', methods=['GET'])
@verify_token
def get_issued_books():
    db_instance = get_db()
    if not db_instance:
        return jsonify([]), 503
    issued = []
    for doc in db_instance.collection('issued_books').stream():
        item = doc.to_dict()
        item['id'] = doc.id
        issued.append(item)
    return jsonify(issued)

@loans_bp.route('/returned', methods=['GET'])
@verify_token
def get_returned_books():
    db_instance = get_db()
    if not db_instance:
        return jsonify([]), 503
    returned = []
    for doc in db_instance.collection('returned_books').stream():
        item = doc.to_dict()
        item['id'] = doc.id
        returned.append(item)
    return jsonify(returned)
