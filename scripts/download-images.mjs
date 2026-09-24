// ينزّل كل صور الموقع المستضافة خارجيًا (مثل media.base44.com) إلى public/images
// ويحدّث src/lib/siteImages.js ليستخدم النسخ المحلية.
// التشغيل: npm run download-images
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const imagesFile = path.join(root, "src/lib/siteImages.js");
const outDir = path.join(root, "public/images");

let source = await readFile(imagesFile, "utf8");
const entries = [...source.matchAll(/^\s*(\w+):\s*"(https?:\/\/[^"]+)"/gm)];

if (entries.length === 0) {
  console.log("كل الصور محلية بالفعل — لا يوجد شيء للتنزيل.");
  process.exit(0);
}

await mkdir(outDir, { recursive: true });
let failed = 0;
for (const [, key, url] of entries) {
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const fileName = `${key}${ext}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path.join(outDir, fileName), Buffer.from(await res.arrayBuffer()));
    source = source.replace(`"${url}"`, `"/images/${fileName}"`);
    console.log(`✓ ${key} → public/images/${fileName}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${key}: ${e.message} (${url})`);
  }
}

await writeFile(imagesFile, source);
console.log(failed ? `\nفشل تنزيل ${failed} صورة — أعد التشغيل لاحقًا.` : "\nتم تنزيل كل الصور.");
process.exit(failed ? 1 : 0);
