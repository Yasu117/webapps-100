import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures relative paths for static hosting
    server: {
        host: true, // Listen on all addresses
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
