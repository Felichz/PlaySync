import { registerSW } from 'virtual:pwa-register';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
