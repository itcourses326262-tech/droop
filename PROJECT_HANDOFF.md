# دروب — ملف تسليم المشروع (Handoff)

> ✅ **تم تنفيذ الانتقال:** المشروع الآن يعمل على Firebase بالكامل ولا يعتمد على Base44.
> هذه الوثيقة تصف الوضع القديم على Base44 للرجوع إليه فقط — للوضع الحالي راجع `README.md`.

> وثيقة شاملة لمواصلة تطوير منصة "دروب" على أي بيئة خارجية (مثل Claude / Claude Code).
> الهدف: نقل كل ما هو موجود حاليًا في تطبيق Base44 إلى مشروع Firebase مستقل.

---

## ١. نظرة عامة على المنتج

**دروب** منصة عربية (RTL) تربط العملاء بأصحاب المهن الموثوقين لخدمات الصيانة والمنزل:
- العميل يستعرض الخدمات وينشر طلب خدمة (مع صور/فيديو للمشكلة).
- صاحب المهنة يرى الطلبات، يعلّق عليها بعرضه، ويراسل العميل خاصًا.
- تصميم عصري بألوان Slate/Teal/Emerald، صفحة واحدة (SPA) مع نافذة طلب خدمة.

---

## ٢. البنية التقنية الحالية (على Base44)

| الطبقة | التقنية | ملاحظة |
|---|---|---|
| الواجهة | React 18 + Vite + Tailwind CSS | شجرة الملفات أدناه |
| مكوّنات UI | shadcn/ui (`@/components/ui/*`) + lucide-react | مثبّتة مسبقًا |
| المصادقة | `base44.auth` (email/password + Google + OTP) | **لا يمكن استبداله بـ Firebase داخل Base44** |
| قاعدة البيانات | كيان `ServiceRequest` عبر `base44.entities` | RLS مفعّل |
| التخزين | `base44.integrations.Core.UploadPublicFile/UploadPrivateFile` | للصور/الفيديو |
| الخرائط | react-leaflet | في نموذج التسجيل |
| Firebase (موازٍ) | Firebase Auth + Firestore + Storage | تكامل تكميلي فقط |

### ⚠️ القيد الأساسي
**لا يمكن فصل الواجهة عن نظام Base44 للدخول.** حتى لو استخدمت Firebase Auth للمصادقة، التطبيق على Base44 يحتاج `base44.auth` لتأسيس الجلسة وفتح المسارات والوصول للبيانات؛ بدونها يظهر "غير مسجّل" ولا يفتح التطبيق. لذلك **الانتقال إلى Firebase كنظام دخول وحيد يتطلب إعادة بناء المشروع خارج Base44 بالكامل** — وهذا هو الهدف من هذه الوثيقة.

---

## ٣. شجرة ملفات المصدر

