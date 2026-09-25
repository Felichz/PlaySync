// Smoke test for the WS protocol against a server running on localhost.
// Usage: npm start (in another terminal) && npm run smoke
import WebSocket from 'ws';

const URL = process.env.SMOKE_URL ?? 'ws://localhost:3001/ws';
const ROOM = process.env.SMOKE_ROOM ?? 'SMOKE01';

function client(label) {
  const ws = new WebSocket(URL);
  const msgs = [];
  const waiters = [];
  // Capture open/error right away: the event may fire before open() is called.
  const opened = new Promise((res, rej) => {
    ws.once('open', res);
    ws.once('error', rej);
  });
  ws.on('message', (d) => {
    const m = JSON.parse(String(d));
    msgs.push(m);
    for (let i = waiters.length - 1; i >= 0; i--) {
      const w = waiters[i];
      if (w.pred(m)) {
        waiters.splice(i, 1);
        clearTimeout(w.timer);
        w.resolve(m);
      }
    }
  });
  const wait = (pred, label2, ms = 4000) =>
    new Promise((resolve, reject) => {
      const found = msgs.find(pred);
      if (found) return resolve(found);
      const timer = setTimeout(() => reject(new Error(`[${label}] timeout waiting for ${label2}`)), ms);
      waiters.push({ pred, resolve, timer });
    });
  const open = () => opened;
  const send = (obj) => ws.send(JSON.stringify(obj));
  return { ws, msgs, wait, open, send, label };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;

function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures++;
}

const a = client('Ana');
const b = client('Beto');

try {
  await a.open();
  a.send({ type: 'join', room: ROOM, name: 'Ana' });
  const wA = await a.wait((m) => m.type === 'welcome', 'welcome A');
  check('welcome carries own id', !!wA.you);

  await b.open();
  b.send({ type: 'join', room: ROOM, name: 'Beto' });
  await b.wait((m) => m.type === 'welcome', 'welcome B');
  const sysJoin = await a.wait(
    (m) => m.type === 'chat' && m.message.system && m.message.text.includes('Beto'),
    'join notice',
  );
  check('system announces the join', !!sysJoin);

  a.send({ type: 'chat', text: 'hola mundo' });
  const chatB = await b.wait((m) => m.type === 'chat' && m.message.text === 'hola mundo', 'chat');
  check('chat propagates', chatB.message.name === 'Ana');

  a.send({
    type: 'chat',
    text: '',
    media: { kind: 'gif', url: 'https://media.giphy.com/media/test/giphy.gif', width: 200, height: 180 },
  });
  const chatM = await b.wait((m) => m.type === 'chat' && m.message.media, 'chat media');
  check('gif media propagates', chatM.message.media?.kind === 'gif' && chatM.message.media.url.includes('giphy.com'));

  b.msgs.length = 0;
  a.send({ type: 'chat', text: '', media: { kind: 'gif', url: 'http://evil.example/x.gif' } });
  await sleep(400);
  check('insecure media rejected', !b.msgs.some((m) => m.type === 'chat' && m.message.media));
  b.msgs.length = 0;

  a.send({ type: 'load', videoId: 'dQw4w9WgXcQ', title: 'Test video' });
  const stLoad = await b.wait((m) => m.type === 'state' && m.state.videoId === 'dQw4w9WgXcQ', 'load');
  check('load publishes state', stLoad.state.isPlaying === false && stLoad.state.position === 0);

  a.send({ type: 'play' });
  await b.wait((m) => m.type === 'state' && m.state.isPlaying === true, 'play');
  check('play propagates', true);

  a.send({ type: 'seek', position: 42 });
  await b.wait((m) => m.type === 'state' && m.state.position === 42, 'seek');
  check('seek propagates', true);

  const pingT0 = Date.now();
  a.send({ type: 'ping', t0: pingT0 });
  const pong = await a.wait((m) => m.type === 'pong' && m.t0 === pingT0, 'pong');
  check('ping/pong NTP-lite', typeof pong.t1 === 'number' && pong.t1 >= pingT0);

  await sleep(1500);
  b.msgs.length = 0; // drop stale states: we want the fresh one from sync-request
  b.send({ type: 'sync-request' });
  const stSync = await b.wait((m) => m.type === 'state', 'sync-request');
  const eff = stSync.state.position + (stSync.state.serverTime - stSync.state.lastUpdatedAt) / 1000;
  check('effective position extrapolates', eff > 43 && eff < 46, `eff=${eff.toFixed(2)}s`);

  a.send({ type: 'queue-add', videoId: 'M7lc1UVf-VE', title: 'Next up' });
  const stQ = await b.wait((m) => m.type === 'state' && m.state.queue.length === 1, 'queue-add');
  check('queue receives the item', stQ.state.queue[0].videoId === 'M7lc1UVf-VE');

  a.send({ type: 'ended' });
  const stNext = await b.wait((m) => m.type === 'state' && m.state.videoId === 'M7lc1UVf-VE', 'queue advance');
  check('ended advances the queue', stNext.state.isPlaying === true && stNext.state.queue.length === 0);

  b.ws.close();
  a.ws.close();
  await sleep(200);
} catch (err) {
  console.error('ERROR', err.message);
  failures++;
  process.exitCode = 1;
} finally {
  a.ws.close();
  b.ws.close();
}
console.log(failures === 0 ? '\nAll good ✅' : `\n${failures} checks failed ❌`);
process.exitCode = failures === 0 ? 0 : 1;
