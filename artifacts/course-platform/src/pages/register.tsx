import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const { t, isRTL, lang, setLang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const register = useRegister();

  const handleSubmit = () => {
    register.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data) => { setToken(data.token); setLocation("/dashboard"); },
        onError: () => toast({ title: "Registration failed. Please try again.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-12 flex-col justify-between">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo.png" alt="BrainHouse" className="h-10 w-10 object-contain" />
            <span className="font-bold text-xl text-white">{t.siteName}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Join thousands of learners
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your<br />learning journey.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Create a free account and get instant access to all available courses.
          </p>
        </div>
        <div className="relative p-5 rounded-2xl bg-white/10 border border-white/15">
          <p className="text-white/80 text-sm italic leading-relaxed">
            "BrainHouse has completely changed how I approach learning. The courses are excellent!"
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">S</div>
            <div>
              <p className="text-white text-sm font-medium">Student</p>
              <p className="text-white/50 text-xs">Verified learner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="BrainHouse" className="h-9 w-9 object-contain" />
            <span className="font-bold text-xl">{t.siteName}</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">{t.createAccount}</h1>
            <p className="text-muted-foreground text-sm">
              {t.haveAccount}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">{t.signIn}</Link>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">{t.name}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="h-11 bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Create a password"
                  className="h-11 pr-10 bg-background"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-11 btn-premium gap-2 text-sm font-medium shadow-md shadow-primary/20 mt-2" onClick={handleSubmit} disabled={register.isPending}>
              {register.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.registering}</>
              ) : (
                <>{t.register} <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              🌐 {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
