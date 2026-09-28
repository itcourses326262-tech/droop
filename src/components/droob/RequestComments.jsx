import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send, Mail, Trash2, BadgeCheck, Loader2, Handshake, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { addComment, deleteComment, subscribeComments, updateRequestStatus } from "@/lib/serviceRequests";
import { timeAgo } from "@/lib/format";
import { useStartChat } from "@/hooks/useStartChat";
import UserAvatar from "@/components/common/UserAvatar";
import ReportButton from "@/components/common/ReportButton";
import { toast } from "@/components/ui/use-toast";

// تعليقات/عروض أصحاب المهن على طلب خدمة (لحظيًا).
// الصلاحيات (مطابقة لـ firestore.rules):
//   • أصحاب المهن يعلّقون ويقدّمون عرض سعر على الطلبات المفتوحة/قيد التنفيذ.
//   • صاحب الطلب يرد على طلبه، ويقبل عرضًا، ويراسل صاحب العرض، ويحذف التعليقات.
//   • الكاتب يحذف تعليقه، والأدمن يحذف أي تعليق.
export default function RequestComments({ request, onChanged }) {
  const { user, isAuthenticated, isAdmin, navigateToLogin } = useAuth();
  const { startChat, starting } = useStartChat();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      subscribeComments(request.id, setComments, (e) => console.error("Comments subscription failed:", e)),
    [request.id]
  );

  const isOwner = user?.uid === request.created_by;
  const isPro = user?.account_type === "professional";
  const acceptsComments = ["open", "in_progress"].includes(request.status || "open");
  const canComment = isAuthenticated && (isPro || isOwner) && acceptsComments;
  // تعليقات قديمة من قبل ربط التعليقات بالحسابات (للقراءة فقط).
  const legacy = Array.isArray(request.comments) ? request.comments : [];
  const total = comments.length + legacy.length;

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const offer = isPro && !isOwner && price !== "" ? Math.max(0, Number(price)) : null;
      await addComment(request.id, user, { text: text.trim().slice(0, 2000), offer_price: offer });
      setText("");
      setPrice("");
    } catch (e) {
      console.error("Adding comment failed:", e);
      setError("تعذّر إضافة التعليق. حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm("حذف هذا التعليق؟")) return;
    try {
      await deleteComment(request.id, c.id);
    } catch {
      toast({ variant: "destructive", title: "تعذّر حذف التعليق" });
    }
  };

  const accept = async (c) => {
    if (!window.confirm(`إسناد الطلب إلى ${c.author_name} وبدء التنفيذ؟`)) return;
    try {
      await updateRequestStatus(request.id, "in_progress", { uid: c.author_uid, name: c.author_name });
      toast({ title: "تم قبول العرض", description: `تم إسناد الطلب إلى ${c.author_name}.` });
      onChanged?.();
    } catch {
      toast({ variant: "destructive", title: "تعذّر قبول العرض" });
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-border/70">
      <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-foreground">
        <MessageSquare size={16} className="text-primary" />
        عروض وتعليقات أصحاب المهن
        {total > 0 && <span className="text-muted-foreground font-normal">({total})</span>}
      </div>

      {total > 0 ? (
        <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
          {legacy.map((c, i) => (
            <div key={`legacy-${i}`} className="flex gap-2.5">
              <UserAvatar name={c.author_name} className="w-8 h-8 text-xs" />
              <div className="flex-1 bg-secondary/60 rounded-2xl rounded-tr-sm px-3.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_date)}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}

          {comments.map((c) => {
            const mine = c.author_uid === user?.uid;
            const authorIsPro = c.author_type === "professional";
            const isAssigned = request.assigned_to && request.assigned_to === c.author_uid;
            return (
              <div key={c.id} className="flex gap-2.5">
                {authorIsPro ? (
                  <Link to={`/pros/${c.author_uid}`}>
                    <UserAvatar name={c.author_name} photo={c.author_photo} className="w-8 h-8 text-xs" />
                  </Link>
                ) : (
                  <UserAvatar name={c.author_name} photo={c.author_photo} className="w-8 h-8 text-xs" />
                )}
                <div
                  className={`flex-1 rounded-2xl rounded-tr-sm px-3.5 py-2 ${
                    isAssigned ? "bg-accent/15 border border-accent/40" : "bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      {authorIsPro ? (
                        <Link to={`/pros/${c.author_uid}`} className="hover:text-primary">
                          {c.author_name}
                        </Link>
                      ) : (
                        c.author_name
                      )}
                      {authorIsPro ? (
                        <span className="text-[10px] font-medium text-primary">صاحب مهنة</span>
                      ) : c.author_uid === request.created_by ? (
                        <span className="text-[10px] font-medium text-muted-foreground">صاحب الطلب</span>
                      ) : null}
                      {isAssigned && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-700">
                          <BadgeCheck size={12} /> المنفّذ
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_date)}</span>
                  </div>
                  {c.offer_price != null && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      عرض سعر: {c.offer_price} ج.م
                    </span>
                  )}
                  <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed whitespace-pre-line break-words">
                    {c.text}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {isOwner && authorIsPro && !mine && (
                      <button
                        onClick={() =>
                          startChat(
                            { uid: c.author_uid, name: c.author_name, photo: c.author_photo },
                            { id: request.id, title: request.service_type }
                          )
                        }
                        disabled={starting}
                        className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition"
                      >
                        <Mail size={12} />
                        مراسلة خاصة
                      </button>
                    )}
                    {isOwner && authorIsPro && !mine && request.status === "open" && (
                      <button
                        onClick={() => accept(c)}
                        className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-600 transition"
                      >
                        <Handshake size={12} />
                        قبول العرض
                      </button>
                    )}
                    {(mine || isOwner || isAdmin) && (
                      <button
                        onClick={() => remove(c)}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>
                    )}
                    {!mine && (
                      <ReportButton
                        target={{
                          target_type: "comment",
                          target_id: c.id,
                          target_path: `service_requests/${request.id}/comments/${c.id}`,
                          excerpt: c.text,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-4">لا توجد عروض بعد.</p>
      )}

      {canComment ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
              placeholder={isOwner ? "اكتب ردك…" : "اكتب عرضك أو استفسارك…"}
              maxLength={2000}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40"
            />
            {isPro && !isOwner && (
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                placeholder="السعر ج.م"
                className="w-24 px-3 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40"
              />
            )}
            <button
              onClick={submit}
              disabled={!text.trim() || sending}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition"
              aria-label="إرسال"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : !isAuthenticated ? (
        <button
          onClick={navigateToLogin}
          className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-foreground/70 hover:border-primary/40 hover:text-primary transition"
        >
          سجّل الدخول لتقديم عرض أو التعليق
        </button>
      ) : !acceptsComments ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={12} /> الطلب مغلق ولا يقبل تعليقات جديدة.
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={12} />
          التعليق وتقديم العروض متاح لأصحاب المهن.{" "}
          <Link to="/profile" className="text-primary font-medium hover:underline">
            حوّل حسابك إلى صاحب مهنة
          </Link>
        </p>
      )}
    </div>
  );
}
