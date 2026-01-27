/**
 * 🏗️ LAYOUT COMPONENT
 *
 * Main wrapper yang mengatur:
 * - PhaserContainer (game canvas)
 * - UI Overlays (HUD, Dialog, Menu)
 * - Layer management (z-index)
 */

import { useState } from 'react';
import PhaserContainer from './Game/PhaserContainer';
import MainMenu from './UI/MainMenu';
import DialogBox from './UI/DialogBox';
import ToastNotification from './UI/ToastNotification';
import SceneTransition from './UI/SceneTransition';
import HealthBar from './HUD/HealthBar';
import InventoryBar from './HUD/InventoryBar';
import useGameStore from '../stores/useGameStore';
import { useGameState } from '../hooks/useGameState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import '../styles/Layout.css';

const Layout = () => {
    useGameState(); // Initialize event listeners

    // Persist gameStarted in sessionStorage so refresh doesn't go back to menu
    const [gameStarted, setGameStarted] = useState(() => {
        return sessionStorage.getItem('kirana-game-started') === 'true';
    });
    
    // Initialize keyboard shortcuts
    useKeyboardShortcuts(gameStarted);
    const isPaused = useGameStore((state) => state.isPaused);
    const showHUD = useGameStore((state) => state.ui.showHUD);
    const showMenu = useGameStore((state) => state.ui.showMenu);
    const toggleMenu = useGameStore((state) => state.toggleMenu);

    // ========== HANDLE START GAME ==========
    const handleStartGame = () => {
        setGameStarted(true);
        sessionStorage.setItem('kirana-game-started', 'true');
    };

    // ========== HANDLE BACK TO MENU (from pause) ==========
    const handleBackToMenu = () => {
        setGameStarted(false);
        sessionStorage.removeItem('kirana-game-started');
        if (showMenu) toggleMenu();
    };

    // ========== PAUSE MENU TOGGLE ==========
    const handlePauseToggle = () => {
        toggleMenu();
    };

    return (
        <div className="game-layout">
            {/* ========== MAIN MENU (Overlay) ========== */}
            {!gameStarted && (
                <div className="layer layer-menu">
                    <MainMenu onStartGame={handleStartGame} />
                </div>
            )}

            {/* ========== PHASER GAME CANVAS ========== */}
            {gameStarted && (
                <div className="layer layer-game">
                    <PhaserContainer />
                </div>
            )}

            {/* ========== HUD OVERLAY ========== */}
            {gameStarted && showHUD && !showMenu && (
                <div className="layer layer-hud">
                    <div className="hud-top-left">
                        <HealthBar />
                    </div>

                    <div className="hud-bottom-center">
                        <InventoryBar />
                    </div>

                    <div className="hud-top-right">
                        <button
                            className="pause-button"
                            onClick={handlePauseToggle}
                            title="Pause (ESC)"
                        >
                            {isPaused ? '▶' : '⏸'}
                        </button>
                    </div>
                </div>
            )}

            {/* ========== DIALOG OVERLAY ========== */}
            {gameStarted && (
                <div className="layer layer-dialog">
                    <DialogBox />
                </div>
            )}

            {/* ========== PAUSE MENU ========== */}
            {gameStarted && showMenu && (
                <div className="layer layer-pause-menu">
                    <div className="pause-menu-overlay">
                        <div className="pause-menu-container">
                            <h2 className="pause-title">PAUSE</h2>

                            <div className="pause-options">
                                <button onClick={handlePauseToggle}>
                                    Lanjutkan
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: Show settings
                                        console.log('Settings');
                                    }}
                                >
                                    Pengaturan
                                </button>
                                <button onClick={handleBackToMenu}>
                                    Kembali ke Menu
                                </button>
                            </div>

                            <div className="pause-controls">
                                <p>ESC untuk kembali ke game</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== SCENE TRANSITION OVERLAY ========== */}
            <SceneTransition />

            {/* ========== TOAST NOTIFICATIONS ========== */}
            <ToastNotification />
        </div>
    );
};

export default Layout;
