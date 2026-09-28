import { useSyncExternalStore } from 'react';
import { getLS, setLS } from './util';

export type Theme = 'light' | 'dark';

/** Same key and values the inline script in index.html reads before first paint. */
export const THEME_KEY = 'playsync:theme';

/** Browser chrome color per theme (`<meta name="theme-color">`), matching `--ground`. */
const CHROME: Record<Theme, string> = { light: '#f3ebe4', dark: '#0f0b10' };

const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
const listeners = new Set<() => void>();

function stored(): Theme | null {
  const v = getLS(THEME_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

/** No saved choice: follow the system, dark when it has no opinion (night-first). */
function resolved(): Theme {
  return stored() ?? (media?.matches ? 'light' : 'dark');
}

let current: Theme = (() => {
  const attr = document.documentElement.dataset.theme;
  return attr === 'light' || attr === 'dark' ? attr : resolved();
})();

function apply(theme: Theme) {
  current = theme;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme]);
  document
    .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    ?.setAttribute('content', theme === 'light' ? 'default' : 'black-translucent');
  listeners.forEach((l) => l());
}

// Keep following the system until the person picks a theme themselves.
media?.addEventListener('change', () => {
  if (!stored()) apply(resolved());
});

// Another tab changed the choice.
window.addEventListener('storage', (e) => {
  if (e.key === THEME_KEY) apply(resolved());
});

export function setTheme(theme: Theme) {
  setLS(THEME_KEY, theme);
  apply(theme);
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
