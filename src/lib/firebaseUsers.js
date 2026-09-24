import { db } from "@/lib/firebase";
import { doc, setDoc, runTransaction, serverTimestamp } from "firebase/firestore";

// ملف المستخدم في Firestore: users/{uid}
// ينشئ/يحدّث ملف المستخدم (دمج مع البيانات الموجودة).
export async function saveUserProfile(uid, data) {
  await setDoc(
    doc(db, "users", uid),
    { ...data, id: uid, updated_at: serverTimestamp() },
    { merge: true }
  );
}

// يُستدعى بعد كل تسجيل دخول: يضمن وجود ملف أساسي للمستخدم ويحدّث وقت آخر دخول.
// داخل transaction حتى لا يكتب القيم الافتراضية فوق ملف تحفظه صفحة التسجيل في نفس اللحظة.
export async function ensureUserProfile(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists() ? snap.data() : null;
    const update = { id: firebaseUser.uid, email: firebaseUser.email || null, last_login_at: serverTimestamp() };
    if (!existing) {
      Object.assign(update, {
        role: "user",
        account_type: "client",
        display_name: firebaseUser.displayName || null,
        full_name: firebaseUser.displayName || null,
        profile_picture: firebaseUser.photoURL || null,
        created_at: serverTimestamp(),
      });
    }
    tx.set(ref, update, { merge: true });
    return { ...(existing || {}), ...update };
  });
}
