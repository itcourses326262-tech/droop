import { Phone, Mail, MapPin } from "lucide-react";

const cols = [
  { title: "الخدمات", links: ["كهرباء", "سباكة", "دهان ونقش", "نجارة", "تكييف"] },
  { title: "دروب", links: ["من نحن", "كيف يعمل", "كن محترفًا", "الأسعار", "الوظائف"] },
  { title: "الدعم", links: ["مركز المساعدة", "سياسة الخصوصية", "الشروط والأحكام", "تواصل معنا"] },
];

export default function Footer() {
  return (
    <footer className="bg-[#0c1a19] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="w-4 h-4 rounded-sm border-2 border-primary-foreground" />
              </span>
              <span className="font-heading text-xl font-bold">دروب</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              منصة تربطك بأصحاب المهن الموثوقين في مدينتك — بأسعار واضحة وضمان على كل خدمة.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-white/60">
              <p className="flex items-center gap-2.5"><Phone size={16} className="text-accent" /> ١٦٤٧</p>
              <p className="flex items-center gap-2.5"><Mail size={16} className="text-accent" /> hello@droob.com</p>
              <p className="flex items-center gap-2.5"><MapPin size={16} className="text-accent" /> القاهرة، مصر</p>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-heading font-semibold mb-4 text-white">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#book" className="text-sm text-white/55 hover:text-accent transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/45">
          <p>© ٢٠٢٦ دروب. جميع الحقوق محفوظة.</p>
          <p>صُنع بدقة لربط المهارة بالحاجة.</p>
        </div>
      </div>
    </footer>
  );
}