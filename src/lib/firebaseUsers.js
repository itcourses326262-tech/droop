import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// يزامن بيانات المستخدم (العميل أو صاحب المهنة) إلى Firestore كنسخة تكميلية.
// لا تستبدل مصادقة Base44 — تظل هي مصدر الجلسات وحماية المسارات.
export async function syncUserToFirebase(user) {
  if (!user || !user.id) return;
  try {
    await setDoc(
      doc(db, "users", user.id),
      {
        id: user.id,
        email: user.email || null,
        full_name: user.full_name || null,
        role: user.role || null,
        account_type: user.account_type || null,
        display_name: user.display_name || null,
        profile_picture: user.profile_picture || null,
        location_lat: user.location_lat ?? null,
        location_lng: user.location_lng ?? null,
        location_address: user.location_address || null,
        last_login_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // لا نكسر تدفق الدخول إذا فشلت المزامنة
    console.error("Firebase sync failed:", e);
  }
}