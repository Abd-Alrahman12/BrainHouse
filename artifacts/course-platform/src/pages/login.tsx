import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { BrainHouseLogo } from "@/components/BrainHouseLogo";

export default function LoginPage() {
  const { t, isRTL, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const login = useLogin();

  const handleSubmit = () => {
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setToken(data.token);
          setLocation("/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary"><BrainHouseLogo size={36} /></span>
            <span className="font-bold text-2xl">{t.siteName}</span>
          </div>
          <CardTitle className="text-2xl">{t.signIn}</CardTitle>
          <CardDescription>{t.haveAccount}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          {login.error && (
            <p className="text-sm text-destructive">Invalid email or password.</p>
          )}
          <Button className="w-full" onClick={handleSubmit} disabled={login.isPending}>
            {login.isPending ? t.signingIn : t.signIn}
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
