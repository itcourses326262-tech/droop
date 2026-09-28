// اختبارات صلاحيات Firestore على المحاكي: npm run test:rules
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc, collection, writeBatch, serverTimestamp,
  increment, query, where, getDocs,
} from "firebase/firestore";

const env = await initializeTestEnvironment({
  projectId: "droob-test",
  firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 },
});

let pass = 0, fail = 0;
async function t(name, p) {
  try { await p; pass++; console.log("ok  ", name); }
  catch (e) { fail++; console.log("FAIL", name, "-", e.message.split("\n")[0]); }
}

// seed
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "users/admin"), { role: "admin", account_type: "client" });
  await setDoc(doc(db, "public_profiles/admin"), { account_type: "client" });
  await setDoc(doc(db, "users/pro"), { role: "user", account_type: "professional", id_card_uri: "x", intro_video_uri: "y" });
  await setDoc(doc(db, "public_profiles/pro"), { account_type: "professional", rating_sum: 0, rating_count: 0 });
  await setDoc(doc(db, "users/clientB"), { role: "user", account_type: "client" });
  await setDoc(doc(db, "public_profiles/clientB"), { account_type: "client" });
  await setDoc(doc(db, "users/outsider"), { role: "user", account_type: "client" });
  await setDoc(doc(db, "public_profiles/outsider"), { account_type: "client" });
});

const as = (uid) => env.authenticatedContext(uid).firestore();
const A = as("clientA"), P = as("pro"), B = as("clientB"), O = as("outsider"), ADM = as("admin");
const anon = env.unauthenticatedContext().firestore();

// --- profiles ---
{
  const b = writeBatch(A);
  b.set(doc(A, "users/clientA"), { role: "user", account_type: "client", display_name: "أ" }, { merge: true });
  b.set(doc(A, "public_profiles/clientA"), { account_type: "client", display_name: "أ" }, { merge: true });
  await t("client creates own profile + public", assertSucceeds(b.commit()));
}
await t("cannot read other private profile", assertFails(getDoc(doc(A, "users/pro"))));
await t("anyone reads public profile", assertSucceeds(getDoc(doc(anon, "public_profiles/pro"))));
await t("cannot become admin", assertFails(updateDoc(doc(A, "users/clientA"), { role: "admin" })));
{
  const b = writeBatch(A);
  b.set(doc(A, "users/clientA"), { account_type: "professional" }, { merge: true });
  b.set(doc(A, "public_profiles/clientA"), { account_type: "professional" }, { merge: true });
  await t("cannot become pro without docs", assertFails(b.commit()));
}
await t("public account_type must match private", assertFails(setDoc(doc(A, "public_profiles/clientA"), { account_type: "professional" }, { merge: true })));
await t("owner cannot self-verify", assertFails(updateDoc(doc(P, "public_profiles/pro"), { verified: true })));
await t("owner cannot fake rating", assertFails(updateDoc(doc(P, "public_profiles/pro"), { rating_sum: 50, rating_count: 10 })));
await t("admin verifies pro", assertSucceeds(updateDoc(doc(ADM, "public_profiles/pro"), { verified: true, updated_at: serverTimestamp() })));
await t("pro edits own public bio", assertSucceeds(
  (async () => { const b = writeBatch(P);
    b.set(doc(P, "users/pro"), { bio: "x" }, { merge: true });
    b.set(doc(P, "public_profiles/pro"), { bio: "x" }, { merge: true }); await b.commit(); })()));

// --- requests ---
const reqRef = doc(A, "service_requests/r1");
await t("client creates request", assertSucceeds(setDoc(reqRef, {
  service_type: "سباكة", description: "تسريب", status: "open", assigned_to: null, created_by: "clientA", created_at: serverTimestamp() })));
await t("cannot create request for someone else", assertFails(setDoc(doc(A, "service_requests/r2"), {
  service_type: "x", description: "y", status: "open", created_by: "pro" })));
await t("non-owner cannot edit request", assertFails(updateDoc(doc(P, "service_requests/r1"), { status: "done" })));
await t("owner cannot assign non-pro", assertFails(updateDoc(reqRef, { status: "in_progress", assigned_to: "clientB" })));

// --- comments ---
const cm = (db, uid, type, extra = {}) => addDoc(collection(db, "service_requests/r1/comments"), {
  author_uid: uid, author_name: "n", author_type: type, text: "عرض", offer_price: 100, created_at: serverTimestamp(), ...extra });
await t("pro comments with offer", assertSucceeds(cm(P, "pro", "professional")));
await t("other client cannot comment", assertFails(cm(B, "clientB", "client")));
await t("owner replies on own request", assertSucceeds(cm(A, "clientA", "client", { offer_price: null })));
await t("client cannot pretend to be pro", assertFails(cm(B, "clientB", "professional")));
await t("cannot comment as someone else", assertFails(cm(B, "pro", "professional")));
const proComment = await cm(P, "pro", "professional");
await t("stranger cannot delete comment", assertFails(deleteDoc(doc(B, proComment.path))));
await t("request owner deletes comment", assertSucceeds(deleteDoc(doc(A, proComment.path))));

