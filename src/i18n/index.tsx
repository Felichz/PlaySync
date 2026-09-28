import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLS, setLS } from '../lib/util';
import { en, type Messages } from './en';
import { es } from './es';

export type Lang = 'en' | 'es';

export const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'es', short: 'ES', name: 'Español' },
];

const CATALOGS: Record<Lang, Messages> = { en, es };
const LANG_KEY = 'playsync.lang';

/** English on first visit, whatever the browser says; after that, whatever the person picked. */
function initialLang(): Lang {
  return getLS(LANG_KEY) === 'es' ? 'es' : 'en';
}

type I18n = {
  lang: Lang;
  setLang(lang: Lang): void;
  t: Messages;
  /** Clock time of a chat message, in the viewer's language. */
  time(at: number): string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLS(LANG_KEY, next);
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const clock = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' });
    return {
      lang,
      setLang,
      t: CATALOGS[lang],
      time: (at) => {
        try {
          return clock.format(at);
        } catch {
          return '';
        }
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n needs an <I18nProvider> above it');
  return ctx;
}

/** Renders a message built from pieces (text around a highlighted name or code). */
export function Rich({ parts }: { parts: ReactNode[] }) {
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}

/** Placeholder names people end up with when they skip naming themselves, in any language. */
export function isDefaultName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return !n || Object.values(CATALOGS).some((c) => c.guest.toLowerCase() === n);
}
