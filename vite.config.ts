import { defineConfig } from 'vite';

export default defineConfig({
  // Göreli yollar: hem pages.dev kökünde hem alt dizinde çalışır
  base: './',
  build: {
    target: 'es2020',
  },
  server: {
    port: 5173,
  },
});
