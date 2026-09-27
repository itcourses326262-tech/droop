import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// إعدادات مشروع Firebase. يمكن تجاوزها بمتغيرات VITE_FIREBASE_* في ملف .env.local
// (انظر .env.example). هذه القيم عامة بطبيعتها — الحماية تتم عبر firestore.rules و storage.rules.
const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA9se0VxztqOoFtzVSxHLpWeJ95xWI7Cjs",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "droop2.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "droop2",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "droop2.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "952668650909",
  appId: env.VITE_FIREBASE_APP_ID || "1:952668650909:web:9366cfd0a9d2f41b5e8374",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-7MGNJSED17",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
auth.languageCode = "ar";
export { app };

// Google Analytics — يُفعَّل فقط في المتصفحات التي تدعمه (لا يعمل مثلًا في بعض الإطارات المحمية).
export const analyticsPromise = isSupported()
  .then((ok) => (ok ? getAnalytics(app) : null))
  .catch(() => null);
