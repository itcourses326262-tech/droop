import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { toIso } from "@/lib/serviceRequests";

// conversations/{cid}                → محادثة خاصة بين شخصين (اختياريًا بخصوص طلب خدمة)
// conversations/{cid}/messages/{mid} → الرسائل
// لا يقرأ المحادثة أو رسائلها إلا طرفاها (انظر firestore.rules).

export const MAX_MESSAGE_LENGTH = 2000;

// معرّف ثابت لكل زوج (+ طلب) حتى لا تتكرر المحادثة.
export function conversationId(uidA, uidB, requestId) {
  return [uidA, uidB].sort().join("_") + (requestId ? `_${requestId}` : "");
}

const personInfo = (p) => ({ name: p.name || "مستخدم", photo: p.photo || null });

// يفتح محادثة (ينشئها إن لم تكن موجودة) ويعيد معرّفها.
// me/other = { uid, name, photo } — request = { id, title } اختياري.
export async function openConversation(me, other, request) {
  const cid = conversationId(me.uid, other.uid, request?.id);
  await setDoc(
    doc(db, "conversations", cid),
    {
      participants: [me.uid, other.uid].sort(),
      participant_info: { [me.uid]: personInfo(me), [other.uid]: personInfo(other) },
      request_id: request?.id || null,
      request_title: request?.title || null,
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
  return cid;
}

const fromDoc = (d) => {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    last_message_date: toIso(data.last_message_at),
    created_date: toIso(data.created_at),
  };
};

export function subscribeMyConversations(uid, cb, onError) {
  return onSnapshot(
    query(collection(db, "conversations"), where("participants", "array-contains", uid), limit(100)),
    (snap) =>
      cb(
        snap.docs
          .map(fromDoc)
          .sort((a, b) => (b.last_message_date || "").localeCompare(a.last_message_date || ""))
      ),
    onError
  );
}

export function subscribeConversation(cid, cb, onError) {
  return onSnapshot(doc(db, "conversations", cid), (d) => cb(d.exists() ? fromDoc(d) : null), onError);
}

export function subscribeMessages(cid, cb, onError) {
  return onSnapshot(
    query(collection(db, "conversations", cid, "messages"), orderBy("created_at", "asc"), limit(300)),
    { includeMetadataChanges: false },
    (snap) => cb(snap.docs.map(fromDoc)),
    onError
  );
}

export async function sendMessage(cid, uid, text) {
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, "conversations", cid, "messages"));
  batch.set(msgRef, { sender_uid: uid, text, created_at: serverTimestamp() });
  batch.update(doc(db, "conversations", cid), {
    last_message: text.slice(0, 140),
    last_message_at: serverTimestamp(),
    last_sender_uid: uid,
    [`last_read.${uid}`]: serverTimestamp(),
  });
  await batch.commit();
}

export async function markConversationRead(cid, uid) {
  await updateDoc(doc(db, "conversations", cid), { [`last_read.${uid}`]: serverTimestamp() });
}

export function isUnread(conv, uid) {
  if (!conv.last_message_at || conv.last_sender_uid === uid) return false;
  const read = conv.last_read?.[uid];
  if (!read?.toMillis) return true;
  return read.toMillis() < conv.last_message_at.toMillis();
}

