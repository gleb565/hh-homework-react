import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';

const BASE_PATH = '/hh-homework-react/';

export default defineConfig({
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],

    base: BASE_PATH,

    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
    },
});
