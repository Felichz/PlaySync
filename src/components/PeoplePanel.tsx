import { useEffect, useState } from 'react';
import type { Participant, Role } from '../../shared/protocol';
import { avatarColor, initials } from '../lib/util';
import { IconCrown, IconHand, IconPencil, IconShare } from './icons';

type Props = {
  code: string;
  participants: Participant[];
  meId: string;
  name: string;
  myRole: Role;
  openControl: boolean;
  onRename(name: string): void;
  onInvite(): void;
  onGrant(id: string, control: boolean): void;
  onSetOpenControl(open: boolean): void;
  onRequestControl(): void;
};

export default function PeoplePanel({
  code,
  participants,
  meId,
  name,
  myRole,
  openControl,
  onRename,
  onInvite,
  onGrant,
  onSetOpenControl,
  onRequestControl,
}: Props) {
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  const dirty = draft.trim() !== '' && draft.trim() !== name;
  const isHost = myRole === 'host';
  const hostName = participants.find((p) => p.role === 'host')?.name;

  return (
    <div className="people">
      {isHost ? (
        <div className="perm-card">
          <div className="perm-row">
            <div className="perm-text">
              <strong>Todos controlan el video</strong>
              <span>
                {openControl
                  ? 'Cualquiera puede pausar, adelantar y cambiar la cola.'
                  : 'Solo tú y quienes marques pueden pausar, adelantar y cambiar la cola.'}
              </span>
            </div>
            <Switch checked={openControl} onChange={onSetOpenControl} label="Todos controlan el video" />
          </div>
        </div>
      ) : (
        <div className={`perm-card ${myRole === 'viewer' && !openControl ? 'viewer' : ''}`}>
          {openControl || myRole === 'control' ? (
            <p className="perm-status">
              <span className="here" /> Tienes el control del video.
            </p>
          ) : (
            <div className="perm-row">
              <div className="perm-text">
                <strong>Solo miras</strong>
                <span>{hostName ? `${hostName} maneja el video.` : 'El anfitrión maneja el video.'}</span>
              </div>
              <button className="btn soft small" onClick={onRequestControl}>
                <IconHand size={14} />
                Pedir el control
              </button>
            </div>
          )}
        </div>
      )}

      <div className="panel-head">
        <h2>En la sala</h2>
        <span className="panel-count">{participants.length}</span>
      </div>

      <ul className="people-list">
        {participants.map((p) => {
          const mine = p.id === meId;
          return (
            <li key={p.id} className={mine ? 'me' : ''}>
              <span className="avatar lg" style={{ background: avatarColor(p.name) }}>
                {initials(p.name)}
                {p.role === 'host' && (
                  <span className="crown" title="Anfitrión">
                    <IconCrown size={10} />
                  </span>
                )}
              </span>
              <span className="people-info">
                <span className="people-name">
                  {p.name}
                  {mine && <span className="you"> (tú)</span>}
                </span>
                <span className="people-role">
                  {p.role === 'host'
                    ? 'Anfitrión'
                    : p.role === 'control' || openControl
                      ? 'Con control'
                      : 'Mirando'}
                </span>
              </span>
              {isHost && p.role !== 'host' ? (
                <Switch
                  checked={p.role === 'control' || openControl}
                  disabled={openControl}
                  onChange={(on) => onGrant(p.id, on)}
                  label={`Control para ${p.name}`}
                />
              ) : (
                <span className="here" title="Conectado" />
              )}
            </li>
          );
        })}
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

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange(on: boolean): void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <i />
    </button>
  );
}
