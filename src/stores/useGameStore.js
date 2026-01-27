/**
 * 🗄️ ZUSTAND STORE - Global Game State
 *
 * Menyimpan semua state game yang perlu diakses oleh React components
 * Sinkronisasi dengan Phaser melalui EventBus
 * 
 * Features:
 * - Persist middleware untuk save/load game
 * - Settings management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ========== SETTINGS STORE (Persisted) ==========
export const useSettingsStore = create(
    persist(
        (set, get) => ({
            // Volume settings
            bgmVolume: 70,
            sfxVolume: 80,
            
            // Display settings
            isFullscreen: false,
            
            // Actions
            setBgmVolume: (volume) => set({ bgmVolume: Math.max(0, Math.min(100, volume)) }),
            setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(100, volume)) }),
            setFullscreen: (isFullscreen) => set({ isFullscreen }),
            
            toggleFullscreen: () => {
                const newState = !get().isFullscreen;
                set({ isFullscreen: newState });
                
                // Actually toggle fullscreen
                if (newState) {
                    document.documentElement.requestFullscreen?.();
                } else {
                    document.exitFullscreen?.();
                }
            },
        }),
        {
            name: 'kirana-settings',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ========== SAVE DATA STORE (Persisted) ==========
export const useSaveDataStore = create(
    persist(
        (set, get) => ({
            // Save data
            hasSaveData: false,
            currentLevel: 'Level1',
            checkpointPosition: { x: 100, y: 500 },
            savedInventory: [],
            savedHealth: 100,
            playTime: 0, // in seconds
            lastSaved: null,
            
            // Save game
            saveGame: (data) => set({
                hasSaveData: true,
                currentLevel: data.level || get().currentLevel,
                checkpointPosition: data.position || get().checkpointPosition,
                savedInventory: data.inventory || [],
                savedHealth: data.health || 100,
                playTime: data.playTime || get().playTime,
                lastSaved: new Date().toISOString(),
            }),
            
            // Clear save
            deleteSave: () => set({
                hasSaveData: false,
                currentLevel: 'Level1',
                checkpointPosition: { x: 100, y: 500 },
                savedInventory: [],
                savedHealth: 100,
                playTime: 0,
                lastSaved: null,
            }),
            
            // Get formatted play time
            getFormattedPlayTime: () => {
                const seconds = get().playTime;
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                
                if (hours > 0) {
                    return `${hours}j ${minutes}m`;
                }
                return `${minutes}m ${secs}d`;
            },
        }),
        {
            name: 'kirana-save',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ========== MAIN GAME STORE (Session only, not persisted) ==========
const useGameStore = create((set, get) => ({
    // ========== GAME STATE ==========
    gameReady: false,
    isPaused: false,
    currentScene: null,

    setGameReady: (ready) => set({ gameReady: ready }),
    setPaused: (paused) => set({ isPaused: paused }),
    setCurrentScene: (scene) => set({ currentScene: scene }),

    // ========== PLAYER STATE ==========
    player: {
        health: 100,
        maxHealth: 100,
        isHiding: false,
        isDead: false,
    },

    updatePlayerHealth: (health, maxHealth) =>
        set((state) => ({
            player: {
                ...state.player,
                health,
                maxHealth,
            },
        })),

    setPlayerHiding: (isHiding) =>
        set((state) => ({
            player: {
                ...state.player,
                isHiding,
            },
        })),

    setPlayerDead: (isDead) =>
        set((state) => ({
            player: {
                ...state.player,
                isDead,
            },
        })),

    // ========== INVENTORY SYSTEM ==========
    inventory: {
        items: [],
        maxSlots: 6,
        selectedSlot: null,
    },

    addItem: (item) =>
        set((state) => {
            const currentItems = state.inventory.items;

            // Cek apakah inventory penuh
            if (currentItems.length >= state.inventory.maxSlots) {
                console.warn('Inventory penuh!');
                return state;
            }

            // Cek apakah item stackable dan sudah ada
            const existingItemIndex = currentItems.findIndex(
                (i) => i.id === item.id && i.stackable
            );

            if (existingItemIndex !== -1) {
                // Stack item yang sudah ada
                const newItems = [...currentItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: (newItems[existingItemIndex].quantity || 1) + 1,
                };

                return {
                    inventory: {
                        ...state.inventory,
                        items: newItems,
                    },
                };
            } else {
                // Tambah item baru
                return {
                    inventory: {
                        ...state.inventory,
                        items: [...currentItems, { ...item, quantity: 1 }],
                    },
                };
            }
        }),

    removeItem: (itemId) =>
        set((state) => ({
            inventory: {
                ...state.inventory,
                items: state.inventory.items.filter(
                    (item) => item.id !== itemId
                ),
            },
        })),

    useItem: (itemId) =>
        set((state) => {
            const itemIndex = state.inventory.items.findIndex(
                (i) => i.id === itemId
            );

            if (itemIndex === -1) return state;

            const item = state.inventory.items[itemIndex];
            const newItems = [...state.inventory.items];

            if (item.quantity > 1) {
                // Kurangi quantity
                newItems[itemIndex] = {
                    ...item,
                    quantity: item.quantity - 1,
                };
            } else {
                // Hapus item
                newItems.splice(itemIndex, 1);
            }

            return {
                inventory: {
                    ...state.inventory,
                    items: newItems,
                },
            };
        }),

    selectSlot: (slotIndex) =>
        set((state) => ({
            inventory: {
                ...state.inventory,
                selectedSlot: slotIndex,
            },
        })),

    // ========== DIALOG STATE ==========
    dialog: {
        isVisible: false,
        character: '',
        text: '',
        avatar: null,
        choices: [],
        onClose: null,
    },

    showDialog: ({ character, text, avatar, choices, onClose }) =>
        set({
            dialog: {
                isVisible: true,
                character,
                text,
                avatar: avatar || null,
                choices: choices || [],
                onClose: onClose || null,
            },
        }),

    hideDialog: () =>
        set({
            dialog: {
                isVisible: false,
                character: '',
                text: '',
                avatar: null,
                choices: [],
                onClose: null,
            },
        }),

    // ========== UI STATE ==========
    ui: {
        showInventory: false,
        showMenu: false,
        showSettings: false,
        showHUD: true,
    },

    toggleInventory: () =>
        set((state) => ({
            ui: {
                ...state.ui,
                showInventory: !state.ui.showInventory,
            },
        })),

    toggleMenu: () =>
        set((state) => ({
            ui: {
                ...state.ui,
                showMenu: !state.ui.showMenu,
            },
        })),

    toggleSettings: () =>
        set((state) => ({
            ui: {
                ...state.ui,
                showSettings: !state.ui.showSettings,
            },
        })),

    setShowHUD: (show) =>
        set((state) => ({
            ui: {
                ...state.ui,
                showHUD: show,
            },
        })),

    // ========== TOAST NOTIFICATIONS ==========
    toasts: [],

    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, toast],
        })),

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    clearToasts: () => set({ toasts: [] }),

    // ========== SCENE TRANSITIONS ==========
    transition: {
        isActive: false,
        levelName: null,
        subtitle: null,
        showLoading: false,
        duration: 2000,
    },

    startTransition: ({ levelName, subtitle, showLoading, duration }) =>
        set({
            transition: {
                isActive: true,
                levelName: levelName || null,
                subtitle: subtitle || null,
                showLoading: showLoading || false,
                duration: duration || 2000,
            },
        }),

    endTransition: () =>
        set({
            transition: {
                isActive: false,
                levelName: null,
                subtitle: null,
                showLoading: false,
                duration: 2000,
            },
        }),

    // ========== RESET GAME ==========
    resetGame: () =>
        set({
            player: {
                health: 100,
                maxHealth: 100,
                isHiding: false,
                isDead: false,
            },
            inventory: {
                items: [],
                maxSlots: 6,
                selectedSlot: null,
            },
            dialog: {
                isVisible: false,
                character: '',
                text: '',
                avatar: null,
                choices: [],
                onClose: null,
            },
            ui: {
                showInventory: false,
                showMenu: false,
                showSettings: false,
                showHUD: true,
            },
            isPaused: false,
        }),

    // ========== LOAD FROM SAVE ==========
    loadFromSave: (saveData) =>
        set({
            player: {
                health: saveData.savedHealth || 100,
                maxHealth: 100,
                isHiding: false,
                isDead: false,
            },
            inventory: {
                items: saveData.savedInventory || [],
                maxSlots: 6,
                selectedSlot: null,
            },
            currentScene: saveData.currentLevel || 'Level1',
        }),
}));

export default useGameStore;
