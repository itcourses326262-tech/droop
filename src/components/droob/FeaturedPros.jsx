import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, BadgeCheck, MapPin, ArrowLeft } from "lucide-react";
import { siteImages } from "@/lib/siteImages";
import { listProfessionals, ratingOf } from "@/lib/firebaseUsers";
import UserAvatar from "@/components/common/UserAvatar";

// أمثلة تظهر فقط قبل تسجيل أي صاحب مهنة حقيقي.
const samplePros = [
  {
    id: null,
    name: "محمود عبد الرحمن",
    craft: "كهربائي معتمد",
    rating: 4.9,
    reviews: 312,
    img: siteImages.pro1,
    verified: true,
    bio: "أعطال طارئة، تمديد، إنارة ولوحات كهربائية.",
  },
  {
    id: null,
    name: "أحمد سمير",
    craft: "سبّاك محترف",
    rating: 4.8,
    reviews: 268,
    img: siteImages.pro2,
    verified: true,
    bio: "تسريبات، سخانات، تركيب أدوات صحية.",
  },
];

const fromProfile = (p) => {
  const r = ratingOf(p);
  return {
    id: p.id,
    name: p.display_name || "صاحب مهنة",
    craft: p.profession || "صاحب مهنة",
    rating: r.count ? r.avg.toFixed(1) : null,
    reviews: r.count,
    img: p.profile_picture,
    verified: !!p.verified,
    city: p.city,
    bio: p.bio,
  };
};

export default function FeaturedPros() {
  const [pros, setPros] = useState(samplePros);

  useEffect(() => {
    listProfessionals({ max: 30 })
      .then((list) => {
        if (list.length) setPros(list.slice(0, 4).map(fromProfile));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="pros" className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-semibold text-primary tracking-wide">المحترفون</span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-2 text-foreground text-balance">
              مهنيون موثوقون جاهزون لمساعدتك
            </h2>
          </div>
          <Link
            to="/pros"
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5"
          >
            عرض كل المحترفين
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pros.map((p, i) => (
            <div
              key={p.id || i}
              className="group grid grid-cols-[auto_1fr] gap-5 p-5 rounded-3xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden shrink-0 bg-secondary">
                {p.img ? (
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <UserAvatar name={p.name} className="w-full h-full rounded-none text-4xl" />
                )}
                {p.verified && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <BadgeCheck size={14} className="text-[#0c1a19]" />
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl font-bold text-foreground truncate">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.craft}</p>
                  </div>
                  {p.rating && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-primary text-sm font-semibold shrink-0">
                      <Star size={14} className="fill-current" />
                      {p.rating}
                    </div>
                  )}
                </div>

                {p.bio && <p className="mt-3 text-sm text-foreground/75 line-clamp-2">{p.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {p.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {p.city}
                    </span>
                  )}
                  <span>{p.reviews ? `${p.reviews} تقييم` : "جديد على دروب"}</span>
                </div>

                <Link
                  to={p.id ? `/pros/${p.id}` : "/pros"}
                  className="mt-auto pt-4"
                >
                  <span className="block px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold text-center hover:bg-primary/90 transition">
                    عرض الملف والمراسلة
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
