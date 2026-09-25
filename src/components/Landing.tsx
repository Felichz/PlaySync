import { useState } from 'react';
import { randomCode } from '../lib/util';

type Props = {
  initialName: string;
  lastRoom: string;
  onJoin(code: string, name: string): void;
};

export default function Landing({ initialName, lastRoom, onJoin }: Props) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');

  const join = (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 4) return;
    onJoin(clean, name.trim() || 'Invitado');
  };

  return (
    <div className="landing">
      <div className="hero">
        <div className="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 512 512" width="64" height="64">
            <rect width="512" height="512" rx="110" fill="#141624" />
            <rect x="30" y="30" width="452" height="452" rx="92" fill="url(#lg)" />
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7c3aed" />
                <stop offset="0.55" stopColor="#d946ef" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <g fill="#fff">
              <path d="M216 170 L216 342 L344 256 Z" />
              <rect x="146" y="226" width="20" height="60" rx="10" />
              <rect x="176" y="206" width="20" height="100" rx="10" opacity="0.85" />
              <rect x="356" y="216" width="20" height="80" rx="10" opacity="0.85" />
              <rect x="386" y="236" width="20" height="40" rx="10" opacity="0.7" />
            </g>
          </svg>
        </div>
        <h1>
          Sync<span className="accent">Play</span>
        </h1>
        <p className="tagline">Mira YouTube sincronizado con quien quieras, desde cualquier dispositivo.</p>
      </div>

      <div className="card">
        <label className="field">
          <span>Tu nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Invitado"
            autoComplete="nickname"
          />
        </label>

        <button className="btn primary big" onClick={() => join(randomCode())}>
          ✨ Crear sala
        </button>

        <div className="divider">o únete con un código</div>

        <form
          className="join-row"
          onSubmit={(e) => {
            e.preventDefault();
            join(code);
          }}
        >
          <input
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="btn ghost big" disabled={code.replace(/[^A-Z0-9]/g, '').length < 4}>
            Unirme
          </button>
        </form>

        {lastRoom && (
          <button className="rejoin" onClick={() => join(lastRoom)}>
            ↩ Volver a la sala <b>{lastRoom}</b>
          </button>
        )}
      </div>

      <p className="foot">Funciona en el navegador. Instálala como app desde tu teléfono o PC.</p>
    </div>
  );
}
