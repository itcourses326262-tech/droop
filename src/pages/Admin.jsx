import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, Flag, Users, ExternalLink } from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import UserAvatar from "@/components/common/UserAvatar";
import { listReports, resolveReport } from "@/lib/moderation";
import { deleteComment, deleteServiceRequest } from "@/lib/serviceRequests";
import { listAllUsers } from "@/lib/firebaseUsers";
import { timeAgo } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TARGET_LABEL = { request: "طلب", comment: "تعليق", message: "رسالة", user: "مستخدم" };

// حذف المحتوى المبلّغ عنه حسب مساره في Firestore.
async function deleteTarget(path) {
  const parts = path.split("/");
  if (parts[0] !== "service_requests") throw new Error("unsupported target");
  if (parts.length === 2) return deleteServiceRequest(parts[1]);
  if (parts.length === 4 && parts[2] === "comments") return deleteComment(parts[1], parts[3]);
  throw new Error("unsupported target");
}

function targetLink(r) {
  if (r.target_type === "user") return `/pros/${r.target_id}`;
  const parts = (r.target_path || "").split("/");
  if (parts[0] === "service_requests" && parts[1]) return `/requests/${parts[1]}`;
  return null;
}

export default function Admin() {
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, u] = await Promise.all([listReports(), listAllUsers()]);
      setReports(r);
      setUsers(u);
    } catch (e) {
      console.error("Loading admin data failed:", e);
      setReports([]);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, msg) => {
    try {
      await fn();
      toast({ title: msg });
      load();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "تعذّر تنفيذ العملية" });
    }
  };

  const visibleReports = (reports || []).filter((r) => showResolved || r.status === "open");
  const openCount = (reports || []).filter((r) => r.status === "open").length;
  const pros = (users || []).filter((u) => u.account_type === "professional").length;

  return (
    <PageShell title="لوحة الإدارة" subtitle="مراجعة البلاغات وإدارة المستخدمين." wide>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "بلاغات مفتوحة", value: openCount },
          { label: "المستخدمون", value: users?.length ?? "…" },
          { label: "أصحاب المهن", value: users ? pros : "…" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="reports" dir="rtl">
        <TabsList className="mb-6">
          <TabsTrigger value="reports" className="gap-1.5">
            <Flag size={14} /> البلاغات
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users size={14} /> المستخدمون
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <label className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
            عرض البلاغات المُعالجة
          </label>
          {reports === null ? (
            <Spinner />
          ) : visibleReports.length === 0 ? (
            <EmptyState>لا توجد بلاغات.</EmptyState>
          ) : (
            <div className="grid gap-3">
              {visibleReports.map((r) => {
                const link = targetLink(r);
                return (
                  <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                          {TARGET_LABEL[r.target_type] || r.target_type}
                        </span>
                        <span className="text-muted-foreground">من {r.reporter_name || "مستخدم"}</span>
                        {r.status !== "open" && <span className="text-xs text-emerald-700">• تمت المعالجة</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo(r.created_date)}</span>
                    </div>
                    {r.excerpt && (
                      <p className="mt-2 text-sm bg-secondary/60 rounded-xl px-3 py-2 text-foreground/80 break-words">
                        {r.excerpt}
                      </p>
                    )}
                    {r.reason && <p className="mt-2 text-sm text-foreground">السبب: {r.reason}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {link && (
                        <Link
                          to={link}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs font-semibold"
                        >
                          <ExternalLink size={13} /> عرض
                        </Link>
                      )}
                      {r.target_path && r.status === "open" && (
                        <button
                          onClick={() => {
                            if (window.confirm("حذف هذا المحتوى نهائيًا؟"))
                              act(async () => {
                                await deleteTarget(r.target_path);
                                await resolveReport(r.id);
                              }, "تم حذف المحتوى");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-destructive/30 text-destructive text-xs font-semibold"
                        >
                          <Trash2 size={13} /> حذف المحتوى
                        </button>
                      )}
                      {r.status === "open" && (
                        <button
                          onClick={() => act(() => resolveReport(r.id), "تم إغلاق البلاغ")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 text-xs font-semibold"
                        >
                          <CheckCircle2 size={13} /> إغلاق دون إجراء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {users === null ? (
            <Spinner />
          ) : (
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {users.map((u) => (
                <Link
                  key={u.id}
                  to={`/pros/${u.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
                >
                  <UserAvatar name={u.display_name} photo={u.profile_picture} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{u.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate" dir="ltr">
                      {u.email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {u.role === "admin" ? "أدمن" : u.account_type === "professional" ? "صاحب مهنة" : "عميل"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
