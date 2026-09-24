// رسائل عربية لأشهر أخطاء Firebase Auth.
const messages = {
  "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "auth/wrong-password": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "auth/user-not-found": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "auth/invalid-email": "البريد الإلكتروني غير صالح",
  "auth/email-already-in-use": "هذا البريد مسجّل بالفعل — جرّب تسجيل الدخول",
  "auth/weak-password": "كلمة المرور ضعيفة — استخدم ٦ أحرف على الأقل",
  "auth/too-many-requests": "محاولات كثيرة — انتظر قليلًا ثم حاول مرة أخرى",
  "auth/network-request-failed": "تعذّر الاتصال بالشبكة",
  "auth/popup-closed-by-user": "تم إغلاق نافذة Google قبل إكمال الدخول",
  "auth/popup-blocked": "المتصفح منع نافذة Google — اسمح بالنوافذ المنبثقة",
  "auth/unauthorized-domain": "هذا النطاق غير مصرّح به في إعدادات Firebase Authentication",
  "auth/expired-action-code": "انتهت صلاحية الرابط — اطلب رابطًا جديدًا",
  "auth/invalid-action-code": "الرابط غير صالح أو استُخدم من قبل",
};

export function authErrorMessage(err, fallback = "حدث خطأ غير متوقع") {
  return messages[err?.code] || fallback;
}
