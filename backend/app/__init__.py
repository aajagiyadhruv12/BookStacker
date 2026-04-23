import threading
import time
import requests
import os
from flask import Flask
from flask_cors import CORS
from .firebase import init_firebase
from .routes.books import books_bp
from .routes.loans import loans_bp
from .routes.users import users_bp
from .routes.reservations import reservations_bp
from .routes.dashboard import dashboard_bp
from .routes.notifications import notifications_bp

def keep_alive():
    """Ping self every 14 minutes to prevent Render free tier cold starts."""
    url = os.getenv('BACKEND_URL', "https://bookstacker.onrender.com") + "/ping"
    while True:
        time.sleep(14 * 60)
        try:
            requests.get(url, timeout=10)
        except Exception:
            pass

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # More robust CORS configuration for deployment
    CORS(app, resources={r"/api/*": {
        "origins": [
            "https://book-stacker.vercel.app",
            "https://book-stacker.vercel.app/",
            "http://localhost:5173",
            "http://localhost:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "X-Requested-With"],
        "expose_headers": ["Content-Type", "Authorization"]
    }}, supports_credentials=True)
    init_firebase(app)
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    @app.route('/')
    def index():
        from .firebase import get_db, get_init_error
        db = get_db()
        error = get_init_error()
        return {
            "message": "Library Management System API is running",
            "firebase_status": "Connected" if db else "Disconnected",
            "error_details": error if not db else None
        }

    @app.route('/ping')
    def ping():
        return {"status": "ok"}, 200

    # Start keep-alive thread only in production
    if os.getenv('FLASK_ENV') == 'production':
        t = threading.Thread(target=keep_alive, daemon=True)
        t.start()

    return app

# Expose app for Gunicorn
app = create_app()
