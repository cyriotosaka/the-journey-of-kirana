/**
 * 🎮 GAME MAIN - Entry point untuk Phaser
 *
 * Export fungsi untuk inisialisasi game dari React
 */

import Phaser from 'phaser';
import gameConfig from './config/gameConfig';

// Import scenes
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { Level1 } from './scenes/Level1';
import { Level2 } from './scenes/Level2';
import { GameOverScene } from './scenes/GameOverScene';

// All scenes
const SCENES = [
    BootScene,
    MainMenuScene,
    Level1,
    Level2,
    GameOverScene,
];

/**
 * Start Phaser game
 * @param {HTMLElement} parent - Container element
 * @returns {Phaser.Game}
 */
export function startGame(parent) {
    const config = {
        ...gameConfig,
        parent: parent,
        scene: SCENES,
    };

    const game = new Phaser.Game(config);
    return game;
}

/**
 * Destroy game instance
 * @param {Phaser.Game} game
 */
export function destroyGame(game) {
    if (game) {
        game.destroy(true);
    }
}

export default { startGame, destroyGame };
