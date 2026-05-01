import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { token, setToken } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    setToken(null);
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <header className="px-4 md:px-6 py-3 flex items-center justify-between bg-card border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img
          src="/logo.png"
          alt="BrainHouse"
          className="h-10 w-10 md:h-12 md:w-12 object-contain flex-shrink-0"
        />
        <span className="font-bold text-lg md:text-xl tracking-tight">{t.siteName}</span>
      </Link>

      <nav className={`flex items-center gap-2 md:gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
          {t.browseCourses}
        </Link>

        {token ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              {t.dashboard}
            </Link>
            <Link href="/my-courses" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              {t.myCourses}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              {t.signOut}
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm">{t.signIn}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t.getStarted}</Button>
            </Link>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="font-semibold min-w-[44px]"
        >
          {lang === "en" ? "AR" : "EN"}
        </Button>
      </nav>
    </header>
  );
}
