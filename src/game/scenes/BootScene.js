/**
 * 🚀 BOOT SCENE - Loading screen (NO ASSETS REQUIRED VERSION)
 *
 * Versi simplified yang langsung ready tanpa asset
 */

import Phaser from 'phaser';
import { AnimationManager } from '../systems/AnimationManager';
import { EventBus, GameEvents } from '../systems/EventBus';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        this.loadingComplete = false;
        // Tell React we're in BootScene (loading)
        EventBus.emit('scene:changed', 'BootScene');
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

        // ============================================
        // LOAD KIRANA CHARACTER SPRITESHEETS
        // ============================================
        const kiranaPath = 'assets/images/characters/kirana/';
        
        // Each sprite has different frame counts and layouts
        // Format: { key, file, frameWidth, frameHeight, frameCount }
        const kiranaSprites = [
            { key: 'kirana_idle', file: 'kirana_idle.png', cols: 6, rows: 1 },
            { key: 'kirana_walk', file: 'kirana_walk.png', cols: 5, rows: 2 },
            { key: 'kirana_run', file: 'kirana_run.png', cols: 6, rows: 1 },
            { key: 'kirana_jump', file: 'kirana_jump.png', cols: 7, rows: 1 },
            { key: 'kirana_fall', file: 'kirana_fall.png', cols: 4, rows: 1 },
            { key: 'kirana_landing', file: 'kirana_landing.png', cols: 6, rows: 1 },
            { key: 'kirana_hurt', file: 'kirana_hurt.png', cols: 4, rows: 2 },
            { key: 'kirana_death', file: 'kirana_death.png', cols: 4, rows: 2 },
            { key: 'kirana_shell_enter', file: 'kirana_shell_enter.png', cols: 5, rows: 1 },
            { key: 'kirana_shell_idle', file: 'kirana_shell_idle.png', cols: 2, rows: 1 },
            { key: 'kirana_shell_exit', file: 'kirana_shell_exit.png', cols: 5, rows: 1 },
        ];
        
        // Store sprite config for animation setup later
        this.kiranaSpritesConfig = kiranaSprites;
        
        // Load each spritesheet as regular image first
        // We'll calculate frame dimensions in create() after images load
        kiranaSprites.forEach(sprite => {
            this.load.image(sprite.key + '_sheet', kiranaPath + sprite.file);
        });
        
        console.log('📦 Loading 11 Kirana sprite animations...');

        // ============================================
        // LOAD ITEMS
        // ============================================
        this.load.spritesheet('items', 'assets/images/items/items_sheet.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // ============================================
        // LOAD LEVEL 1 BACKGROUND LAYERS (Parallax)
        // ============================================
        this.load.image('bg_level1_sky', 'assets/images/backgrounds/level1/layer1_sky.png');
        this.load.image('bg_level1_forest', 'assets/images/backgrounds/level1/layer2_forest.png');
        this.load.image('bg_level1_mid', 'assets/images/backgrounds/level1/layer3_mid.png');
        this.load.image('bg_level1_frame', 'assets/images/backgrounds/level1/layer4_frame.png');
        this.load.image('bg_level1_fog', 'assets/images/backgrounds/level1/layer5_fog.png');

        // ============================================
        // LOAD LEVEL 2 BACKGROUND LAYERS (Parallax)
        // ============================================
        this.load.image('bg_level2_layer1', 'assets/images/backgrounds/level2/layer1.png');
        this.load.image('bg_level2_layer2', 'assets/images/backgrounds/level2/layer2.png');
        this.load.image('bg_level2_layer3', 'assets/images/backgrounds/level2/layer3.png');
        this.load.image('bg_level2_layer4', 'assets/images/backgrounds/level2/layer4.png');

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
            graphics.fillCircle(x + 8, 8, 4); // Simple circle instead of star
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

        // Convert Kirana images to spritesheets
        this.setupKiranaSpritesheets();

        // Create animations from spritesheets
        this.createAnimations();

        this.loadingText.setText('Siap!');

        // Auto start after short delay
        this.time.delayedCall(500, () => {
            this.startGame();
        });
    }

    /**
     * Convert loaded Kirana images into proper spritesheets
     * This calculates frame dimensions from image size and column/row counts
     */
    setupKiranaSpritesheets() {
        if (!this.kiranaSpritesConfig) {
            console.warn('⚠️ Kirana sprite config not found, using placeholders');
            return;
        }

        console.log('🔧 Setting up Kirana spritesheets...');

        this.kiranaSpritesConfig.forEach(config => {
            const sheetKey = config.key + '_sheet';
            
            // Check if the image was loaded
            if (!this.textures.exists(sheetKey)) {
                console.warn(`⚠️ Texture ${sheetKey} not found`);
                return;
            }

            // Get image dimensions
            const texture = this.textures.get(sheetKey);
            const source = texture.getSourceImage();
            const imgWidth = source.width;
            const imgHeight = source.height;

            // Calculate frame dimensions
            const frameWidth = Math.floor(imgWidth / config.cols);
            const frameHeight = Math.floor(imgHeight / config.rows);
            const totalFrames = config.cols * config.rows;

            console.log(`  📦 ${config.key}: ${imgWidth}x${imgHeight} → ${frameWidth}x${frameHeight} (${totalFrames} frames)`);

            // Remove the sheet key and create a new spritesheet from the same image
            // We need to re-add the texture as a spritesheet
            const path = 'assets/images/characters/kirana/' + config.file;
            
            // Create spritesheet from the loaded image
            this.textures.addSpriteSheet(config.key, source, {
                frameWidth: frameWidth,
                frameHeight: frameHeight,
            });
        });

        console.log('✅ Kirana spritesheets ready');
    }

    createAnimations() {
        const anims = this.anims;
        
        // Helper: Check if texture is a spritesheet (has multiple frames)
        const isSpritesheet = (key) => {
            if (!this.textures.exists(key)) return false;
            const texture = this.textures.get(key);
            return texture.frameTotal > 1;
        };
        
        // Helper: Create animation safely
        const createAnim = (key, textureKey, startFrame, endFrame, frameRate, repeat) => {
            if (anims.exists(key)) return;
            
            if (isSpritesheet(textureKey)) {
                // Real spritesheet - use frame numbers
                anims.create({
                    key,
                    frames: anims.generateFrameNumbers(textureKey, { start: startFrame, end: endFrame }),
                    frameRate,
                    repeat,
                });
            } else if (this.textures.exists(textureKey)) {
                // Single image - create simple 1-frame animation
                anims.create({
                    key,
                    frames: [{ key: textureKey, frame: 0 }],
                    frameRate: 1,
                    repeat: repeat === -1 ? -1 : 0,
                });
            }
            // If texture doesn't exist, skip animation
        };
        
        // ========== PLAYER ANIMATIONS (from separate spritesheets) ==========
        // Each animation uses its own spritesheet key
        // Frame counts: idle(6), walk(10), run(6), jump(7), fall(4), landing(6), hurt(8), death(8), shell_enter(5), shell_idle(2), shell_exit(5)
        
        createAnim('kirana_idle', 'kirana_idle', 0, 5, 8, -1);           // 6 frames
        createAnim('kirana_walk', 'kirana_walk', 0, 9, 12, -1);          // 10 frames
        createAnim('kirana_run', 'kirana_run', 0, 5, 14, -1);            // 6 frames
        createAnim('kirana_jump', 'kirana_jump', 0, 6, 12, 0);           // 7 frames
        createAnim('kirana_fall', 'kirana_fall', 0, 3, 10, -1);          // 4 frames
        createAnim('kirana_landing', 'kirana_landing', 0, 5, 15, 0);     // 6 frames
        createAnim('kirana_hurt', 'kirana_hurt', 0, 7, 12, 0);           // 8 frames
        createAnim('kirana_death', 'kirana_death', 0, 7, 10, 0);         // 8 frames
        createAnim('kirana_shell_enter', 'kirana_shell_enter', 0, 4, 12, 0);  // 5 frames
        createAnim('kirana_shell_idle', 'kirana_shell_idle', 0, 1, 4, -1);    // 2 frames
        createAnim('kirana_shell_exit', 'kirana_shell_exit', 0, 4, 12, 0);    // 5 frames
        
        // ========== ENEMY ANIMATIONS ==========
        createAnim('galuh_idle', 'galuh', 0, 3, 4, -1);
        createAnim('galuh_walk', 'galuh', 4, 7, 6, -1);
        createAnim('galuh_alert', 'galuh', 8, 11, 8, 0);
        createAnim('galuh_chase', 'galuh', 12, 17, 10, -1);
        createAnim('galuh_search', 'galuh', 18, 21, 5, -1);
        
        // ========== TORCH ANIMATION ==========
        createAnim('torch_burn', 'torch', 0, 5, 10, -1);

        console.log('✅ Animations created (safe mode)');
    }

    startGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Emit game ready to React
            GameEvents.gameReady();
            
            // Emit loading complete to hide loading screen and show HUD
            EventBus.emit('loading:complete');
            
            // Start Level 1
            this.scene.start('Level1');
        });
    }
}

export default BootScene;
