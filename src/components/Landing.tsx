import { useState } from 'react';
import { useI18n } from '../i18n';
import { randomCode } from '../lib/util';
import { IconArrow, IconPause, IconReturn, Logo } from './icons';
import LangSwitch from './LangSwitch';

type Props = {
  initialName: string;
  lastRoom: string;
  onJoin(code: string, name: string): void;
};

export default function Landing({ initialName, lastRoom, onJoin }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');
  const cleanCode = code.replace(/[^A-Z0-9]/g, '');
  const who = () => name.trim() || t.guest;

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
        <LangSwitch className="landing-lang" />
      </header>

      <main className="landing-main">
        <section className="landing-copy">
          <h1>
            {t.landing.headline}
            <br />
            <span>{t.landing.headlineAccent}</span>
          </h1>
          <p className="sub">{t.landing.sub}</p>

          <div className="entry">
            <label className="field">
              <span>{t.landing.nameLabel}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder={t.guest}
                autoComplete="nickname"
              />
            </label>

            <button className="btn primary big" onClick={() => onJoin(randomCode(), who())}>
              {t.landing.create}
              <IconArrow />
            </button>

            <div className="or">{t.landing.or}</div>

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
                placeholder={t.landing.codePlaceholder}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-label={t.landing.codeLabel}
              />
              <button className="btn ghost big" disabled={cleanCode.length < 4}>
                {t.landing.join}
              </button>
            </form>

            {lastRoom && (
              <button className="rejoin" onClick={() => onJoin(lastRoom, who())}>
                <IconReturn />
                {t.landing.rejoin}
                <b>{lastRoom}</b>
              </button>
            )}
          </div>
        </section>

        <SyncScene />
      </main>

      <footer className="landing-foot">
        <span>{t.landing.footAccounts}</span>
        <span>{t.landing.footBrowsers}</span>
        <span>{t.landing.footInstall}</span>
      </footer>
    </div>
  );
}

/** Two screens in two cities, one playhead: the product's promise, shown. */
function SyncScene() {
  const { t } = useI18n();
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
          <p className="them">{t.landing.sceneThem}</p>
          <p className="me">{t.landing.sceneMe}</p>
        </div>
      </div>

      <div className="scene-sync">
        <span className="sync-dots">
          <i />
          <i />
          <i />
        </span>
        {t.landing.sceneSync}
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
