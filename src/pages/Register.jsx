import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { uploadFile } from "@/lib/storage";
import { saveUserProfile } from "@/lib/firebaseUsers";
import { authErrorMessage } from "@/lib/authErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Mail, Lock, Loader2, Camera, CreditCard, Video, User, Briefcase, Circle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import LocationPicker from "@/components/droob/LocationPicker";
import LiveVideoRecorder from "@/components/droob/LiveVideoRecorder";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const getVideoDuration = (file) =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(file);
  });

const fmtSize = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

export default function Register() {
  const [accountType, setAccountType] = useState("client");
  const [displayName, setDisplayName] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [personalDetails, setPersonalDetails] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null, address: "" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const onProfileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && !f.type.startsWith("image/")) {
      setError("الصورة الشخصية يجب أن تكون صورة");
      return;
    }
    setError("");
    setProfileFile(f || null);
  };

  const onIdCardChange = (e) => {
    const f = e.target.files?.[0];
    if (f && !f.type.startsWith("image/")) {
      setError("صورة البطاقة يجب أن تكون صورة");
      return;
    }
    setError("");
    setIdCardFile(f || null);
  };

  const applyVideoFile = async (f, knownDuration) => {
    if (!f) return;
    if (!f.type || !f.type.startsWith("video/")) {
      setError("الملف يجب أن يكون فيديو");
      return;
    }
    const duration = knownDuration ?? (await getVideoDuration(f));
    if (duration == null) {
      setError("تعذّر قراءة مدة الفيديو");
      return;
    }
    if (duration < 60) {
      setError("الفيديو يجب أن يكون دقيقة واحدة على الأقل");
      return;
    }
    if (duration > 300) {
      setError("الفيديو يجب ألا يتجاوز ٥ دقائق");
      return;
    }
    setError("");
    setVideoFile(f);
  };

  const onVideoChange = async (e) => {
    const f = e.target.files?.[0];
    if (f) await applyVideoFile(f);
  };

  const handleRecorded = async (file, duration) => {
    setRecorderOpen(false);
    await applyVideoFile(file, duration);
  };

  const validateProfile = () => {
    if (!displayName.trim()) return "الرجاء إدخال الاسم";
    if (!profileFile) return "الرجاء رفع صورة شخصية";
    if (!location.address.trim()) return "الرجاء إدخال المنطقة أو العنوان";
    if (accountType === "professional") {
      if (!idCardFile) return "الرجاء رفع صورة البطاقة";
      if (!personalDetails.trim()) return "الرجاء إدخال التفاصيل الشخصية";
      if (!videoFile) return "الرجاء رفع فيديو تعريفي (١-٥ دقائق)";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const profileError = validateProfile();
    if (profileError) {
      setError(profileError);
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await saveProfile(user);
      await sendEmailVerification(user).catch((e) => console.error("Email verification failed:", e));
      setShowVerify(true);
    } catch (err) {
      setError(authErrorMessage(err, "فشل التسجيل"));
    } finally {
      setLoading(false);
    }
  };

  // يرفع الملفات إلى Firebase Storage ويحفظ ملف المستخدم في Firestore (users/{uid}).
  const saveProfile = async (user) => {
    const uid = user.uid;
    const profile = profileFile
      ? await uploadFile(`users/${uid}/public`, profileFile)
      : null;
    let idCardPath = null;
    let introVideoPath = null;
    if (accountType === "professional") {
      if (idCardFile) {
        idCardPath = (await uploadFile(`users/${uid}/private`, idCardFile, { isPrivate: true })).path;
      }
      if (videoFile) {
        introVideoPath = (await uploadFile(`users/${uid}/private`, videoFile, { isPrivate: true })).path;
      }
    }
    await updateProfile(user, {
      displayName: displayName.trim(),
      photoURL: profile?.url || null,
    });
    await saveUserProfile(uid, {
      email: user.email,
      role: "user",
      account_type: accountType,
      display_name: displayName.trim(),
      full_name: displayName.trim(),
      profile_picture: profile?.url || null,
      id_card_uri: idCardPath,
      intro_video_uri: introVideoPath,
      personal_details: personalDetails.trim(),
      location_lat: location.lat,
      location_lng: location.lng,
      location_address: location.address.trim(),
    });
  };

  const handleResend = async () => {
    setError("");
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "تم الإرسال", description: "تحقق من بريدك الإلكتروني للحصول على رابط التفعيل." });
    } catch (err) {
      setError(authErrorMessage(err, "تعذّر إعادة الإرسال"));
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(authErrorMessage(err, "تعذّر الدخول عبر Google"));
    }
  };

  if (showVerify) {
    return (
      <AuthLayout icon={Mail} title="تأكيد البريد الإلكتروني" subtitle={`أرسلنا رابط تفعيل إلى ${email}`}>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
        <p className="text-sm text-foreground text-center mb-6 leading-relaxed">
          تم إنشاء حسابك بنجاح. افتح بريدك واضغط على رابط التفعيل لتأكيد عنوانك.
        </p>
        <Button className="w-full h-12 font-medium" onClick={() => (window.location.href = safeReturnTo())}>
          متابعة
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          لم يصلك الرابط؟{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            إعادة الإرسال
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="إنشاء حساب جديد"
      subtitle="اختر نوع الحساب وأكمل بياناتك"
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-primary font-medium hover:underline"
          >
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" />
        المتابعة عبر Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">أو</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account type */}
        <div className="space-y-2">
          <Label>نوع الحساب</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("client")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                accountType === "client"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <User className="w-4 h-4" />
              عميل
            </button>
            <button
              type="button"
              onClick={() => setAccountType("professional")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                accountType === "professional"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              صاحب مهنة
            </button>
          </div>
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <Label htmlFor="name">الاسم</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="name"
              type="text"
              autoFocus
              placeholder="اسمك الكامل"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pr-10 h-12"
              required
            />
          </div>
        </div>

        {/* Profile picture */}
        <div className="space-y-2">
          <Label>الصورة الشخصية</Label>
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-border hover:border-primary/50 px-4 py-3 transition">
            <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
              {profileFile ? (
                <img src={URL.createObjectURL(profileFile)} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {profileFile ? profileFile.name : "اضغط لرفع صورة شخصية"}
            </span>
            <input type="file" accept="image/*" onChange={onProfileChange} className="hidden" />
          </label>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-10 h-12"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 h-12"
              required
            />
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10 h-12"
              required
            />
          </div>
        </div>

        {/* Professional-only fields */}
        {accountType === "professional" && (
          <div className="space-y-4 pt-2 border-t border-border mt-2">
            <p className="text-sm font-semibold text-primary">بيانات صاحب المهنة</p>

            {/* ID card */}
            <div className="space-y-2">
              <Label>صورة البطاقة الشخصية</Label>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-border hover:border-primary/50 px-4 py-3 transition">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
                  {idCardFile ? (
                    <img src={URL.createObjectURL(idCardFile)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {idCardFile ? idCardFile.name : "اضغط لرفع صورة البطاقة"}
                </span>
                <input type="file" accept="image/*" onChange={onIdCardChange} className="hidden" />
              </label>
            </div>

            {/* Personal details */}
            <div className="space-y-2">
              <Label htmlFor="details">تفاصيل شخصية / نبذة تعريفية</Label>
              <Textarea
                id="details"
                rows={3}
                placeholder="اختصصك، سنوات الخبرة، المناطق التي تخدمها…"
                value={personalDetails}
                onChange={(e) => setPersonalDetails(e.target.value)}
              />
            </div>

            {/* Intro video */}
            <div className="space-y-2">
              <Label>فيديو تعريفي (من دقيقة إلى ٥ دقائق)</Label>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-border hover:border-primary/50 px-4 py-3 transition">
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {videoFile ? `${videoFile.name} · ${fmtSize(videoFile.size)}` : "اضغط لرفع فيديو تعريفي"}
                </span>
                <input type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => setRecorderOpen(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15 transition"
              >
                <Circle className="w-4 h-4 fill-current" />
                تسجيل فيديو مباشر
              </button>
            </div>
          </div>
        )}

        <LiveVideoRecorder
          open={recorderOpen}
          onClose={() => setRecorderOpen(false)}
          onSaved={handleRecorded}
        />

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جارٍ الإنشاء…
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}