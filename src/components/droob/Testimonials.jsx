import { Star, Quote } from "lucide-react";

const items = [
  {
    name: "سارة منصور",
    role: "مالكة شقة — المعادي",
    text: "انقطعت الكهرباء ليلاً، وطلبت عبر دروب كهربائيًا وصل خلال عشرين دقيقة. سعر واضح من البداية وخدمة ممتازة.",
    rating: 5,
  },
  {
    name: "خالد العزب",
    role: "صاحب فيلا — الشيخ زايد",
    text: "جربت دروب لدهان الشقة بالكامل. المحترف كان منظّمًا والعمل نُظيف. التقييم بعد الخدمة فكرة ممتازة.",
    rating: 5,
  },
  {
    name: "نورا حسن",
    role: "مستأجرة — مدينة نصر",
    text: "تسريب مياه مفاجئ، حجزت سبّاكًا في دقائق. الشفافية في الأسعار والضمان خلّتني أرتاح تمامًا.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-primary tracking-wide">آراء العملاء</span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-2 text-foreground text-balance">
            ثقة بُنيت خدمة بعد خدمة
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.name}
              className="relative bg-card rounded-3xl p-7 border border-border/60 hover:border-primary/30 transition-colors"
            >
              <Quote className="absolute top-6 left-6 text-primary/10" size={44} />
              <div className="flex items-center gap-1 mb-4 relative">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < t.rating ? "fill-accent text-accent" : "text-border"}
                  />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed relative">{t.text}</p>
              <div className="mt-6 flex items-center gap-3 relative">
                <span className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}