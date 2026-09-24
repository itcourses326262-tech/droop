import { useState } from "react";
import { X, UploadCloud, Check, Image as ImageIcon, Video, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const serviceTypes = ["كهرباء", "سباكة", "دهان", "نجارة", "تكييف", "أخرى"];

export default function RequestServiceModal({ open, onClose }) {
  const [files, setFiles] = useState([]);
  const [service, setService] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    const mapped = list.map((f) => ({
      file: f,
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video"),
    }));
    setFiles((prev) => [...prev, ...mapped].slice(0, 5));
  };

  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const media = [];
      for (const f of files) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: f.file });
        media.push(file_url);
      }
      await base44.entities.ServiceRequest.create({
        service_type: service,
        description: desc,
        budget: budget ? Number(budget) : null,
        execution_date: date || null,
        media,
        status: "open",
        comments: [],
      });
      window.dispatchEvent(new Event("droob:request-created"));
      setSubmitted(true);
    } catch (err) {
      setError("تعذّر نشر الطلب. تأكد من تسجيل دخولك وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setSubmitted(false);
    setFiles([]);
    setService("");
    setDesc("");
    setBudget("");
    setDate("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#0c1a19]/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-card rounded-3xl shadow-2xl border border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card/95 backdrop-blur border-b border-border">
          <h3 className="font-heading text-xl font-bold text-foreground">طلب خدمة جديدة</h3>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-14 text-center">
            <span className="w-16 h-16 rounded-full bg-accent/15 text-primary flex items-center justify-center mx-auto mb-5">
              <Check size={30} />
            </span>
            <h4 className="font-heading text-2xl font-bold text-foreground">تم استلام طلبك</h4>
            <p className="text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              شكرًا لك! سيتواصل معك أحد محترفي دروب خلال دقائق لمراجعة التفاصيل وتأكيد الموعد.
            </p>
            <button
              onClick={close}
              className="mt-7 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
            >
              تم
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Service type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2.5">نوع الخدمة</label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    className={`px-4 py-2 rounded-full text-sm transition border ${
                      service === s
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "bg-secondary/50 text-foreground/70 border-transparent hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2.5">
                صورة أو فيديو للمشكلة
              </label>
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 px-6 py-8 transition">
                <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud size={24} />
                </span>
                <span className="text-sm font-medium text-foreground">اضغط للرفع أو اسحب الملفات هنا</span>
                <span className="text-xs text-muted-foreground">صور أو فيديو — حتى ٥ ملفات</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mt-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                      {f.isVideo ? (
                        <video src={f.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={f.url} alt="" className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white rounded px-1">
                        {f.isVideo ? <Video size={12} /> : <ImageIcon size={12} />}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2.5">
                وصف المشكلة
              </label>
              <textarea
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="اشرح المشكلة بإيجاز: ما الذي يحدث؟ متى بدأ؟ وأي تفاصيل تساعد المحترف…"
                className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-primary/50"
              />
            </div>

            {/* Budget + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2.5">
                  الميزانية المتوقعة (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="مثال: ٥٠٠"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border outline-none text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2.5">
                  التاريخ المناسب للتنفيذ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border outline-none text-sm text-foreground focus:border-primary/50"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={!service || !desc || submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-accent text-[#0c1a19] font-semibold text-sm hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جارٍ النشر…
                </>
              ) : (
                "إرسال الطلب"
              )}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              سيُنشر طلبك على الصفحة الرئيسية ليتمكن أصحاب المهن من التعليق عليه.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}