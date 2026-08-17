import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Menu, X, Instagram, Youtube, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const NAV_ITEMS = [
  {
    label: "About",
    href: "/mission",
    children: [
      { label: "Mission", href: "/mission" },
      { label: "Annenberg Stats", href: "/mission#annenberg" },
      { label: "Committees", href: "/committees" },
    ],
  },
  { label: "Database", href: "/database" },
  { label: "Sessions", href: "/sessions" },
  {
    label: "Mentorship",
    href: "/mentorship",
    children: [
      { label: "Mentorship", href: "/mentorship" },
      { label: "UK Next Up", href: "/mentorship#uk-next-up" },
    ],
  },
  { label: "Job Board", href: "/job-board" },
  { label: "Partners", href: "/partners" },
  { label: "Donate", href: "/donate" },
  { label: "News", href: "/news" },
  { label: "SITM Español", href: "/sitm-espanol" },
  { label: "Sharing the Spotlight", href: "/women-sharing-the-spotlight" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user } = useAuth();
  const unreadCountQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
  const unreadCount = unreadCountQuery.data ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#44407A]/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="https://sheisthemusic.org/wp-content/themes/sheisthemusic/assets/images/brand-white.svg"
              alt="She Is The Music"
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-white/90 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors duration-150 flex items-center gap-1"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 bg-[#44407A] rounded shadow-xl py-2 min-w-[180px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 text-xs uppercase tracking-wider transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center gap-3">
            {user && (
              <Link
                href="/notifications"
                className="relative text-white/80 hover:text-white transition-colors p-2"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-[#A20E56] text-white text-[10px] leading-4 text-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <Link
                href="/member-portal"
                className="bg-[#A20E56] hover:bg-[#8a0c49] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded transition-all duration-150 active:scale-[0.97]"
              >
                Member Portal
              </Link>
            ) : (
              <>
                <a
                  href="https://sheisthemusic.org/login"
                  className="text-white/80 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors"
                >
                  Log In
                </a>
                <a
                  href="https://sheisthemusic.org/register"
                  className="bg-[#A20E56] hover:bg-[#8a0c49] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded transition-all duration-150 active:scale-[0.97]"
                >
                  Join Database
                </a>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-[#44407A] border-t border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="container py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-3 text-white/90 hover:text-white text-sm font-medium uppercase tracking-wider border-b border-white/5"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block py-2 text-white/60 hover:text-white text-xs uppercase tracking-wider"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {user && (
                <Link
                  href="/notifications"
                  className="flex items-center gap-2 py-3 text-white/90 text-sm font-medium uppercase tracking-wider"
                >
                  <Bell className="w-4 h-4" />
                  Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </Link>
              )}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <Link
                    href="/member-portal"
                    className="bg-[#A20E56] text-white text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded text-center"
                  >
                    Member Portal
                  </Link>
                ) : (
                  <div className="flex gap-3">
                    <a
                      href="https://sheisthemusic.org/login"
                      className="text-white/80 text-sm font-medium uppercase tracking-wider"
                    >
                      Log In
                    </a>
                    <a
                      href="https://sheisthemusic.org/register"
                      className="bg-[#A20E56] text-white text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded"
                    >
                      Join Database
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Newsletter */}
      <section className="bg-[#44407A] py-16">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-3">Stay Connected</h2>
          <p className="text-white/70 text-sm mb-6">
            Sign up to receive news and announcements
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#A20E56]"
            />
            <button className="bg-[#A20E56] hover:bg-[#8a0c49] text-white font-semibold uppercase tracking-wider text-sm px-6 py-3 rounded transition-all duration-150 active:scale-[0.97]">
              Sign Me Up
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d2a52] py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <img
              src="https://sheisthemusic.org/wp-content/themes/sheisthemusic/assets/images/brand-white.svg"
              alt="She Is The Music"
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/sheisthemusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/c/SheIsTheMusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@sheisthemusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.6a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.83z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <a href="mailto:info@sheisthemusic.org" className="hover:text-white transition-colors">Contact</a>
              <span>•</span>
              <Link href="/compliance" className="hover:text-white transition-colors">Cookie Policy</Link>
              <span>•</span>
              <Link href="/compliance" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/compliance" className="hover:text-white transition-colors">Terms of Use</Link>
            </div>
            <p>© 2026 She Is The Music • All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}