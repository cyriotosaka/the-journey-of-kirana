/**
 * 🎮 PHASER CONTAINER
 *
 * Component yang me-mount Phaser game instance ke dalam React
 * Handles lifecycle: initialization, cleanup, resize
 */

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBus, GameEvents } from '../../game/systems/EventBus';
import gameConfig from '../../game/config/GameConfig';
import { useSettingsStore } from '../../stores/useGameStore';

const PhaserContainer = () => {
    const gameRef = useRef(null);
    const containerRef = useRef(null);
    
    // Get settings from store
    const bgmVolume = useSettingsStore((state) => state.bgmVolume);
    const sfxVolume = useSettingsStore((state) => state.sfxVolume);
    
    // Sync settings to window for Phaser access
    useEffect(() => {
        window.__KIRANA_SETTINGS__ = {
            bgmVolume: bgmVolume / 100, // Convert 0-100 to 0-1
            sfxVolume: sfxVolume / 100,
        };
        
        // Emit volume change to Phaser
        EventBus.emit('settings:volume_changed', {
            bgm: bgmVolume / 100,
            sfx: sfxVolume / 100,
        });
    }, [bgmVolume, sfxVolume]);

    useEffect(() => {
        if (!containerRef.current) return;

        // ========== INITIALIZE PHASER GAME ==========
        const config = {
            ...gameConfig,
            parent: containerRef.current, // Mount point
            callbacks: {
                postBoot: (game) => {
                    // Game ready, kirim signal ke React
                    console.log('🎮 Phaser Game initialized');
                    GameEvents.gameReady();
                },
            },
        };

        // Create game instance
        gameRef.current = new Phaser.Game(config);

        // ========== RESIZE HANDLER ==========
        const handleResize = () => {
            if (gameRef.current) {
                gameRef.current.scale.resize(
                    window.innerWidth,
                    window.innerHeight
                );
            }
        };

        window.addEventListener('resize', handleResize);

        // ========== CLEANUP ON UNMOUNT ==========
        return () => {
            console.log('🧹 Cleaning up Phaser instance...');

            // Remove resize listener
            window.removeEventListener('resize', handleResize);

            // Destroy game instance
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }

            // Clear EventBus
            EventBus.removeAllListeners();
        };
    }, []);

    // ========== PAUSE/RESUME BASED ON DOCUMENT VISIBILITY ==========
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!gameRef.current) return;

            if (document.hidden) {
                // Tab tidak aktif, pause game
                gameRef.current.scene.scenes.forEach((scene) => {
                    if (scene.scene.isActive()) {
                        scene.scene.pause();
                    }
                });
                GameEvents.pauseGame();
            } else {
                // Tab aktif lagi, resume
                gameRef.current.scene.scenes.forEach((scene) => {
                    if (scene.scene.isPaused()) {
                        scene.scene.resume();
                    }
                });
                GameEvents.resumeGame();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, []);

    return (
        <div
            ref={containerRef}
            id="phaser-container"
            className="phaser-game-container"
            style={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative',
                background: '#000',
            }}
        />
    );
};

export default PhaserContainer;
