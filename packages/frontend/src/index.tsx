import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/index.js';
import { engine } from './engine/engine.js';
import { initI18next } from './translations/index.js';

const runApp = async () => {
  const rootElement = document.getElementById('root');
  const splashScreen = document.getElementById('splashScreen');
  if (!rootElement || !splashScreen) {
    throw new Error('Root element or splash screen not found');
  }
  await initI18next();
  await engine.boot();

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  splashScreen.remove();
};

await runApp();
