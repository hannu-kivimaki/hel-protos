import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// HDS styles - required for all HDS components
import 'hds-react/index.css';

import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
