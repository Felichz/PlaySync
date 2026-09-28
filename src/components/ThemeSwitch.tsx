import type { CSSProperties } from 'react';
import { useI18n } from '../i18n';
import { setTheme, useTheme, type Theme } from '../lib/theme';
import { IconMoon, IconSun } from './icons';

const THEMES: { id: Theme; icon: typeof IconSun }[] = [
  { id: 'light', icon: IconSun },
  { id: 'dark', icon: IconMoon },
];

/** Light / dark toggle, the language switch's twin. Starts on the system theme until one is picked. */
export default function ThemeSwitch({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const theme = useTheme();
  const index = THEMES.findIndex((x) => x.id === theme);
  return (
    <div
      className={`seg mini theme-switch ${className}`}
      role="group"
      aria-label={t.theme.label}
      style={{ '--i': index } as CSSProperties}
    >
      {THEMES.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab-btn ${id === theme ? 'active' : ''}`}
          aria-pressed={id === theme}
          aria-label={t.theme[id]}
          title={t.theme[id]}
          onClick={() => setTheme(id)}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
