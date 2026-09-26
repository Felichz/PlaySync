// PlaySync icon set: one soft stroke weight, rounded joins, 24×24, currentColor.
import type { ReactNode } from 'react';

type P = { size?: number; className?: string };

function svg(size: number, className: string | undefined, children: ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconPlay = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M7 4.6v14.8L20 12 7 4.6Z" />
  </svg>
);

export const IconPause = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
);

export const IconVolume = ({ size = 18, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M15.5 9a4.4 4.4 0 0 1 0 6" />
      <path d="M18 6.5a8 8 0 0 1 0 11" />
    </>,
  );

export const IconMute = ({ size = 18, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </>,
  );

export const IconFull = ({ size = 18, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </>,
  );

export const IconSend = ({ size = 17, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M3.5 12 20.5 4l-4.2 16-4.1-6.1L3.5 12Z" />
      <path d="M12.2 13.9 20.5 4" />
    </>,
  );

export const IconPlus = ({ size = 16, className }: P) => svg(size, className, <path d="M12 5v14M5 12h14" />);

export const IconX = ({ size = 14, className }: P) => svg(size, className, <path d="M6 6l12 12M18 6 6 18" />);

export const IconShare = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="17.5" cy="5.5" r="2.4" />
      <circle cx="17.5" cy="18.5" r="2.4" />
      <path d="M8.2 10.9 15.3 6.8M8.2 13.1l7.1 4.1" />
    </>,
  );

export const IconBack = ({ size = 18, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </>,
  );

export const IconSmile = ({ size = 20, className }: P) =>
  svg(
    size,
    className,
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.6 14.2a4.2 4.2 0 0 0 6.8 0" />
      <path d="M9.2 9.6h.01M14.8 9.6h.01" strokeWidth="2.4" />
    </>,
  );

export const IconSignal = ({ size = 14, className, level = 3 }: P & { level?: 1 | 2 | 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={3 + i * 7.5}
        y={17 - i * 6}
        width="4.5"
        height={4 + i * 6}
        rx="1"
        fill="currentColor"
        opacity={i < level ? 1 : 0.22}
      />
    ))}
  </svg>
);

export const IconChat = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 3.6v-3.6h-1A2.5 2.5 0 0 1 4 13V6Z" />
    </>,
  );

export const IconFilm = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M3.5 12h17M3.5 8.5H8M3.5 15.5H8M16 8.5h4.5M16 15.5h4.5" strokeWidth="1.2" />
    </>,
  );

export const IconUsers = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a3 3 0 0 1 0 5.8M17.5 14.9c2 .6 3.5 2.3 3.5 4.6" />
    </>,
  );

/** Brand mark: two play marks, one catching up to the other. */
export const Logo = ({ size = 28, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="ps-tile" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#2d2032" />
        <stop offset="1" stopColor="#140f17" />
      </linearGradient>
      <linearGradient id="ps-glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffc9a8" />
        <stop offset="1" stopColor="#ff9a76" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="120" fill="url(#ps-tile)" />
    <path d="M168 150 L168 318 L314 234 Z" fill="none" stroke="#ff8497" strokeWidth="30" strokeLinejoin="round" opacity="0.9" />
    <path d="M214 196 L214 364 L360 280 Z" fill="url(#ps-glow)" stroke="url(#ps-glow)" strokeWidth="30" strokeLinejoin="round" />
  </svg>
);

export const IconArrow = ({ size = 16, className }: P) =>
  svg(size, className, <path d="M5 12h14M13 6l6 6-6 6" />);

export const IconReturn = ({ size = 15, className }: P) =>
  svg(size, className, <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />);

export const IconLink = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </>,
  );

export const IconDrive = ({ size = 16, className }: P) =>
  svg(
    size,
    className,
    <>
      <path d="M8.6 4h6.8l5.6 9.8-3.4 5.9H6.4L3 13.8 8.6 4Z" />
      <path d="M8.6 4 14.3 13.8H21M6.4 19.7 12 10" />
    </>,
  );

export const IconPencil = ({ size = 15, className }: P) =>
  svg(size, className, <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />);
