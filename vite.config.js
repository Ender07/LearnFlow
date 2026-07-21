import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/integrations/Core': path.resolve(__dirname, './src/integrations/Core.js'),
      '@/entities/all': path.resolve(__dirname, './src/entities/all.js'),
      '@/functions/shadowExpertDetector': path.resolve(__dirname, './src/functions/shadowExpertDetector.js'),
      '@/functions/knowledgeGraphSuggestions': path.resolve(__dirname, './src/functions/knowledgeGraphSuggestions.js'),
      '@/functions/predictiveComplianceEngine': path.resolve(__dirname, './src/functions/predictiveComplianceEngine.js'),
      '@/functions/regulatoryWatchdog': path.resolve(__dirname, './src/functions/regulatoryWatchdog.js'),
    }
  }
});