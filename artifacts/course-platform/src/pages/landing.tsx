import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";

export default function LandingPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            {t.heroTitle} <span className="text-primary">{t.heroTitleHighlight}</span> {t.heroTitleEnd}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            {t.heroSub}
          </p>
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link href="/courses">
              <Button size="lg" className="h-12 px-8 text-base">{t.exploreCoursesBtn}</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">{t.createAccount}</Button>
            </Link>
          </div>
        </section>

        <section className="bg-muted/50 py-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-xl font-bold">{t.trackProgress}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.trackProgressDesc}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </div>
              <h3 className="text-xl font-bold">{t.richResources}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.richResourcesDesc}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              </div>
              <h3 className="text-xl font-bold">{t.liveSessions}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.liveSessionsDesc}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t bg-card text-center text-muted-foreground flex justify-between items-center relative">
        <p>&copy; {new Date().getFullYear()} {t.siteName}. {t.footer}</p>
        <Link href="/admin">
          <div className="w-4 h-4 opacity-10 hover:opacity-100 cursor-pointer rounded-full bg-primary transition-opacity absolute bottom-8 right-6" title="Admin Portal" />
        </Link>
      </footer>
    </div>
  );
}
