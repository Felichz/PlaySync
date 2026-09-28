import type { CSSProperties } from 'react';
import { LANGS, useI18n } from '../i18n';

/** EN / ES toggle. Each option is labelled in its own language so it reads right from either side. */
export default function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const index = LANGS.findIndex((l) => l.id === lang);
  return (
    <div
      className={`seg mini lang-switch ${className}`}
      role="group"
      aria-label={t.language}
      style={{ '--i': index } as CSSProperties}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          className={`tab-btn ${l.id === lang ? 'active' : ''}`}
          aria-pressed={l.id === lang}
          aria-label={l.name}
          title={l.name}
          onClick={() => setLang(l.id)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
