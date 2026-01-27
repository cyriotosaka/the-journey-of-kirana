/**
 * 🍞 TOAST NOTIFICATION HOOK
 *
 * Hook untuk menampilkan toast notifications
 * Digunakan untuk item pickup, hints, achievements
 */

import { useCallback } from 'react';
import useGameStore from '../stores/useGameStore';

export const useToast = () => {
    const addToast = useGameStore((state) => state.addToast);
    const removeToast = useGameStore((state) => state.removeToast);

    const showToast = useCallback(
        (message, options = {}) => {
            const {
                type = 'info', // 'success', 'warning', 'error', 'info'
                duration = 3000,
                icon = null,
            } = options;

            const id = Date.now().toString();

            addToast({
                id,
                message,
                type,
                icon,
            });

            // Auto dismiss
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [addToast, removeToast]
    );

    // Shorthand methods
    const success = useCallback(
        (message, options = {}) => showToast(message, { ...options, type: 'success' }),
        [showToast]
    );

    const warning = useCallback(
        (message, options = {}) => showToast(message, { ...options, type: 'warning' }),
        [showToast]
    );

    const error = useCallback(
        (message, options = {}) => showToast(message, { ...options, type: 'error' }),
        [showToast]
    );

    const info = useCallback(
        (message, options = {}) => showToast(message, { ...options, type: 'info' }),
        [showToast]
    );

    const itemPickup = useCallback(
        (itemName) => showToast(`${itemName} ditambahkan ke inventory`, { type: 'success', icon: '🎒' }),
        [showToast]
    );

    return {
        showToast,
        success,
        warning,
        error,
        info,
        itemPickup,
        removeToast,
    };
};

export default useToast;
