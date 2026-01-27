/**
 * ⌨️ KEYBOARD SHORTCUTS HOOK
 *
 * Global keyboard handler untuk:
 * - 1-6: Inventory quick select
 * - ESC: Toggle pause menu
 * - TAB/I: Toggle inventory visibility
 */

import { useEffect, useCallback } from 'react';
import { EventBus } from '../game/systems/EventBus';
import useGameStore from '../stores/useGameStore';

export const useKeyboardShortcuts = (gameStarted = false) => {
    const selectSlot = useGameStore((state) => state.selectSlot);
    const toggleMenu = useGameStore((state) => state.toggleMenu);
    const toggleInventory = useGameStore((state) => state.toggleInventory);
    const showMenu = useGameStore((state) => state.ui.showMenu);
    const isPaused = useGameStore((state) => state.isPaused);

    const handleKeyDown = useCallback(
        (e) => {
            // Jangan handle shortcut jika sedang di input field
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA'
            ) {
                return;
            }

            // ========== INVENTORY QUICK SELECT (1-6) ==========
            if (gameStarted && !showMenu) {
                const key = e.key;
                if (key >= '1' && key <= '6') {
                    e.preventDefault();
                    const slotIndex = parseInt(key) - 1;
                    selectSlot(slotIndex);

                    // Notify Phaser about slot selection
                    EventBus.emit('inventory:slot:selected', slotIndex);
                }
            }

            // ========== PAUSE MENU (ESC) ==========
            if (e.key === 'Escape' && gameStarted) {
                e.preventDefault();
                toggleMenu();

                // Notify Phaser about pause state
                if (!showMenu) {
                    EventBus.emit('game:pause');
                } else {
                    EventBus.emit('game:resume');
                }
            }

            // ========== INVENTORY TOGGLE (TAB / I) ==========
            if ((e.key === 'Tab' || e.key === 'i' || e.key === 'I') && gameStarted && !showMenu) {
                e.preventDefault();
                toggleInventory();
            }
        },
        [gameStarted, showMenu, selectSlot, toggleMenu, toggleInventory]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return null;
};

export default useKeyboardShortcuts;
