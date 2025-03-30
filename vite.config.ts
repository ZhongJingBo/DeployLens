import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'html-transform',
      transformIndexHtml(html: string): string {
        return html.replace(
          /<\/head>/,
          `<link
              rel="stylesheet"
              data-name="vs/editor/editor.main"
              href="./lib/monaco-editor/min/vs/editor/editor.main.css"
            />
          </head>`
        );
      },
    },
    copy({
      targets: [
        { src: 'manifest.json', dest: 'dist' },
        { src: 'service-worker.js', dest: 'dist' },
        { src: 'lib', dest: 'dist' },
      ],
      hook: 'writeBundle',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
  server: {
    proxy: {
      '/note': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/note/, '/note'),
      },
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    watch: {},
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // background: path.resolve(__dirname, 'src/background/requestForward.js'),
      },
      output: {
        // entryFileNames: (chunkInfo: { name: string }) => {
        //   return chunkInfo.name === 'background'
        //     ? 'background/requestForward.js'
        //     : 'assets/js/[name].js';
        // },
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
