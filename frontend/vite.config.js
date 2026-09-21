import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8088';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        },
        '/swagger-ui.html': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        },
        '/swagger-ui': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        },
        '/v3/api-docs': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
