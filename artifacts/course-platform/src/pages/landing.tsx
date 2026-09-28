import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/use-language";
import { ArrowRight, BookOpen, TrendingUp, Users, Star, CheckCircle, Zap } from "lucide-react";

export default function LandingPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

        {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 fade-in">
            <Zap className="w-3.5 h-3.5" />
            <span>The modern learning platform</span>
          </div>

    
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1] fade-in" style={{ animationDelay: "0.1s" }}>
            {t.heroTitle}{" "}
            <span className="gradient-text">{t.heroTitleHighlight}</span>{" "}
            {t.heroTitleEnd}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed fade-in" style={{ animationDelay: "0.2s" }}>
            {t.heroSub}
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 fade-in ${isRTL ? "sm:flex-row-reverse" : ""}`} style={{ animationDelay: "0.3s" }}>
            <Link href="/register">
              <Button size="lg" className="btn-premium h-12 px-8 text-base gap-2 shadow-lg shadow-primary/25">
                {t.getStarted}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base hover:bg-muted/50">
                {t.exploreCoursesBtn}
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-medium text-foreground">4.9</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Trusted by students</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Expert instructors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to learn
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete platform built for serious learners and educators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                color: "text-violet-600 bg-violet-50",
                title: t.trackProgress,
                desc: t.trackProgressDesc,
              },
              {
                icon: BookOpen,
                color: "text-blue-600 bg-blue-50",
                title: t.richResources,
                desc: t.richResourcesDesc,
              },
              {
                icon: Users,
                color: "text-emerald-600 bg-emerald-50",
                title: t.liveSessions,
                desc: t.liveSessionsDesc,
              },
            ].map((feature, i) => (
              <div key={i} className="group relative rounded-2xl border border-border bg-card p-8 card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-primary p-12 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-700" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start learning?</h2>
              <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
                Join today and unlock access to all courses.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold gap-2">
                  {t.createAccount}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="BrainHouse" className="h-7 w-7 object-contain" />
            <span className="font-semibold text-sm">{t.siteName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t.siteName}. {t.footer}
          </p>
          <Link href="/admin">
            <div className="w-3 h-3 rounded-full bg-border hover:bg-primary/30 cursor-pointer transition-colors" title="Admin" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
