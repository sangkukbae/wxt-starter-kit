import React from 'react';
import { createRoot } from 'react-dom/client';

import '@assets/styles/globals.css';
import { SidePanelApp } from '@components/features/SidePanelApp';

const container =
  document.getElementById('root') ?? document.body.appendChild(document.createElement('div'));
container.id = container.id || 'root';

createRoot(container).render(
  <React.StrictMode>
    <SidePanelApp />
  </React.StrictMode>,
);
