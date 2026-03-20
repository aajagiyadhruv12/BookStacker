import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = { 
  apiKey: "AIzaSyCzHgEA_7R0CmvuuJUhQ4EPDRMS-02r4H0", 
  authDomain: "bookstacker0.firebaseapp.com", 
  projectId: "bookstacker0", 
  storageBucket: "bookstacker0.firebasestorage.app", 
  messagingSenderId: "1055649608740", 
  appId: "1:1055649608740:web:ffd2bd5c57f3fc2f53d4b1", 
  measurementId: "G-HTYR6VHP6G" 
}; 

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
