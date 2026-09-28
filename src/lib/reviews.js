import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { toIso } from "@/lib/serviceRequests";
import { PREVIEW, SAMPLE_REVIEWS } from "@/lib/previewData";

// reviews/{requestId} → تقييم واحد لكل طلب مكتمل، يكتبه صاحب الطلب لصاحب المهنة المسند إليه.
// في نفس الدفعة يُحدَّث مجموع/عدد التقييمات في public_profiles/{pro} (القواعد تتحقق من التطابق).

export async function submitReview(request, reviewer, { rating, text }) {
  const batch = writeBatch(db);
  batch.set(doc(db, "reviews", request.id), {
    request_id: request.id,
    service_type: request.service_type || null,
    pro_uid: request.assigned_to,
    reviewer_uid: reviewer.uid,
    reviewer_name: reviewer.display_name || reviewer.full_name || "عميل",
    rating,
    text: text || "",
    created_at: serverTimestamp(),
  });
  batch.update(doc(db, "public_profiles", request.assigned_to), {
    rating_sum: increment(rating),
    rating_count: increment(1),
    last_review_id: request.id,
  });
  await batch.commit();
}

export async function listReviewsForPro(uid) {
  if (PREVIEW) return SAMPLE_REVIEWS.filter((r) => r.pro_uid === uid);
  const snap = await getDocs(query(collection(db, "reviews"), where("pro_uid", "==", uid), limit(100)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data(), created_date: toIso(d.data().created_at) }))
    .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

export async function listReviewsByReviewer(uid) {
  const snap = await getDocs(query(collection(db, "reviews"), where("reviewer_uid", "==", uid), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
