import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';
import mkcertRaw from 'vite-plugin-mkcert';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const mkcert = mkcertRaw as unknown as typeof mkcertRaw.default;

export default defineConfig({
  base: '/',
  mode: 'production',
  plugins: [react(), mkcert()],
  envPrefix: ['VITE_', 'frontend'],
  resolve: {
    conditions: defaultClientConditions.concat('monorepo'),
  },
  build: {
    target: 'es2022',
    assetsDir: '',
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: {
        index: 'index.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
