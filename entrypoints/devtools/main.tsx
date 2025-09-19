import React from 'react';
import { createRoot } from 'react-dom/client';

import '@assets/styles/globals.css';
import { DevtoolsApp } from '@components/features/DevtoolsApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('DevTools root element not found');
}

createRoot(container).render(
  <React.StrictMode>
    <DevtoolsApp />
  </React.StrictMode>,
);
