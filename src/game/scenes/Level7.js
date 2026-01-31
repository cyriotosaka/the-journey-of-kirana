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
        const { width, height } = this.cameras.main;

        // Spawn Boss Visual
        if (this.textures.exists('giant_idle')) {
            this.boss = this.add.sprite(width - 300, height - 150, 'giant_idle').setScale(1.5).setDepth(10);
            this.boss.play('giant_idle');
            this.boss.setFlipX(true); // Face player
        }

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
        const worldWidth = width * 3;

        if (this.textures.exists('bg_level7')) {
            this.add.image(worldWidth / 2, height / 2, 'bg_level7')
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

        // Arena floor
        this.matter.add.rectangle(width / 2, groundY + 30, width, 60, {
            isStatic: true, label: 'ground',
        });

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
        this.enemies = [];

        // Buto Ijo Boss
        this.butoIjo = new Enemy(this, width - 200, height - 150, 'buto_ijo', {
            type: 'buto_ijo',
            visionRange: 1000, // Always sees player
            visionAngle: 360,
            patrolSpeed: 2,
            chaseSpeed: 5, // Fast!
            scale: 3,
            health: 500, // Boss Health
            damage: 20,
        });
        
        this.butoIjo.setTarget(this.player);
        this.enemies.push(this.butoIjo);
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
        
        // Make background visible
        this.lightingSystem.setAmbientLight(1);
    }

    setupCamera() {
        const { width, height } = this.scale;
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.startFollow(this.player);
    }

    setupAudio() {
        this.bgm = this.sound.add('bgm_level7', { loop: true, volume: 0.5 });
        this.bgm.play();
    }

    setupEvents() {
        EventBus.on(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.on(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.on(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.on(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        
        // Settings events
        EventBus.on('settings:volume_changed', (data) => {
             if (this.bgm) this.bgm.setVolume(data.bgm);
        }, this);

        // DEV events
        EventBus.on('dev:switch_level', this.onDevSwitchLevel, this);
        EventBus.on('dev:set_health', this.onDevSetHealth, this);
        EventBus.on('dev:toggle_invincible', this.onDevToggleInvincible, this);
    }

    onDevSwitchLevel(levelKey) { this.cleanup(); this.scene.start(levelKey); }
    onDevSetHealth(health) { if (this.player) this.player.currentHealth = health; }
    onDevToggleInvincible() { if (this.player) this.player.isInvincible = !this.player.isInvincible; }

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
        if (this.isPaused) return;
        this.player.update(time, delta);
        this.lightingSystem.update(time, delta);

        // Update Enemies (Buto Ijo)
        if (this.enemies) {
            this.enemies.forEach(enemy => enemy.update(time, delta));
        }

        // Victory Condition: Check if Buto Ijo is Dead
        if (this.butoIjo && this.butoIjo.isDead && !this.victoryTriggered) {
             this.victoryTriggered = true;
             this.handleVictory();
        }

        // Subtle parallax in arena
        const camX = this.cameras.main.scrollX;
        if (this.bgLayer1) this.bgLayer1.tilePositionX = camX * 0.05;
        if (this.bgLayer2) this.bgLayer2.tilePositionX = camX * 0.1;
        if (this.bgLayer3) this.bgLayer3.tilePositionX = camX * 0.15;
        if (this.bgLayer4) this.bgLayer4.tilePositionX = camX * 0.2;
    }

    handleVictory() {
        this.player.inputManager.disable();
        this.matter.world.pause();
        
        EventBus.emit(EVENTS.DIALOG_SHOW, {
            character: 'Kirana',
            text: 'Akhirnya... Buto Ijo telah dikalahkan! Keong Emas telah kembali.',
            choices: [{ text: 'Tamat', action: 'menu' }]
        });
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
