import json
import os

def generate_render_env_string():
    # Try to find the service account file
    possible_paths = [
        'serviceAccountKey.json',
        'backend/serviceAccountKey.json',
        '../serviceAccountKey.json'
    ]
    
    file_path = None
    for path in possible_paths:
        if os.path.exists(path):
            file_path = path
            break
            
    if not file_path:
        print("Error: 'serviceAccountKey.json' not found in the current directory.")
        print("Please place your Firebase Service Account JSON file in the root folder.")
        return

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Convert to a single-line string
            env_string = json.dumps(data)
            print("\n" + "="*50)
            print("STEP 1: Copy the string below (everything between the quotes):")
            print("="*50 + "\n")
            print(env_string)
            print("\n" + "="*50)
            print("STEP 2: Go to Render Dashboard -> Your Service -> Environment")
            print("STEP 3: Add a new variable:")
            print("   Key: FIREBASE_SERVICE_ACCOUNT_JSON")
            print("   Value: (Paste the string you copied above)")
            print("="*50)
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    generate_render_env_string()
