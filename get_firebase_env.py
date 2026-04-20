import json
import os

def generate_render_env_string():
    # Try to find the service account file
    possible_files = [f for f in os.listdir('.') if f.endswith('.json')]
    
    file_path = None
    for f in possible_files:
        try:
            with open(f, 'r') as jf:
                data = json.load(jf)
                if 'project_id' in data and 'private_key' in data:
                    file_path = f
                    break
        except:
            continue
            
    if not file_path:
        print("Error: Firebase Service Account JSON file not found in the current directory.")
        print("Please download it from Firebase Console (Project Settings > Service Accounts) and save it here.")
        return

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Convert to a single-line string
            env_string = json.dumps(data)
            print("\n" + "="*50)
            print(f"SUCCESS! Found file: {file_path}")
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
