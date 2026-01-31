/**
 * 🏯 LEVEL 5 - Markas Buto Ijo
 *
 * Emosi: Ngeri → Putus Asa
 * - Struktur dari tulang & kayu tua
 * - Obor hijau redup
 * - Buto Ijo terlihat penuh (besar, lambat, tak terhentikan)
 * - Puncak ketegangan
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Item, Door, HidingSpot } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level5 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level5' });
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 500;
        this.isPaused = false;
        this.isGameOver = false;
    }

    create() {
        this.cameras.main.fadeIn(2000, 0, 0, 0); // Slower fade for dread

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createEnemies();
        this.createInteractables();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level5');

        this.time.delayedCall(2000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Ini... sarangnya. Buto Ijo ada di sini. Aku tidak boleh ketahuan.',
                avatar: null,
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        const worldWidth = width * 3;

        if (this.textures.exists('bg_level5')) {
            this.add.image(worldWidth / 2, height / 2, 'bg_level5')
                .setScrollFactor(0.2)
                .setDepth(-50)
                .setDisplaySize(worldWidth, height);
        } else {
             this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f0a)
                .setScrollFactor(0).setDepth(-50);
        }
    }

    createTilemap() {
        this.createPlaceholderLevel();
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Ground - bone and wood structure
        this.matter.add.rectangle(width * 1.5, groundY + 30, width * 3, 60, {
            isStatic: true, label: 'ground',
        });

        const groundGraphics = this.add.graphics();
        // Removed graphics
        
        // Bone/wood platforms
        const platforms = [
            { x: 300, y: groundY - 70, w: 100, h: 20 },
            { x: 550, y: groundY - 130, w: 80, h: 15 },
            { x: 800, y: groundY - 90, w: 120, h: 20 },
            { x: 1100, y: groundY - 150, w: 100, h: 20 },
            { x: 1400, y: groundY - 100, w: 140, h: 20 },
            { x: 1750, y: groundY - 80, w: 110, h: 20 },
            { x: 2100, y: groundY - 120, w: 130, h: 20 },
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

        // BUTO IJO - Main boss, huge, slow, terrifying
        const butoIjo = new Enemy(this, 1500, height - 200, 'buto_ijo', {
            type: 'buto_ijo',
            visionRange: 300,
            visionAngle: 90,
            patrolSpeed: 0.8,
            chaseSpeed: 2,
            scale: 2.5, // Much larger
        });
        butoIjo.setTarget(this.player);
        butoIjo.setPatrolPath([
            { x: 600, y: height - 200 },
            { x: 2000, y: height - 200 },
        ]);
        this.enemies.push(butoIjo);

        // Minion patrols
        const minion = new Enemy(this, 400, height - 150, 'enemy_minion', {
            type: 'minion',
            visionRange: 150,
            visionAngle: 60,
            patrolSpeed: 1.5,
            chaseSpeed: 3,
        });
        minion.setTarget(this.player);
        minion.setPatrolPath([
            { x: 200, y: height - 150 },
            { x: 800, y: height - 150 },
        ]);
        this.enemies.push(minion);
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;

        // Skull/bone hiding spots
        const hidingPositions = [
            { x: 250, y: height - 90 },
            { x: 650, y: height - 90 },
            { x: 1050, y: height - 90 },
            { x: 1500, y: height - 90 },
            { x: 1900, y: height - 90 },
        ];

        hidingPositions.forEach((pos) => {
            const spot = new HidingSpot(this, pos.x, pos.y, { texture: 'prop_skull_pile' });
            this.interactables.push(spot);
        });

        // Final shell fragment before Buto Ijo
        const fragment = new Item(this, 2000, height - 170, {
            id: 'shell_fragment_5',
            name: 'Pecahan Cangkang',
            description: 'Pecahan terakhir. Cangkang emas... hampir lengkap.',
            texture: 'item_shell_fragment',
        });
        this.interactables.push(fragment);

        // Exit - heavily guarded
        const exitDoor = new Door(this, 2700, height - 100, {
            isLocked: false,
            targetScene: 'Level6',
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }

    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.05, // Very dark
            darknessColor: 0x050a05, // Green-black
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 60, // Small light - vulnerability
            intensity: 0.6,
            flicker: true,
            flickerAmount: 0.2,
        });

        // Green torches
        const { height } = this.cameras.main;
        const torchPositions = [400, 900, 1400, 1900];
        torchPositions.forEach((x) => {
            this.lightingSystem.addLight(x, height - 150, {
                radius: 80,
                intensity: 0.4,
                color: 0x44ff44, // Eerie green
                flicker: true,
            });
        });
        
        // Make background visible
        this.lightingSystem.setAmbientLight(1);
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
        this.cameras.main.setBounds(0, 0, 1280 * 3, 720);
        this.cameras.main.setZoom(1.05); // Slight zoom for claustrophobia
    }

    setupAudio() {
        if (this.cache.audio.exists('bgm_level5')) {
            this.bgm = this.sound.add('bgm_level5', { volume: 0.35, loop: true });
            this.bgm.play();
            console.log('🎵 BGM Level 5 playing');
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
        this.cameras.main.shake(700, 0.03);
        this.cameras.main.flash(300, 50, 100, 50); // Green flash
        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(1500);
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
        if (this.isPaused || this.isGameOver) return;
        this.player.update(time, delta);
        this.enemies.forEach((enemy) => enemy.update(time, delta));
        this.lightingSystem.update(time, delta);

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

export default Level5;
