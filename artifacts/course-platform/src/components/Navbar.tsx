import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, LayoutDashboard, LogOut, Globe, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { token, setToken } = useAuth();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    setToken(null);
    queryClient.clear();
    window.location.href = "/";
  };

  const isActive = (path: string) => location === path;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href}>
      <span className={`
        relative text-sm font-medium transition-colors duration-150 px-1 py-0.5
        ${isActive(href)
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
        }
      `}>
        {children}
        {isActive(href) && (
          <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
        )}
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
            <div className="relative">
              <img src="/logo.png" alt="BrainHouse" className="h-9 w-9 object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight">{t.siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={`hidden md:flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <NavLink href="/courses">{t.browseCourses}</NavLink>
            {token && (
              <>
                <NavLink href="/dashboard">{t.dashboard}</NavLink>
                <NavLink href="/my-courses">{t.myCourses}</NavLink>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className={`hidden md:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            {token ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.signOut}
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t.signIn}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="btn-premium shadow-sm">{t.getStarted}</Button>
                </Link>
              </>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 border border-transparent hover:border-border"
              title={lang === "en" ? "العربية" : "English"}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "AR" : "EN"}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link href="/courses" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                {t.browseCourses}
              </div>
            </Link>
            {token && (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    {t.dashboard}
                  </div>
                </Link>
                <Link href="/my-courses" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    {t.myCourses}
                  </div>
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-border mt-2 flex items-center gap-2">
              {token ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2">
                  <LogOut className="w-4 h-4" /> {t.signOut}
                </Button>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t.signIn}</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">{t.getStarted}</Button>
                  </Link>
                </>
              )}
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors"
              >
                {lang === "en" ? "AR" : "EN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
