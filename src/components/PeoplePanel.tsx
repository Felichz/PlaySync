import { useEffect, useState } from 'react';
import type { Participant } from '../../shared/protocol';
import { avatarColor, initials } from '../lib/util';
import { IconPencil, IconShare } from './icons';

type Props = {
  code: string;
  participants: Participant[];
  meId: string;
  name: string;
  onRename(name: string): void;
  onInvite(): void;
};

export default function PeoplePanel({ code, participants, meId, name, onRename, onInvite }: Props) {
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  const dirty = draft.trim() !== '' && draft.trim() !== name;

  return (
    <div className="people">
      <div className="panel-head">
        <h2>En la sala</h2>
        <span className="panel-count">{participants.length}</span>
      </div>

      <ul className="people-list">
        {participants.map((p) => (
          <li key={p.id} className={p.id === meId ? 'me' : ''}>
            <span className="avatar lg" style={{ background: avatarColor(p.name) }}>
              {initials(p.name)}
            </span>
            <span className="people-name">{p.name}</span>
            {p.id === meId ? <span className="tag">tú</span> : <span className="here" title="Conectado" />}
          </li>
        ))}
      </ul>

      {participants.length <= 1 && (
        <div className="invite-card">
          <p>
            Esto se disfruta más en compañía. Comparte el código <b>{code}</b> o manda el enlace directo.
          </p>
          <button className="btn soft" onClick={onInvite}>
            <IconShare size={14} />
            Invitar a alguien
          </button>
        </div>
      )}

      <form
        className="rename-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) onRename(draft);
        }}
      >
        <label className="field">
          <span>Cómo te ven los demás</span>
          <div className="input-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={24}
              placeholder="Tu nombre"
              aria-label="Tu nombre"
            />
            <button className="btn primary" disabled={!dirty}>
              <IconPencil />
              Guardar
            </button>
          </div>
        </label>
      </form>
    </div>
  );
}
