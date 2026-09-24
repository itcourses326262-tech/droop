import { Search, CalendarCheck, Wrench, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "اختر الخدمة",
    desc: "حدد نوع العطل أو المهمة وموقعك — الواجهة توجهك بخط واضح من البداية.",
  },
  {
    icon: CalendarCheck,
    title: "احجز موعدًا",
    desc: "اختر الوقت المناسب: الآن، اليوم، أو لاحقًا. تأكيد فوري دون مكالمات.",
  },
  {
    icon: Wrench,
    title: "ينفّذ المحترف",
    desc: "يصل المحترف الموثوق بالأدوات، ويتم العمل وفق سعر متفق عليه مسبقًا.",
  },
  {
    icon: Star,
    title: "قيّم الخدمة",
    desc: "بعد الانتهاء، قيّم تجربتك لتساعد غيرك، مع ضمان دروب على كل خدمة.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-28 bg-[#0c1a19] relative overflow-hidden">
      <div className="absolute top-0 bottom-0 right-[8%] w-px path-line opacity-30" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-accent tracking-wide">كيف يعمل دروب</span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-2 text-white text-balance">
            من الطلب إلى الإصلاح في أربع خطوات
          </h2>
          <p className="mt-4 text-white/60 text-lg leading-relaxed">
            صمّمنا المسار ليكون مباشرًا وموثوقًا — من أول نقرة حتى انتهاء الخدمة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="glass rounded-2xl p-6 h-full hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <span className="w-12 h-12 rounded-xl bg-primary/15 text-accent flex items-center justify-center">
                    <s.icon size={24} />
                  </span>
                  <span className="font-heading text-4xl font-bold text-white/10">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -left-3 w-6 h-px bg-accent/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}