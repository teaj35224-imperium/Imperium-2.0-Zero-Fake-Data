import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ImperiumProvider } from './context/ImperiumContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ImperiumProvider>
      <App />
    </ImperiumProvider>
  </StrictMode>,
);

