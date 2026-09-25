import { useState } from 'react';
import { randomCode } from '../lib/util';
import { IconPlay } from './icons';

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
      <main className="hero">
        <div className="hero-mark" aria-hidden="true">
          <IconPlay size={22} />
        </div>
        <h1>Mira YouTube juntos</h1>
        <p className="sub">
          La misma reproducción, el mismo segundo, con quien quieras y desde cualquier dispositivo.
        </p>

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

          <button className="btn primary big" onClick={() => onJoin(randomCode(), name.trim() || 'Invitado')}>
            Crear sala
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
              placeholder="CÓDIGO"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Código de sala"
            />
            <button className="btn ghost big" disabled={code.replace(/[^A-Z0-9]/g, '').length < 4}>
              Unirme
            </button>
          </form>

          {lastRoom && (
            <button className="rejoin" onClick={() => onJoin(lastRoom, name.trim() || 'Invitado')}>
              Volver a la sala <b>{lastRoom}</b>
            </button>
          )}
        </div>

        <p className="foot">Sin cuentas · en cualquier navegador · instalable como app</p>
      </main>
    </div>
  );
}
