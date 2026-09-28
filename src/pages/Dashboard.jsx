import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Mail,
  Eye,
  UserCheck,
  Star,
  Loader2,
  Wallet,
  Calendar,
} from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import StarRating from "@/components/common/StarRating";
import RequestServiceModal from "@/components/droob/RequestServiceModal";
import { useAuth } from "@/lib/AuthContext";
import { useStartChat } from "@/hooks/useStartChat";
import {
  deleteServiceRequest,
  listAssignedRequests,
  listMyRequests,
  updateRequestStatus,
} from "@/lib/serviceRequests";
import { listReviewsByReviewer, submitReview } from "@/lib/reviews";
import { REQUEST_STATUS } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ReviewForm({ request, onDone }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!rating || saving) return;
    setSaving(true);
    try {
      await submitReview(request, user, { rating, text: text.trim().slice(0, 1000) });
      toast({ title: "شكرًا لتقييمك", description: `تم تقييم ${request.assigned_name}.` });
      onDone();
    } catch (e) {
      console.error("Review failed:", e);
      toast({ variant: "destructive", title: "تعذّر حفظ التقييم" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
      <p className="text-sm font-semibold text-foreground mb-2">قيّم {request.assigned_name}</p>
      <StarRating value={rating} onChange={setRating} size={22} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="اكتب رأيك في الخدمة (اختياري)"
        className="mt-2 w-full px-3 py-2 rounded-xl bg-card border border-border outline-none text-sm focus:border-primary/40"
      />
      <button
        onClick={submit}
        disabled={!rating || saving}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
        إرسال التقييم
      </button>
    </div>
  );
}

function RequestRow({ req, reviewed, asOwner, onChanged }) {
  const { startChat, starting } = useStartChat();
  const [busy, setBusy] = useState(false);
  const status = REQUEST_STATUS[req.status] || REQUEST_STATUS.open;

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      if (okMsg) toast({ title: okMsg });
      onChanged();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "تعذّر تنفيذ العملية" });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (s, assignee, msg) => run(() => updateRequestStatus(req.id, s, assignee), msg);
  const remove = () => {
    if (window.confirm("حذف الطلب نهائيًا مع كل تعليقاته؟"))
      run(() => deleteServiceRequest(req.id), "تم حذف الطلب");
  };

  const btn =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition disabled:opacity-40";

  const chatWith = asOwner
    ? req.assigned_to && { uid: req.assigned_to, name: req.assigned_name }
    : { uid: req.created_by, name: req.created_by_name || "صاحب الطلب" };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {req.service_type}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>{status.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo(req.created_date)}</span>
      </div>
      <p className="mt-3 text-sm text-foreground/85 line-clamp-3 whitespace-pre-line">{req.description}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-muted-foreground">
        {req.budget != null && (
          <span className="flex items-center gap-1">
            <Wallet size={13} className="text-primary" /> {req.budget} ج.م
          </span>
        )}
        {req.execution_date && (
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-primary" /> {req.execution_date}
          </span>
        )}
        {asOwner && req.assigned_name && (
          <span className="flex items-center gap-1 text-emerald-700">
            <UserCheck size={13} /> المنفّذ:{" "}
            <Link to={`/pros/${req.assigned_to}`} className="underline">
              {req.assigned_name}
            </Link>
          </span>
        )}
        {!asOwner && (
          <span>صاحب الطلب: {req.created_by_name || "—"}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link to={`/requests/${req.id}`} className={`${btn} border-border text-foreground/80 hover:border-primary/40`}>
          <Eye size={13} /> العروض والتفاصيل
        </Link>
        {chatWith && (
          <button
            onClick={() => startChat(chatWith, { id: req.id, title: req.service_type })}
            disabled={starting}
            className={`${btn} border-primary/30 text-primary hover:bg-primary/5`}
          >
            <Mail size={13} /> مراسلة {asOwner ? "المنفّذ" : "صاحب الطلب"}
          </button>
        )}
        {asOwner && req.status === "in_progress" && (
          <>
            <button
              disabled={busy}
              onClick={() => setStatus("done", undefined, "تم تعليم الطلب كمكتمل")}
              className={`${btn} border-emerald-300 text-emerald-700 hover:bg-emerald-50`}
            >
              <CheckCircle2 size={13} /> تم التنفيذ
            </button>
            <button
              disabled={busy}
              onClick={() => setStatus("open", null, "أُعيد فتح الطلب")}
              className={`${btn} border-border text-foreground/70 hover:border-primary/40`}
            >
              <RotateCcw size={13} /> إلغاء الإسناد وإعادة الفتح
            </button>
          </>
        )}
        {asOwner && req.status === "open" && (
          <button
            disabled={busy}
            onClick={() => setStatus("cancelled", undefined, "تم إلغاء الطلب")}
            className={`${btn} border-border text-foreground/70 hover:border-destructive/40`}
          >
            <XCircle size={13} /> إلغاء الطلب
          </button>
        )}
        {asOwner && req.status === "cancelled" && (
          <button
            disabled={busy}
            onClick={() => setStatus("open", null, "أُعيد فتح الطلب")}
            className={`${btn} border-border text-foreground/70 hover:border-primary/40`}
          >
            <RotateCcw size={13} /> إعادة الفتح
          </button>
        )}
        {asOwner && req.status !== "in_progress" && (
          <button
            disabled={busy}
            onClick={remove}
            className={`${btn} border-destructive/30 text-destructive hover:bg-destructive/5`}
          >
            <Trash2 size={13} /> حذف
          </button>
        )}
      </div>

      {asOwner && req.status === "done" && req.assigned_to && !reviewed && (
        <ReviewForm request={req} onDone={onChanged} />
      )}
      {asOwner && req.status === "done" && reviewed && (
        <p className="mt-3 text-xs text-emerald-700 flex items-center gap-1">
          <CheckCircle2 size={13} /> قيّمت هذه الخدمة. شكرًا لك!
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isProfessional } = useAuth();
  const [mine, setMine] = useState(null);
  const [assigned, setAssigned] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [requestOpen, setRequestOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [my, reviews, jobs] = await Promise.all([
        listMyRequests(user.uid),
        listReviewsByReviewer(user.uid),
        isProfessional ? listAssignedRequests(user.uid) : Promise.resolve([]),
      ]);
      setMine(my);
      setReviewedIds(new Set(reviews.map((r) => r.request_id)));
      setAssigned(jobs);
    } catch (e) {
      console.error("Loading dashboard failed:", e);
      setMine([]);
      setAssigned([]);
    }
  }, [user.uid, isProfessional]);

  useEffect(() => {
    load();
    window.addEventListener("droob:request-created", load);
    return () => window.removeEventListener("droob:request-created", load);
  }, [load]);

  const myList =
    mine === null ? (
      <Spinner />
    ) : mine.length === 0 ? (
      <EmptyState>لم تنشر أي طلب بعد. اضغط «طلب جديد» لنشر أول طلب.</EmptyState>
    ) : (
      <div className="grid gap-4">
        {mine.map((r) => (
          <RequestRow key={r.id} req={r} asOwner reviewed={reviewedIds.has(r.id)} onChanged={load} />
        ))}
      </div>
    );

  return (
    <PageShell
      title="طلباتي"
      subtitle="تابع طلباتك، اقبل العروض، وقيّم أصحاب المهن بعد انتهاء العمل."
      actions={
        <button
          onClick={() => setRequestOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Plus size={16} /> طلب جديد
        </button>
      }
    >
      {isProfessional ? (
        <Tabs defaultValue="jobs" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="jobs">الأعمال المسندة إليّ</TabsTrigger>
            <TabsTrigger value="mine">طلباتي كعميل</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            {assigned === null ? (
              <Spinner />
            ) : assigned.length === 0 ? (
              <EmptyState>
                لم يُسند إليك أي عمل بعد. قدّم عروضك على{" "}
                <Link to="/#feed" className="text-primary font-medium">
                  الطلبات المفتوحة
                </Link>
                .
              </EmptyState>
            ) : (
              <div className="grid gap-4">
                {assigned.map((r) => (
                  <RequestRow key={r.id} req={r} onChanged={load} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="mine">{myList}</TabsContent>
        </Tabs>
      ) : (
        myList
      )}
      <RequestServiceModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </PageShell>
  );
}
