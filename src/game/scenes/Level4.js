/**
 * 🌿 LEVEL 4 - Rawa & Penyamaran
 *
 * Emosi: Sunyi → Tekad
 * - Area rawa & gua akar
 * - Air dangkal memantulkan cahaya
 * - Puzzle + stealth kompleks
 * - Keong emas bereaksi (memberi perlindungan)
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Item, Door, HidingSpot, Switch } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level4 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level4' });
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

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level4');

        this.time.delayedCall(1500, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Rawa ini... tenang tapi berbahaya. Air memantulkan cahaya, aku harus lebih berhati-hati.',
                avatar: null,
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        const worldWidth = width * 3;

        if (this.textures.exists('bg_level4')) {
            this.add.image(worldWidth / 2, height / 2, 'bg_level4')
                .setScrollFactor(0.2)
                .setDepth(-50)
                .setDisplaySize(worldWidth, height);
        } else {
             this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e)
                .setScrollFactor(0).setDepth(-50);
        }
    }

    createTilemap() {
        this.createPlaceholderLevel();
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Ground - murky swamp floor
        this.matter.add.rectangle(width, groundY + 30, width * 3, 60, {
            isStatic: true, label: 'ground',
        });

        // Root platforms
        const platforms = [
            { x: 350, y: groundY - 80, w: 120, h: 20 },
            { x: 650, y: groundY - 120, w: 100, h: 15 },
            { x: 1000, y: groundY - 90, w: 150, h: 20 },
            { x: 1400, y: groundY - 110, w: 130, h: 20 },
            { x: 1800, y: groundY - 70, w: 140, h: 20 },
        ];

        platforms.forEach((p) => {
            this.matter.add.rectangle(p.x, p.y + p.h / 2, p.w, p.h, {
                isStatic: true, label: 'platform',
            });
        });

        this.matter.world.setBounds(0, 0, width * 3, height);
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
    }

    createEnemies() {
        this.enemies = [];
        const { height } = this.cameras.main;

        // Swamp creature - slower but wider vision
        const creature = new Enemy(this, 900, height - 150, 'enemy_creature', {
            type: 'creature',
            visionRange: 220,
            visionAngle: 80,
            patrolSpeed: 1,
            chaseSpeed: 2.5,
        });
        creature.setTarget(this.player);
        creature.setPatrolPath([
            { x: 500, y: height - 150 },
            { x: 1300, y: height - 150 },
        ]);
        this.enemies.push(creature);
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;

        // Hiding in roots
        const hidingPositions = [
            { x: 300, y: height - 90 },
            { x: 700, y: height - 90 },
            { x: 1100, y: height - 90 },
            { x: 1600, y: height - 90 },
        ];

        hidingPositions.forEach((pos) => {
            const spot = new HidingSpot(this, pos.x, pos.y, { texture: 'prop_roots' });
            this.interactables.push(spot);
        });

        // Shell fragment
        const fragment = new Item(this, 1400, height - 180, {
            id: 'shell_fragment_4',
            name: 'Pecahan Cangkang',
            description: 'Pecahan keempat dari cangkang emas.',
            texture: 'item_shell_fragment',
        });
        this.interactables.push(fragment);

        // Exit
        const exitDoor = new Door(this, 2500, height - 100, {
            isLocked: false,
            targetScene: 'Level5',
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }

    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.08,
            darknessColor: 0x0a1510,
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 80,
            intensity: 0.7,
            flicker: true,
            color: 0xffffcc, // Keong golden glow
        });
        
        // Make background visible
        this.lightingSystem.setAmbientLight(1);
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 1280 * 3, 720);
    }

    setupAudio() {
        if (this.cache.audio.exists('bgm_level4')) {
            this.bgm = this.sound.add('bgm_level4', { volume: 0.25, loop: true });
            this.bgm.play();
            console.log('🎵 BGM Level 4 playing');
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

    onDevSwitchLevel(levelKey) { this.cleanup(); this.scene.start(levelKey); }
    onDevSetHealth(health) { if (this.player) this.player.currentHealth = health; }
    onDevToggleInvincible() { if (this.player) this.player.isInvincible = !this.player.isInvincible; }

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
        if (!this.matter || !this.matter.world) return;
        this.isPaused = true;
        this.matter.world.pause();
        if (this.player?.inputManager) this.player.inputManager.disable();
    }

    onResume() {
        if (!this.matter || !this.matter.world) return;
        this.isPaused = false;
        this.matter.world.resume();
        if (this.player?.inputManager) this.player.inputManager.enable();
    }
    onDialogShow() {
        if (!this.scene.isActive()) return;
        this.onPause();
    }
    onDialogHide() {
        if (!this.scene.isActive()) return;
        this.onResume();
    }

    update(time, delta) {
        // Always update lighting (prevents dark screen during pause)
        if (this.lightingSystem) this.lightingSystem.update(time, delta);

        if (this.isPaused || this.isGameOver) return;
        this.player.update(time, delta);
        this.enemies.forEach((enemy) => enemy.update(time, delta));

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

export default Level4;
