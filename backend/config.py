import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-12345')
    FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
    FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
