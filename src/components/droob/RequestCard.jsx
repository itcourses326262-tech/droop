import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Calendar, X, Mail, Play, Settings2, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import RequestComments from "@/components/droob/RequestComments";
import ReportButton from "@/components/common/ReportButton";
import { useStartChat } from "@/hooks/useStartChat";
import { REQUEST_STATUS as statusMap } from "@/lib/constants";
import { timeAgo } from "@/lib/format";

// بطاقة طلب خدمة: الوسائط + التفاصيل + أزرار المراسلة/الإبلاغ + العروض والتعليقات.
export default function RequestCard({ req, onChanged }) {
  const [lightbox, setLightbox] = useState(null); // { url, isVideo }
  const { user } = useAuth();
  const { startChat, starting } = useStartChat();
  const status = statusMap[req.status] || statusMap.open;
  const isOwner = user?.uid === req.created_by;
  const isPro = user?.account_type === "professional";

  return (
    <>
      <article
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

          <Link to={`/requests/${req.id}`} className="block text-foreground/85 leading-relaxed text-sm hover:text-foreground whitespace-pre-line break-words">
          {req.description}
        </Link>

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

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <span className="text-xs text-muted-foreground">
              {req.created_by_name ? `بواسطة ${req.created_by_name}` : ""}
              {req.assigned_name && (
                <span className="inline-flex items-center gap-1 mr-2 text-emerald-700">
                  <UserCheck size={13} /> المنفّذ: {req.assigned_name}
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              {isOwner ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                >
                  <Settings2 size={13} />
                  إدارة طلبي
                </Link>
              ) : (
                isPro && (
                  <button
                    onClick={() =>
                      startChat(
                        { uid: req.created_by, name: req.created_by_name || "صاحب الطلب" },
                        { id: req.id, title: req.service_type }
                      )
                    }
                    disabled={starting}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    <Mail size={13} />
                    مراسلة صاحب الطلب
                  </button>
                )
              )}
              {!isOwner && (
                <ReportButton
                  target={{
                    target_type: "request",
                    target_id: req.id,
                    target_path: `service_requests/${req.id}`,
                    excerpt: req.description,
                  }}
                />
              )}
            </div>
          </div>

          <RequestComments request={req} onChanged={onChanged} />
        </div>
      </article>

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
    </>
  );
}
