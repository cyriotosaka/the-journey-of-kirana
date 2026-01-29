/**
 * 🐚 LEVEL 6 - Kebenaran Keong Mas
 *
 * Emosi: Haru → Bangkit
 * - Dunia berubah tenang
 * - Cahaya emas memenuhi layar
 * - Story heavy + light gameplay
 * - Revealed: Keong = Putri yang dikutuk
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Item, Door } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level6 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level6' });
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 500;
        this.isPaused = false;
        this.isGameOver = false;
    }

    create() {
        this.cameras.main.fadeIn(3000, 255, 220, 150); // Golden fade

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createInteractables();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level6');

        // Story sequence
        this.time.delayedCall(2000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Keong Mas',
                text: '...',
                avatar: null,
            });
        });

        this.time.delayedCall(5000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Keong Mas',
                text: 'Kirana... terima kasih telah membawaku sejauh ini.',
                avatar: null,
            });
        });

        this.time.delayedCall(9000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Keong Mas',
                text: 'Aku adalah Dewi Galuh, putri kerajaan yang dikutuk oleh Buto Ijo.',
                avatar: null,
            });
        });

        this.time.delayedCall(14000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Jadi... cahaya ini... adalah kekuatanmu?',
                avatar: null,
            });
        });

        this.time.delayedCall(18000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Keong Mas',
                text: 'Ya. Dan keberanianmu yang membangunkannya. Kita harus menghadapi Buto Ijo... bersama.',
                avatar: null,
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // Golden, ethereal atmosphere
        if (this.textures.exists('bg_level6_layer1')) {
            this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg_level6_layer1')
                .setOrigin(0).setScrollFactor(0).setDepth(-50).setDisplaySize(width, height);
        } else {
            // Golden gradient fallback
            this.add.rectangle(0, 0, width * 2, height, 0xfff8e0).setOrigin(0).setScrollFactor(0).setDepth(-50);
        }

        if (this.textures.exists('bg_level6_layer2')) {
            this.bgLayer2 = this.add.tileSprite(0, 0, width, height, 'bg_level6_layer2')
                .setOrigin(0).setScrollFactor(0).setDepth(-40).setDisplaySize(width, height);
        }

        if (this.textures.exists('bg_level6_layer3')) {
            this.bgLayer3 = this.add.tileSprite(0, 0, width, height, 'bg_level6_layer3')
                .setOrigin(0).setScrollFactor(0).setDepth(-30).setDisplaySize(width, height);
        }

        if (this.textures.exists('bg_level6_layer4')) {
            this.bgLayer4 = this.add.tileSprite(0, 0, width, height, 'bg_level6_layer4')
                .setOrigin(0).setScrollFactor(0).setDepth(-20).setDisplaySize(width, height);
        }
    }

    createTilemap() {
        this.createPlaceholderLevel();
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Ethereal ground - golden path
        this.matter.add.rectangle(width, groundY + 30, width * 2, 60, {
            isStatic: true, label: 'ground',
        });

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0xd4af37);
        groundGraphics.fillRect(0, groundY, width * 2, 60);

        // Simple platforms - meditation spots
        const platforms = [
            { x: 400, y: groundY - 80, w: 150, h: 20 },
            { x: 800, y: groundY - 60, w: 200, h: 20 },
            { x: 1200, y: groundY - 90, w: 180, h: 20 },
        ];

        platforms.forEach((p) => {
            this.matter.add.rectangle(p.x, p.y + p.h / 2, p.w, p.h, {
                isStatic: true, label: 'platform',
            });

            const platformGraphics = this.add.graphics();
            platformGraphics.fillStyle(0xe6c85e);
            platformGraphics.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
        });

        this.matter.world.setBounds(0, 0, width * 2, height);
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
    }

    // No enemies in this level - story focus
    createEnemies() {
        this.enemies = [];
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;

        // Keong Emas (completed shell)
        const shell = new Item(this, 1000, height - 150, {
            id: 'keong_emas_complete',
            name: 'Keong Emas',
            description: 'Cangkang emas lengkap. Bersiap untuk pertarungan terakhir.',
            texture: 'item_keong_emas',
        });
        this.interactables.push(shell);

        // Exit to final level
        const exitDoor = new Door(this, 1800, height - 100, {
            isLocked: false,
            targetScene: 'Level7',
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }

    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.5, // Bright, safe
            darknessColor: 0xfff5d4, // Golden tint
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 150, // Large protective light
            intensity: 1.0,
            flicker: false,
            color: 0xffd700, // Golden
        });
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, 1280 * 2, 720);
    }

    setupAudio() {
        if (this.cache.audio.exists('bgm_level6')) {
            this.bgm = this.sound.add('bgm_level6', { volume: 0.4, loop: true });
            this.bgm.play();
            console.log('🎵 BGM Level 6 playing');
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
        // No game over in this peaceful level
    }

    onPause() { this.isPaused = true; this.matter.world.pause(); this.player.inputManager.disable(); }
    onResume() { this.isPaused = false; this.matter.world.resume(); this.player.inputManager.enable(); }
    onDialogShow() { this.onPause(); }
    onDialogHide() { this.onResume(); }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;
        this.player.update(time, delta);
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

export default Level6;
