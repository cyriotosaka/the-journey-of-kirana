/**
 * 💀 GAME OVER SCENE - Layar game over
 *
 * Ditampilkan saat Kirana mati
 * Opsi: Coba Lagi atau Kembali ke Menu
 */

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../systems/EventBus';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.reason = data?.reason || 'Kirana telah pergi...';
        this.previousScene = data?.previousScene || 'Level1';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark red background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0000);

        // Blood drip effect (subtle)
        this.createBloodDrips(width, height);

        // Game Over text
        this.add.text(width / 2, height * 0.3, 'KIRANA TELAH PERGI', {
            fontFamily: 'Georgia, serif',
            fontSize: '48px',
            color: '#8b0000',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Reason text
        this.add.text(width / 2, height * 0.42, this.reason, {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#606060',
            fontStyle: 'italic',
        }).setOrigin(0.5);

        // Menu options
        this.createMenuOptions(width, height);

        // Fade in
        this.cameras.main.fadeIn(2000, 10, 0, 0);

        // Sad music
        this.playMusic();
    }

    createBloodDrips(width, height) {
        const graphics = this.add.graphics();
        
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const drip = {
                x,
                y: 0,
                length: Phaser.Math.Between(50, 200),
                width: Phaser.Math.Between(2, 5),
                speed: Phaser.Math.Between(1, 3),
                alpha: Phaser.Math.FloatBetween(0.1, 0.3),
            };

            graphics.fillStyle(0x400000, drip.alpha);
            graphics.fillRect(drip.x, drip.y, drip.width, drip.length);
        }
    }

    createMenuOptions(width, height) {
        const options = [
            { text: 'Coba Lagi', action: 'retry' },
            { text: 'Kembali ke Menu', action: 'menu' },
        ];

        this.selectedIndex = 0;
        this.menuTexts = [];

        const startY = height * 0.6;
        const spacing = 50;

        options.forEach((option, index) => {
            const y = startY + index * spacing;

            const text = this.add.text(width / 2, y, option.text, {
                fontFamily: 'Georgia, serif',
                fontSize: '28px',
                color: '#808080',
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            text.on('pointerover', () => this.selectOption(index));
            text.on('pointerdown', () => this.confirmSelection(option.action));

            this.menuTexts.push(text);
        });

        this.updateMenuSelection();

        // Keyboard
        this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
        this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
        this.input.keyboard.on('keydown-W', () => this.navigate(-1));
        this.input.keyboard.on('keydown-S', () => this.navigate(1));
        this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection(options[this.selectedIndex].action));
        this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection(options[this.selectedIndex].action));
    }

    navigate(direction) {
        this.selectedIndex = Phaser.Math.Wrap(
            this.selectedIndex + direction,
            0,
            this.menuTexts.length
        );
        this.updateMenuSelection();
    }

    selectOption(index) {
        this.selectedIndex = index;
        this.updateMenuSelection();
    }

    updateMenuSelection() {
        this.menuTexts.forEach((text, index) => {
            if (index === this.selectedIndex) {
                text.setColor('#d4af37');
                text.setScale(1.1);
            } else {
                text.setColor('#808080');
                text.setScale(1);
            }
        });
    }

    confirmSelection(action) {
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.bgm) this.bgm.stop();

            if (action === 'retry') {
                EventBus.emit('game:restart');
                this.scene.start(this.previousScene);
            } else {
                EventBus.emit('game:return_to_menu');
                this.scene.start('MainMenuScene');
            }
        });
    }

    playMusic() {
        if (this.cache.audio.exists('bgm_gameover')) {
            this.bgm = this.sound.add('bgm_gameover', { volume: 0.3, loop: false });
            this.bgm.play();
        }
    }

    shutdown() {
        if (this.bgm) this.bgm.stop();
    }
}

export default GameOverScene;