// --- conversations ---
const cid = "clientA_pro_r1";
const conv = (db, me, other, rid, id) => setDoc(doc(db, "conversations", id), {
  participants: [me, other].sort(), participant_info: {}, request_id: rid, request_title: "t", updated_at: serverTimestamp() }, { merge: true });
await t("pro opens chat with request owner", assertSucceeds(conv(P, "pro", "clientA", "r1", cid)));
await t("owner re-opens same chat (merge update)", assertSucceeds(conv(A, "clientA", "pro", "r1", cid)));
await t("client→client direct chat denied", assertFails(conv(A, "clientA", "clientB", null, "clientA_clientB")));
await t("client→pro direct chat allowed", assertSucceeds(conv(B, "clientB", "pro", null, "clientB_pro")));
await t("client→client via request denied", assertFails(conv(B, "clientB", "clientA", "r1", "clientA_clientB_r1")));
await t("wrong conversation id denied", assertFails(conv(B, "clientB", "pro", null, "random")));
await t("outsider cannot open chat for others", assertFails(setDoc(doc(O, "conversations/clientB_pro"), {
  participants: ["clientB", "pro"], request_id: null })));
await t("outsider cannot read chat", assertFails(getDoc(doc(O, "conversations", cid))));
await t("participant reads chat", assertSucceeds(getDoc(doc(A, "conversations", cid))));
await t("participant lists own chats", assertSucceeds(getDocs(query(collection(A, "conversations"), where("participants", "array-contains", "clientA")))));
await t("cannot list others' chats", assertFails(getDocs(query(collection(O, "conversations"), where("participants", "array-contains", "clientA")))));
await t("participant cannot add third person", assertFails(updateDoc(doc(A, "conversations", cid), { participants: ["clientA", "outsider", "pro"] })));

const send = (db, uid, sender = uid) => {
  const b = writeBatch(db);
  b.set(doc(collection(db, `conversations/${cid}/messages`)), { sender_uid: sender, text: "مرحبا", created_at: serverTimestamp() });
  b.update(doc(db, "conversations", cid), { last_message: "مرحبا", last_message_at: serverTimestamp(), last_sender_uid: uid, [`last_read.${uid}`]: serverTimestamp() });
  return b.commit();
};
await t("participant sends message", assertSucceeds(send(A, "clientA")));
await t("other participant replies", assertSucceeds(send(P, "pro")));
await t("sender spoofing denied", assertFails(send(A, "clientA", "pro")));
await t("outsider cannot send", assertFails(addDoc(collection(O, `conversations/${cid}/messages`), { sender_uid: "outsider", text: "x", created_at: serverTimestamp() })));
await t("outsider cannot read messages", assertFails(getDocs(collection(O, `conversations/${cid}/messages`))));
await t("participant reads messages", assertSucceeds(getDocs(collection(A, `conversations/${cid}/messages`))));
await t("participant marks read", assertSucceeds(updateDoc(doc(P, "conversations", cid), { "last_read.pro": serverTimestamp() })));

// --- reviews ---
await t("owner assigns pro", assertSucceeds(updateDoc(reqRef, { status: "in_progress", assigned_to: "pro", assigned_name: "p" })));
const review = (db, uid, rating, sumInc = rating) => {
  const b = writeBatch(db);
  b.set(doc(db, "reviews/r1"), { request_id: "r1", pro_uid: "pro", reviewer_uid: uid, reviewer_name: "n", rating, text: "", created_at: serverTimestamp() });
  b.update(doc(db, "public_profiles/pro"), { rating_sum: increment(sumInc), rating_count: increment(1), last_review_id: "r1" });
  return b.commit();
};
await t("cannot review before done", assertFails(review(A, "clientA", 5)));
await t("owner marks done", assertSucceeds(updateDoc(reqRef, { status: "done" })));
await t("stranger cannot review", assertFails(review(B, "clientB", 5)));
await t("rating sum must match review", assertFails(review(A, "clientA", 5, 50)));
await t("rating out of range", assertFails(review(A, "clientA", 9)));
await t("owner reviews assigned pro", assertSucceeds(review(A, "clientA", 4)));
await t("second review denied", assertFails(review(A, "clientA", 5)));
let pp; await env.withSecurityRulesDisabled(async (ctx) => { pp = (await getDoc(doc(ctx.firestore(), "public_profiles/pro"))).data(); });
await t("rating aggregate stored", pp.rating_sum === 4 && pp.rating_count === 1 ? Promise.resolve() : Promise.reject(new Error(JSON.stringify(pp))));

// --- reports ---
await t("user reports content", assertSucceeds(addDoc(collection(B, "reports"), {
  reporter_uid: "clientB", target_type: "comment", target_id: "x", status: "open", reason: "" })));
await t("user cannot read reports", assertFails(getDocs(collection(B, "reports"))));
await t("admin reads reports", assertSucceeds(getDocs(collection(ADM, "reports"))));
await t("admin deletes any request", assertSucceeds(deleteDoc(doc(ADM, "service_requests/r1"))));

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
