from flask import Blueprint, jsonify
from ..firebase import get_db
from ..utils.auth import verify_token

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/user/<user_id>', methods=['GET'])
@verify_token
def get_notifications(user_id):
    db = get_db()
    if not db:
        return jsonify([]), 503
    try:
        notifications = []
        # Remove order_by to avoid needing a Firestore composite index
        for doc in db.collection('notifications').where('user_id', '==', user_id).limit(20).stream():
            n = doc.to_dict()
            n['id'] = doc.id
            notifications.append(n)
        # Sort in Python instead
        notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return jsonify(notifications)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-read/<notif_id>', methods=['POST'])
@verify_token
def mark_read(notif_id):
    db = get_db()
    if not db:
        return jsonify({'error': 'Database unavailable'}), 503
    try:
        db.collection('notifications').document(notif_id).update({'read': True})
        return jsonify({'message': 'Marked as read'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-all-read/<user_id>', methods=['POST'])
@verify_token
def mark_all_read(user_id):
    db = get_db()
    if not db:
        return jsonify({'error': 'Database unavailable'}), 503
    try:
        docs = db.collection('notifications').where('user_id', '==', user_id).where('read', '==', False).stream()
        for doc in docs:
            doc.reference.update({'read': True})
        return jsonify({'message': 'All marked as read'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notif_id>', methods=['DELETE'])
@verify_token
def delete_notification(notif_id):
    db = get_db()
    if not db:
        return jsonify({'error': 'Database unavailable'}), 503
    try:
        db.collection('notifications').document(notif_id).delete()
        return jsonify({'message': 'Notification deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
