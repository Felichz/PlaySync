import { useState } from 'react';
import type { Participant } from '../../shared/protocol';
import { colorFor } from '../lib/util';

type Props = {
  participants: Participant[];
  meId: string;
  name: string;
  onRename(name: string): void;
};

export default function PeoplePanel({ participants, meId, name, onRename }: Props) {
  const [draft, setDraft] = useState(name);

  return (
    <div className="people">
      <ul className="people-list">
        {participants.map((p) => (
          <li key={p.id} className={p.id === meId ? 'me' : ''}>
            <span className="dot" style={{ background: colorFor(p.name) }} aria-hidden="true" />
            <span className="people-name">
              {p.name}
              {p.id === meId ? ' (tú)' : ''}
            </span>
          </li>
        ))}
        {participants.length <= 1 && (
          <p className="hint">Comparte el código de la sala para que se una más gente.</p>
        )}
      </ul>

      <form
        className="rename-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) onRename(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={24}
          placeholder="Tu nombre"
          aria-label="Tu nombre"
        />
        <button className="btn primary" disabled={!draft.trim()}>
          Guardar
        </button>
      </form>
    </div>
  );
}
