import React, { strict mode } from 'react';
import { create root } from 'react-dom/client';

import 'leaflet/dist/leaflet.css';   //  ←  put this line back
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);