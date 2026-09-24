import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// إعدادات مشروع Firebase. يمكن تجاوزها بمتغيرات VITE_FIREBASE_* في ملف .env.local
// (انظر .env.example). هذه القيم عامة بطبيعتها — الحماية تتم عبر firestore.rules و storage.rules.
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBJSkbEKRR9fAkFTXE3x1ZEcjtPzP5bd7o",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "drop-4e1e7.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "drop-4e1e7",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "drop-4e1e7.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "47244910812",
  appId: env.VITE_FIREBASE_APP_ID || "1:47244910812:web:3b23ca641dccd158925419",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-DG65EV7ECM",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
auth.languageCode = "ar";
export { app };
