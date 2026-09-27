import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// رفع الملفات (صور/فيديو) معطّل حتى يُفعَّل Firebase Storage في المشروع.
// للتفعيل: فعّل Storage من لوحة Firebase ثم ضع VITE_FIREBASE_STORAGE_ENABLED=true في .env.local.
export const storageEnabled = import.meta.env.VITE_FIREBASE_STORAGE_ENABLED === "true";

const safeName = (name) => name.replace(/[^\w.\-]+/g, "_").slice(-80);

// يرفع ملفًا إلى Firebase Storage ويعيد { path, url }.
// الملفات الخاصة (البطاقة، الفيديو التعريفي) تُحفظ تحت private/ ولا يُعاد لها رابط عام.
export async function uploadFile(folder, file, { isPrivate = false } = {}) {
  if (!storageEnabled) throw new Error("storage-disabled");
  const path = `${folder}/${Date.now()}_${safeName(file.name || "file")}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || undefined });
  const url = isPrivate ? null : await getDownloadURL(fileRef);
  return { path, url };
}
