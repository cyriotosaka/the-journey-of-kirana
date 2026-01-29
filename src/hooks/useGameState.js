/**
 * 🎣 CUSTOM HOOK - useGameState
 *
 * Menghubungkan EventBus (Phaser) dengan Zustand Store (React)
 * Otomatis sinkronisasi state saat Phaser emit events
 */

import { useEffect } from 'react';
import { EventBus, EVENTS } from '../game/systems/EventBus';
import useGameStore from '../stores/useGameStore';

export const useGameState = () => {
    const store = useGameStore();

    useEffect(() => {
        // ========== LISTENER: PLAYER HEALTH ==========
        const onHealthChanged = ({ currentHealth, maxHealth }) => {
            store.updatePlayerHealth(currentHealth, maxHealth);
        };

        // ========== LISTENER: PLAYER DIED ==========
        const onPlayerDied = () => {
            store.setPlayerDead(true);
            store.showDialog({
                character: 'Game Over',
                text: 'Kirana telah meninggal... Dunia gelap menelan harapannya.',
                choices: [
                    { text: 'Coba Lagi', action: 'restart' },
                    { text: 'Kembali ke Menu', action: 'menu' },
                ],
            });
        };

        // ========== LISTENER: PLAYER HIDING STATE ==========
        const onPlayerHiding = () => {
            store.setPlayerHiding(true);
        };

        const onPlayerRevealed = () => {
            store.setPlayerHiding(false);
        };

        // ========== LISTENER: INVENTORY ==========
        const onItemCollected = (item) => {
            store.addItem(item);

            // Show toast notification instead of blocking dialog
            store.addToast({
                id: Date.now(),
                type: 'success',
                message: `Mendapatkan: ${item.name}`,
                duration: 2000,
            });
        };

        const onInventoryUpdated = (inventory) => {
            // Update inventory dari Phaser jika ada perubahan eksternal
            console.log('Inventory updated from Phaser:', inventory);
        };

        // ========== LISTENER: DIALOG ==========
        const onDialogShow = ({
            character,
            text,
            avatar,
            choices,
            onClose,
        }) => {
            store.showDialog({ character, text, avatar, choices, onClose });
        };

        const onDialogHide = () => {
            store.hideDialog();
        };

        // ========== LISTENER: GAME STATE ==========
        const onGameReady = () => {
            store.setGameReady(true);
        };

        const onGamePaused = () => {
            store.setPaused(true);
        };

        const onGameResumed = () => {
            store.setPaused(false);
        };

        const onGameOver = ({ reason }) => {
            store.showDialog({
                character: 'Game Over',
                text: reason || 'Perjalanan Kirana berakhir...',
                choices: [
                    { text: 'Main Lagi', action: 'restart' },
                    { text: 'Menu Utama', action: 'menu' },
                ],
            });
        };

        const onLevelComplete = ({ levelId }) => {
            store.showDialog({
                character: 'Level Complete!',
                text: `Kirana berhasil melewati ${levelId}!`,
                choices: [{ text: 'Lanjut', action: 'next_level' }],
            });
        };

        const onSceneChanged = (sceneName) => {
            console.log('📍 Scene changed:', sceneName);
            store.setCurrentScene(sceneName);
        };

        // ========== REGISTER SEMUA LISTENERS ==========
        EventBus.on(EVENTS.PLAYER_HEALTH_CHANGED, onHealthChanged);
        EventBus.on(EVENTS.PLAYER_DIED, onPlayerDied);
        EventBus.on(EVENTS.PLAYER_HIDING, onPlayerHiding);
        EventBus.on(EVENTS.PLAYER_REVEALED, onPlayerRevealed);
        EventBus.on(EVENTS.ITEM_COLLECTED, onItemCollected);
        EventBus.on(EVENTS.INVENTORY_UPDATED, onInventoryUpdated);
        EventBus.on(EVENTS.DIALOG_SHOW, onDialogShow);
        EventBus.on(EVENTS.DIALOG_HIDE, onDialogHide);
        EventBus.on(EVENTS.GAME_READY, onGameReady);
        EventBus.on(EVENTS.GAME_PAUSED, onGamePaused);
        EventBus.on(EVENTS.GAME_RESUMED, onGameResumed);
        EventBus.on(EVENTS.GAME_OVER, onGameOver);
        EventBus.on(EVENTS.LEVEL_COMPLETE, onLevelComplete);
        EventBus.on(EVENTS.SCENE_CHANGED, onSceneChanged);
        
        // Loading complete listener
        const onLoadingComplete = () => {
            store.setLoading(false);
        };
        EventBus.on('loading:complete', onLoadingComplete);

        // ========== CLEANUP SAAT COMPONENT UNMOUNT ==========
        return () => {
            EventBus.off(EVENTS.PLAYER_HEALTH_CHANGED, onHealthChanged);
            EventBus.off(EVENTS.PLAYER_DIED, onPlayerDied);
            EventBus.off(EVENTS.PLAYER_HIDING, onPlayerHiding);
            EventBus.off(EVENTS.PLAYER_REVEALED, onPlayerRevealed);
            EventBus.off(EVENTS.ITEM_COLLECTED, onItemCollected);
            EventBus.off(EVENTS.INVENTORY_UPDATED, onInventoryUpdated);
            EventBus.off(EVENTS.DIALOG_SHOW, onDialogShow);
            EventBus.off(EVENTS.DIALOG_HIDE, onDialogHide);
            EventBus.off(EVENTS.GAME_READY, onGameReady);
            EventBus.off(EVENTS.GAME_PAUSED, onGamePaused);
            EventBus.off(EVENTS.GAME_RESUMED, onGameResumed);
            EventBus.off(EVENTS.GAME_OVER, onGameOver);
            EventBus.off(EVENTS.LEVEL_COMPLETE, onLevelComplete);
            EventBus.off(EVENTS.SCENE_CHANGED, onSceneChanged);
            EventBus.off('loading:complete', onLoadingComplete);
        };
    }, [store]);

    return store;
};

/**
 * Hook khusus untuk hanya mengambil player state
 */
export const usePlayer = () => {
    const player = useGameStore((state) => state.player);
    const updatePlayerHealth = useGameStore(
        (state) => state.updatePlayerHealth
    );
    const setPlayerHiding = useGameStore((state) => state.setPlayerHiding);

    return { player, updatePlayerHealth, setPlayerHiding };
};

/**
 * Hook khusus untuk inventory
 */
export const useInventory = () => {
    const inventory = useGameStore((state) => state.inventory);
    const addItem = useGameStore((state) => state.addItem);
    const removeItem = useGameStore((state) => state.removeItem);
    const useItem = useGameStore((state) => state.useItem);
    const selectSlot = useGameStore((state) => state.selectSlot);

    return { inventory, addItem, removeItem, useItem, selectSlot };
};

/**
 * Hook khusus untuk dialog
 */
export const useDialog = () => {
    const dialog = useGameStore((state) => state.dialog);
    const showDialog = useGameStore((state) => state.showDialog);
    const hideDialog = useGameStore((state) => state.hideDialog);

    return { dialog, showDialog, hideDialog };
};
    