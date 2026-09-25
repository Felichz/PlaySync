import { useState } from 'react';
import type { Participant } from '../../shared/protocol';
import { colorFor } from '../lib/util';
import { IconSignal } from './icons';

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
            <span className="sig" style={{ ['--sigc' as string]: colorFor(p.name), color: colorFor(p.name) }}>
              <IconSignal level={3} />
            </span>
            <span className="people-name">
              {p.name} {p.id === meId && <b>(tú)</b>}
            </span>
          </li>
        ))}
        {participants.length <= 1 && (
          <p className="hint">Comparte la frecuencia de la sala para que se una más gente.</p>
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
        <button className="key primary" disabled={!draft.trim()}>
          Guardar
        </button>
      </form>
    </div>
  );
}
