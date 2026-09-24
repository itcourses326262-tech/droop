import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UserPlus } from "lucide-react";
import RequestServiceModal from "@/components/droob/RequestServiceModal";

const links = [
  { label: "الخدمات", href: "#services" },
  { label: "كيف يعمل دروب", href: "#how" },
  { label: "المحترفون", href: "#pros" },
  { label: "آراء العملاء", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-light shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="w-4 h-4 rounded-sm border-2 border-primary-foreground" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            دروب
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
          >
            تسجيل الدخول
          </a>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-[#0c1a19] text-sm font-semibold hover:brightness-105 transition-colors"
          >
            <UserPlus size={16} />
            صاحب مهنة
          </Link>
          <button
            onClick={() => setRequestOpen(true)}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            اطلب خدمة
          </button>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass-light border-t border-border/60">
          <div className="px-5 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-foreground/80"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-accent text-[#0c1a19] text-sm font-semibold text-center"
            >
              <UserPlus size={16} />
              صاحب مهنة
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setRequestOpen(true);
              }}
              className="mt-1 px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold text-center"
            >
              اطلب خدمة
            </button>
          </div>
        </div>
      )}
    </header>

      <RequestServiceModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}