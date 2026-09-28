import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { reportContent } from "@/lib/moderation";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// زر "إبلاغ" عن محتوى مسيء — target = { target_type, target_id, target_path, excerpt }.
export default function ReportButton({ target, className = "", label = "إبلاغ" }) {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await reportContent(user, { ...target, reason: reason.trim() });
      toast({ title: "تم إرسال البلاغ", description: "سيراجعه فريق دروب في أقرب وقت." });
      setOpen(false);
      setReason("");
    } catch (e) {
      console.error("Report failed:", e);
      toast({ variant: "destructive", title: "تعذّر إرسال البلاغ" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (isAuthenticated ? setOpen(true) : navigateToLogin())}
        className={`flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition ${className}`}
        title="إبلاغ عن محتوى مسيء"
      >
        <Flag size={12} />
        {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="text-right">
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>إبلاغ عن محتوى</DialogTitle>
            <DialogDescription>أخبرنا بسبب البلاغ (اختياري). لن يعرف صاحب المحتوى هويتك.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 1000))}
            placeholder="مثال: محتوى مسيء، احتيال، رسائل مزعجة…"
            rows={4}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={submit} disabled={sending}>
              {sending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              إرسال البلاغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
