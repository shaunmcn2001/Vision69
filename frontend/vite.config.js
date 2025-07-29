import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// See https://vitejs.dev/config/ for details
// This configuration enables React support. If you need to expose additional
// environment variables to the client, prefix them with `VITE_` when
// defining them in your `.env` file. For example, the map uses
// `VITE_MAPBOX_TOKEN` to authenticate with the Mapbox API.

export default defineConfig({
  plugins: [react()],
});