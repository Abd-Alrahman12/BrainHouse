import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

function getFingerprint(): string {
  const key = "bh_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = [
      screen.width, screen.height, screen.colorDepth,
      navigator.hardwareConcurrency, navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.userAgent.match(/(Windows NT[\s\d.]+|Mac OS X[\s\d_]+|Android[\s\d.]+|iPhone OS[\s\d_]+|Linux)/)?.[0] || "unknown",
    ].join("|");
    let hash = 0;
    for (let i = 0; i < fp.length; i++) { hash = ((hash << 5) - hash) + fp.charCodeAt(i); hash |= 0; }
    fp = `dev_${Math.abs(hash).toString(36)}`;
    localStorage.setItem(key, fp);
  }
  return fp;
}

export default function LoginPage() {
  const { t, isRTL, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-fingerprint": getFingerprint() },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); return; }
      setToken(data.token);
      setLocation("/dashboard");
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 p-12 flex-col justify-between">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo.png" alt="BrainHouse" className="h-10 w-10 object-contain" />
            <span className="font-bold text-xl text-white">{t.siteName}</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Learn anything,<br />anywhere.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Access premium courses from expert instructors. Track your progress and achieve your goals.
          </p>
        </div>
        <div className="relative space-y-3">
          {["Expert instructors", "Progress tracking", "Live sessions"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="BrainHouse" className="h-9 w-9 object-contain" />
            <span className="font-bold text-xl">{t.siteName}</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">{t.signIn}</h1>
            <p className="text-muted-foreground text-sm">
              {t.noAccount}{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">{t.createOne}</Link>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.email}</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="h-11 pr-10 bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 btn-premium gap-2 text-sm font-medium shadow-md shadow-primary/20"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.signingIn}</>
              ) : (
                <>{t.signIn} <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              🌐 {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
