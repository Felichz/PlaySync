// Spanish catalog: the original wording of the app, kept as it was.
import type { ReactNode } from 'react';
import type { SystemEvent } from '../../shared/protocol';
import type { Messages } from './en';

const plural = new Intl.PluralRules('es');
const count = (n: number, one: string, other: string) => (plural.select(n) === 'one' ? one : other);

export const es: Messages = {
  meta: {
    title: 'PlaySync — Mira YouTube juntos',
    roomTitle: (code: string) => `Sala ${code} · PlaySync`,
  },
  language: 'Idioma',
  guest: 'Invitado',

  landing: {
    headline: 'Mismo video.',
    headlineAccent: 'Mismo segundo.',
    sub: 'Crea una sala, comparte el código y vean YouTube o Google Drive sincronizados mientras charlan. Como en el mismo sofá, aunque estén lejos.',
    nameLabel: '¿Cómo te llamas?',
    create: 'Crear una sala',
    or: 'o entra con un código',
    codePlaceholder: 'CÓDIGO',
    codeLabel: 'Código de sala',
    join: 'Entrar',
    rejoin: 'Volver a tu última sala',
    footAccounts: 'Sin cuentas',
    footBrowsers: 'En cualquier navegador',
    footInstall: 'Se instala como app',
    sceneThem: '¿Le damos play? 🍿',
    sceneMe: '¡Dale! Ya está 💛',
    sceneSync: 'En sincronía',
  },

  room: {
    status: { connecting: 'Conectando…', online: 'Conectado', offline: 'Reconectando…' },
    leave: 'Salir de la sala',
    ticketTitle: (status: string) => `${status} · copiar código`,
    ticketStub: 'Sala',
    live: 'Viendo juntos',
    paused: 'En pausa',
    invite: 'Invitar',
    shareText: (code: string) => `Únete a mi sala: ${code}`,
    linkCopied: 'Enlace copiado. Pásaselo a quien quieras.',
    codeCopied: (code: string) => `Código ${code} copiado`,
    addedToQueue: 'Añadido a la cola',
    panels: 'Paneles de la sala',
    tabs: { chat: 'Chat', queue: 'Cola', people: 'Gente' },
    request: (name: ReactNode): ReactNode[] => [name, ' pide el control del video'],
    giveControl: 'Dar control',
    dismiss: 'Ignorar',
    couch: (n: number) => (n === 1 ? 'Solo tú por ahora' : `${n} en la sala`),
    host: 'Anfitrión',
  },

  errors: {
    'bad-room': 'Código de sala inválido',
    flood: 'Vas muy rápido, espera un momento',
    forbidden: 'Necesitas control para hacer eso. Pídeselo al anfitrión.',
    requested: 'Le avisamos al anfitrión que quieres el control',
    unknown: 'Algo salió mal. Intenta de nuevo.',
  },

  system: (e: SystemEvent): string => {
    switch (e.kind) {
      case 'joined':
        return `${e.name} se unió`;
      case 'left':
        return `${e.name} salió`;
      case 'granted':
        return `${e.by} le dio el control a ${e.to}`;
      case 'revoked':
        return `${e.by} le quitó el control a ${e.to}`;
      case 'control-open':
        return 'Ahora todos pueden controlar el video';
      case 'control-closed':
        return 'Solo el anfitrión y quien tenga control manejan el video';
      case 'loaded':
        return `${e.by} puso ${e.title ?? 'un video'}`;
      case 'loaded-file':
        return e.title ? `${e.by} puso un archivo: ${e.title}` : `${e.by} puso un archivo`;
      case 'next':
        return `Siguiente: ${e.title ?? 'archivo'}`;
      case 'added':
        return `${e.by} añadió ${e.title ?? 'un archivo'}`;
      case 'jumped':
        return `${e.by} saltó a ${e.title ?? 'archivo'}`;
      case 'new-host':
        return `${e.name} ahora es anfitrión de la sala`;
    }
  },

  chat: {
    log: 'Chat de la sala',
    emptyTitle: 'Rompe el hielo',
    emptyBody: 'Lo que escribas aquí lo ve todo el mundo en la sala, en vivo.',
    moreNotices: (n: number) => count(n, `+${n} aviso`, `+${n} avisos`),
    pickerToggle: 'Emojis, GIFs y stickers',
    placeholder: 'Escribe un mensaje…',
    message: 'Mensaje',
    send: 'Enviar',
    closePicker: 'Cerrar panel',
    tabs: { emoji: 'Emojis', gif: 'GIFs', sticker: 'Stickers' },
    recent: 'Recientes',
    emojiCats: {
      faces: 'Caras',
      gestures: 'Gestos',
      hearts: 'Corazones',
      animals: 'Animales',
      food: 'Comida',
      activities: 'Actividades',
      objects: 'Objetos',
      symbols: 'Símbolos',
      flags: 'Banderas',
    },
    searchGifs: 'Buscar GIFs',
    searchStickers: 'Buscar stickers',
    searchGifsPlaceholder: 'Buscar GIFs…',
    searchStickersPlaceholder: 'Buscar stickers…',
    giphyMissing:
      'Los GIFs y stickers necesitan una clave gratuita de Giphy. Crea una en developers.giphy.com y configúrala como GIPHY_API_KEY en el servidor.',
    giphyFailed: 'No se pudieron cargar. Intenta de nuevo en un momento.',
    sendAgain: 'Enviar de nuevo',
    results: 'Resultados',
    trending: 'Tendencias',
    noResults: 'Sin resultados. Prueba con otra búsqueda.',
    searching: 'Buscando…',
  },

  people: {
    everyoneControls: 'Todos controlan el video',
    openOn: 'Cualquiera puede pausar, adelantar y cambiar la cola.',
    openOff: 'Solo tú y quienes marques pueden pausar, adelantar y cambiar la cola.',
    youHaveControl: 'Tienes el control del video.',
    justWatching: 'Solo miras',
    hostDrives: (name: string) => `${name} maneja el video.`,
    hostDrivesAnon: 'El anfitrión maneja el video.',
    askControl: 'Pedir el control',
    inRoom: 'En la sala',
    you: '(tú)',
    roleHost: 'Anfitrión',
    roleControl: 'Con control',
    roleViewer: 'Mirando',
    controlFor: (name: string) => `Control para ${name}`,
    connected: 'Conectado',
    invite: (code: ReactNode): ReactNode[] => [
      'Esto se disfruta más en compañía. Comparte el código ',
      code,
      ' o manda el enlace directo.',
    ],
    inviteSomeone: 'Invitar a alguien',
    renameLabel: 'Cómo te ven los demás',
    yourName: 'Tu nombre',
    save: 'Guardar',
  },

  player: {
    embedError: 'Este video no permite reproducción embebida o no existe. Prueba con otro.',
    driveError: 'No se pudo cargar el archivo de Drive (¿sigue compartido como público?).',
    loading: 'Cargando',
    preparingFile: 'Preparando el archivo…',
    theVideo: 'el video',
    embedBlocked: (title?: string) =>
      `${title ? `«${title}»` : 'Ese video'} no se puede ver fuera de YouTube. Elige otro.`,
    ended: 'Terminó el video',
    waiting: 'Esperando el primer video',
    idleBody: 'Quien tiene el control está eligiendo qué ver. Aparecerá aquí para todos a la vez.',
    play: 'Reproducir',
    pause: 'Pausar',
    locked: 'Solo quien tiene el control puede reproducir',
    cueHint: 'Empieza para todos a la vez',
    cuePassive: 'Listo. Empieza cuando quien tiene el control le dé play.',
    blockedTitle: 'La sala ya está viendo',
    blockedHint: 'Toca para unirte con sonido',
    you: 'Tú',
    progress: 'Progreso del video',
    unmute: 'Activar sonido',
    mute: 'Silenciar',
    volume: 'Volumen',
    fullscreen: 'Pantalla completa',
  },

  queue: {
    driveErrors: {
      MEDIA_NOT_FOUND: 'No se pudo acceder al archivo. ¿Está compartido como "Cualquiera con el enlace"?',
      DRIVE_QUOTA: 'Google limitó las descargas de este archivo por hoy (demasiado tráfico). Prueba mañana.',
      FILE_TOO_LARGE: 'El archivo supera el límite de tamaño del servidor.',
      MEDIA_UNREACHABLE: 'No se pudo contactar a Google Drive. Intenta de nuevo.',
    },
    tooLarge: (mb: number) => `El archivo pesa más de ${mb} MB, el límite del servidor.`,
    driveGeneric: 'No se pudo resolver el archivo de Drive.',
    badLink: 'Pega un enlace de YouTube o de Google Drive (público).',
    locked: 'Solo quien tiene el control puede cambiar la cola.',
    ask: 'Pedir',
    placeholder: 'Enlace de YouTube o Drive',
    inputLabel: 'Enlace de YouTube o Google Drive',
    adding: 'Añadiendo',
    add: 'Añadir',
    upNext: 'A continuación',
    emptyTitle: 'La cola está vacía',
    emptyBody:
      'Añade videos de YouTube o archivos públicos de Google Drive (hasta 500 MB). Se reproducen solos, uno tras otro.',
    addedBy: (name: string) => `Añadido por ${name}`,
    playNow: 'Reproducir ahora',
    remove: 'Quitar de la cola',
    removeShort: 'Quitar',
  },

  search: {
    youtubeVideo: 'Video de YouTube',
    finished: 'Terminó',
    watchAgain: 'Volver a ver',
    heading: '¿Qué vemos?',
    headingAfter: '¿Y ahora qué vemos?',
    placeholder: 'Busca en YouTube o pega un enlace',
    label: 'Buscar en YouTube',
    clear: 'Borrar búsqueda',
    recent: 'Búsquedas recientes',
    searching: 'Buscando',
    error: 'No pudimos buscar en YouTube ahora mismo. Prueba de nuevo o pega un enlace.',
    empty: 'Nada por aquí. Prueba con otras palabras.',
    addToQueue: 'Añadir a la cola',
    addToQueueNamed: (title: string) => `Añadir a la cola: ${title}`,
    queued: 'En cola',
    queue: 'Cola',
    hint: 'Busca lo que quieran ver: se reproduce para todos a la vez.',
  },

  nameModal: {
    title: '¿Cómo te llamas?',
    hereNone: 'Así te verán quienes entren a la sala.',
    hereOne: (a: string) => `${a} ya está aquí. Así te verá en la sala.`,
    hereTwo: (a: string, b: string) => `${a} y ${b} ya están aquí.`,
    hereMany: (a: string, b: string, more: number) => `${a}, ${b} y ${more} más ya están aquí.`,
    yourName: 'Tu nombre',
    enter: 'Entrar a la sala',
    skip: 'Seguir como Invitado',
  },
};
