import { useState } from 'react';
import { randomCode } from '../lib/util';
import { IconArrow, IconPause, IconReturn, Logo } from './icons';

type Props = {
  initialName: string;
  lastRoom: string;
  onJoin(code: string, name: string): void;
};

export default function Landing({ initialName, lastRoom, onJoin }: Props) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');
  const cleanCode = code.replace(/[^A-Z0-9]/g, '');
  const who = () => name.trim() || 'Invitado';

  const join = () => {
    if (cleanCode.length < 4) return;
    onJoin(cleanCode, who());
  };

  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />

      <header className="landing-top">
        <Logo size={30} />
        <span className="wordmark">PlaySync</span>
      </header>

      <main className="landing-main">
        <section className="landing-copy">
          <h1>
            Mismo video.
            <br />
            <span>Mismo segundo.</span>
          </h1>
          <p className="sub">
            Crea una sala, comparte el código y vean YouTube o Google Drive sincronizados mientras charlan. Como en el
            mismo sofá, aunque estén lejos.
          </p>

          <div className="entry">
            <label className="field">
              <span>¿Cómo te llamas?</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder="Invitado"
                autoComplete="nickname"
              />
            </label>

            <button className="btn primary big" onClick={() => onJoin(randomCode(), who())}>
              Crear una sala
              <IconArrow />
            </button>

            <div className="or">o entra con un código</div>

            <form
              className="join-row"
              onSubmit={(e) => {
                e.preventDefault();
                join();
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
              <button className="btn ghost big" disabled={cleanCode.length < 4}>
                Entrar
              </button>
            </form>

            {lastRoom && (
              <button className="rejoin" onClick={() => onJoin(lastRoom, who())}>
                <IconReturn />
                Volver a tu última sala
                <b>{lastRoom}</b>
              </button>
            )}
          </div>
        </section>

        <SyncScene />
      </main>

      <footer className="landing-foot">
        <span>Sin cuentas</span>
        <span>En cualquier navegador</span>
        <span>Se instala como app</span>
      </footer>
    </div>
  );
}

/** Two screens in two cities, one playhead: the product's promise, shown. */
function SyncScene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="screen laptop">
        <div className="screen-bar">
          <i />
          <i />
          <i />
          <span>Madrid · 04:12</span>
        </div>
        <SceneVideo />
        <SceneTransport time="12:48" />
      </div>

      <div className="screen phone">
        <div className="phone-notch" />
        <span className="phone-city">Bogotá · 21:12</span>
        <SceneVideo />
        <SceneTransport time="12:48" />
        <div className="phone-chat">
          <p className="them">¿Le damos play? 🍿</p>
          <p className="me">¡Dale! Ya está 💛</p>
        </div>
      </div>

      <div className="scene-sync">
        <span className="sync-dots">
          <i />
          <i />
          <i />
        </span>
        En sincronía
      </div>
    </div>
  );
}

function SceneVideo() {
  return (
    <div className="scene-video">
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2150" />
            <stop offset="0.55" stopColor="#c2566b" />
            <stop offset="1" stopColor="#ffb38a" />
          </linearGradient>
        </defs>
        <rect width="160" height="90" fill="url(#sky)" />
        <circle className="sun" cx="104" cy="58" r="15" fill="#ffe0b8" />
        <path d="M0 64 Q30 50 58 60 T118 58 T160 56 V90 H0Z" fill="#6b2c4c" />
        <path d="M0 74 Q40 62 80 72 T160 68 V90 H0Z" fill="#3b1a33" />
        <path d="M0 84 Q50 76 96 83 T160 80 V90 H0Z" fill="#1d0f1c" />
      </svg>
    </div>
  );
}

function SceneTransport({ time }: { time: string }) {
  return (
    <div className="scene-transport">
      <span className="scene-play">
        <IconPause size={9} />
      </span>
      <span className="scene-track">
        <i />
      </span>
      <span className="scene-time">{time}</span>
    </div>
  );
}
