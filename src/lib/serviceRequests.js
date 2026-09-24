import { db } from "@/lib/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// بديل كيان ServiceRequest في Base44 → مجموعة service_requests في Firestore.
const col = collection(db, "service_requests");

const toIso = (ts) => (ts?.toDate ? ts.toDate().toISOString() : ts || null);

export async function listServiceRequests(max = 24) {
  const snap = await getDocs(query(col, orderBy("created_at", "desc"), limit(max)));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, created_date: toIso(data.created_at) };
  });
}

export async function createServiceRequest(user, data) {
  return addDoc(col, {
    ...data,
    comments: [],
    messages: [],
    status: "open",
    created_by: user.uid,
    created_by_email: user.email || null,
    created_at: serverTimestamp(),
  });
}

// arrayUnion يضيف العنصر دون إعادة كتابة المصفوفة كلها (لا يضيع تعليق كتبه شخص آخر في نفس اللحظة).
export async function addComment(requestId, comment) {
  await updateDoc(doc(db, "service_requests", requestId), { comments: arrayUnion(comment) });
}

export async function addMessage(requestId, message) {
  await updateDoc(doc(db, "service_requests", requestId), { messages: arrayUnion(message) });
}
