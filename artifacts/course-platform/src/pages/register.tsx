import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { BrainHouseLogo } from "@/components/BrainHouseLogo";

export default function RegisterPage() {
  const { t, isRTL, lang, setLang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const register = useRegister();

  const handleSubmit = () => {
    register.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data) => {
          setToken(data.token);
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Registration failed. Please try again.", variant: "destructive" });
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
          <CardTitle className="text-2xl">{t.createAccount}</CardTitle>
          <CardDescription>{t.noAccount}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={register.isPending}>
            {register.isPending ? t.registering : t.register}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t.haveAccount}{" "}
            <Link href="/login" className="text-primary hover:underline">{t.signIn}</Link>
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
