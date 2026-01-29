/**
 * 🌅 LEVEL 7 - Pembebasan
 *
 * Emosi: Tegang → Lega → Bahagia
 * - Final cinematic level
 * - Konfrontasi tanpa pertarungan
 * - Cahaya keong menghapus kutukan
 * - Buto Ijo melemah oleh ketamakannya
 * - Dunia kembali hidup
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Door } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level7 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level7' });
        this.confrontationPhase = 0;
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 500;
        this.isPaused = false;
        this.isGameOver = false;
        this.confrontationPhase = 0;
    }

    create() {
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createButoIjo();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level7');

        // Start confrontation sequence
        this.time.delayedCall(2000, () => this.startConfrontation());
    }

    startConfrontation() {
        this.confrontationPhase = 1;

        // Phase 1: Buto Ijo confronts
        EventBus.emit(EVENTS.DIALOG_SHOW, {
            character: 'Buto Ijo',
            text: 'KIRANA! Kau tidak akan bisa lari lagi! Keong itu milikku!',
            avatar: null,
        });

        this.time.delayedCall(5000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Tidak! Cahaya ini bukan milikmu... dan tidak pernah!',
                avatar: null,
            });
            this.confrontationPhase = 2;
        });

        this.time.delayedCall(10000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Keong Mas',
                text: 'Kirana, percaya padaku. Biarkan cahaya ini menunjukkan jalannya.',
                avatar: null,
            });
            this.startLightExpansion();
        });

        this.time.delayedCall(15000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Buto Ijo',
                text: 'TIDAK! Cahayanya... TERLALU TERANG!',
                avatar: null,
            });
            this.butoIjoWeakens();
        });

        this.time.delayedCall(20000, () => {
            this.victorySequence();
        });
    }

    startLightExpansion() {
        // Golden light expands from player
        if (this.lightingSystem && this.lightingSystem.playerLight) {
            this.tweens.add({
                targets: this.lightingSystem.playerLight,
                radius: 500,
                intensity: 1.5,
                duration: 5000,
                ease: 'Quad.easeOut',
            });
        }

        // Background brightens
        this.tweens.add({
            targets: this.cameras.main,
            duration: 5000,
            onUpdate: (tween) => {
                const progress = tween.progress;
                const r = Math.floor(255 * progress);
                const g = Math.floor(230 * progress);
                const b = Math.floor(150 * progress);
                // Gradual flash
            },
        });
    }

    butoIjoWeakens() {
        if (this.butoIjo) {
            this.tweens.add({
                targets: this.butoIjo,
                alpha: 0.3,
                scale: 0.5,
                duration: 3000,
                ease: 'Quad.easeIn',
            });
        }
    }

    victorySequence() {
        this.confrontationPhase = 4;

        EventBus.emit(EVENTS.DIALOG_SHOW, {
            character: 'Narrator',
            text: 'Kutukan telah diangkat. Dewi Galuh bebas.',
            avatar: null,
        });

        this.time.delayedCall(4000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Dewi Galuh',
                text: 'Terima kasih, Kirana. Keberanianmu telah menyelamatkan kami semua.',
                avatar: null,
            });
        });

        this.time.delayedCall(8000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Kita... berhasil?',
                avatar: null,
            });
        });

        this.time.delayedCall(12000, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Dewi Galuh',
                text: 'Ya. Sekarang saatnya pulang.',
                avatar: null,
            });
        });

        // Final fade to credits
        this.time.delayedCall(16000, () => {
            this.cameras.main.fadeOut(3000, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.cleanup();
                // Go to credits or main menu
                EventBus.emit('game:complete');
                this.scene.start('BootScene'); // Return to start
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // Dramatic arena - shifting from dark to light
        if (this.textures.exists('bg_level7_layer1')) {
            this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg_level7_layer1')
                .setOrigin(0).setScrollFactor(0).setDepth(-50).setDisplaySize(width, height);
        } else {
            this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0).setScrollFactor(0).setDepth(-50);
        }

        if (this.textures.exists('bg_level7_layer2')) {
            this.bgLayer2 = this.add.tileSprite(0, 0, width, height, 'bg_level7_layer2')
                .setOrigin(0).setScrollFactor(0).setDepth(-40).setDisplaySize(width, height);
        }

        if (this.textures.exists('bg_level7_layer3')) {
            this.bgLayer3 = this.add.tileSprite(0, 0, width, height, 'bg_level7_layer3')
                .setOrigin(0).setScrollFactor(0).setDepth(-30).setDisplaySize(width, height);
        }

        if (this.textures.exists('bg_level7_layer4')) {
            this.bgLayer4 = this.add.tileSprite(0, 0, width, height, 'bg_level7_layer4')
                .setOrigin(0).setScrollFactor(0).setDepth(-20).setDisplaySize(width, height);
        }
    }

    createTilemap() {
        this.createPlaceholderLevel();
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Arena floor
        this.matter.add.rectangle(width / 2, groundY + 30, width, 60, {
            isStatic: true, label: 'ground',
        });

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x2a2a3a);
        groundGraphics.fillRect(0, groundY, width, 60);

        // Walls to contain the arena
        this.matter.add.rectangle(30, height / 2, 60, height, { isStatic: true });
        this.matter.add.rectangle(width - 30, height / 2, 60, height, { isStatic: true });

        this.matter.world.setBounds(0, 0, width, height);
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
    }

    createButoIjo() {
        const { width, height } = this.cameras.main;

        // Buto Ijo placeholder - will be animated during confrontation
        this.butoIjo = this.add.sprite(width - 200, height - 200, 'buto_ijo')
            .setScale(3)
            .setTint(0x44ff44)
            .setDepth(5);

        // If no texture, create placeholder
        if (!this.textures.exists('buto_ijo')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x225522);
            graphics.fillRect(width - 300, height - 350, 200, 300);
            graphics.fillStyle(0xff0000);
            graphics.fillCircle(width - 250, height - 300, 15); // Eyes
            graphics.fillCircle(width - 150, height - 300, 15);
        }
    }

    createLighting() {
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.15,
            darknessColor: 0x0a0a15,
        });

        this.lightingSystem.addPlayerLight(this.player, {
            radius: 100,
            intensity: 0.9,
            flicker: true,
            color: 0xffd700, // Golden
        });
    }

    setupCamera() {
        // Fixed camera for arena
        this.cameras.main.setBounds(0, 0, 1280, 720);
    }

    setupAudio() {
        if (this.cache.audio.exists('bgm_finale')) {
            this.bgm = this.sound.add('bgm_finale', { volume: 0.4, loop: true });
            this.bgm.play();
        }
    }

    setupEvents() {
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

    onPause() { this.isPaused = true; this.matter.world.pause(); this.player.inputManager.disable(); }
    onResume() { this.isPaused = false; this.matter.world.resume(); this.player.inputManager.enable(); }
    onDialogShow() { this.onPause(); }
    onDialogHide() { this.onResume(); }

    update(time, delta) {
        if (this.isPaused) return;
        this.player.update(time, delta);
        this.lightingSystem.update(time, delta);

        // Subtle parallax in arena
        const camX = this.cameras.main.scrollX;
        if (this.bgLayer1) this.bgLayer1.tilePositionX = camX * 0.05;
        if (this.bgLayer2) this.bgLayer2.tilePositionX = camX * 0.1;
        if (this.bgLayer3) this.bgLayer3.tilePositionX = camX * 0.15;
        if (this.bgLayer4) this.bgLayer4.tilePositionX = camX * 0.2;
    }

    cleanup() {
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

export default Level7;
