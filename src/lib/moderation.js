import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toIso } from "@/lib/serviceRequests";

// reports/{id} → بلاغات المستخدمين عن محتوى مسيء. ينشئها أي مستخدم مسجّل ويقرؤها الأدمن فقط.

export async function reportContent(user, { target_type, target_id, target_path, excerpt, reason }) {
  return addDoc(collection(db, "reports"), {
    reporter_uid: user.uid,
    reporter_name: user.display_name || user.full_name || null,
    target_type,
    target_id,
    target_path: target_path || null,
    excerpt: excerpt ? String(excerpt).slice(0, 300) : null,
    reason: reason || "",
    status: "open",
    created_at: serverTimestamp(),
  });
}

export async function listReports(max = 100) {
  const snap = await getDocs(query(collection(db, "reports"), orderBy("created_at", "desc"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), created_date: toIso(d.data().created_at) }));
}

export async function resolveReport(id) {
  await updateDoc(doc(db, "reports", id), { status: "resolved", resolved_at: serverTimestamp() });
}

