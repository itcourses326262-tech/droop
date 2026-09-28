// كل صور الموقع في مكان واحد.
// ⚠️ هذه الصور ما زالت مستضافة على media.base44.com (من المشروع الأصلي).
// لفصل الموقع عن Base44 نهائيًا: ضع الصور في public/images/ واستبدل كل رابط بمسار مثل "/images/hero.jpg"
// (أو ارفعها إلى Firebase Storage/Hosting واستخدم روابطها).
export const siteImages = {
  category1: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/570108bce_generated_c367fa61.jpg",
  category2: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/a40df07e9_generated_bff6a651.jpg",
  category3: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/4fec86070_generated_f85e0109.jpg",
  category4: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/ecaf8f876_generated_122be2f0.jpg",
  category5: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/60ceda666_generated_48e10376.jpg",
  category6: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/8038fb2cb_generated_e094d350.jpg",
  pro1: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/456be3400_generated_c0940ea4.jpg",
  pro2: "https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/63d7c403f_generated_88cba957.jpg",
};

// نسخة المعاينة داخل Claude لا تستطيع تحميل صور من مواقع خارجية،
// فتُستبدل الصور بخلفيات متدرجة بألوان الموقع (VITE_PREVIEW_IMAGES=placeholder).
if (import.meta.env.VITE_PREVIEW_IMAGES === "placeholder") {
  const tones = {
    category1: ["#0f766e", "#134e4a"],
    category2: ["#0e7490", "#164e63"],
    category3: ["#0d9488", "#115e59"],
    category4: ["#047857", "#064e3b"],
    category5: ["#0891b2", "#155e75"],
    category6: ["#1f3b39", "#0c1a19"],
    pro1: ["#14b8a6", "#0f766e"],
    pro2: ["#10b981", "#047857"],
  };
  for (const [key, [a, b]] of Object.entries(tones)) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/>` +
      `<stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/>` +
      `<g fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2">` +
      `<circle cx="640" cy="120" r="180"/><circle cx="160" cy="520" r="240"/></g></svg>`;
    siteImages[key] = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}
