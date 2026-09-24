import { ArrowLeft } from "lucide-react";
import { siteImages } from "@/lib/siteImages";

const categories = [
  {
    name: "كهرباء",
    desc: "إصلاح أعطال، تمديد، إنارة ولوحات كهربائية",
    count: "٨٤٠ محترف",
    urgent: true,
    img: siteImages.category1,
  },
  {
    name: "سباكة",
    desc: "تسريبات، سخانات، تركيب أدوات صحية",
    count: "٦٢٠ محترف",
    urgent: true,
    img: siteImages.category2,
  },
  {
    name: "دهان ونقش",
    desc: "دهان جدران، معجون، ديكورات وطلاء داخلي",
    count: "٧٣٠ محترف",
    urgent: false,
    img: siteImages.category3,
  },
  {
    name: "نجارة",
    desc: "أبواب، خزائن، أرضيات وتصليح أثاث",
    count: "٤١٠ محترف",
    urgent: false,
    img: siteImages.category4,
  },
  {
    name: "تكييف وتبريد",
    desc: "صيانة، تنظيف، تركيب وحدات وتعبئة فريون",
    count: "٣٥٠ محترف",
    urgent: true,
    img: siteImages.category5,
  },
  {
    name: "أعمال أخرى",
    desc: "سيراميك، زجاج، نظافة، صيانة عامة والمزيد",
    count: "٩٥٠ محترف",
    urgent: false,
    img: siteImages.category6,
  },
];

export default function Categories() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-semibold text-primary tracking-wide">شبكة الخدمات</span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-2 text-foreground text-balance">
              كل ما يحتاجه منزلك في مكان واحد
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            اختر المهمة، ودروب يربطك بمحترف متخصص موثوق خلال دقائق.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <a
              key={c.name}
              href="#book"
              className="group relative overflow-hidden rounded-3xl bg-card border border-border/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a19]/85 via-[#0c1a19]/20 to-transparent" />
                {c.urgent && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/95 text-[#0c1a19] text-xs font-semibold pulse-glow">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0c1a19]" />
                    طارئ
                  </span>
                )}
                <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                  <h3 className="font-heading text-2xl font-bold text-white">{c.name}</h3>
                  <span className="text-xs text-white/70 glass px-2.5 py-1 rounded-full">
                    {c.count}
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <span className="shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowLeft size={18} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}