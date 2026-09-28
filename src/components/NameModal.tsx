import { useEffect, useRef, useState } from 'react';
import type { Participant } from '../../shared/protocol';
import { useI18n } from '../i18n';
import type { Messages } from '../i18n/en';
import { avatarColor, initials } from '../lib/util';
import { IconArrow } from './icons';

type Props = {
  others: Participant[];
  onSave(name: string): void;
  onSkip(): void;
};

function whoIsHere(others: Participant[], m: Messages['nameModal']): string {
  const names = others.map((p) => p.name);
  if (names.length === 0) return m.hereNone;
  if (names.length === 1) return m.hereOne(names[0]);
  if (names.length === 2) return m.hereTwo(names[0], names[1]);
  return m.hereMany(names[0], names[1], names.length - 2);
}

/** First thing a nameless guest sees in a room: pick a name without hunting for the setting. */
export default function NameModal({ others, onSave, onSkip }: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const clean = draft.trim();
  const preview = clean || '?';

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);

  return (
    <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && onSkip()}>
      <form
        className="modal name-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-modal-title"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) onSave(clean);
        }}
      >
        <div className="name-couch" aria-hidden="true">
          {others.slice(0, 3).map((p) => (
            <span key={p.id} className="avatar lg" style={{ background: avatarColor(p.name) }}>
              {initials(p.name)}
            </span>
          ))}
          <span
            className={`avatar lg me ${clean ? '' : 'empty'}`}
            style={clean ? { background: avatarColor(clean) } : undefined}
          >
            {clean ? initials(preview) : '?'}
          </span>
        </div>

        <h2 id="name-modal-title">{t.nameModal.title}</h2>
        <p>{whoIsHere(others, t.nameModal)}</p>

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={24}
          placeholder={t.nameModal.yourName}
          aria-label={t.nameModal.yourName}
          autoComplete="nickname"
          enterKeyHint="go"
        />

        <button className="btn primary big" disabled={!clean}>
          {t.nameModal.enter}
          <IconArrow size={16} />
        </button>
        <button type="button" className="modal-skip" onClick={onSkip}>
          {t.nameModal.skip}
        </button>
      </form>
    </div>
  );
}
