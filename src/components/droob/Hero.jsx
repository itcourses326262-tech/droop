import { useEffect, useState } from "react";
import { Search, MapPin, ArrowLeft, Zap, ShieldCheck } from "lucide-react";

const rotating = ["كهربائي", "سبّاك", "نقّاش", "نجّار", "فنّي تكييف"];

export default function Hero({ heroImage }) {
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % rotating.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0c1a19]/92 via-[#0c1a19]/70 to-[#0c1a19]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a19]/80 via-transparent to-[#0c1a19]/30" />
      </div>

      {/* Decorative path line */}
      <div className="absolute top-0 bottom-0 right-[12%] w-px path-line opacity-40 hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full pt-24 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-primary-foreground/90 text-xs font-medium mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            أكثر من ٤٬٠٠٠ محترف موثوق في مدينتك
          </div>

          <h1 className="font-heading text-white text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-balance">
            أحتاج إلى{" "}
            <span className="relative inline-block text-accent">
              {rotating[idx]}
              <span className="absolute -bottom-1 right-0 left-0 h-1 rounded-full bg-accent/70" />
            </span>
            <br />
            في مكاني، الآن.
          </h1>

          <p className="mt-6 text-white/75 text-lg sm:text-xl leading-relaxed max-w-2xl">
            دروب يصل بينك وبين أفضل أصحاب المهن في دقائق — أسعار واضحة، تقييمات حقيقية،
            وحجز فوري دون عناء البحث.
          </p>

          {/* Search bar */}
          <div className="mt-9 glass rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-2 max-w-2xl">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-white/95 rounded-xl">
              <Search size={20} className="text-primary shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن خدمة… كهرباء، سباكة، دهان"
                className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-3 bg-white/95 rounded-xl">
              <MapPin size={20} className="text-primary shrink-0" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">القاهرة</span>
            </div>
            <a
              href="#services"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-[#0c1a19] font-semibold text-sm hover:brightness-105 transition"
            >
              ابحث الآن
              <ArrowLeft size={18} />
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" /> محترفون موثّقون
            </span>
            <span className="flex items-center gap-2">
              <Zap size={18} className="text-accent" /> خدمة طارئة ٢٤/٧
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" /> ضمان على الخدمة
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 inset-x-0 hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 pb-7">
          <div className="glass rounded-2xl px-8 py-5 flex items-center justify-between text-white">
            {[
              { n: "٤٬٠٠٠+", l: "محترف موثوق" },
              { n: "١٢٠", l: "مدينة ومنطقة" },
              { n: "٤.٨/٥", l: "متوسط التقييم" },
              { n: "<٣٠ د", l: "متوسط وقت الوصول" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-accent">{s.n}</span>
                <span className="text-xs text-white/60 mt-0.5">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}