import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, Wallet, Calendar, RefreshCw, X, Mail, Play } from "lucide-react";
import MessageModal from "@/components/droob/MessageModal";

const statusMap = {
  open: { label: "مفتوح", cls: "bg-accent/15 text-primary" },
  in_progress: { label: "قيد التنفيذ", cls: "bg-amber-100 text-amber-700" },
  done: { label: "مكتمل", cls: "bg-secondary text-muted-foreground" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
}

export default function RequestsFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [lightbox, setLightbox] = useState(null); // { url, isVideo }
  const [chat, setChat] = useState(null); // { request, professionalName }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.ServiceRequest.list("-created_date", 24);
      setRequests(list || []);
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("droob:request-created", handler);
    return () => window.removeEventListener("droob:request-created", handler);
  }, [load]);

  const setDraft = (id, field, value) =>
    setDrafts((p) => ({
      ...p,
      [id]: { name: p[id]?.name || "", text: p[id]?.text || "", [field]: value },
    }));

  const addComment = async (req) => {
    const draft = drafts[req.id] || { name: "", text: "" };
    if (!draft.text.trim() || !draft.name.trim()) return;
    const newComment = {
      author_name: draft.name.trim(),
      text: draft.text.trim(),
      created_date: new Date().toISOString(),
    };
    const updated = [...(req.comments || []), newComment];
    try {
      await base44.entities.ServiceRequest.update(req.id, { comments: updated });
      setDrafts((p) => ({ ...p, [req.id]: { name: "", text: "" } }));
      load();
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <section id="feed" className="py-20 sm:py-28 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-semibold text-primary tracking-wide">سوق الطلبات</span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-2 text-foreground text-balance">
              أحدث طلبات الخدمة
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-xl">
              تصفّح الطلبات المنشورة وعلّق عليها إن كنت صاحب مهرة قادر على تنفيذها.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-medium text-foreground/80 hover:border-primary/40 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-card border border-dashed border-border">
            <p className="text-muted-foreground">لا توجد طلبات منشورة بعد. كن أول من ينشر خدمة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((req) => {
              const status = statusMap[req.status] || statusMap.open;
              const draft = drafts[req.id] || { name: "", text: "" };
              return (
                <article
                  key={req.id}
                  className="bg-card rounded-3xl border border-border/70 overflow-hidden flex flex-col"
                >
                  {/* Media */}
                  {req.media && req.media.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 h-40 bg-secondary">
                      {req.media.slice(0, 3).map((url, i) => {
                        const isVideo = /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightbox({ url, isVideo })}
                            className="relative h-full w-full cursor-zoom-in group"
                          >
                            {isVideo ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                            )}
                            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                              {isVideo && (
                                <span className="w-10 h-10 rounded-full bg-white/85 text-primary flex items-center justify-center">
                                  <Play size={18} />
                                </span>
                              )}
                            </span>
                            {i === 2 && req.media.length > 3 && (
                              <span className="absolute inset-0 bg-black/50 text-white flex items-center justify-center font-semibold">
                                +{req.media.length - 3}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          {req.service_type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo(req.created_date)}</span>
                    </div>

                    <p className="text-foreground/85 leading-relaxed text-sm">{req.description}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                      {req.budget != null && (
                        <span className="flex items-center gap-1.5">
                          <Wallet size={14} className="text-primary" />
                          {req.budget} ج.م
                        </span>
                      )}
                      {req.execution_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          {req.execution_date}
                        </span>
                      )}
                    </div>

                    {/* Comments */}
                    <div className="mt-5 pt-4 border-t border-border/70">
                      <div className="flex items-center gap-1.5 mb-3 text-sm font-semibold text-foreground">
                        <MessageSquare size={16} className="text-primary" />
                        تعليقات أصحاب المهن
                        {(req.comments?.length || 0) > 0 && (
                          <span className="text-muted-foreground font-normal">({req.comments.length})</span>
                        )}
                      </div>

                      {req.comments && req.comments.length > 0 ? (
                        <div className="space-y-2.5 mb-4 max-h-52 overflow-y-auto scrollbar-hide">
                          {req.comments.map((c, i) => (
                            <div key={i} className="flex gap-2.5">
                              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                                {c.author_name.charAt(0)}
                              </span>
                              <div className="flex-1 bg-secondary/60 rounded-2xl rounded-tr-sm px-3.5 py-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setChat({ request: req, professionalName: c.author_name })}
                                      className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition"
                                      title={`مراسلة ${c.author_name}`}
                                    >
                                      <Mail size={13} />
                                      مراسلة
                                    </button>
                                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_date)}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-4">كن أول من يعلّق على هذا الطلب.</p>
                      )}

                      {/* Add comment */}
                      <div className="flex gap-2">
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft(req.id, "name", e.target.value)}
                          placeholder="اسمك"
                          className="w-28 px-3 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40"
                        />
                        <input
                          value={draft.text}
                          onChange={(e) => setDraft(req.id, "text", e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addComment(req)}
                          placeholder="اكتب تعليقك…"
                          className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40"
                        />
                        <button
                          onClick={() => addComment(req)}
                          className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition"
                          aria-label="إرسال"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 left-5 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            <X size={22} />
          </button>
          {lightbox.isVideo ? (
            <video
              src={lightbox.url}
              className="max-w-full max-h-full rounded-lg"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt=""
              className="max-w-full max-h-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Message modal */}
      {chat && (
        <MessageModal
          open
          onClose={() => setChat(null)}
          requestId={chat.request.id}
          professionalName={chat.professionalName}
          messages={chat.request.messages}
          onSent={load}
        />
      )}
    </section>
  );
}