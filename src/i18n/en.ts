// English catalog. It is the source shape: `es.ts` must match it key for key (see Messages).
import type { ReactNode } from 'react';
import type { SystemEvent } from '../../shared/protocol';

const plural = new Intl.PluralRules('en');
const count = (n: number, one: string, other: string) => (plural.select(n) === 'one' ? one : other);

export const en = {
  meta: {
    title: 'PlaySync · Watch YouTube together',
    roomTitle: (code: string) => `Room ${code} · PlaySync`,
  },
  language: 'Language',
  theme: { label: 'Theme', light: 'Light', dark: 'Dark' },
  guest: 'Guest',

  landing: {
    headline: 'Same video.',
    headlineAccent: 'Same second.',
    sub: 'Create a room, share the code, and watch YouTube or Google Drive in sync while you chat. Like sitting on the same couch, even when you are far apart.',
    nameLabel: 'What’s your name?',
    create: 'Create a room',
    or: 'or join with a code',
    codePlaceholder: 'CODE',
    codeLabel: 'Room code',
    join: 'Join',
    rejoin: 'Back to your last room',
    footAccounts: 'No accounts',
    footBrowsers: 'Works in any browser',
    footInstall: 'Installs as an app',
    sceneThem: 'Ready to press play? 🍿',
    sceneMe: 'Yes! Playing now 💛',
    sceneSync: 'In sync',
  },

  room: {
    status: { connecting: 'Connecting…', online: 'Connected', offline: 'Reconnecting…' },
    leave: 'Leave the room',
    ticketTitle: (status: string) => `${status} · copy code`,
    ticketStub: 'Room',
    live: 'Watching together',
    paused: 'Paused',
    invite: 'Invite',
    shareText: (code: string) => `Join my room: ${code}`,
    linkCopied: 'Link copied. Send it to whoever you like.',
    codeCopied: (code: string) => `Code ${code} copied`,
    addedToQueue: 'Added to the queue',
    panels: 'Room panels',
    tabs: { chat: 'Chat', queue: 'Queue', people: 'People' },
    request: (name: ReactNode): ReactNode[] => [name, ' is asking for control of the video'],
    giveControl: 'Give control',
    dismiss: 'Dismiss',
    couch: (n: number) => (n === 1 ? 'Just you for now' : `${n} in the room`),
    host: 'Host',
  },

  errors: {
    'bad-room': 'That room code isn’t valid',
    flood: 'You’re going a bit fast. Wait a moment.',
    forbidden: 'You need control to do that. Ask the host.',
    requested: 'We let the host know you’d like control',
    unknown: 'Something went wrong. Try again.',
  },

  system: (e: SystemEvent): string => {
    switch (e.kind) {
      case 'joined':
        return `${e.name} joined`;
      case 'left':
        return `${e.name} left`;
      case 'granted':
        return `${e.by} gave control to ${e.to}`;
      case 'revoked':
        return `${e.by} took control away from ${e.to}`;
      case 'control-open':
        return 'Everyone can control the video now';
      case 'control-closed':
        return 'Only the host and people with control can drive the video';
      case 'loaded':
        return e.title ? `${e.by} put on ${e.title}` : `${e.by} put on a video`;
      case 'loaded-file':
        return e.title ? `${e.by} put on a file: ${e.title}` : `${e.by} put on a file`;
      case 'next':
        return `Up next: ${e.title ?? 'a file'}`;
      case 'added':
        return `${e.by} added ${e.title ?? 'a file'}`;
      case 'jumped':
        return `${e.by} skipped to ${e.title ?? 'a file'}`;
      case 'new-host':
        return `${e.name} is the room’s host now`;
    }
  },

  chat: {
    log: 'Room chat',
    emptyTitle: 'Break the ice',
    emptyBody: 'Everyone in the room sees what you write here, as you send it.',
    moreNotices: (n: number) => count(n, `+${n} notice`, `+${n} notices`),
    pickerToggle: 'Emoji, GIFs and stickers',
    placeholder: 'Write a message…',
    message: 'Message',
    send: 'Send',
    closePicker: 'Close panel',
    tabs: { emoji: 'Emoji', gif: 'GIFs', sticker: 'Stickers' },
    recent: 'Recent',
    emojiCats: {
      faces: 'Faces',
      gestures: 'Gestures',
      hearts: 'Hearts',
      animals: 'Animals',
      food: 'Food',
      activities: 'Activities',
      objects: 'Objects',
      symbols: 'Symbols',
      flags: 'Flags',
    },
    searchGifs: 'Search GIFs',
    searchStickers: 'Search stickers',
    searchGifsPlaceholder: 'Search GIFs…',
    searchStickersPlaceholder: 'Search stickers…',
    giphyMissing:
      'GIFs and stickers need a free Giphy key. Create one at developers.giphy.com and set it as GIPHY_API_KEY on the server.',
    giphyFailed: 'Couldn’t load them. Try again in a moment.',
    sendAgain: 'Send again',
    results: 'Results',
    trending: 'Trending',
    noResults: 'No results. Try another search.',
    searching: 'Searching…',
  },

  people: {
    everyoneControls: 'Everyone controls the video',
    openOn: 'Anyone can pause, skip ahead and change the queue.',
    openOff: 'Only you and the people you pick can pause, skip ahead and change the queue.',
    youHaveControl: 'You have control of the video.',
    justWatching: 'Just watching',
    hostDrives: (name: string) => `${name} controls the video.`,
    hostDrivesAnon: 'The host controls the video.',
    askControl: 'Ask for control',
    inRoom: 'In the room',
    you: '(you)',
    roleHost: 'Host',
    roleControl: 'Has control',
    roleViewer: 'Watching',
    controlFor: (name: string) => `Control for ${name}`,
    connected: 'Connected',
    invite: (code: ReactNode): ReactNode[] => [
      'It’s nicer with company. Share the code ',
      code,
      ' or send the direct link.',
    ],
    inviteSomeone: 'Invite someone',
    renameLabel: 'How others see you',
    yourName: 'Your name',
    save: 'Save',
  },

  player: {
    embedError: 'This video can’t be played here, or it doesn’t exist. Try another one.',
    driveError: 'Couldn’t load the Drive file. Is it still shared publicly?',
    loading: 'Loading',
    preparingFile: 'Getting the file ready…',
    theVideo: 'the video',
    embedBlocked: (title?: string) =>
      title
        ? `“${title}” can’t be watched outside YouTube. Pick another one.`
        : 'That video can’t be watched outside YouTube. Pick another one.',
    ended: 'The video ended',
    waiting: 'Waiting for the first video',
    idleBody: 'Whoever has control is picking what to watch. It will show up here for everyone at once.',
    play: 'Play',
    pause: 'Pause',
    locked: 'Only people with control can play',
    cueHint: 'Starts for everyone at once',
    cuePassive: 'Ready. It starts when whoever has control presses play.',
    blockedTitle: 'The room is already watching',
    blockedHint: 'Tap to join with sound',
    you: 'You',
    progress: 'Video progress',
    unmute: 'Unmute',
    mute: 'Mute',
    volume: 'Volume',
    fullscreen: 'Full screen',
  },

  queue: {
    driveErrors: {
      MEDIA_NOT_FOUND: 'Couldn’t open the file. Is it shared as “Anyone with the link”?',
      DRIVE_QUOTA: 'Google has paused downloads of this file for today (too much traffic). Try again tomorrow.',
      FILE_TOO_LARGE: 'The file is over the server’s size limit.',
      MEDIA_UNREACHABLE: 'Couldn’t reach Google Drive. Try again.',
    } as Record<string, string>,
    tooLarge: (mb: number) => `The file is over ${mb} MB, the server’s limit.`,
    driveGeneric: 'Couldn’t open the Drive file.',
    badLink: 'Paste a YouTube link or a public Google Drive link.',
    locked: 'Only people with control can change the queue.',
    ask: 'Ask',
    placeholder: 'YouTube or Drive link',
    inputLabel: 'YouTube or Google Drive link',
    adding: 'Adding',
    add: 'Add',
    upNext: 'Up next',
    emptyTitle: 'The queue is empty',
    emptyBody: 'Add YouTube videos or public Google Drive files (up to 500 MB). They play on their own, one after another.',
    addedBy: (name: string) => `Added by ${name}`,
    playNow: 'Play now',
    remove: 'Remove from the queue',
    removeShort: 'Remove',
  },

  search: {
    youtubeVideo: 'YouTube video',
    finished: 'Finished',
    watchAgain: 'Watch again',
    heading: 'What should we watch?',
    headingAfter: 'What should we watch now?',
    placeholder: 'Search YouTube or paste a link',
    label: 'Search YouTube',
    clear: 'Clear search',
    recent: 'Recent searches',
    searching: 'Searching',
    error: 'We couldn’t search YouTube just now. Try again or paste a link.',
    empty: 'Nothing here. Try other words.',
    addToQueue: 'Add to the queue',
    addToQueueNamed: (title: string) => `Add to the queue: ${title}`,
    queued: 'Queued',
    queue: 'Queue',
    hint: 'Search for something to watch. It plays for everyone at once.',
  },

  nameModal: {
    title: 'What’s your name?',
    hereNone: 'This is how people in the room will see you.',
    hereOne: (a: string) => `${a} is already here. This is how they’ll see you.`,
    hereTwo: (a: string, b: string) => `${a} and ${b} are already here.`,
    hereMany: (a: string, b: string, more: number) => `${a}, ${b} and ${more} more are already here.`,
    yourName: 'Your name',
    enter: 'Join the room',
    skip: 'Continue as Guest',
  },
};

/** The shape every catalog must match: same keys, same parameters. */
export type Messages = typeof en;
