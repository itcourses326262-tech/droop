import { Star, BadgeCheck, Clock, ArrowLeft } from "lucide-react";
import { siteImages } from "@/lib/siteImages";

const pros = [
  {
    name: "محمود عبد الرحمن",
    craft: "كهربائي معتمد",
    rating: 4.9,
    jobs: 312,
    eta: "٢٥ دقيقة",
    img: siteImages.pro1,
    tags: ["أعطال طارئة", "تمديد", "إنارة"],
  },
  {
    name: "أحمد سمير",
    craft: "سبّاك محترف",
    rating: 4.8,
    jobs: 268,
    eta: "٣٠ دقيقة",
    img: siteImages.pro2,
    tags: ["تسريبات", "سخانات", "تركيب"],
  },
];

export default function FeaturedPros() {
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
          <a
            href="#book"
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5"
          >
            عرض كل المحترفين
            <ArrowLeft size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pros.map((p) => (
            <div
              key={p.name}
              className="group grid grid-cols-[auto_1fr] gap-5 p-5 rounded-3xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden shrink-0">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <BadgeCheck size={14} className="text-[#0c1a19]" />
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.craft}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-primary text-sm font-semibold">
                    <Star size={14} className="fill-current" />
                    {p.rating}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    متاح الآن
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> يصل خلال {p.eta}
                  </span>
                  <span>{p.jobs} مهمة منجزة</span>
                </div>

                <a
                  href="#book"
                  className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold text-center hover:bg-primary/90 transition"
                >
                  احجز الآن
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}