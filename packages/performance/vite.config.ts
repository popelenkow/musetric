import { defaultClientConditions, defineConfig } from 'vite';
import mkcertRaw from 'vite-plugin-mkcert';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const mkcert = mkcertRaw as unknown as typeof mkcertRaw.default;

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
