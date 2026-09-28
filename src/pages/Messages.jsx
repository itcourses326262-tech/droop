import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Send, Loader2, MessageCircle, FileText } from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import UserAvatar from "@/components/common/UserAvatar";
import ReportButton from "@/components/common/ReportButton";
import { useAuth } from "@/lib/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import {
  MAX_MESSAGE_LENGTH,
  isUnread,
  markConversationRead,
  sendMessage,
  subscribeConversation,
  subscribeMessages,
} from "@/lib/conversations";
import { formatTime, timeAgo } from "@/lib/format";

const otherOf = (conv, uid) => {
  const otherUid = conv.participants.find((p) => p !== uid);
  return { uid: otherUid, ...(conv.participant_info?.[otherUid] || { name: "مستخدم" }) };
};

function ConversationList({ conversations, activeId, uid, loading }) {
  if (loading) return <Spinner />;
  if (!conversations.length) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground leading-relaxed">
        لا توجد محادثات بعد.
        <br />
        ابدأ محادثة من صفحة صاحب مهنة أو من عروض طلبك.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/70">
      {conversations.map((c) => {
        const other = otherOf(c, uid);
        const unread = isUnread(c, uid);
        return (
          <li key={c.id}>
            <Link
              to={`/messages/${c.id}`}
              className={`flex gap-3 px-4 py-3.5 transition ${
                c.id === activeId ? "bg-primary/10" : "hover:bg-secondary/60"
              }`}
            >
              <UserAvatar name={other.name} photo={other.photo} className="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>{other.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {timeAgo(c.last_message_date)}
                  </span>
                </div>
                {c.request_title && (
                  <p className="text-[11px] text-primary truncate">بخصوص طلب: {c.request_title}</p>
                )}
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs truncate flex-1 ${
                      unread ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {c.last_message
                      ? (c.last_sender_uid === uid ? "أنت: " : "") + c.last_message
                      : "لا توجد رسائل بعد"}
                  </p>
                  {unread && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ChatPanel({ cid, uid }) {
  const [conv, setConv] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    setConv(undefined);
    setMessages([]);
    setError("");
    const unsubConv = subscribeConversation(cid, setConv, () => setConv(null));
    const unsubMsgs = subscribeMessages(cid, setMessages, (e) => console.error("Messages subscription failed:", e));
    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [cid]);

  // تعليم المحادثة كمقروءة عند وصول رسالة جديدة من الطرف الآخر.
  useEffect(() => {
    if (conv && isUnread(conv, uid)) markConversationRead(cid, uid).catch(() => {});
  }, [conv, cid, uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (conv === undefined) return <Spinner />;
  if (conv === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground text-sm">
        المحادثة غير موجودة أو ليس لديك صلاحية الوصول إليها.
      </div>
    );
  }

  const other = otherOf(conv, uid);

  const send = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(cid, uid, body.slice(0, MAX_MESSAGE_LENGTH));
      setText("");
    } catch (err) {
      console.error("Sending message failed:", err);
      setError("تعذّر إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link to="/messages" className="md:hidden p-1 -mr-1 text-muted-foreground" aria-label="رجوع">
          <ArrowRight size={20} />
        </Link>
        <Link to={`/pros/${other.uid}`}>
          <UserAvatar name={other.name} photo={other.photo} className="w-10 h-10" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/pros/${other.uid}`} className="font-semibold text-foreground hover:text-primary truncate block">
            {other.name}
          </Link>
          {conv.request_title ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <FileText size={12} /> بخصوص طلب: {conv.request_title}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">محادثة خاصة</span>
          )}
        </div>
        <ReportButton
          target={{ target_type: "user", target_id: other.uid, target_path: null, excerpt: `محادثة ${cid}` }}
          label="إبلاغ"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-secondary/30">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            لا توجد رسائل بعد. ابدأ المراسلة مع {other.name}.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_uid === uid;
            return (
              <div key={m.id} className={`group flex ${mine ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
                    mine
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line break-words">{m.text}</p>
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <span className="text-[10px] opacity-70">{m.created_date ? formatTime(m.created_date) : "…"}</span>
                    {!mine && (
                      <ReportButton
                        className="opacity-0 group-hover:opacity-100"
                        label=""
                        target={{
                          target_type: "message",
                          target_id: m.id,
                          target_path: null,
                          excerpt: m.text,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="px-3 py-3 border-t border-border bg-card">
        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="اكتب رسالتك…"
            className="flex-1 resize-none max-h-32 px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition"
            aria-label="إرسال"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-scale-x-100" />}
          </button>
        </div>
        {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}

export default function Messages() {
  const { cid } = useParams();
  const { user } = useAuth();
  const { conversations, loading, error } = useConversations();
  const navigate = useNavigate();

  useEffect(() => {
    // على الشاشات الكبيرة افتح أحدث محادثة تلقائيًا.
    if (!cid && conversations.length && window.innerWidth >= 768) {
      navigate(`/messages/${conversations[0].id}`, { replace: true });
    }
  }, [cid, conversations, navigate]);

  return (
    <PageShell title="الرسائل" subtitle="محادثاتك الخاصة — لا يراها أحد غيرك وغير الطرف الآخر." wide>
      {error ? (
        <EmptyState>تعذّر تحميل المحادثات. تحقق من اتصالك وحاول مرة أخرى.</EmptyState>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden flex h-[calc(100vh-15rem)] min-h-[480px]">
          <aside
            className={`${cid ? "hidden md:block" : "block"} w-full md:w-80 md:border-l border-border overflow-y-auto shrink-0`}
          >
            <ConversationList conversations={conversations} activeId={cid} uid={user.uid} loading={loading} />
          </aside>
          <section className={`${cid ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
            {cid ? (
              <ChatPanel key={cid} cid={cid} uid={user.uid} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8 text-center">
                <MessageCircle size={40} className="text-primary/40" />
                <p className="text-sm">اختر محادثة لعرضها.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
