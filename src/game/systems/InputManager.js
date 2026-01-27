/**
 * 🎮 INPUT MANAGER - Centralized keyboard input handling
 *
 * Menyediakan API yang clean untuk cek state keyboard
 * Support WASD dan Arrow Keys
 */

import Phaser from 'phaser';

export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};
        this.enabled = true;

        this.setupKeys();
    }

    setupKeys() {
        const keyboard = this.scene.input.keyboard;

        // Cursor keys
        this.cursors = keyboard.createCursorKeys();

        // Custom keys
        this.keys = {
            // Movement
            LEFT: this.cursors.left,
            RIGHT: this.cursors.right,
            UP: this.cursors.up,
            DOWN: this.cursors.down,

            // WASD
            W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),

            // Actions
            JUMP: this.cursors.space,
            HIDE: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            INTERACT: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            PAUSE: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        };
    }

    // Cek apakah key sedang ditekan
    isDown(keyName) {
        if (!this.enabled) return false;
        return this.keys[keyName]?.isDown || false;
    }

    // Cek apakah key baru saja ditekan (frame ini)
    justPressed(keyName) {
        if (!this.enabled) return false;
        return Phaser.Input.Keyboard.JustDown(this.keys[keyName]);
    }

    // Cek apakah key baru saja dilepas
    justReleased(keyName) {
        if (!this.enabled) return false;
        return Phaser.Input.Keyboard.JustUp(this.keys[keyName]);
    }

    // Get horizontal input (-1, 0, 1)
    getHorizontal() {
        if (!this.enabled) return 0;

        let h = 0;
        if (this.isDown('LEFT') || this.isDown('A')) h -= 1;
        if (this.isDown('RIGHT') || this.isDown('D')) h += 1;
        return h;
    }

    // Get vertical input (-1, 0, 1)
    getVertical() {
        if (!this.enabled) return 0;

        let v = 0;
        if (this.isDown('UP') || this.isDown('W')) v -= 1;
        if (this.isDown('DOWN') || this.isDown('S')) v += 1;
        return v;
    }

    // Convenience methods
    isJumpPressed() {
        return this.isDown('JUMP') || this.isDown('W') || this.isDown('UP');
    }

    isJumpJustPressed() {
        return this.justPressed('JUMP') || this.justPressed('W') || this.justPressed('UP');
    }

    isHidePressed() {
        return this.isDown('HIDE');
    }

    isInteractJustPressed() {
        return this.justPressed('INTERACT');
    }

    isPauseJustPressed() {
        return this.justPressed('PAUSE');
    }

    // Enable/disable
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    destroy() {
        Object.values(this.keys).forEach((key) => {
            if (key && key.removeAllListeners) {
                key.removeAllListeners();
            }
        });
        this.keys = {};
    }
}

export default InputManager;
