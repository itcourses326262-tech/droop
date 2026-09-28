import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, MapPin, Mail, Loader2, UserCog, ShieldCheck, ShieldOff } from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import UserAvatar from "@/components/common/UserAvatar";
import StarRating from "@/components/common/StarRating";
import ReportButton from "@/components/common/ReportButton";
import { useAuth } from "@/lib/AuthContext";
import { useStartChat } from "@/hooks/useStartChat";
import { getPublicProfile, ratingOf, setProfessionalVerified } from "@/lib/firebaseUsers";
import { listReviewsForPro } from "@/lib/reviews";
import { timeAgo } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";

// الصفحة العامة لأي مستخدم (بتفاصيل إضافية لأصحاب المهن: التقييمات وزر المراسلة).
export default function ProfessionalProfile() {
  const { uid } = useParams();
  const { user, isAdmin } = useAuth();
  const { startChat, starting } = useStartChat();
  const [profile, setProfile] = useState(undefined);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let alive = true;
    setProfile(undefined);
    Promise.all([getPublicProfile(uid), listReviewsForPro(uid)])
      .then(([p, r]) => {
        if (!alive) return;
        setProfile(p);
        setReviews(r);
      })
      .catch(() => alive && setProfile(null));
    return () => {
      alive = false;
    };
  }, [uid]);

  const toggleVerified = async () => {
    try {
      await setProfessionalVerified(uid, !profile.verified);
      setProfile((p) => ({ ...p, verified: !p.verified }));
      toast({ title: profile.verified ? "أُلغي التوثيق" : "تم توثيق صاحب المهنة" });
    } catch {
      toast({ variant: "destructive", title: "تعذّر تحديث التوثيق" });
    }
  };

  if (profile === undefined) {
    return (
      <PageShell>
        <Spinner />
      </PageShell>
    );
  }
  if (profile === null) {
    return (
      <PageShell>
        <EmptyState>هذا الملف غير موجود.</EmptyState>
      </PageShell>
    );
  }

  const isPro = profile.account_type === "professional";
  const isMe = user?.uid === uid;
  const r = ratingOf(profile);

  return (
    <PageShell>
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <UserAvatar name={profile.display_name} photo={profile.profile_picture} className="w-28 h-28 text-3xl" />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2">
              {profile.display_name || "مستخدم"}
              {profile.verified && <BadgeCheck className="text-primary" title="موثّق" />}
            </h1>
            <p className="text-primary font-medium mt-1">
              {isPro ? profile.profession || "صاحب مهنة" : "عميل"}
              {isPro && profile.verified && <span className="text-xs text-muted-foreground mr-2">• هوية موثّقة</span>}
            </p>
            {isPro && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <StarRating value={r.avg} />
                {r.count ? `${r.avg.toFixed(1)} من ٥ (${r.count} تقييم)` : "لا توجد تقييمات بعد"}
              </div>
            )}
            {profile.city && (
              <p className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin size={14} /> {profile.city}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {isMe ? (
              <Link
                to="/profile"
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-border text-sm font-semibold"
              >
                <UserCog size={16} /> تعديل ملفي
              </Link>
            ) : (
              isPro && (
                <button
                  onClick={() =>
                    startChat({ uid, name: profile.display_name, photo: profile.profile_picture })
                  }
                  disabled={starting}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                >
                  {starting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  مراسلة
                </button>
              )
            )}
            {isAdmin && isPro && (
              <button
                onClick={toggleVerified}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-border text-xs font-semibold"
              >
                {profile.verified ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                {profile.verified ? "إلغاء التوثيق" : "توثيق الحساب"}
              </button>
            )}
            {!isMe && (
              <ReportButton
                target={{ target_type: "user", target_id: uid, target_path: null, excerpt: profile.display_name }}
                label="إبلاغ عن الحساب"
              />
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="font-semibold mb-2">نبذة</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>
        )}
      </div>

      {isPro && (
        <section className="mt-8">
          <h2 className="font-heading text-xl font-bold mb-4">آراء العملاء</h2>
          {reviews.length === 0 ? (
            <EmptyState>لا توجد تقييمات بعد.</EmptyState>
          ) : (
            <div className="grid gap-3">
              {reviews.map((rv) => (
                <div key={rv.id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={rv.reviewer_name} className="w-8 h-8 text-xs" />
                      <span className="text-sm font-semibold">{rv.reviewer_name}</span>
                      {rv.service_type && (
                        <span className="text-xs text-muted-foreground">• {rv.service_type}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(rv.created_date)}</span>
                  </div>
                  <StarRating value={rv.rating} size={14} className="mt-2" />
                  {rv.text && <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{rv.text}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
