import { useEffect, useState } from 'react';
import type { Participant, Role } from '../../shared/protocol';
import { Rich, useI18n } from '../i18n';
import { avatarColor, initials } from '../lib/util';
import { IconCrown, IconHand, IconPencil, IconShare } from './icons';
import LangSwitch from './LangSwitch';
import ThemeSwitch from './ThemeSwitch';

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
  const { t } = useI18n();
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
              <strong>{t.people.everyoneControls}</strong>
              <span>{openControl ? t.people.openOn : t.people.openOff}</span>
            </div>
            <Switch checked={openControl} onChange={onSetOpenControl} label={t.people.everyoneControls} />
          </div>
        </div>
      ) : (
        <div className={`perm-card ${myRole === 'viewer' && !openControl ? 'viewer' : ''}`}>
          {openControl || myRole === 'control' ? (
            <p className="perm-status">
              <span className="here" /> {t.people.youHaveControl}
            </p>
          ) : (
            <div className="perm-row">
              <div className="perm-text">
                <strong>{t.people.justWatching}</strong>
                <span>{hostName ? t.people.hostDrives(hostName) : t.people.hostDrivesAnon}</span>
              </div>
              <button className="btn soft small" onClick={onRequestControl}>
                <IconHand size={14} />
                {t.people.askControl}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="panel-head">
        <h2>{t.people.inRoom}</h2>
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
                  <span className="crown" title={t.people.roleHost}>
                    <IconCrown size={10} />
                  </span>
                )}
              </span>
              <span className="people-info">
                <span className="people-name">
                  {p.name}
                  {mine && <span className="you"> {t.people.you}</span>}
                </span>
                <span className="people-role">
                  {p.role === 'host'
                    ? t.people.roleHost
                    : p.role === 'control' || openControl
                      ? t.people.roleControl
                      : t.people.roleViewer}
                </span>
              </span>
              {isHost && p.role !== 'host' ? (
                <Switch
                  checked={p.role === 'control' || openControl}
                  disabled={openControl}
                  onChange={(on) => onGrant(p.id, on)}
                  label={t.people.controlFor(p.name)}
                />
              ) : (
                <span className="here" title={t.people.connected} />
              )}
            </li>
          );
        })}
      </ul>

      {participants.length <= 1 && (
        <div className="invite-card">
          <p>
            <Rich parts={t.people.invite(<b>{code}</b>)} />
          </p>
          <button className="btn soft" onClick={onInvite}>
            <IconShare size={14} />
            {t.people.inviteSomeone}
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
          <span>{t.people.renameLabel}</span>
          <div className="input-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={24}
              placeholder={t.people.yourName}
              aria-label={t.people.yourName}
            />
            <button className="btn primary" disabled={!dirty}>
              <IconPencil />
              {t.people.save}
            </button>
          </div>
        </label>
        <div className="lang-row">
          <span className="pref">
            <span>{t.language}</span>
            <LangSwitch />
          </span>
          <span className="pref">
            <span>{t.theme.label}</span>
            <ThemeSwitch />
          </span>
        </div>
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
