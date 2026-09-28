import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
// `vite build --mode preview` → نسخة معاينة في ملف HTML واحد (dist-preview/index.html)
// تعمل بدون خادم ولا Firebase: تُفتح من الكمبيوتر مباشرة أو تُعرض داخل Claude.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  define: mode === 'preview' ? { 'import.meta.env.VITE_PREVIEW': JSON.stringify('1') } : {},
  build: mode === 'preview' ? { outDir: 'dist-preview' } : {},
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}));
