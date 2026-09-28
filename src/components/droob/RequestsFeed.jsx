import { useEffect, useState, useCallback } from "react";
import { listServiceRequests } from "@/lib/serviceRequests";
import { RefreshCw } from "lucide-react";
import RequestCard from "@/components/droob/RequestCard";

export default function RequestsFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listServiceRequests(24);
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
              تصفّح الطلبات المنشورة وقدّم عرضك إن كنت صاحب مهنة قادرًا على تنفيذها.
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
            {requests.map((req) => (
              <RequestCard key={req.id} req={req} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}