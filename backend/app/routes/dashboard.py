from flask import Blueprint, jsonify
from ..services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/admin', methods=['GET'])
def get_admin_stats():
    stats = DashboardService.get_admin_stats()
    return jsonify(stats)

@dashboard_bp.route('/user/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    stats = DashboardService.get_user_stats(user_id)
    return jsonify(stats)
