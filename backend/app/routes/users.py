from flask import Blueprint, request, jsonify
from ..services.user_service import UserService
from ..services.loan_service import LoanService

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>', methods=['GET'])
def get_profile(user_id):
    user = UserService.get_user_profile(user_id)
    if user:
        if 'created_at' in user and hasattr(user['created_at'], 'isoformat'):
            user['created_at'] = user['created_at'].isoformat()
        
        loans = LoanService.get_user_loans(user_id)
        active_loans = sum(1 for loan in loans if loan.get('status') == 'active')
        read_books = len([loan for loan in loans if loan.get('status') == 'returned'])
        
        user['stats'] = {
            'active': active_loans,
            'read': read_books,
            'total_loans': len(loans)
        }
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

@users_bp.route('/<user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    UserService.update_user_profile(user_id, data)
    return jsonify({"message": "Profile updated successfully"})

@users_bp.route('', methods=['GET'])
def get_all_users():
    users = UserService.get_all_users()
    return jsonify(users)

@users_bp.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    UserService.delete_user(user_id)
    return jsonify({"message": "User deleted successfully"})
