import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite configuration
export default defineConfig({
  plugins: [
    react(), // React plugin for Vite
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Resolve '@' to the 'src' directory
    },
  },
  server: {
    host: '0.0.0.0', // Accept connections from any host
    port: 3000, // Set the port for the development server
    hmr: {
      clientPort: 443, // WebSocket client port for Hot Module Replacement (HMR)
      protocol: 'wss', // Use secure WebSocket protocol
    },
  },
});
