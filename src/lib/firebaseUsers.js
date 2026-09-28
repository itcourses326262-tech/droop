import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

// users/{uid}            → الملف الخاص (بريد، بطاقة، فيديو، موقع دقيق…) — لصاحبه وللأدمن فقط.
// public_profiles/{uid}  → الملف العام (اسم، صورة، مهنة، مدينة، نبذة، تقييم) — يقرؤه الجميع.
// أي حقل من PUBLIC_FIELDS يُكتب في users يُنسخ تلقائيًا إلى public_profiles في نفس الدفعة.
const PUBLIC_FIELDS = ["display_name", "profile_picture", "account_type", "profession", "city", "bio"];

function pickPublic(data) {
  const out = {};
  for (const k of PUBLIC_FIELDS) if (data[k] !== undefined) out[k] = data[k];
  return out;
}

// ينشئ/يحدّث ملف المستخدم (دمج مع البيانات الموجودة) ويحدّث الملف العام معه.
export async function saveUserProfile(uid, data) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid), { ...data, id: uid, updated_at: serverTimestamp() }, { merge: true });
  const pub = pickPublic(data);
  if (Object.keys(pub).length) {
    batch.set(doc(db, "public_profiles", uid), { ...pub, id: uid, updated_at: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

// يُستدعى بعد كل تسجيل دخول: يضمن وجود ملف أساسي للمستخدم (وملفه العام) ويحدّث وقت آخر دخول.
// داخل transaction حتى لا يكتب القيم الافتراضية فوق ملف تحفظه صفحة التسجيل في نفس اللحظة.
export async function ensureUserProfile(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const pubRef = doc(db, "public_profiles", firebaseUser.uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const pubSnap = await tx.get(pubRef);
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
    const merged = { ...(existing || {}), ...update };
    if (!pubSnap.exists()) {
      tx.set(pubRef, {
        id: firebaseUser.uid,
        display_name: merged.display_name || null,
        profile_picture: merged.profile_picture || null,
        account_type: merged.account_type || "client",
        profession: merged.profession || null,
        city: merged.city || null,
        bio: merged.bio || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
    return {
      ...merged,
      verified: pubSnap.exists() ? !!pubSnap.data().verified : false,
      rating_sum: pubSnap.data()?.rating_sum || 0,
      rating_count: pubSnap.data()?.rating_count || 0,
    };
  });
}

// يحدّث الاسم والصورة في Firebase Auth أيضًا (تظهر في رسائل البريد وغيرها).
export async function syncAuthProfile({ displayName, photoURL }) {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName, photoURL });
}

export async function getPublicProfile(uid) {
  const snap = await getDoc(doc(db, "public_profiles", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function ratingOf(profile) {
  const count = profile?.rating_count || 0;
  return { count, avg: count ? profile.rating_sum / count : 0 };
}

// قائمة أصحاب المهن مرتبة حسب التقييم (الترتيب في المتصفح لتجنّب فهارس مركّبة).
export async function listProfessionals({ profession, max = 60 } = {}) {
  const constraints = [where("account_type", "==", "professional")];
  if (profession) constraints.push(where("profession", "==", profession));
  const snap = await getDocs(query(collection(db, "public_profiles"), ...constraints, limit(max)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      if (!!b.verified !== !!a.verified) return b.verified ? 1 : -1;
      const ra = ratingOf(a), rb = ratingOf(b);
      return rb.avg - ra.avg || rb.count - ra.count;
    });
}

// ---- للأدمن فقط (القواعد ترفض غير ذلك) ----

export async function listAllUsers(max = 200) {
  const snap = await getDocs(query(collection(db, "users"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setProfessionalVerified(uid, verified) {
  await updateDoc(doc(db, "public_profiles", uid), { verified, updated_at: serverTimestamp() });
}
