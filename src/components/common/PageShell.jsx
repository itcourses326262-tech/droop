import Navbar from "@/components/droob/Navbar";
import Footer from "@/components/droob/Footer";

// هيكل الصفحات الداخلية: الشريط العلوي + المحتوى + التذييل.
export default function PageShell({ title, subtitle, actions, children, wide = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar solid />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-8 pt-24 pb-16 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              {title && <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground">{title}</h1>}
              {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="text-center py-14 px-6 rounded-3xl bg-card border border-dashed border-border text-muted-foreground">
      {children}
    </div>
  );
}
