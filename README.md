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

## الصفحات

| المسار | الوصف |
|---|---|
| `/` | الصفحة الرئيسية + سوق الطلبات (العروض والتعليقات لحظيًا) |
| `/login`, `/register` | الدخول/التسجيل بالبريد أو **Google** (مستخدم Google الجديد يُوجَّه لإكمال ملفه) |
| `/pros`, `/pros/:uid` | دليل أصحاب المهن + الصفحة العامة (التقييمات، زر المراسلة) |
| `/requests/:id` | تفاصيل طلب |
| `/dashboard` | طلباتي: قبول العروض، الإسناد، إكمال/إلغاء، التقييم — و«الأعمال المسندة إليّ» لصاحب المهنة |
| `/messages`, `/messages/:cid` | المحادثات الخاصة (لحظيًا) مع عدّاد غير المقروءة في الشريط العلوي |
| `/profile` | تعديل الملف، والتحويل إلى صاحب مهنة (يتطلب البطاقة + فيديو تعريفي) |
| `/admin` | لوحة الإدارة: البلاغات، حذف المحتوى، المستخدمون، توثيق أصحاب المهن |

## الصلاحيات

| الإجراء | من يستطيع |
|---|---|
| نشر طلب خدمة | أي مستخدم مسجّل |
| تعديل حالة الطلب / إسناده / حذفه | صاحب الطلب (والأدمن) |
| التعليق وتقديم عرض سعر | أصحاب المهن على الطلبات المفتوحة/قيد التنفيذ، وصاحب الطلب للرد |
| حذف تعليق | كاتبه، أو صاحب الطلب، أو الأدمن |
| بدء محادثة | صاحب الطلب ↔ صاحب مهنة بخصوص الطلب، أو أي مستخدم مع صاحب مهنة مباشرة |
| قراءة المحادثة وإرسال الرسائل | طرفا المحادثة فقط (ولا حتى الأدمن) |
| التقييم | صاحب الطلب، مرة واحدة، بعد اكتماله، للمنفّذ فقط |
| الإبلاغ عن محتوى | أي مستخدم مسجّل — والبلاغات يقرؤها الأدمن فقط |
| توثيق صاحب مهنة (شارة ✓) | الأدمن فقط |

**تعيين أدمن:** من Firebase Console ← Firestore ← `users/{uid}` غيّر الحقل `role` إلى `admin`
(لا يستطيع أي مستخدم ترقية نفسه).

كل هذه القواعد مطبّقة في `firestore.rules` ومغطاة باختبارات على المحاكي:

```bash
npm run test:rules    # يتطلب Java
```

## هيكل البيانات

| Firestore | الوصف |
|---|---|
| `users/{uid}` | الملف الخاص (لصاحبه وللأدمن): البريد، الهاتف، `role`، `account_type`، مسارات البطاقة/الفيديو، الموقع… |
| `public_profiles/{uid}` | الملف العام (للجميع): الاسم، الصورة، `account_type`، المهنة، المدينة، النبذة، `verified`، `rating_sum`/`rating_count` |
| `service_requests/{id}` | طلب خدمة: `service_type`، `description`، `budget`، `execution_date`، `media[]`، `status` (open/in_progress/done/cancelled)، `assigned_to`، `created_by` |
| `service_requests/{id}/comments/{cid}` | عرض/تعليق مرتبط بحساب الكاتب: `author_uid`، `author_type`، `text`، `offer_price` |
| `conversations/{cid}` | محادثة بين شخصين: `participants[2]`، `participant_info`، `request_id`، `last_message`، `last_read` |
| `conversations/{cid}/messages/{mid}` | الرسائل: `sender_uid`، `text`، `created_at` |
| `reviews/{requestId}` | تقييم واحد لكل طلب مكتمل: `pro_uid`، `reviewer_uid`، `rating` (1–5)، `text` |
| `reports/{id}` | بلاغات المستخدمين (للأدمن) |

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
- `src/lib/serviceRequests.js` — طلبات الخدمة والتعليقات
- `src/lib/conversations.js` — المراسلة الخاصة
- `src/lib/reviews.js` — التقييمات
- `src/lib/moderation.js` — البلاغات
- `src/lib/authActions.js` — الدخول عبر Google
- `src/lib/storage.js` — رفع الملفات إلى Storage
- `src/lib/siteImages.js` — كل صور الموقع في مكان واحد
