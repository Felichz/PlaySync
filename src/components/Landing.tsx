import { useMemo, useState } from 'react';
import { randomCode } from '../lib/util';

type Props = {
  initialName: string;
  lastRoom: string;
  onJoin(code: string, name: string): void;
};

/** Dial needle position: rests left, then tracks the code being dialed. */
function needlePos(code: string): number {
  if (code.length < 2) return 14;
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 18 + (h % 68) + Math.min(code.length, 6) * 2;
}

const BAND = [88, 92, 96, 100, 104, 108];

export default function Landing({ initialName, lastRoom, onJoin }: Props) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');

  const join = (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 4) return;
    onJoin(clean, name.trim() || 'Invitado');
  };

  const ticks = useMemo(() => {
    const out: { w: number; maj: boolean }[] = [];
    for (let i = 0; i <= 84; i++) out.push({ w: i % 6 === 0 ? 14 : i % 2 === 0 ? 8 : 4, maj: i % 6 === 0 });
    return out;
  }, []);

  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pos = needlePos(cleanCode);

  return (
    <div className="landing">
      <header className="studio-top">
        <span className="logotype">
          SYNC<b>PLAY</b>
        </span>
        <span className="studio-tag">transmisión sincronizada</span>
      </header>

      <main className="studio-main">
        <div className="dial" aria-hidden="true">
          <div className="dial-face">
            <div className="dial-numbers">
              {BAND.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="dial-ticks">
              {ticks.map((t, i) => (
                <i key={i} className={t.maj ? 'maj' : ''} style={{ height: t.w }} />
              ))}
            </div>
            <div className="dial-needle" style={{ left: `${pos}%` }} />
          </div>
        </div>

        <h1 className="wordmark">
          Sync<span>Play</span>
        </h1>
        <p className="promise">
          Mira YouTube con quien quieras, donde esté. La sala es una transmisión en vivo que solo
          ustedes dos sintonizan.
        </p>

        <div className="console-card">
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

          <button className="key primary big" onClick={() => onJoin(randomCode(), name.trim() || 'Invitado')}>
            Encender estudio
          </button>

          <div className="divider">o sintoniza una frecuencia</div>

          <form
            className="join-row"
            onSubmit={(e) => {
              e.preventDefault();
              join(code);
            }}
          >
            <input
              className="freq-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="FRECUENCIA"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Código de sala"
            />
            <button className="key big" disabled={cleanCode.length < 4}>
              Sintonizar
            </button>
          </form>

          {lastRoom && (
            <button className="key small" onClick={() => onJoin(lastRoom, name.trim() || 'Invitado')}>
              Volver a {lastRoom}
            </button>
          )}
        </div>
      </main>

      <footer className="studio-foot">
        <b>sin cuentas</b> · <b>en cualquier navegador</b> · instalable como app
      </footer>
    </div>
  );
}
