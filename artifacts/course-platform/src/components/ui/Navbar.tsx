import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BrainHouseLogo } from "@/components/BrainHouseLogo";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { token, setToken } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    setToken(null);
    queryClient.clear();
    setLocation("/");
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between bg-card border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-primary">
          <BrainHouseLogo size={34} />
        </span>
        <span className="font-bold text-xl tracking-tight">{t.siteName}</span>
      </Link>

      <nav className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
          {t.browseCourses}
        </Link>

        {token ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              {t.dashboard}
            </Link>
            <Link href="/my-courses" className="text-sm font-medium hover:text-primary transition-colors">
              {t.myCourses}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              {t.signOut}
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">{t.signIn}</Button>
            </Link>
            <Link href="/register">
              <Button>{t.getStarted}</Button>
            </Link>
          </>
        )}

        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="font-semibold min-w-[48px]"
          title={lang === "en" ? "العربية" : "English"}
        >
          {lang === "en" ? "AR" : "EN"}
        </Button>
      </nav>
    </header>
  );
}
