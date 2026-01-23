/**
 * 🗄️ ZUSTAND STORE - Global Game State
 *
 * Menyimpan semua state game yang perlu diakses oleh React components
 * Sinkronisasi dengan Phaser melalui EventBus
 */

import { create } from 'zustand';

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

    setShowHUD: (show) =>
        set((state) => ({
            ui: {
                ...state.ui,
                showHUD: show,
            },
        })),

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
                showHUD: true,
            },
            isPaused: false,
        }),
}));

export default useGameStore;
