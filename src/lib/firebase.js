import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJSkbEKRR9fAkFTXE3x1ZEcjtPzP5bd7o",
  authDomain: "drop-4e1e7.firebaseapp.com",
  projectId: "drop-4e1e7",
  storageBucket: "drop-4e1e7.firebasestorage.app",
  messagingSenderId: "47244910812",
  appId: "1:47244910812:web:3b23ca641dccd158925419",
  measurementId: "G-DG65EV7ECM",
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// قاعدة البيانات (Firestore) والتخزين (Storage) جاهزان للاستخدام
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };