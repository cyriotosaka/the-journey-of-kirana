/**
 * ⚙️ PHASER GAME CONFIGURATION
 *
 * Setup untuk Phaser engine dengan settingan optimized
 * untuk game 2.5D cinematic platformer
 */

import Phaser from 'phaser';

// Import scenes
import { BootScene } from '../scenes/BootScene';
import { Level1 } from '../scenes/Level1';
import { Level2 } from '../scenes/Level2';

const gameConfig = {
    // ========== CORE CONFIG ==========
    type: Phaser.AUTO, // Auto-detect WebGL or Canvas
    parent: 'phaser-container', // ID dari container element

    // ========== RESOLUTION ==========
    width: 1280,
    height: 720,

    // ========== SCALE CONFIG ==========
    scale: {
        mode: Phaser.Scale.FIT, // Fit to screen, maintain aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
        min: {
            width: 640,
            height: 360,
        },
        max: {
            width: 1920,
            height: 1080,
        },
    },

    // ========== PHYSICS ENGINE ==========
    physics: {
        default: 'matter', // Matter.js untuk interaksi objek realistis
        matter: {
            gravity: {
                y: 1.2, // Gravity sedikit lebih berat untuk feel Little Nightmares
            },
            debug: false, // Set true untuk development
            debugBodyColor: 0x00ff00,
            debugStaticBodyColor: 0x0000ff,
            debugVelocityColor: 0xff0000,
        },

        // Alternative: Arcade Physics (lebih simple, bisa dipakai juga)
        arcade: {
            gravity: { y: 800 },
            debug: false,
        },
    },

    // ========== RENDERING ==========
    render: {
        antialias: true,
        pixelArt: false, // Set true jika pakai pixel art style
        roundPixels: true, // Prevent texture bleeding
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        batchSize: 2048,
    },

    // ========== AUDIO ==========
    audio: {
        disableWebAudio: false,
        noAudio: false,
    },

    // ========== BACKGROUND COLOR ==========
    backgroundColor: '#000000',

    // ========== SCENES ==========
    scene: [
        BootScene,   // Loading screen → auto starts Level1
        Level1,      // Level pertama
        Level2,      // Level kedua
    ],

    // ========== INPUT ==========
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false,
    },

    // ========== DOM ==========
    dom: {
        createContainer: false,
    },

    // ========== FPS ==========
    fps: {
        target: 60,
        forceSetTimeOut: false,
        min: 30,
        smoothStep: true,
    },

    // ========== BANNER ==========
    banner: {
        hidePhaser: false,
        text: '#000000',
        background: ['#d4af37', '#8b4513', '#ff6b6b'],
    },

    // ========== CALLBACKS ==========
    callbacks: {
        preBoot: (game) => {
            console.log('🎮 Phaser pre-boot...');
        },
        postBoot: (game) => {
            console.log('✅ Phaser booted successfully');
            // EventBus akan emit GAME_READY dari PhaserContainer
        },
    },
};

export default gameConfig;

/**
 * PHYSICS ENGINE NOTES:
 *
 * Matter.js:
 * - Pros: Realistic physics, complex shapes, rotation, constraints
 * - Cons: Lebih berat, butuh tuning lebih banyak
 * - Use case: Puzzle platformer, interaksi objek kompleks
 *
 * Arcade Physics:
 * - Pros: Simple, ringan, cukup untuk basic platformer
 * - Cons: Tidak ada rotation, collision shapes terbatas
 * - Use case: Classic platformer, simple gameplay
 *
 * Untuk "The Journey of Kirana", Matter.js recommended karena:
 * - Cangkang emas bisa berputar saat player jatuh
 * - Interaksi dengan objek lingkungan lebih realistic
 * - Bisa bikin puzzle dengan rope/chain constraints
 */
