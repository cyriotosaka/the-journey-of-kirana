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
import HealthBar from './HUD/HealthBar';
import InventoryBar from './HUD/InventoryBar';
import useGameStore from '../stores/useGameStore';
import { useGameState } from '../hooks/useGameState';
import '../styles/Layout.css';

const Layout = () => {
    useGameState(); // Initialize event listeners

    const [gameStarted, setGameStarted] = useState(false);
    const isPaused = useGameStore((state) => state.isPaused);
    const showHUD = useGameStore((state) => state.ui.showHUD);
    const showMenu = useGameStore((state) => state.ui.showMenu);
    const toggleMenu = useGameStore((state) => state.toggleMenu);

    // ========== HANDLE START GAME ==========
    const handleStartGame = () => {
        setGameStarted(true);
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
                                <button
                                    onClick={() => {
                                        setGameStarted(false);
                                        toggleMenu();
                                    }}
                                >
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

            {/* ========== LOADING SCREEN (Future) ========== */}
            {/* Could add scene transition loading screens here */}
        </div>
    );
};

export default Layout;
