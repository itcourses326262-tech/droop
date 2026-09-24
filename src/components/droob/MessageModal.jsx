import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { addMessage } from "@/lib/serviceRequests";
import { useAuth } from "@/lib/AuthContext";

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

export default function MessageModal({ open, onClose, requestId, professionalName, messages, onSent }) {
  const [fromName, setFromName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [allMessages, setAllMessages] = useState(messages || []);
  const { isAuthenticated, navigateToLogin } = useAuth();

  useEffect(() => {
    if (open) setAllMessages(messages || []);
  }, [open, professionalName, requestId]);

  if (!open) return null;

  const thread = allMessages.filter((m) => m.professional_name === professionalName);

  const send = async () => {
    if (!fromName.trim() || !text.trim() || sending) return;
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setSending(true);
    setError("");
    const newMsg = {
      professional_name: professionalName,
      from_name: fromName.trim(),
      text: text.trim(),
      created_date: new Date().toISOString(),
    };
    try {
      await addMessage(requestId, newMsg);
      setAllMessages((prev) => [...prev, newMsg]);
      setText("");
      onSent();
    } catch (e) {
      setError("تعذّر إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#0c1a19]/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
              {professionalName.charAt(0)}
            </span>
            <div>
              <h3 className="font-heading font-bold text-foreground leading-tight">مراسلة {professionalName}</h3>
              <span className="text-xs text-muted-foreground">محادثة خاصة بشأن هذا الطلب</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-3 bg-secondary/30">
          {thread.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              لا توجد رسائل بعد. ابدأ المراسلة مع {professionalName}.
            </p>
          ) : (
            thread.map((m, i) => (
              <div key={i} className={`flex ${m.from_name === fromName ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  m.from_name === fromName
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <span className="block text-[10px] opacity-70 mt-1">{timeAgo(m.created_date)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Composer */}
        <div className="px-4 py-4 border-t border-border bg-card space-y-2.5">
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="اسمك"
            className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40"
          />
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="اكتب رسالتك…"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40"
            />
            <button
              onClick={send}
              disabled={!fromName.trim() || !text.trim() || sending}
              className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition"
              aria-label="إرسال"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}