```
src/
├─ App.jsx                      # الموجّه (Routes) + AuthProvider + QueryClientProvider + Toaster
├─ index.css                    # رموز التصميم (Design Tokens) + Tailwind layers
├─ main.jsx                     # نقطة الدخول
├─ api/
│  └─ base44Client.js           # عميل Base44 SDK المُهيّأ (يُستبدل بـ Firebase في المشروع الجديد)
├─ lib/
│  ├─ AuthContext.jsx           # سياق المصادقة (base44.auth + مزامنة Firebase)
│  ├─ firebase.js               # تهيئة Firebase (Auth + Firestore + Storage)
│  ├─ firebaseAuth.js           # إنشاء/تسجيل دخول حساب Firebase موازٍ
│  ├─ firebaseUsers.js          # مزامنة بيانات المستخدم إلى Firestore (users/{id})
│  ├─ authReturnTo.js           # أداة returnTo الآمن
│  ├─ app-params.js             # قراءة token من URL/التخزين (خاص بـ Base44)
│  ├─ query-client.js           # عميل TanStack Query
│  ├─ utils.js                  # cn() وغيرها
│  └─ PageNotFound.jsx          # صفحة 404
├─ components/
│  ├─ AuthLayout.jsx            # قالب صفحات الدخول/التسجيل
│  ├─ GoogleIcon.jsx            # شعار Google
│  ├─ ProtectedRoute.jsx        # حارس المسارات (يعتمد على Base44)
│  ├─ ScrollToTop.jsx           # إعادة التمرير عند التنقل
│  ├─ UserNotRegisteredError.jsx
│  ├─ ui/                       # مكوّنات shadcn/ui (button, input, dialog, …)
│  └─ droob/
│     ├─ Navbar.jsx             # شريط تنقل + زر "صاحب مهنة" + زر "اطلب خدمة"
│     ├─ Hero.jsx                # قسم البطل مع صورة وصندوق بحث
│     ├─ Categories.jsx          # شبكة الخدمات
│     ├─ HowItWorks.jsx         # خطوات العمل
│     ├─ FeaturedPros.jsx       # المحترفون المميزون
│     ├─ RequestsFeed.jsx       # سوق الطلبات + تعليقات + مراسلة + Lightbox
│     ├─ RequestServiceModal.jsx# نافذة إنشاء طلب خدمة (مع رفع وسائط)
│     ├─ MessageModal.jsx       # نافذة مراسلة خاصة
│     ├─ LocationPicker.jsx     # منتقي الموقع على خريطة Leaflet
│     ├─ LiveVideoRecorder.jsx  # تسجيل فيديو تعريفي مباشر (60–300 ثانية)
│     ├─ Testimonials.jsx
│     ├─ CTA.jsx
│     ├─ Footer.jsx
│     └─ ScrollProgress.jsx     # شريط تقدم التمرير
└─ pages/
   ├─ Home.jsx                  # الصفحة الرئيسية (تجميع الأقسام)
   ├─ Login.jsx                 # تسجيل الدخول (Base44 + Firebase موازٍ)
   ├─ Register.jsx              # التسجيل متعدد الخطوات + OTP + رفع ملفات
   ├─ ForgotPassword.jsx
   └─ ResetPassword.jsx
```

---

## ٤. كيان قاعدة البيانات: `ServiceRequest`

```jsonc
{
  "name": "ServiceRequest",
  "type": "object",
  "properties": {
    "service_type": { "type": "string", "title": "نوع الخدمة" },
    "description": { "type": "string", "title": "وصف المشكلة" },
    "budget": { "type": "number", "title": "الميزانية المتوقعة" },
    "execution_date": { "type": "string", "format": "date", "title": "التاريخ المناسب للتنفيذ" },
    "media": { "type": "array", "items": { "type": "string" }, "title": "ملفات الطلب" },
    "status": { "type": "string", "enum": ["open", "in_progress", "done"], "default": "open" },
    "comments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "author_name": { "type": "string" },
          "text": { "type": "string" },
          "created_date": { "type": "string", "format": "date-time" }
        },
        "required": ["author_name", "text"]
      },
      "title": "تعليقات أصحاب المهن"
    },
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "professional_name": { "type": "string" },
          "from_name": { "type": "string" },
          "text": { "type": "string" },
          "created_date": { "type": "string", "format": "date-time" }
        },
        "required": ["professional_name", "from_name", "text"]
      },
      "title": "رسائل مباشرة لأصحاب المهن"
    }
  },
  "required": ["service_type", "description"]
}
```

**قواعد RLS الحالية:**
- `create`: المنشئ فقط (`created_by_id == user.id`)
- `read`: مفتوح (null)
- `update`: مفتوح (للسماح بالتعليقات والمراسلة)
- `delete`: المنشئ أو الأدمن

### تعيين Firestore المقابل (للمشروع الجديد)
```
collection: service_requests/{requestId}
fields: service_type, description, budget, execution_date, media[], status,
        comments[], messages[], created_by (uid), created_at
sub-collection بديل: messages/{messageId}  (أفضل للمراسلة الحية)
```

---

## ٥. تدفقات المصادقة (الحالية)

### التسجيل (Register.jsx)
1. نموذج: نوع الحساب (عميل/صاحب مهنة)، الاسم، صورة شخصية، الموقع (Leaflet)، بريد، كلمة مرور، تأكيد.
2. لو صاحب مهنة: صورة بطاقة، نبذة تعريفية، فيديو تعريفي (رفع أو تسجيل مباشر ٦٠–٣٠٠ ثانية).
3. `base44.auth.register({ email, password })` → لا يسجّل الدخول، المستخدم غير مُوثّق.
4. (موازٍ) `registerFirebaseUser(email, password)` → حساب Firebase Auth.
5. يعرض شاشة OTP (٦ أرقام).
6. `base44.auth.verifyOtp({ email, otpCode })` → access_token → `setToken`.
7. `saveProfile()` يرفع الملفات و`base44.auth.updateMe({...})` لبيانات الملف الشخصي.
8. إعادة توجيه إلى `returnTo`.

