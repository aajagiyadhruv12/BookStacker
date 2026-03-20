from flask import Flask
from flask_cors import CORS
from .firebase import init_firebase
from .routes.books import books_bp
from .routes.loans import loans_bp
from .routes.users import users_bp
from .routes.reservations import reservations_bp
from .routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # Initialize CORS
    CORS(app)
    
    # Initialize Firebase Admin
    init_firebase(app)
    
    # Register Blueprints
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    @app.route('/')
    def index():
        return {"message": "Library Management System API is running"}
        
    return app
