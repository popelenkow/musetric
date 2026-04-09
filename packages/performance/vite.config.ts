import { defaultClientConditions, defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  base: './',
  plugins: [mkcert()],
  resolve: {
    conditions: defaultClientConditions.concat('monorepo'),
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: true,
  },
});
