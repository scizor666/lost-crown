import { defineConfig } from 'vite';

export default defineConfig({
  base: '/lost-crown/',
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'es2020',
  },
});
