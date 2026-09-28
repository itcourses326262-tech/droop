import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, CreditCard, Video, Loader2, Save, Briefcase, User, BadgeCheck, PartyPopper } from "lucide-react";
import PageShell from "@/components/common/PageShell";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/lib/AuthContext";
import { saveUserProfile, syncAuthProfile } from "@/lib/firebaseUsers";
import { uploadFile } from "@/lib/storage";
import { SERVICE_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

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

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const welcome = params.get("welcome") === "1";

  const [accountType, setAccountType] = useState(user.account_type || "client");
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [profession, setProfession] = useState(user.profession || "");
  const [city, setCity] = useState(user.city || "");
  const [bio, setBio] = useState(user.bio || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const hasDocs = !!(user.id_card_uri && user.intro_video_uri);
  const becomingPro = accountType === "professional";
  const localPreview = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : null), [photoFile]);
  useEffect(() => () => localPreview && URL.revokeObjectURL(localPreview), [localPreview]);
  const photoPreview = localPreview || user.profile_picture;

  const onVideo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) return setError("الملف يجب أن يكون فيديو");
    const d = await getVideoDuration(f);
    if (d == null) return setError("تعذّر قراءة مدة الفيديو");
    if (d < 60 || d > 300) return setError("الفيديو التعريفي يجب أن يكون من دقيقة إلى ٥ دقائق");
    setError("");
    setVideoFile(f);
  };

  const onImage = (setter) => (e) => {
    const f = e.target.files?.[0];
    if (f && !f.type.startsWith("image/")) return setError("الملف يجب أن يكون صورة");
    setError("");
    setter(f || null);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!displayName.trim()) return setError("الرجاء إدخال الاسم");
    if (becomingPro) {
      if (!profession) return setError("الرجاء اختيار المهنة");
      if (!hasDocs && (!idCardFile || !videoFile))
        return setError("للتسجيل كصاحب مهنة ارفع صورة البطاقة وفيديو تعريفي");
    }
    setSaving(true);
    try {
      const uid = user.uid;
      const data = {
        display_name: displayName.trim(),
        full_name: displayName.trim(),
        profession: becomingPro ? profession : null,
        city: city.trim() || null,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      };
      if (photoFile) data.profile_picture = (await uploadFile(`users/${uid}/public`, photoFile)).url;
      if (becomingPro && idCardFile)
        data.id_card_uri = (await uploadFile(`users/${uid}/private`, idCardFile, { isPrivate: true })).path;
      if (becomingPro && videoFile)
        data.intro_video_uri = (await uploadFile(`users/${uid}/private`, videoFile, { isPrivate: true })).path;
      // نوع الحساب يُكتب بعد رفع الوثائق (القواعد تشترط وجودها للتحويل إلى صاحب مهنة).
      data.account_type = accountType;
      await saveUserProfile(uid, data);
      await syncAuthProfile({
        displayName: data.display_name,
        photoURL: data.profile_picture || user.profile_picture || null,
      }).catch(() => {});
      await refreshUser();
      setPhotoFile(null);
      setIdCardFile(null);
      setVideoFile(null);
      toast({ title: "تم حفظ ملفك الشخصي" });
    } catch (err) {
      console.error("Saving profile failed:", err);
      setError("تعذّر حفظ البيانات. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  const fileBox = (icon, label, file, onChange, accept) => (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 cursor-pointer transition">
      {icon}
      <span className="text-sm text-foreground/80 flex-1 truncate">{file ? file.name : label}</span>
      <input type="file" accept={accept} className="hidden" onChange={onChange} />
    </label>
  );

  return (
    <PageShell title="ملفي الشخصي" subtitle="هذه البيانات تظهر لأصحاب الطلبات والمحترفين الآخرين.">
      {welcome && (
        <div className="mb-6 p-4 rounded-2xl bg-accent/15 border border-accent/40 flex gap-3 items-start">
          <PartyPopper className="text-primary shrink-0" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-foreground">أهلًا بك في دروب!</p>
            <p className="text-foreground/70">
              أكمل ملفك الشخصي. إن كنت صاحب مهنة اختر «صاحب مهنة» لتتمكن من تقديم العروض على الطلبات.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center text-center h-fit">
          <label className="relative cursor-pointer group">
            <UserAvatar name={displayName} photo={photoPreview} className="w-28 h-28 text-3xl" />
            <span className="absolute bottom-1 left-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow group-hover:scale-105 transition">
              <Camera size={16} />
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onImage(setPhotoFile)} />
          </label>
          <p className="mt-4 font-heading font-bold text-lg">{displayName || "—"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.account_type === "professional" && (
            <>
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                <BadgeCheck size={14} /> {user.verified ? "صاحب مهنة موثّق" : "صاحب مهنة (بانتظار التوثيق)"}
              </span>
              <Link to={`/pros/${user.uid}`} className="mt-3 text-sm text-primary font-medium hover:underline">
                عرض صفحتي العامة
              </Link>
            </>
          )}
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 space-y-5">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label>نوع الحساب</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "client", label: "عميل", icon: User, hint: "أطلب خدمات" },
                { v: "professional", label: "صاحب مهنة", icon: Briefcase, hint: "أقدّم خدمات" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setAccountType(o.v)}
                  className={`p-4 rounded-2xl border text-right transition ${
                    accountType === o.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <o.icon size={18} className="text-primary mb-1" />
                  <p className="font-semibold text-sm">{o.label}</p>
                  <p className="text-xs text-muted-foreground">{o.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">المدينة / المنطقة</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (خاص — لا يظهر للآخرين)</Label>
              <Input id="phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </div>
            {becomingPro && (
              <div className="space-y-2">
                <Label htmlFor="profession">المهنة</Label>
                <select
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                >
                  <option value="">اختر المهنة</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">نبذة عنك {becomingPro && "(خبراتك وأعمالك السابقة)"}</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} />
          </div>

          {becomingPro && !hasDocs && (
            <div className="space-y-3 p-4 rounded-2xl bg-secondary/50">
              <p className="text-sm font-semibold">وثائق التحقق (خاصة — يراها فريق دروب فقط)</p>
              {fileBox(
                <CreditCard size={18} className="text-primary" />,
                "صورة البطاقة الشخصية",
                idCardFile,
                onImage(setIdCardFile),
                "image/*"
              )}
              {fileBox(
                <Video size={18} className="text-primary" />,
                "فيديو تعريفي (من دقيقة إلى ٥ دقائق)",
                videoFile,
                onVideo,
                "video/*"
              )}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
