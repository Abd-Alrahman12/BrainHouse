import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { BrainHouseLogo } from "@/components/BrainHouseLogo";

function getFingerprint(): string {
  const key = "bh_fp";
  
  // Build device fingerprint from hardware characteristics
  const deviceSignature = [
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Extract OS from userAgent only (not browser)
    navigator.userAgent.match(/(Windows NT[\s\d.]+|Mac OS X[\s\d_]+|Android[\s\d.]+|iPhone OS[\s\d_]+|Linux)/)?.[0] || "unknown",
  ].join("|");

  // Hash it into a short ID
  let hash = 0;
  for (let i = 0; i < deviceSignature.length; i++) {
    hash = ((hash << 5) - hash) + deviceSignature.charCodeAt(i);
    hash |= 0;
  }
  const deviceId = `dev_${Math.abs(hash).toString(36)}`;

  // Store it (in case hardware info changes slightly between sessions)
  let fp = localStorage.getItem(key);
  if (!fp) {
    localStorage.setItem(key, deviceId);
    fp = deviceId;
  }
  return fp;
}

export default function LoginPage() {
  const { t, isRTL, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "";
      const fingerprint = getFingerprint();

      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-fingerprint": fingerprint,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      setToken(data.token);
      setLocation("/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <BrainHouseLogo size={36} />
            <span className="font-bold text-2xl">{t.siteName}</span>
          </div>
          <CardTitle className="text-2xl">{t.signIn}</CardTitle>
          <CardDescription>{t.haveAccount}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? t.signingIn : t.signIn}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t.noAccount}{" "}
            <Link href="/register" className="text-primary hover:underline">{t.createOne}</Link>
          </p>
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              {lang === "en" ? "العربية" : "English"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
