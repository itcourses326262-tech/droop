import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Search } from "lucide-react";
import PageShell, { Spinner, EmptyState } from "@/components/common/PageShell";
import UserAvatar from "@/components/common/UserAvatar";
import StarRating from "@/components/common/StarRating";
import { listProfessionals, ratingOf } from "@/lib/firebaseUsers";
import { SERVICE_TYPES } from "@/lib/constants";

export default function Professionals() {
  const [profession, setProfession] = useState("");
  const [search, setSearch] = useState("");
  const [pros, setPros] = useState(null);

  useEffect(() => {
    let alive = true;
    setPros(null);
    listProfessionals({ profession: profession || undefined })
      .then((list) => alive && setPros(list))
      .catch((e) => {
        console.error("Loading professionals failed:", e);
        if (alive) setPros([]);
      });
    return () => {
      alive = false;
    };
  }, [profession]);

  const q = search.trim();
  const shown = (pros || []).filter(
    (p) => !q || [p.display_name, p.city, p.bio, p.profession].some((v) => v && v.includes(q))
  );

  return (
    <PageShell title="أصحاب المهن" subtitle="تصفّح المحترفين، اطّلع على تقييماتهم وراسلهم مباشرة." wide>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو المدينة…"
            className="w-full pr-10 pl-4 py-2.5 rounded-full bg-card border border-border outline-none text-sm focus:border-primary/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["", ...SERVICE_TYPES].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setProfession(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                profession === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground/70 hover:border-primary/40"
              }`}
            >
              {s || "الكل"}
            </button>
          ))}
        </div>
      </div>

      {pros === null ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <EmptyState>لا يوجد أصحاب مهن مطابقون حاليًا.</EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((p) => {
            const r = ratingOf(p);
            return (
              <Link
                key={p.id}
                to={`/pros/${p.id}`}
                className="group p-5 rounded-3xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={p.display_name} photo={p.profile_picture} className="w-14 h-14 text-lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground flex items-center gap-1 truncate">
                      {p.display_name || "صاحب مهنة"}
                      {p.verified && <BadgeCheck size={16} className="text-primary shrink-0" />}
                    </p>
                    <p className="text-sm text-primary">{p.profession || "صاحب مهنة"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <StarRating value={r.avg} size={14} />
                  {r.count ? `${r.avg.toFixed(1)} (${r.count})` : "لا توجد تقييمات بعد"}
                </div>
                {p.city && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} /> {p.city}
                  </p>
                )}
                {p.bio && <p className="mt-3 text-sm text-foreground/75 line-clamp-2">{p.bio}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
