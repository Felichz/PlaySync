import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import Room from './components/Room';
import { getLS, setLS } from './lib/util';

function parseHash(): string | null {
  const m = window.location.hash.match(/#\/r\/([A-Za-z0-9]{4,12})/);
  return m ? m[1].toUpperCase() : null;
}

export default function App() {
  const [route, setRoute] = useState<string | null>(parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route) {
    return <Room key={route} code={route} onLeave={() => (window.location.hash = '')} />;
  }

  return (
    <Landing
      initialName={getLS('playsync.name')}
      lastRoom={getLS('playsync.lastRoom')}
      onJoin={(code, name) => {
        setLS('playsync.name', name);
        setLS('playsync.lastRoom', code);
        window.location.hash = `#/r/${code}`;
      }}
    />
  );
}
