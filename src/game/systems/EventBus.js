/**
 * 🌉 EVENT BUS - Bridge between Phaser and React
 *
 * Phaser Game mengirim event → React UI menerima dan update
 * React UI trigger action → Phaser Game merespon
 */

import Phaser from 'phaser';

// Singleton EventEmitter yang bisa diakses dari mana saja
export const EventBus = new Phaser.Events.EventEmitter();

/**
 * EVENT CONSTANTS - Daftar semua event yang digunakan
 */
export const EVENTS = {
    // Game State Events
    GAME_READY: 'game:ready',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    LEVEL_COMPLETE: 'level:complete',
    GAME_OVER: 'game:over',

    // Player Events
    PLAYER_HEALTH_CHANGED: 'player:health:changed',
    PLAYER_DIED: 'player:died',
    PLAYER_HIDING: 'player:hiding',
    PLAYER_REVEALED: 'player:revealed',

    // Inventory Events
    ITEM_COLLECTED: 'item:collected',
    ITEM_USED: 'item:used',
    INVENTORY_UPDATED: 'inventory:updated',

    // Dialog Events
    DIALOG_SHOW: 'dialog:show',
    DIALOG_HIDE: 'dialog:hide',
    DIALOG_NEXT: 'dialog:next',

    // UI Events
    MENU_OPEN: 'menu:open',
    MENU_CLOSE: 'menu:close',

    // Scene Events
    SCENE_CHANGED: 'scene:changed',
};

/**
 * Helper Functions untuk emit events dengan type-safety
 */
export const GameEvents = {
    // Health Management
    updateHealth: (currentHealth, maxHealth) => {
        EventBus.emit(EVENTS.PLAYER_HEALTH_CHANGED, {
            currentHealth,
            maxHealth,
        });
    },

    // Inventory Management
    collectItem: (item) => {
        EventBus.emit(EVENTS.ITEM_COLLECTED, item);
    },

    updateInventory: (inventory) => {
        EventBus.emit(EVENTS.INVENTORY_UPDATED, inventory);
    },

    // Dialog System
    showDialog: (character, text, options = {}) => {
        EventBus.emit(EVENTS.DIALOG_SHOW, { character, text, ...options });
    },

    hideDialog: () => {
        EventBus.emit(EVENTS.DIALOG_HIDE);
    },

    // Game State
    gameReady: () => {
        EventBus.emit(EVENTS.GAME_READY);
    },

    pauseGame: () => {
        EventBus.emit(EVENTS.GAME_PAUSED);
    },

    resumeGame: () => {
        EventBus.emit(EVENTS.GAME_RESUMED);
    },

    gameOver: (reason) => {
        EventBus.emit(EVENTS.GAME_OVER, { reason });
    },

    levelComplete: (levelId) => {
        EventBus.emit(EVENTS.LEVEL_COMPLETE, { levelId });
    },
};

/**
 * Cleanup function untuk mencegah memory leaks
 */
export const cleanupEventBus = () => {
    EventBus.removeAllListeners();
};
