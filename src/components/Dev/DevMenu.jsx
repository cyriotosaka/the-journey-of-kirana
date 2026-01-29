/**
 * 🛠️ DEV MENU - Development tools for quick testing
 * 
 * Shows only in development mode (NODE_ENV !== 'production')
 * Allows quick level switching, teleporting, etc.
 */

import { useState } from 'react';
import { EventBus } from '../../game/systems/EventBus';
import useGameStore from '../../stores/useGameStore';
import './DevMenu.css';

const LEVELS = [
    { key: 'Level1', name: 'L1 - Rumah Nenek' },
    { key: 'Level2', name: 'L2 - Hutan Terkutuk' },
    { key: 'Level3', name: 'L3 - Jejak Raksasa' },
    { key: 'Level4', name: 'L4 - Rawa & Penyamaran' },
    { key: 'Level5', name: 'L5 - Markas Buto Ijo' },
    { key: 'Level6', name: 'L6 - Kebenaran Keong' },
    { key: 'Level7', name: 'L7 - Pembebasan' },
];

const DevMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const currentScene = useGameStore((state) => state.currentScene);
    const setHealth = useGameStore((state) => state.setHealth);
    const addItem = useGameStore((state) => state.addItem);

    // Only show in development
    if (process.env.NODE_ENV === 'production') return null;

    const handleLevelSelect = (levelKey) => {
        console.log(`🚀 Dev: Switching to ${levelKey}`);
        EventBus.emit('dev:switch_level', levelKey);
        setIsOpen(false);
    };

    const handleFullHealth = () => {
        setHealth(100);
        EventBus.emit('dev:set_health', 100);
    };

    const handleAddTestItem = () => {
        addItem({
            id: `test_item_${Date.now()}`,
            name: 'Test Item',
            description: 'Item untuk testing',
            icon: 'item',
        });
    };

    const handleToggleInvincible = () => {
        EventBus.emit('dev:toggle_invincible');
    };

    return (
        <div className="dev-menu">
            <button 
                className="dev-menu-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="Dev Menu (Ctrl+D)"
            >
                🛠️
            </button>

            {isOpen && (
                <div className="dev-menu-panel">
                    <h3>🛠️ Dev Menu</h3>
                    <p className="dev-current-scene">Scene: {currentScene || 'N/A'}</p>
                    
                    <div className="dev-section">
                        <h4>Level Select</h4>
                        {LEVELS.map((level) => (
                            <button
                                key={level.key}
                                className={`dev-btn ${currentScene === level.key ? 'active' : ''}`}
                                onClick={() => handleLevelSelect(level.key)}
                            >
                                {level.name}
                            </button>
                        ))}
                    </div>

                    <div className="dev-section">
                        <h4>Player</h4>
                        <button className="dev-btn" onClick={handleFullHealth}>
                            ❤️ Full Health
                        </button>
                        <button className="dev-btn" onClick={handleToggleInvincible}>
                            🛡️ Toggle Invincible
                        </button>
                    </div>

                    <div className="dev-section">
                        <h4>Inventory</h4>
                        <button className="dev-btn" onClick={handleAddTestItem}>
                            ➕ Add Test Item
                        </button>
                    </div>

                    <div className="dev-hint">
                        Press <kbd>Ctrl+D</kbd> to toggle
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevMenu;
