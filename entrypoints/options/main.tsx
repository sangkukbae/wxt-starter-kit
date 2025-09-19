import React from 'react';
import { createRoot } from 'react-dom/client';

import '@assets/styles/globals.css';
import { OptionsApp } from '@components/features/OptionsApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Options root element not found');
}

createRoot(container).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);