### الدخول (Login.jsx)
1. بريد + كلمة مرور → `base44.auth.loginViaEmailPassword`.
2. (موازٍ) `loginFirebaseUser(email, password)`.
3. إعادة توجيه إلى `returnTo`.
- زر Google → `base44.auth.loginWithProvider("google", returnTo)`.

### سياق المصادقة (AuthContext.jsx)
- `checkAppState()` يحمّل الإعدادات العامة ثم يتحقق من الـ token.
- `checkUserAuth()` يستدعي `base44.auth.me()` ثم `syncUserToFirebase(currentUser)` (نسخة Firestore).
- `logout()` و`navigateToLogin()` يستخدمان `base44.auth`.

---

## ٦. تكامل Firebase (الحالي)

**الإعدادات** (`src/lib/firebase.js`):
```js
const firebaseConfig = {
  apiKey: "AIzaSyBJSkbEKRR9fAkFTXE3x1ZEcjtPzP5bd7o",
  authDomain: "drop-4e1e7.firebaseapp.com",
  projectId: "drop-4e1e7",
  storageBucket: "drop-4e1e7.firebasestorage.app",
  messagingSenderId: "47244910812",
  appId: "1:47244910812:web:3b23ca641dccd158925419",
  measurementId: "G-DG65EV7ECM",
};
```

**الوحدات:**
- `firebaseAuth.js` → `registerFirebaseUser` / `loginFirebaseUser` (حساب Auth موازٍ).
- `firebaseUsers.js` → `syncUserToFirebase` (نسخة `users/{uid}` في Firestore).

**المجموعات الحالية في Firestore:**
- `users/{base44UserId}` — نسخة بيانات المستخدم (account_type, display_name, location, profile_picture…).

