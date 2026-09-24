# دروب (Droob)

منصة عربية تربط العملاء بأصحاب المهن لخدمات الصيانة والمنزل.
الواجهة: React + Vite + Tailwind + shadcn/ui — الخلفية: **Firebase** (Auth + Firestore + Storage + Hosting).

> المشروع نُقل بالكامل من Base44 إلى Firebase ولم يعد يعتمد على Base44 في أي شيء
> (باستثناء صور الموقع الثابتة — انظر `src/lib/siteImages.js`).

## التشغيل محليًا

```bash
npm install
npm run dev        # http://localhost:5173
```

إعدادات Firebase موجودة في `src/lib/firebase.js` (مشروع `drop-4e1e7`).
لاستخدام مشروع آخر انسخ `.env.example` إلى `.env.local` واملأ القيم.

## إعداد Firebase (مرة واحدة من Firebase Console)

1. **Authentication → Sign-in method**: فعّل **Email/Password** و **Google**.
2. **Authentication → Settings → Authorized domains**: أضف نطاق موقعك (و `localhost` للتطوير).
3. **Firestore Database**: أنشئ قاعدة البيانات.
4. **Storage**: فعّل التخزين.
5. (اختياري) **Authentication → Templates → Password reset → Customize action URL**:
   ضعه `https://<نطاقك>/reset-password` لو أردت صفحة إعادة تعيين كلمة المرور الخاصة بالموقع
   بدلًا من صفحة Firebase الافتراضية.

## النشر (Firebase Hosting + القواعد)

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy     # ينشر الموقع + firestore.rules + storage.rules
```

## هيكل البيانات

| Firestore | الوصف |
|---|---|
| `users/{uid}` | ملف المستخدم: `account_type` (client/professional)، `display_name`، `profile_picture`، الموقع، `id_card_uri`/`intro_video_uri` (مسارات Storage خاصة)… |
| `service_requests/{id}` | طلب خدمة: `service_type`، `description`، `budget`، `execution_date`، `media[]`، `status`، `comments[]`، `messages[]`، `created_by`، `created_at` |

| Storage | الوصول |
|---|---|
| `users/{uid}/public/*` | الصورة الشخصية — عامة |
| `users/{uid}/private/*` | البطاقة والفيديو التعريفي — لصاحبها فقط |
| `service_requests/{uid}/*` | صور/فيديو الطلبات — عامة |

القواعد الأمنية في `firestore.rules` و `storage.rules`.

## ملفات مهمة

- `src/lib/firebase.js` — تهيئة Firebase
- `src/lib/AuthContext.jsx` — الجلسة عبر `onAuthStateChanged`
- `src/lib/firebaseUsers.js` — ملف المستخدم في Firestore
- `src/lib/serviceRequests.js` — طلبات الخدمة (قراءة/إنشاء/تعليقات/رسائل)
- `src/lib/storage.js` — رفع الملفات إلى Storage
- `src/lib/siteImages.js` — كل صور الموقع في مكان واحد
