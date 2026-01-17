import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyAdfIlDuX6bmlgBGvvXyElxoOnc5ONjync",
  authDomain: "college-notice-board-dc362.firebaseapp.com",
  projectId: "college-notice-board-dc362",
  storageBucket: "college-notice-board-dc362.firebasestorage.app",
  messagingSenderId: "926785553358",
  appId: "1:926785553358:web:296c8b05785cd2f1f0e19f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

