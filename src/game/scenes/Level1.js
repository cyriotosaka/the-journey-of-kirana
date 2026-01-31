/**
 * 🌲 LEVEL 1 - Hutan Sungai
 *
 * Level pertama game dengan parallax, enemies, dan lighting
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Item, Door, NPC, HidingSpot } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 600; // Closer to ground
        this.isPaused = false;
        this.isGameOver = false;
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createEnemies();
        this.createInteractables();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level1');
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        const worldWidth = width * 3; // Estimasi panjang level

        if (this.textures.exists('bg_level1')) {
            this.bgKey = this.add.image(worldWidth / 2, height / 2, 'bg_level1')
                .setScrollFactor(0.2) // Parallax effect for single image
                .setDepth(-50)
                .setDisplaySize(worldWidth, height);
        } else {
             // Fallback
             this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a15)
                .setScrollFactor(0).setDepth(-50);
        }
    }

    createTilemap() {
        if (!this.cache.tilemap.exists('map_level1')) {
            this.createPlaceholderLevel();
            return;
        }

        this.map = this.make.tilemap({ key: 'map_level1' });
        const tileset = this.map.addTilesetImage('tileset_forest', 'tileset_forest');

        this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
        this.platformLayer = this.map.createLayer('Platforms', tileset, 0, 0);

        if (this.groundLayer) {
            this.groundLayer.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(this.groundLayer);
        }

        if (this.platformLayer) {
            this.platformLayer.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(this.platformLayer);
        }

        const spawnPoint = this.map.findObject('Objects', (obj) => obj.name === 'PlayerSpawn');
        if (spawnPoint) {
            this.spawnX = spawnPoint.x;
            this.spawnY = spawnPoint.y;
        }
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        this.groundY = height - 60; // Lowered to align with BG bottom
        const groundY = this.groundY;

        // Ground (Invisible Physics Body)
        this.matter.add.rectangle(width, groundY + 40, width * 4, 80, {
            isStatic: true,
            label: 'ground',
        });

        // Platforms (Invisible Physics Bodies)
        const platforms = [
            { x: 400, y: groundY - 100, w: 200 },
            { x: 700, y: groundY - 180, w: 150 },
            { x: 1100, y: groundY - 130, w: 180 },
            { x: 1500, y: groundY - 200, w: 200 },
            { x: 1900, y: groundY - 150, w: 150 },
        ];

        platforms.forEach((p) => {
            this.matter.add.rectangle(p.x, p.y + 15, p.w, 30, {
                isStatic: true,
                label: 'platform',
            });
        });
        
        // Removed graphics placeholders to show Panoramic BG
        
        this.matter.world.setBounds(0, 0, width * 2.5, height);
    }



    createPlayer() {
        const spawnY = this.spawnY || (this.groundY ? this.groundY - 100 : 500);
        console.log('🏁 Level1: Creating player at', this.spawnX, spawnY);
        this.player = new Player(this, this.spawnX || 100, spawnY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        console.log('✅ Level1: Player created instance');
    }

    createEnemies() {
        this.enemies = [];
        const { height } = this.cameras.main;

        const galuh1 = new Enemy(this, 800, height - 180, 'galuh', {
            type: 'galuh',
            visionRange: 200,
            visionAngle: 60,
        });
        galuh1.setTarget(this.player);
        galuh1.setPatrolPath([
            { x: 600, y: height - 180 },
            { x: 1000, y: height - 180 },
        ]);
        this.enemies.push(galuh1);

        const galuh2 = new Enemy(this, 1600, height - 180, 'galuh', {
            type: 'galuh',
            visionRange: 180,
            visionAngle: 50,
        });
        galuh2.setTarget(this.player);
        galuh2.setPatrolPath([
            { x: 1400, y: height - 180 },
            { x: 1800, y: height - 180 },
        ]);
        this.enemies.push(galuh2);
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;
        const groundY = this.groundY || (height - 60); // Use class property or fallback

        const fragment = new Item(this, 500, groundY - 50, {
            id: 'shell_fragment_1',
            name: 'Pecahan Cangkang',
            description: 'Sebuah pecahan cangkang emas.',
            texture: 'item_shell_fragment',
        });
        this.interactables.push(fragment);

        const key = new Item(this, 1300, groundY - 50, {
            id: 'key_level1',
            name: 'Kunci Berkarat',
            description: 'Kunci untuk pintu keluar.',
            texture: 'item_key',
        });
        this.interactables.push(key);

        // Hiding Spots (Updated texture)
        const barrel1 = new HidingSpot(this, 450, groundY - 40, { texture: 'prop_hiding_spot' });
        this.interactables.push(barrel1);

        const barrel2 = new HidingSpot(this, 1150, groundY - 40, { texture: 'prop_hiding_spot' });
        this.interactables.push(barrel2);

        // Door
        const exitDoor = new Door(this, 2200, groundY - 48, { // Adjusted Y for 96px height
            isLocked: true,
            keyRequired: 'key_level1',
            targetScene: 'Level2',
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }


    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.12,
            darknessColor: 0x0a0a15,
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 100,
            intensity: 0.8,
            flicker: true,
        });

        const { height } = this.cameras.main;
        this.lightingSystem.addTorch(250, height - 100, { radius: 80 });
        this.lightingSystem.addTorch(900, height - 100, { radius: 90 });
        this.lightingSystem.addTorch(1550, height - 100, { radius: 85 });
        this.lightingSystem.addTorch(2100, height - 100, { radius: 90 });

        // DEBUG: Disable darkness to check sprite visibility
        this.lightingSystem.setAmbientLight(1); 
        // this.lightingSystem.fadeFromBlack(2000, 0.12);
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        const mapWidth = this.map ? this.map.widthInPixels : 1280 * 2.5;
        const mapHeight = this.map ? this.map.heightInPixels : 720;

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    }

    setupAudio() {
        // Get volume settings from React store (via window)
        const bgmVolume = window.__KIRANA_SETTINGS__?.bgmVolume ?? 0.5;
        
        // Background Music - Level 1
        if (this.cache.audio.exists('bgm_level1')) {
            this.bgm = this.sound.add('bgm_level1', { 
                volume: bgmVolume, 
                loop: true 
            });
            this.bgm.play();
            console.log('🎵 BGM Level 1 playing');
        }

        // Ambient sound (jika ada)
        if (this.cache.audio.exists('amb_forest')) {
            this.ambience = this.sound.add('amb_forest', { volume: 0.2, loop: true });
            this.ambience.play();
        }
    }

    setupEvents() {
        EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.on(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.on(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.on(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.on(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.on('enemy:chase_started', this.onChaseStarted, this);
        
        // Listen for volume changes from React settings
        EventBus.on('settings:volume_changed', this.onVolumeChanged, this);
        
        // Listen for scene change from React dialog
        EventBus.on('scene:change', this.onSceneChange, this);

        // ========== DEV EVENTS ==========
        EventBus.on('dev:switch_level', this.onDevSwitchLevel, this);
        EventBus.on('dev:set_health', this.onDevSetHealth, this);
        EventBus.on('dev:toggle_invincible', this.onDevToggleInvincible, this);
    }

    // ========== DEV HANDLERS ==========
    onDevSwitchLevel(levelKey) {
        console.log(`🚀 Switching to ${levelKey}`);
        this.cleanup();
        this.scene.start(levelKey);
    }

    onDevSetHealth(health) {
        if (this.player) this.player.currentHealth = health;
    }

    onDevToggleInvincible() {
        if (this.player) {
            this.player.isInvincible = !this.player.isInvincible;
            console.log(`🛡️ Invincible: ${this.player.isInvincible}`);
        }
    }
    
    onVolumeChanged(data) {
        if (this.bgm) this.bgm.setVolume(data.bgm);
        if (this.ambience) this.ambience.setVolume(data.sfx * 0.2);
    }
    
    onSceneChange(targetScene) {
        this.cleanup();
        if (targetScene === 'restart') {
            this.scene.restart();
        } else {
            this.scene.start(targetScene);
        }
    }

    onGameOver(data) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.player.inputManager.disable();
        this.cameras.main.shake(500, 0.02);

        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.cleanup();
                this.scene.restart();
            });
        });
    }

    onPause() {
        this.isPaused = true;
        this.matter.world.pause();
        this.player.inputManager.disable();
    }

    onResume() {
        this.isPaused = false;
        this.matter.world.resume();
        this.player.inputManager.enable();
    }

    onDialogShow() {
        this.onPause();
    }

    onDialogHide() {
        this.onResume();
    }

    onChaseStarted() {
        if (this.bgm) {
            this.tweens.add({ targets: this.bgm, volume: 0, duration: 500 });
        }

        if (this.cache.audio.exists('bgm_chase')) {
            this.chaseBgm = this.sound.add('bgm_chase', { volume: 0.5, loop: true });
            this.chaseBgm.play();
        }
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        this.player.update(time, delta);
        this.enemies.forEach((enemy) => enemy.update(time, delta));
        this.lightingSystem.update(time, delta);
        this.updateParallax();
    }

    updateParallax() {
        const camX = this.cameras.main.scrollX;
        const time = this.time.now;
        
        // Parallax updates removed (handled by scrollFactor)
    }

    cleanup() {
        EventBus.off(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.off(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.off(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.off(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.off(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.off('enemy:chase_started', this.onChaseStarted, this);
        EventBus.off('settings:volume_changed', this.onVolumeChanged, this);
        EventBus.off('scene:change', this.onSceneChange, this);

        if (this.bgm) this.bgm.stop();
        if (this.ambience) this.ambience.stop();
        if (this.chaseBgm) this.chaseBgm.stop();
        if (this.lightingSystem) this.lightingSystem.destroy();
    }

    shutdown() {
        this.cleanup();
    }
}

export default Level1;
