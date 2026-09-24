import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// يُنشئ حسابًا في Firebase Auth موازيًا لحساب Base44 (نفس البريد وكلمة المرور)
// حتى يظهر المستخدم في قائمة Firebase → Authentication → Users.
// لا يُستبدل نظام Base44 — يظل هو مصدر الجلسات وحماية المسارات.
export async function registerFirebaseUser(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    // أفضل جهد: لا نكسر التسجيل إذا فشل (مستخدم موجود مسبقًا أو خطأ شبكة)
    console.error("Firebase register (best effort):", e);
  }
}

export async function loginFirebaseUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    console.error("Firebase login (best effort):", e);
  }
}