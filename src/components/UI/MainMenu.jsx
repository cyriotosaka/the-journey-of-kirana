/**
 * 🎮 MAIN MENU COMPONENT
 *
 * Landing screen game dengan:
 * - Animated title
 * - Menu options (New Game, Continue, Settings, Credits)
 * - Background ambience
 */

import { useState, useEffect } from 'react';
import { EventBus } from '../../game/systems/EventBus';
import useGameStore from '../../stores/useGameStore';
import '../styles/MainMenu.css';

const MainMenu = ({ onStartGame }) => {
    const [selectedOption, setSelectedOption] = useState(0);
    const [showCredits, setShowCredits] = useState(false);
    const gameReady = useGameStore((state) => state.gameReady);

    const menuOptions = [
        { label: 'MULAI PETUALANGAN', action: 'new_game', enabled: true }, // Always enabled now!
        { label: 'LANJUTKAN', action: 'continue', enabled: false },
        { label: 'PENGATURAN', action: 'settings', enabled: false },
        { label: 'KREDIT', action: 'credits', enabled: true },
    ];

    // ========== KEYBOARD NAVIGATION ==========
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showCredits) {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    setShowCredits(false);
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    setSelectedOption((prev) => {
                        const newIndex = prev - 1;
                        return newIndex < 0 ? menuOptions.length - 1 : newIndex;
                    });
                    break;

                case 'ArrowDown':
                case 's':
                case 'S':
                    setSelectedOption(
                        (prev) => (prev + 1) % menuOptions.length
                    );
                    break;

                case 'Enter':
                case ' ':
                    handleMenuClick(menuOptions[selectedOption]);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedOption, showCredits, menuOptions]);

    // ========== HANDLE MENU SELECTION ==========
    const handleMenuClick = (option) => {
        if (!option.enabled) return;

        switch (option.action) {
            case 'new_game':
                EventBus.emit('menu:start_new_game');
                if (onStartGame) onStartGame();
                break;

            case 'continue':
                EventBus.emit('menu:continue_game');
                break;

            case 'settings':
                // TODO: Open settings panel
                break;

            case 'credits':
                setShowCredits(true);
                break;
        }
    };

    // ========== RENDER CREDITS ==========
    if (showCredits) {
        return (
            <div className="credits-screen">
                <div className="credits-container">
                    <h1 className="credits-title">THE JOURNEY OF KIRANA</h1>

                    <div className="credits-content">
                        <div className="credits-section">
                            <h2>Dikembangkan oleh</h2>
                            <p>Tim Game Development</p>
                        </div>

                        <div className="credits-section">
                            <h2>Inspirasi</h2>
                            <p>Little Nightmares • Inside • Limbo</p>
                            <p>Cerita Rakyat: Keong Mas</p>
                        </div>

                        <div className="credits-section">
                            <h2>Teknologi</h2>
                            <p>Phaser 3 • React • Zustand</p>
                            <p>Gemini AI • Vite</p>
                        </div>

                        <div className="credits-section">
                            <h2>Special Thanks</h2>
                            <p>Kepada seluruh pemain yang berani</p>
                            <p>menemani Kirana dalam perjalanannya</p>
                        </div>
                    </div>

                    <button
                        className="credits-back-button"
                        onClick={() => setShowCredits(false)}
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    // ========== RENDER MAIN MENU ==========
    return (
        <div className="main-menu-screen">
            {/* Animated Background */}
            <div className="menu-background">
                <div className="bg-layer bg-stars"></div>
                <div className="bg-layer bg-fog"></div>
            </div>

            {/* Game Title */}
            <div className="menu-header">
                <h1 className="game-title">
                    THE JOURNEY OF
                    <span className="title-highlight">KIRANA</span>
                </h1>
                <p className="game-subtitle">
                    Sebuah kisah gelap tentang keberanian dan harapan
                </p>
            </div>

            {/* Menu Options */}
            <div className="menu-options">
                {menuOptions.map((option, index) => (
                    <button
                        key={index}
                        className={`menu-option ${selectedOption === index ? 'selected' : ''} ${!option.enabled ? 'disabled' : ''}`}
                        onClick={() => {
                            setSelectedOption(index);
                            handleMenuClick(option);
                        }}
                        onMouseEnter={() => setSelectedOption(index)}
                        disabled={!option.enabled}
                    >
                        {selectedOption === index && (
                            <span className="menu-cursor">▶ </span>
                        )}
                        {option.label}
                        {!option.enabled && (
                            <span className="coming-soon"> (Segera)</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Controls Hint */}
            <div className="menu-controls">
                <p>↑↓ atau W/S untuk navigasi • Enter untuk pilih</p>
            </div>
        </div>
    );
};

export default MainMenu;
