import { useState, useEffect, useCallback } from "react";
import { translations, type Lang } from "@/lib/i18n";

const LANG_KEY = "brainhouse_lang";

function getInitialLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "ar" || stored === "en") return stored;
  const browser = navigator.language.startsWith("ar") ? "ar" : "en";
  return browser;
}

let globalLang: Lang = getInitialLang();
const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(globalLang);

  // Subscribe to global changes from other components
  useEffect(() => {
    const update = () => setLangState(globalLang);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    globalLang = newLang;
    localStorage.setItem(LANG_KEY, newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    setLangState(newLang);
    notifyAll();
  }, []);

  const t = translations[lang];
  const isRTL = lang === "ar";

  return { lang, setLang, t, isRTL };
}

export function applyInitialLang() {
  const lang = getInitialLang();
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}
