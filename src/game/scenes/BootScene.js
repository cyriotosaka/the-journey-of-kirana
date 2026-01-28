/**
 * 🚀 BOOT SCENE - Loading screen (NO ASSETS REQUIRED VERSION)
 *
 * Versi simplified yang langsung ready tanpa asset
 */

import Phaser from 'phaser';
import { AnimationManager } from '../systems/AnimationManager';
import { GameEvents } from '../systems/EventBus';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        this.loadingComplete = false;
    }

    preload() {
        this.createLoadingUI();

        // ============================================
        // PLACEHOLDER TEXTURES (No external files needed!)
        // ============================================
        this.createPlaceholderTextures();

        // ============================================
        // LOAD BGM AUDIO
        // ============================================
        this.load.audio('bgm_level1', 'assets/audio/bgm/bgm_level1.mp3');
        this.load.audio('bgm_level2', 'assets/audio/bgm/bgm_level2.mp3');
        this.load.audio('bgm_level3', 'assets/audio/bgm/bgm_level3.mp3');
        this.load.audio('bgm_level4', 'assets/audio/bgm/bgm_level4.mp3');
        this.load.audio('bgm_level5', 'assets/audio/bgm/bgm_level5.mp3');
        this.load.audio('bgm_level6', 'assets/audio/bgm/bgm_level6.mp3');
        this.load.audio('bgm_level7', 'assets/audio/bgm/bgm_level7.mp3');

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
    }

    createLoadingUI() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

        // Title
        this.add.text(centerX, centerY - 100, 'THE JOURNEY OF', {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#a0a0a0',
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 60, 'KIRANA', {
            fontFamily: 'Georgia, serif',
            fontSize: '64px',
            color: '#d4af37',
        }).setOrigin(0.5);

        // Loading bar background
        this.add.rectangle(centerX, centerY + 50, 400, 24, 0x1a1a1a)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xd4af37);

        // Loading bar fill
        this.loadingBar = this.add.rectangle(
            centerX - 198,
            centerY + 50,
            0,
            20,
            0xd4af37
        ).setOrigin(0, 0.5);

        // Loading text
        this.loadingText = this.add.text(centerX, centerY + 100, 'Memuat... 0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#606060',
        }).setOrigin(0.5);

        // Tip text
        this.add.text(centerX, height - 60, 'TIP: Tekan SHIFT untuk bersembunyi dalam cangkang emas', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#404040',
            fontStyle: 'italic',
        }).setOrigin(0.5);
    }

    /**
     * Create placeholder textures so the game can run without asset files
     */
    createPlaceholderTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // ========== PLAYER (Kirana) - 64x64 spritesheet ==========
        graphics.clear();
        for (let i = 0; i < 31; i++) {
            const x = (i % 8) * 64;
            const y = Math.floor(i / 8) * 64;
            
            // Body
            graphics.fillStyle(0xd4af37, 1); // Gold color
            graphics.fillCircle(x + 32, y + 28, 16);
            
            // Shell
            graphics.fillStyle(0xc9a227, 1);
            graphics.fillEllipse(x + 32, y + 42, 24, 16);
            
            // Eyes
            graphics.fillStyle(0x000000, 1);
            graphics.fillCircle(x + 26, y + 24, 3);
            graphics.fillCircle(x + 38, y + 24, 3);
        }
        graphics.generateTexture('kirana', 512, 256);

        // ========== ENEMY (Galuh) - 96x96 spritesheet ==========
        graphics.clear();
        for (let i = 0; i < 30; i++) {
            const x = (i % 6) * 96;
            const y = Math.floor(i / 6) * 96;
            
            // Body
            graphics.fillStyle(0x4a0080, 1); // Purple
            graphics.fillCircle(x + 48, y + 40, 24);
            
            // Cloak
            graphics.fillStyle(0x2a0050, 1);
            graphics.fillTriangle(x + 48, y + 30, x + 20, y + 90, x + 76, y + 90);
            
            // Eyes (menacing)
            graphics.fillStyle(0xff0000, 1);
            graphics.fillCircle(x + 40, y + 36, 4);
            graphics.fillCircle(x + 56, y + 36, 4);
        }
        graphics.generateTexture('galuh', 576, 480);

        // ========== GIANT - 128x128 ==========
        graphics.clear();
        for (let i = 0; i < 20; i++) {
            const x = (i % 5) * 128;
            const y = Math.floor(i / 5) * 128;
            
            graphics.fillStyle(0x3d2914, 1);
            graphics.fillRect(x + 30, y + 20, 68, 100);
            graphics.fillCircle(x + 64, y + 30, 28);
        }
        graphics.generateTexture('giant', 640, 512);

        // ========== DOOR - 64x96 ==========
        graphics.clear();
        for (let i = 0; i < 5; i++) {
            const x = i * 64;
            graphics.fillStyle(0x4a3728, 1);
            graphics.fillRect(x + 5, 5, 54, 86);
            graphics.fillStyle(0x3a2718, 1);
            graphics.fillRect(x + 10, 10, 44, 76);
            // Handle
            graphics.fillStyle(0xd4af37, 1);
            graphics.fillCircle(x + 48, 48, 4);
        }
        graphics.generateTexture('door', 320, 96);

        // ========== ITEMS ==========
        // Key
        graphics.clear();
        graphics.fillStyle(0xd4af37, 1);
        graphics.fillCircle(16, 10, 8);
        graphics.fillRect(12, 16, 8, 20);
        graphics.fillRect(10, 28, 4, 6);
        graphics.fillRect(18, 28, 4, 6);
        graphics.generateTexture('item_key', 32, 40);

        // Shell fragment
        graphics.clear();
        graphics.fillStyle(0xd4af37, 1);
        graphics.fillTriangle(16, 4, 4, 28, 28, 28);
        graphics.generateTexture('item_shell_fragment', 32, 32);

        // ========== PROPS ==========
        // Barrel
        graphics.clear();
        graphics.fillStyle(0x5c4033, 1);
        graphics.fillEllipse(24, 40, 20, 36);
        graphics.fillStyle(0x3a2820, 1);
        graphics.fillRect(8, 12, 32, 4);
        graphics.fillRect(8, 32, 32, 4);
        graphics.fillRect(8, 52, 32, 4);
        graphics.generateTexture('prop_barrel', 48, 72);

        // Pot
        graphics.clear();
        graphics.fillStyle(0x6b4423, 1);
        graphics.fillEllipse(24, 36, 22, 28);
        graphics.fillStyle(0x4a3020, 1);
        graphics.fillEllipse(24, 14, 16, 8);
        graphics.generateTexture('prop_pot', 48, 56);

        // ========== PARTICLE ==========
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);

        // ========== TORCH ==========
        graphics.clear();
        for (let i = 0; i < 6; i++) {
            const x = i * 32;
            graphics.fillStyle(0x4a3020, 1);
            graphics.fillRect(x + 12, 30, 8, 34);
            graphics.fillStyle(0xff6600, 1);
            graphics.fillCircle(x + 16, 20, 10 + Math.sin(i) * 3);
            graphics.fillStyle(0xffaa00, 1);
            graphics.fillCircle(x + 16, 18, 6);
        }
        graphics.generateTexture('torch', 192, 64);

        // ========== SWITCH ==========
        graphics.clear();
        graphics.fillStyle(0x444444, 1);
        graphics.fillRect(0, 8, 32, 24);
        graphics.fillStyle(0x888888, 1);
        graphics.fillRect(12, 4, 8, 24);
        // On state
        graphics.fillStyle(0x444444, 1);
        graphics.fillRect(32, 8, 32, 24);
        graphics.fillStyle(0x44ff44, 1);
        graphics.fillRect(44, 4, 8, 24);
        graphics.generateTexture('switch', 64, 32);

        // ========== DUST EFFECT ==========
        graphics.clear();
        for (let i = 0; i < 6; i++) {
            const x = i * 32;
            const alpha = 1 - (i / 6);
            graphics.fillStyle(0xaaaaaa, alpha);
            graphics.fillCircle(x + 16, 16, 8 + i * 2);
        }
        graphics.generateTexture('dust', 192, 32);

        // ========== SPARKLE ==========
        graphics.clear();
        for (let i = 0; i < 6; i++) {
            const x = i * 16;
            graphics.fillStyle(0xffffaa, 1);
            graphics.fillStar(x + 8, 8, 4, 4, 2);
        }
        graphics.generateTexture('sparkle', 96, 16);

        graphics.destroy();

        console.log('✅ Placeholder textures created');
    }

    onLoadProgress(progress) {
        const barWidth = 396 * progress;
        this.loadingBar.width = barWidth;

        const percent = Math.round(progress * 100);
        this.loadingText.setText(`Memuat... ${percent}%`);
    }

    onLoadComplete() {
        this.loadingComplete = true;

        // Create animations from placeholder textures
        this.createAnimations();

        this.loadingText.setText('Siap!');

        // Auto start after short delay
        this.time.delayedCall(500, () => {
            this.startGame();
        });
    }

    createAnimations() {
        const anims = this.anims;

        // Player animations
        if (!anims.exists('kirana_idle')) {
            anims.create({
                key: 'kirana_idle',
                frames: anims.generateFrameNumbers('kirana', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1,
            });

            anims.create({
                key: 'kirana_walk',
                frames: anims.generateFrameNumbers('kirana', { start: 4, end: 7 }),
                frameRate: 10,
                repeat: -1,
            });

            anims.create({
                key: 'kirana_jump',
                frames: anims.generateFrameNumbers('kirana', { start: 8, end: 9 }),
                frameRate: 10,
                repeat: 0,
            });

            anims.create({
                key: 'kirana_fall',
                frames: anims.generateFrameNumbers('kirana', { start: 10, end: 11 }),
                frameRate: 8,
                repeat: -1,
            });

            anims.create({
                key: 'kirana_shell_enter',
                frames: anims.generateFrameNumbers('kirana', { start: 12, end: 15 }),
                frameRate: 12,
                repeat: 0,
            });

            anims.create({
                key: 'kirana_shell_idle',
                frames: anims.generateFrameNumbers('kirana', { start: 15, end: 16 }),
                frameRate: 4,
                repeat: -1,
            });

            anims.create({
                key: 'kirana_shell_exit',
                frames: anims.generateFrameNumbers('kirana', { start: 15, end: 12 }),
                frameRate: 12,
                repeat: 0,
            });

            anims.create({
                key: 'kirana_hurt',
                frames: anims.generateFrameNumbers('kirana', { start: 17, end: 18 }),
                frameRate: 10,
                repeat: 0,
            });

            anims.create({
                key: 'kirana_death',
                frames: anims.generateFrameNumbers('kirana', { start: 19, end: 22 }),
                frameRate: 8,
                repeat: 0,
            });
        }

        // Enemy animations
        if (!anims.exists('galuh_idle')) {
            anims.create({
                key: 'galuh_idle',
                frames: anims.generateFrameNumbers('galuh', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_walk',
                frames: anims.generateFrameNumbers('galuh', { start: 4, end: 7 }),
                frameRate: 6,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_alert',
                frames: anims.generateFrameNumbers('galuh', { start: 8, end: 11 }),
                frameRate: 8,
                repeat: 0,
            });

            anims.create({
                key: 'galuh_chase',
                frames: anims.generateFrameNumbers('galuh', { start: 12, end: 17 }),
                frameRate: 10,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_search',
                frames: anims.generateFrameNumbers('galuh', { start: 18, end: 21 }),
                frameRate: 5,
                repeat: -1,
            });
        }

        // Torch
        if (!anims.exists('torch_burn')) {
            anims.create({
                key: 'torch_burn',
                frames: anims.generateFrameNumbers('torch', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1,
            });
        }

        console.log('✅ Animations created');
    }

    startGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Emit game ready to React
            GameEvents.gameReady();
            
            // Start Level 1
            this.scene.start('Level1');
        });
    }
}

export default BootScene;
