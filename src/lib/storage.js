import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const safeName = (name) => name.replace(/[^\w.\-]+/g, "_").slice(-80);

// يرفع ملفًا إلى Firebase Storage ويعيد { path, url }.
// الملفات الخاصة (البطاقة، الفيديو التعريفي) تُحفظ تحت private/ ولا يُعاد لها رابط عام.
export async function uploadFile(folder, file, { isPrivate = false } = {}) {
  const path = `${folder}/${Date.now()}_${safeName(file.name || "file")}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || undefined });
  const url = isPrivate ? null : await getDownloadURL(fileRef);
  return { path, url };
}