**قواعد Firestore المطلوبة** (بدون Firebase Auth كنظام أساسي):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} { allow read, write: if true; }
  }
}
```

---

## ٧. رموز التصميم (Design Tokens)

من `src/index.css` (قيم HSL):
| الرمز | القيمة (light) |
|---|---|
| `--background` | `156 14% 97%` |
| `--foreground` | `210 16% 12%` |
| `--primary` | `174 100% 26%` (تركواز) |
| `--accent` | `158 60% 55%` (أخضر زمردي) |
| `--secondary` | `200 12% 95%` (رمادي) |
| `--border` | `200 12% 88%` |
| `--radius` | `0.75rem` |
| `--font-heading/body/display` | `IBM Plex Sans Arabic` |

- الاتجاه RTL، خط `IBM Plex Sans Arabic` من Google Fonts.
- Tailwind config يربط الرموز بأسماء الألوان (`primary`, `accent`, …).
- أصناف مخصصة: `.glass`, `.glass-light`, `.pulse-glow`, `.path-line`, `.scrollbar-hide`.

---

## ٨. مكوّنات وأقسام الواجهة الرئيسية

- **Navbar**: ثابت، يتحول لـ glass-light عند التمرير؛ أزرار "تسجيل الدخول"، "صاحب مهنة" (لون accent)، "اطلب خدمة" (لون primary) يفتح `RequestServiceModal`.
- **Hero**: صورة خلفية + عنوان رئيسي + صندوق بحث + شريط إحصائيات.
- **Categories**: شبكة الخدمات (كهرباء، سباكة، دهان…).
- **HowItWorks**: ٣ خطوات.
- **FeaturedPros**: بطاقات المحترفين الموثوقين.
- **RequestsFeed**: شبكة طلبات الطلبات، كل بطاقة تعرض وسائط (مع Lightbox) + تعليقات + إضافة تعليق + زر "مراسلة" يفتح `MessageModal`.
- **RequestServiceModal**: نوع خدمة + وصف + ميزانية + تاريخ + رفع وسائط (صور/فيديو) → ينشئ `ServiceRequest`.
- **MessageModal**: محادثة خاصة بين العميل وصاحب المهنة، تُحفظ في `messages[]` بالطلب.
- **LocationPicker**: خريطة Leaflet + زر "موقعي الحالي" + حقل العنوان.
- **LiveVideoRecorder**: يطلب الكاميرا، يسجّل، يعرض معاينة، يفرض مدة ٦٠–٣٠٠ ثانية.
- **Testimonials / CTA / Footer**.

---

## ٩. خطة الانتقال إلى مشروع Firebase مستقل

للانتقال خارج Base44 بالكامل (الهدف النهائي):

1. **إنشاء مشروع Vite + React جديد** (خارج Base44) بنفس شجرة الملفات في القسم ٣.
2. **المصادقة**: استبدل كل `base44.auth.*` بـ Firebase Auth:
   - `register` → `createUserWithEmailAndPassword` + إرسال تفعيل البريد.
   - `login` → `signInWithEmailAndPassword`.
   - `me()` / الجلسة → `onAuthStateChanged`.
   - Google → `signInWithPopup(GoogleAuthProvider)`.
   - حارس المسارات → مكوّن `ProtectedRoute` يقرأ `auth.currentUser`.
   - حذف خطوات OTP الخاصة بـ Base44 (أو استخدام Firebase Email Verification بدلها).
3. **قاعدة البيانات**: استبدل `base44.entities.ServiceRequest.*` بـ Firestore:
   - `list/filter` → `getDocs(query(collection, orderBy, where))`.
   - `create` → `addDoc`.
   - `update` → `updateDoc` (أو `arrayUnion` للتعليقات/الرسائل).
   - `delete` → `deleteDoc`.
   - اشتراك لحظي → `onSnapshot`.
4. **التخزين**: استبدل `UploadPublicFile/UploadPrivateFile` بـ Firebase Storage:
   - `uploadBytes(ref(storage, path), file)` ثم `getDownloadURL`.
   - الملفات الخاصة (بطاقة، فيديو تعريفي) → storage مع rules تقييدية + signed URLs.
5. **مزامنة المستخدم**: أبقِ `syncUserToFirebase` لكن اجعل الـ key هو `auth.currentUser.uid` لا `base44 user.id`.
6. **قواعد Firestore الآمنة** (بعد تفعيل Firebase Auth):
   ```
   match /users/{userId} { allow read, write: if request.auth.uid == userId; }
   match /service_requests/{reqId} {
     allow read: if request.auth != null;
     allow create: if request.auth.uid == resource.data.created_by;
     allow update: if request.auth != null; // للتعليقات/الرسائل
     allow delete: if request.auth.uid == resource.data.created_by;
   }
   ```
7. **النطاقات المصرّح بها**: أضف نطاق الاستضافة الجديد في Firebase Console ← Authentication ← Settings ← Authorized domains.
8. **تحديث المسارات**: أبقِ نفس المسارات في `App.jsx` (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/`) ولكن بدّل `ProtectedRoute` ليعتمد على Firebase.

---

## ١٠. الحزم المثبّتة (للنسخ في مشروع جديد)

```
react react-dom react-router-dom
tailwindcss tailwindcss-animate
@radix-ui/* (حسب مكوّنات shadcn المستخدمة)
class-variance-authority clsx tailwind-merge
lucide-react date-fns lodash moment
recharts react-leaflet react-markdown react-quill-new
react-hook-form @hookform/resolvers zod
@tanstack/react-query
framer-motion three
firebase
input-otp
```

> shadcn/ui: انسخ مكوّنات `src/components/ui/*` كما هي (تعتمد على radix + cn).

---

## ١١. نقاط مهمة قبل البدء مع Claude

- اللغة: كل النصوص بالعربية مع تخطيط RTL (`dir="rtl"` على `<html>`).
- الخط: حمّل `IBM Plex Sans Arabic` من Google Fonts في `index.html`.
- صور البطل والمحترفين: روابط `media.base44.com` — استبدلها بصور Unsplash/Firebase Storage في المشروع الجديد.
- `base44Client.js` و`app-params.js` خاصان بـ Base44 — احذفهما واستبدلهما بسياق Firebase Auth.
- `ProtectedRoute.jsx` يعتمد على `base44.auth.isAuthenticated()` — أعد كتابته بـ `onAuthStateChanged`.
- أيقونات lucide-react فقط؛ لا تستخدم مكتبات غير مثبّتة.

---

*الوثيقة جاهزة للنسخ إلى مشروع Firebase مستقل لمواصلة التطوير على Claude.*