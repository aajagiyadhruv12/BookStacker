from flask import Flask
from flask_cors import CORS
from .firebase import init_firebase
from .routes.books import books_bp
from .routes.loans import loans_bp
from .routes.users import users_bp
from .routes.reservations import reservations_bp
from .routes.dashboard import dashboard_bp

from .routes.notifications import notifications_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    CORS(app, resources={r"/api/*": {
        "origins": ["https://book-stacker.vercel.app", "http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
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
        return {"message": "Library Management System API is running"}
    return app

# Expose app for Gunicorn's default 'app:app' command
app = create_app()
