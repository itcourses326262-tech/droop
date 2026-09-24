import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

const services = ["كهرباء", "سباكة", "دهان", "نجارة", "تكييف", "أخرى"];

export default function CTA() {
  const [service, setService] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="book" className="py-20 sm:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0c1a19] p-8 sm:p-14">
          <div className="absolute top-0 bottom-0 right-[10%] w-px path-line opacity-40" />
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-sm font-semibold text-accent tracking-wide">ابدأ الآن</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2 text-white text-balance">
                اطلب خدمتك في أقل من دقيقة
              </h2>
              <p className="mt-4 text-white/60 text-lg leading-relaxed">
                اختر الخدمة، اترك رقمك، وسيتواصل معك محترف موثوق خلال دقائق — بأسعار واضحة وضمان دروب.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["بدون رسوم مخفية", "ضمان على الخدمة", "دفع بعد الإتمام"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                      <Check size={13} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              {sent ? (
                <div className="text-center py-10">
                  <span className="w-14 h-14 rounded-full bg-accent text-[#0c1a19] flex items-center justify-center mx-auto mb-4">
                    <Check size={26} />
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white">تم استلام طلبك</h3>
                  <p className="text-white/60 text-sm mt-2">
                    سيتواصل معك أحد محترفي دروب خلال دقائق لتأكيد الموعد.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">نوع الخدمة</label>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setService(s)}
                          className={`px-3.5 py-1.5 rounded-full text-sm transition ${
                            service === s
                              ? "bg-accent text-[#0c1a19] font-semibold"
                              : "glass text-white/70 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">رقم الهاتف</label>
                    <input
                      required
                      type="tel"
                      placeholder="01X XXXX XXXX"
                      className="w-full px-4 py-3 rounded-xl bg-white/95 text-foreground outline-none text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">وصف موجز للمشكلة</label>
                    <textarea
                      rows={2}
                      placeholder="مثال: انقطاع كهرباء في غرفة النوم…"
                      className="w-full px-4 py-3 rounded-xl bg-white/95 text-foreground outline-none text-sm placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!service}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-[#0c1a19] font-semibold text-sm hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    تأكيد الطلب
                    <ArrowLeft size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}