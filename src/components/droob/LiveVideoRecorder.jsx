import { useEffect, useRef, useState } from "react";
import { X, Circle, Square, RotateCcw, Check, AlertCircle } from "lucide-react";

const MIN = 60;
const MAX = 300;

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export default function LiveVideoRecorder({ open, onClose, onSaved }) {
  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lastBlob, setLastBlob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("متصفحك لا يدعم تسجيل الفيديو.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
        setStreaming(true);
      } catch (e) {
        setError("تعذّر الوصول إلى الكاميرا. اسمح بالأذونات وحاول مرة أخرى.");
      }
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (recording && elapsed >= MAX) stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, recording]);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {}
    }
    recorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStreaming(false);
    setRecording(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    setError("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current);
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setLastBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const reRecord = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLastBlob(null);
    setElapsed(0);
    startRecording();
  };

  const handleSave = () => {
    if (!lastBlob || elapsed < MIN) return;
    const file = new File([lastBlob], "intro-video.webm", { type: "video/webm" });
    onSaved(file, elapsed);
  };

  const close = () => {
    cleanup();
    setPreviewUrl(null);
    setLastBlob(null);
    setElapsed(0);
    setError("");
    onClose();
  };

  if (!open) return null;

  const tooShort = !previewUrl || elapsed < MIN;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0c1a19]/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading text-lg font-bold text-foreground">تسجيل فيديو تعريفي</h3>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          ) : (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                {previewUrl ? (
                  <video src={previewUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <video
                    ref={liveRef}
                    muted
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                {recording && (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {fmt(elapsed)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                {!recording && !previewUrl && (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={!streaming}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    <Circle className="w-4 h-4 fill-current" />
                    بدء التسجيل
                  </button>
                )}

                {recording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    إيقاف
                  </button>
                )}

                {previewUrl && (
                  <>
                    <button
                      type="button"
                      onClick={reRecord}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition"
                    >
                      <RotateCcw size={16} />
                      إعادة
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={tooShort}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      <Check size={16} />
                      حفظ
                    </button>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {previewUrl
                  ? tooShort
                    ? `المدة المسجلة ${fmt(elapsed)} — الحد الأدنى ${fmt(MIN)}`
                    : `المدة المسجلة ${fmt(elapsed)} — جاهز للحفظ`
                  : `الحد الأدنى ${fmt(MIN)} والأقصى ${fmt(MAX)} — سيُوقف تلقائيًا عند الحد الأقصى`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}