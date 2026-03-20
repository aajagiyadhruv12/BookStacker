from flask import Blueprint, request, jsonify
from ..services.user_service import UserService

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>', methods=['GET'])
def get_profile(user_id):
    user = UserService.get_user_profile(user_id)
    if user:
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
