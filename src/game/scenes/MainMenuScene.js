/**
 * 🎮 MAIN MENU SCENE - Menu utama dalam Phaser
 *
 * Bisa digunakan sebagai alternatif atau bersama React MainMenu
 * Animated background dengan atmosphere gelap
 */

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../systems/EventBus';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        this.createBackground(width, height);
        this.createTitle(width, height);
        this.createMenuOptions(width, height);
        this.createParticles(width, height);
        this.setupInput();
        this.playMusic();

        // Fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Emit ready
        GameEvents.gameReady();
    }

    createBackground(width, height) {
        // Dark gradient background
        const bgGraphics = this.add.graphics();
        
        // Create gradient effect
        for (let i = 0; i < height; i++) {
            const alpha = i / height;
            const r = Math.floor(10 + alpha * 5);
            const g = Math.floor(10 + alpha * 3);
            const b = Math.floor(20 + alpha * 5);
            const color = Phaser.Display.Color.GetColor(r, g, b);
            
            bgGraphics.fillStyle(color, 1);
            bgGraphics.fillRect(0, i, width, 1);
        }

        // Fog layers
        if (this.textures.exists('bg_fog')) {
            this.fog1 = this.add.tileSprite(0, height - 200, width, 200, 'bg_fog')
                .setOrigin(0)
                .setAlpha(0.3)
                .setDepth(1);

            this.fog2 = this.add.tileSprite(0, height - 150, width, 150, 'bg_fog')
                .setOrigin(0)
                .setAlpha(0.2)
                .setDepth(2);
        }

        // Vignette
        const vignette = this.add.graphics();
        vignette.setDepth(50);
        
        for (let i = 0; i < 10; i++) {
            const alpha = (i / 10) * 0.5;
            const radius = Math.max(width, height) * (1 - i / 10);
            
            vignette.fillStyle(0x000000, alpha);
            vignette.fillCircle(width / 2, height / 2, radius);
        }
    }

    createTitle(width, height) {
        // Subtitle
        this.add.text(width / 2, height * 0.25, 'THE JOURNEY OF', {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: '#808080',
            letterSpacing: 8,
        }).setOrigin(0.5).setDepth(10);

        // Main title
        this.titleText = this.add.text(width / 2, height * 0.35, 'KIRANA', {
            fontFamily: 'Georgia, serif',
            fontSize: '96px',
            color: '#d4af37',
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(10);

        // Glow effect
        this.tweens.add({
            targets: this.titleText,
            alpha: { from: 0.8, to: 1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Tagline
        this.add.text(width / 2, height * 0.45, '"Dalam kegelapan, cangkang emas adalah satu-satunya perlindungan"', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#606060',
            fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(10);
    }

    createMenuOptions(width, height) {
        this.menuOptions = [
            { text: 'MULAI PETUALANGAN', action: 'start', enabled: true },
            { text: 'LANJUTKAN', action: 'continue', enabled: false },
            { text: 'PENGATURAN', action: 'settings', enabled: false },
            { text: 'KREDIT', action: 'credits', enabled: true },
        ];

        this.selectedIndex = 0;
        this.menuTexts = [];

        const startY = height * 0.55;
        const spacing = 50;

        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            
            const text = this.add.text(width / 2, y, option.text, {
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                color: option.enabled ? '#a0a0a0' : '#404040',
            })
            .setOrigin(0.5)
            .setDepth(10)
            .setInteractive({ useHandCursor: option.enabled });

            if (option.enabled) {
                text.on('pointerover', () => {
                    this.selectOption(index);
                });

                text.on('pointerdown', () => {
                    this.confirmSelection();
                });
            }

            this.menuTexts.push(text);
        });

        // Cursor
        this.cursor = this.add.text(width / 2 - 150, startY, '▶', {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#d4af37',
        }).setOrigin(0.5).setDepth(10);

        // Animate cursor
        this.tweens.add({
            targets: this.cursor,
            x: this.cursor.x - 5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.updateMenuSelection();

        // Controls hint
        this.add.text(width / 2, height - 40, '↑↓ Navigasi  •  ENTER Pilih', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#404040',
        }).setOrigin(0.5).setDepth(10);
    }

    createParticles(width, height) {
        // Floating dust particles
        if (!this.textures.exists('particle')) {
            // Create simple particle texture
            const graphics = this.add.graphics();
            graphics.fillStyle(0xd4af37, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('particle_menu', 8, 8);
            graphics.destroy();
        }

        this.particles = this.add.particles(0, 0, 'particle_menu', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.4, end: 0 },
            speed: { min: 5, max: 20 },
            angle: { min: -90, max: -70 },
            lifespan: 4000,
            frequency: 500,
            quantity: 1,
        });
        this.particles.setDepth(5);
    }

    setupInput() {
        // Keyboard
        this.input.keyboard.on('keydown-UP', () => this.navigateUp());
        this.input.keyboard.on('keydown-DOWN', () => this.navigateDown());
        this.input.keyboard.on('keydown-W', () => this.navigateUp());
        this.input.keyboard.on('keydown-S', () => this.navigateDown());
        this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
        this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
    }

    navigateUp() {
        let newIndex = this.selectedIndex - 1;
        while (newIndex >= 0 && !this.menuOptions[newIndex].enabled) {
            newIndex--;
        }
        if (newIndex >= 0) {
            this.selectOption(newIndex);
        }
    }

    navigateDown() {
        let newIndex = this.selectedIndex + 1;
        while (newIndex < this.menuOptions.length && !this.menuOptions[newIndex].enabled) {
            newIndex++;
        }
        if (newIndex < this.menuOptions.length) {
            this.selectOption(newIndex);
        }
    }

    selectOption(index) {
        if (!this.menuOptions[index].enabled) return;
        
        this.selectedIndex = index;
        this.updateMenuSelection();
        
        // Play sound
        if (this.cache.audio.exists('sfx_menu_move')) {
            this.sound.play('sfx_menu_move', { volume: 0.3 });
        }
    }

    updateMenuSelection() {
        const startY = this.cameras.main.height * 0.55;
        const spacing = 50;

        this.menuTexts.forEach((text, index) => {
            const option = this.menuOptions[index];
            
            if (index === this.selectedIndex) {
                text.setColor('#d4af37');
                text.setScale(1.1);
            } else {
                text.setColor(option.enabled ? '#a0a0a0' : '#404040');
                text.setScale(1);
            }
        });

        // Move cursor
        this.cursor.y = startY + this.selectedIndex * spacing;
    }

    confirmSelection() {
        const option = this.menuOptions[this.selectedIndex];
        if (!option.enabled) return;

        // Play sound
        if (this.cache.audio.exists('sfx_menu_select')) {
            this.sound.play('sfx_menu_select', { volume: 0.4 });
        }

        switch (option.action) {
            case 'start':
                this.startGame();
                break;
            case 'continue':
                // TODO: Load saved game
                break;
            case 'settings':
                // TODO: Show settings
                break;
            case 'credits':
                this.showCredits();
                break;
        }
    }

    startGame() {
        // Fade out music
        if (this.bgm) {
            this.tweens.add({
                targets: this.bgm,
                volume: 0,
                duration: 1000,
            });
        }

        this.cameras.main.fadeOut(1500, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            EventBus.emit('menu:start_new_game');
            this.scene.start('Level1');
        });
    }

    showCredits() {
        // Simple credits overlay
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9)
            .setDepth(100);

        const creditsText = this.add.text(width / 2, height / 2 - 100, 
            'THE JOURNEY OF KIRANA\n\n' +
            'Dikembangkan oleh\nTim Keong Balap\n\n' +
            'Inspirasi\nLittle Nightmares • Inside • Limbo\n' +
            'Cerita Rakyat: Keong Mas\n\n' +
            'Teknologi\nPhaser 3 • React • Zustand • Gemini AI',
            {
                fontFamily: 'Georgia, serif',
                fontSize: '20px',
                color: '#d4af37',
                align: 'center',
                lineSpacing: 10,
            }
        ).setOrigin(0.5).setDepth(101);

        const backButton = this.add.text(width / 2, height - 100, 'Tekan ESC atau ENTER untuk kembali', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#606060',
        }).setOrigin(0.5).setDepth(101);

        const closeCredits = () => {
            overlay.destroy();
            creditsText.destroy();
            backButton.destroy();
        };

        this.input.keyboard.once('keydown-ESC', closeCredits);
        this.input.keyboard.once('keydown-ENTER', closeCredits);
        overlay.setInteractive().once('pointerdown', closeCredits);
    }

    playMusic() {
        if (this.cache.audio.exists('bgm_menu')) {
            this.bgm = this.sound.add('bgm_menu', { volume: 0.4, loop: true });
            this.bgm.play();
        }
    }

    update(time, delta) {
        // Animate fog
        if (this.fog1) {
            this.fog1.tilePositionX += 0.2;
        }
        if (this.fog2) {
            this.fog2.tilePositionX -= 0.1;
        }
    }

    shutdown() {
        if (this.bgm) {
            this.bgm.stop();
        }
    }
}

export default MainMenuScene;
