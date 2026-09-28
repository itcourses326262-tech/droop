import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  UserPlus,
  MessageCircle,
  LayoutDashboard,
  UserCog,
  ShieldCheck,
  LogOut,
  Users,
} from "lucide-react";
import RequestServiceModal from "@/components/droob/RequestServiceModal";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/lib/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { label: "الخدمات", href: "/#services" },
  { label: "كيف يعمل دروب", href: "/#how" },
  { label: "المحترفون", to: "/pros" },
  { label: "الطلبات", href: "/#feed" },
];

function NavItem({ item, className, onClick }) {
  return item.to ? (
    <Link to={item.to} className={className} onClick={onClick}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className={className} onClick={onClick}>
      {item.label}
    </a>
  );
}

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
      {count > 9 ? "+9" : count}
    </span>
  );
}

export default function Navbar({ solid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount } = useConversations();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userLinks = [
    { label: "طلباتي", to: "/dashboard", icon: LayoutDashboard },
    { label: "الرسائل", to: "/messages", icon: MessageCircle, badge: unreadCount },
    { label: "ملفي الشخصي", to: "/profile", icon: UserCog },
    ...(user?.account_type === "professional"
      ? [{ label: "صفحتي العامة", to: `/pros/${user.uid}`, icon: Users }]
      : []),
    ...(isAdmin ? [{ label: "لوحة الإدارة", to: "/admin", icon: ShieldCheck }] : []),
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || solid ? "glass-light shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="w-4 h-4 rounded-sm border-2 border-primary-foreground" />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">دروب</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavItem
                key={l.label}
                item={l}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              />
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/80 hover:text-primary transition"
                  aria-label="الرسائل"
                >
                  <MessageCircle size={18} />
                  <UnreadBadge count={unreadCount} />
                </Link>
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <UserAvatar name={user?.display_name} photo={user?.profile_picture} className="w-10 h-10" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="font-semibold text-foreground truncate">{user?.display_name || "حسابي"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userLinks.map((l) => (
                      <DropdownMenuItem key={l.to} onSelect={() => navigate(l.to)} className="gap-2 cursor-pointer">
                        <l.icon size={16} />
                        <span className="flex-1">{l.label}</span>
                        {l.badge > 0 && (
                          <span className="px-1.5 rounded-full bg-destructive text-white text-[10px] font-bold">
                            {l.badge}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => logout()} className="gap-2 cursor-pointer text-destructive">
                      <LogOut size={16} />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-[#0c1a19] text-sm font-semibold hover:brightness-105 transition-colors"
                >
                  <UserPlus size={16} />
                  صاحب مهنة
                </Link>
              </>
            )}
            <button
              onClick={() => setRequestOpen(true)}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              اطلب خدمة
            </button>
          </div>

          <button
            className="md:hidden relative p-2 -ml-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
            {!open && <UnreadBadge count={unreadCount} />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden glass-light border-t border-border/60 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavItem
                  key={l.label}
                  item={l}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-foreground/80"
                />
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60">
                    <UserAvatar name={user?.display_name} photo={user?.profile_picture} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.display_name || "حسابي"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  {userLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground/80"
                    >
                      <l.icon size={16} />
                      <span className="flex-1">{l.label}</span>
                      {l.badge > 0 && (
                        <span className="px-1.5 rounded-full bg-destructive text-white text-[10px] font-bold">
                          {l.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 py-2.5 text-sm font-medium text-destructive"
                  >
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-sm font-semibold text-foreground/80"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-accent text-[#0c1a19] text-sm font-semibold text-center"
                  >
                    <UserPlus size={16} />
                    صاحب مهنة
                  </Link>
                </>
              )}
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
