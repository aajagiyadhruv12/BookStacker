from flask import Blueprint, request, jsonify
from ..services.reservation_service import ReservationService

reservations_bp = Blueprint('reservations', __name__)

@reservations_bp.route('', methods=['POST'])
def create_reservation():
    data = request.json
    user_id = data.get('user_id')
    book_id = data.get('book_id')
    
    if not user_id or not book_id:
        return jsonify({"error": "User ID and Book ID are required"}), 400
        
    result, status_code = ReservationService.create_reservation(user_id, book_id)
    return jsonify(result), status_code

@reservations_bp.route('/<reservation_id>/cancel', methods=['POST'])
def cancel_reservation(reservation_id):
    result, status_code = ReservationService.cancel_reservation(reservation_id)
    return jsonify(result), status_code

@reservations_bp.route('/user/<user_id>', methods=['GET'])
def get_user_reservations(user_id):
    reservations = ReservationService.get_user_reservations(user_id)
    return jsonify(reservations)

@reservations_bp.route('', methods=['GET'])
def get_all_reservations():
    reservations = ReservationService.get_all_reservations()
    return jsonify(reservations)
