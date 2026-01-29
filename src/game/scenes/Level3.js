/**
 * 🌲 LEVEL 3 - Jejak Sang Raksasa
 *
 * Emosi: Panik → Bertahan
 * - Patung batu hancur, kerangka binatang
 * - Musuh mulai muncul sebagai siluet
 * - Shell mechanic diperkenalkan
 * - Cahaya = bahaya, Gelap = aman
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Item, Door, HidingSpot } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3' });
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 500;
        this.isPaused = false;
        this.isGameOver = false;
    }

    create() {
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createEnemies();
        this.createInteractables();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level3');

        // Level intro dialog
        this.time.delayedCall(1500, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Jejak besar... seperti ada yang melewati tempat ini. Aku harus berhati-hati.',
                avatar: null,
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // ========== LAYER 1: Back (furthest) ==========
        if (this.textures.exists('bg_level3_layer1')) {
            this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg_level3_layer1')
                .setOrigin(0).setScrollFactor(0).setDepth(-50).setDisplaySize(width, height);
        } else {
            this.add.rectangle(0, 0, width * 2, height, 0x1a1a2e).setOrigin(0).setScrollFactor(0).setDepth(-50);
        }

        // ========== LAYER 2: Mid-back ==========
        if (this.textures.exists('bg_level3_layer2')) {
            this.bgLayer2 = this.add.tileSprite(0, 0, width, height, 'bg_level3_layer2')
                .setOrigin(0).setScrollFactor(0).setDepth(-40).setDisplaySize(width, height);
        }

        // ========== LAYER 3: Mid-front ==========
        if (this.textures.exists('bg_level3_layer3')) {
            this.bgLayer3 = this.add.tileSprite(0, 0, width, height, 'bg_level3_layer3')
                .setOrigin(0).setScrollFactor(0).setDepth(-30).setDisplaySize(width, height);
        }

        // ========== LAYER 4: Front (closest) ==========
        if (this.textures.exists('bg_level3_layer4')) {
            this.bgLayer4 = this.add.tileSprite(0, 0, width, height, 'bg_level3_layer4')
                .setOrigin(0).setScrollFactor(0).setDepth(-20).setDisplaySize(width, height);
        }
    }

    createTilemap() {
        // Placeholder level - no tilemap yet
        this.createPlaceholderLevel();
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Ground
        this.matter.add.rectangle(width, groundY + 30, width * 3, 60, {
            isStatic: true, label: 'ground',
        });

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x2d4739);
        groundGraphics.fillRect(0, groundY, width * 3, 60);

        // Platforms - representing broken statues & debris
        const platforms = [
            { x: 300, y: groundY - 60, w: 150, h: 25 },
            { x: 550, y: groundY - 100, w: 120, h: 20 },
            { x: 850, y: groundY - 80, w: 180, h: 25 },
            { x: 1200, y: groundY - 120, w: 140, h: 20 },
            { x: 1550, y: groundY - 70, w: 160, h: 25 },
        ];

        platforms.forEach((p) => {
            this.matter.add.rectangle(p.x, p.y + p.h / 2, p.w, p.h, {
                isStatic: true, label: 'platform',
            });

            const platformGraphics = this.add.graphics();
            platformGraphics.fillStyle(0x3d5a4b);
            platformGraphics.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
        });

        this.matter.world.setBounds(0, 0, width * 3, height);
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
    }

    createEnemies() {
        this.enemies = [];
        const { height } = this.cameras.main;

        // Shadow enemy - siluet, tidak jelas
        const shadow = new Enemy(this, 700, height - 150, 'enemy_shadow', {
            type: 'shadow',
            visionRange: 180,
            visionAngle: 50,
            patrolSpeed: 1.5,
            chaseSpeed: 3,
        });
        shadow.setTarget(this.player);
        shadow.setPatrolPath([
            { x: 400, y: height - 150 },
            { x: 1000, y: height - 150 },
        ]);
        this.enemies.push(shadow);
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;

        // Hiding spots
        const hidingPositions = [
            { x: 250, y: height - 90 },
            { x: 600, y: height - 90 },
            { x: 950, y: height - 90 },
            { x: 1300, y: height - 90 },
        ];

        hidingPositions.forEach((pos) => {
            const spot = new HidingSpot(this, pos.x, pos.y, { texture: 'prop_rock' });
            this.interactables.push(spot);
        });

        // Shell fragment collectible
        const fragment = new Item(this, 1200, height - 190, {
            id: 'shell_fragment_3',
            name: 'Pecahan Cangkang',
            description: 'Pecahan ketiga dari cangkang emas.',
            texture: 'item_shell_fragment',
        });
        this.interactables.push(fragment);

        // Exit to next level
        const exitDoor = new Door(this, 2400, height - 100, {
            isLocked: false,
            targetScene: 'Level4',
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }

    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.1,
            darknessColor: 0x0a1015,
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 90,
            intensity: 0.75,
            flicker: true,
        });
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 1280 * 3, 720);
    }

    setupAudio() {
        if (this.cache.audio.exists('bgm_level3')) {
            this.bgm = this.sound.add('bgm_level3', { volume: 0.3, loop: true });
            this.bgm.play();
            console.log('🎵 BGM Level 3 playing');
        }
    }

    setupEvents() {
        EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.on(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.on(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.on(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.on(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.on('dev:switch_level', this.onDevSwitchLevel, this);
        EventBus.on('dev:set_health', this.onDevSetHealth, this);
        EventBus.on('dev:toggle_invincible', this.onDevToggleInvincible, this);
    }

    // ========== DEV HANDLERS ==========
    onDevSwitchLevel(levelKey) {
        this.cleanup();
        this.scene.start(levelKey);
    }

    onDevSetHealth(health) {
        if (this.player) this.player.currentHealth = health;
    }

    onDevToggleInvincible() {
        if (this.player) this.player.isInvincible = !this.player.isInvincible;
    }

    onGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.player.inputManager.disable();
        this.cameras.main.shake(500, 0.02);
        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(1000);
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

    onDialogShow() { this.onPause(); }
    onDialogHide() { this.onResume(); }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        this.player.update(time, delta);
        this.enemies.forEach((enemy) => enemy.update(time, delta));
        this.lightingSystem.update(time, delta);

        // Parallax scrolling
        const camX = this.cameras.main.scrollX;
        if (this.bgLayer1) this.bgLayer1.tilePositionX = camX * 0.1;
        if (this.bgLayer2) this.bgLayer2.tilePositionX = camX * 0.3;
        if (this.bgLayer3) this.bgLayer3.tilePositionX = camX * 0.5;
        if (this.bgLayer4) this.bgLayer4.tilePositionX = camX * 0.7;
    }

    cleanup() {
        EventBus.off(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.off(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.off(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.off(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.off(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.off('dev:switch_level', this.onDevSwitchLevel, this);
        EventBus.off('dev:set_health', this.onDevSetHealth, this);
        EventBus.off('dev:toggle_invincible', this.onDevToggleInvincible, this);

        if (this.bgm) this.bgm.stop();
        if (this.lightingSystem) this.lightingSystem.destroy();
    }

    shutdown() { this.cleanup(); }
}

export default Level3;
