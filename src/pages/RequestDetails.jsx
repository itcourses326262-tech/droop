import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import RequestCard from "@/components/droob/RequestCard";
import { getServiceRequest } from "@/lib/serviceRequests";

export default function RequestDetails() {
  const { id } = useParams();
  const [req, setReq] = useState(undefined);

  const load = useCallback(async () => {
    try {
      setReq(await getServiceRequest(id));
    } catch {
      setReq(null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageShell
      title="تفاصيل الطلب"
      actions={
        <Link to="/#feed" className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <ArrowRight size={16} /> كل الطلبات
        </Link>
      }
    >
      {req === undefined ? (
        <Spinner />
      ) : req === null ? (
        <EmptyState>الطلب غير موجود أو تم حذفه.</EmptyState>
      ) : (
        <div className="max-w-2xl mx-auto">
          <RequestCard req={req} onChanged={load} />
        </div>
      )}
    </PageShell>
  );
}
