import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: parseInt(env.VITE_APP_PORT ?? '3000'),
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: parseInt(env.VITE_APP_PORT ?? '80'),
    },
  };
});
