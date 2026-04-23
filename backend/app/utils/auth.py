from functools import wraps
from flask import request, jsonify
from firebase_admin import auth


def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header.split('Bearer ')[1]
        try:
            decoded = auth.verify_id_token(token)
            request.uid = decoded['uid']
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated
