import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Server config untuk development
    server: {
        port: 3000,
        open: false,
        host: true,
    },

    // Build optimization
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',

        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                    'react-vendor': ['react', 'react-dom'],
                    zustand: ['zustand'],
                },
            },
        },

        // Chunk size warning limit
        chunkSizeWarningLimit: 1000,
    },

    // Resolve aliases
    resolve: {
        alias: {
            '@': '/src',
            '@components': '/src/components',
            '@game': '/src/game',
            '@stores': '/src/stores',
            '@hooks': '/src/hooks',
            '@styles': '/src/styles',
            '@assets': '/public/assets',
        },
    },

    // Optimized deps
    optimizeDeps: {
        include: ['phaser', 'zustand'],
    },
    server: { allowedHosts: [ 'kirana.deepkernel.site' ] },
});
