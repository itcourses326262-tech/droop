import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

// service_requests/{id}                   → طلب الخدمة
// service_requests/{id}/comments/{cid}    → تعليقات/عروض أصحاب المهن (مرتبطة بحساب الكاتب)
const col = collection(db, "service_requests");

export const toIso = (ts) => (ts?.toDate ? ts.toDate().toISOString() : ts || null);

const fromDoc = (d) => {
  const data = d.data();
  return { id: d.id, ...data, created_date: toIso(data.created_at) };
};

export async function listServiceRequests(max = 24) {
  const snap = await getDocs(query(col, orderBy("created_at", "desc"), limit(max)));
  return snap.docs.map(fromDoc);
}

export async function getServiceRequest(id) {
  const snap = await getDoc(doc(db, "service_requests", id));
  return snap.exists() ? fromDoc(snap) : null;
}

// طلبات مستخدم معيّن (الترتيب في المتصفح لتجنّب فهرس مركّب).
export async function listMyRequests(uid) {
  const snap = await getDocs(query(col, where("created_by", "==", uid), limit(100)));
  return snap.docs.map(fromDoc).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

// الطلبات المسندة إلى صاحب مهنة.
export async function listAssignedRequests(uid) {
  const snap = await getDocs(query(col, where("assigned_to", "==", uid), limit(100)));
  return snap.docs.map(fromDoc).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

export async function createServiceRequest(user, data) {
  return addDoc(col, {
    ...data,
    status: "open",
    assigned_to: null,
    assigned_name: null,
    created_by: user.uid,
    created_by_name: user.display_name || user.full_name || null,
    created_by_email: user.email || null,
    created_at: serverTimestamp(),
  });
}

// صاحب الطلب يغيّر الحالة، ويسند الطلب لصاحب مهنة عند بدء التنفيذ.
export async function updateRequestStatus(requestId, status, assignee) {
  const update = { status, updated_at: serverTimestamp() };
  if (assignee !== undefined) {
    update.assigned_to = assignee?.uid || null;
    update.assigned_name = assignee?.name || null;
  }
  await updateDoc(doc(db, "service_requests", requestId), update);
}

// Firestore لا يحذف المجموعات الفرعية تلقائيًا، فنحذف التعليقات أولًا.
export async function deleteServiceRequest(requestId) {
  const comments = await getDocs(commentsCol(requestId));
  await Promise.all(comments.docs.map((c) => deleteDoc(c.ref)));
  await deleteDoc(doc(db, "service_requests", requestId));
}

// ---- التعليقات ----

const commentsCol = (requestId) => collection(db, "service_requests", requestId, "comments");

export function subscribeComments(requestId, cb, onError) {
  return onSnapshot(
    query(commentsCol(requestId), orderBy("created_at", "asc"), limit(100)),
    (snap) => cb(snap.docs.map(fromDoc)),
    onError
  );
}

export async function addComment(requestId, user, { text, offer_price }) {
  return addDoc(commentsCol(requestId), {
    author_uid: user.uid,
    author_name: user.display_name || user.full_name || "مستخدم",
    author_photo: user.profile_picture || null,
    author_type: user.account_type || "client",
    text,
    offer_price: offer_price ?? null,
    created_at: serverTimestamp(),
  });
}

export async function deleteComment(requestId, commentId) {
  await deleteDoc(doc(db, "service_requests", requestId, "comments", commentId));
}
