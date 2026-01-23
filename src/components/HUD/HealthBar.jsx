/**
 * ❤️ HEALTH BAR COMPONENT
 *
 * Menampilkan health player dengan:
 * - Smooth animated transitions
 * - Color changes based on health percentage
 * - Pulse effect saat low health
 */

import { useEffect, useState } from 'react';
import { usePlayer } from '../../hooks/useGameState';
import '../styles/HealthBar.css';

const HealthBar = () => {
    const { player } = usePlayer();
    const [prevHealth, setPrevHealth] = useState(player.health);
    const [isAnimating, setIsAnimating] = useState(false);

    const healthPercentage = (player.health / player.maxHealth) * 100;

    // ========== HEALTH CHANGE ANIMATION ==========
    useEffect(() => {
        if (player.health !== prevHealth) {
            setIsAnimating(true);

            const timer = setTimeout(() => {
                setIsAnimating(false);
                setPrevHealth(player.health);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [player.health, prevHealth]);

    // ========== HEALTH COLOR BASED ON PERCENTAGE ==========
    const getHealthColor = () => {
        if (healthPercentage > 60) return '#4ade80'; // Green
        if (healthPercentage > 30) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    // ========== LOW HEALTH WARNING ==========
    const isLowHealth = healthPercentage <= 30;

    return (
        <div
            className={`health-bar-container ${isLowHealth ? 'low-health' : ''}`}
        >
            <div className="health-bar-header">
                <span className="health-bar-label">KIRANA</span>
                <span className="health-bar-value">
                    {Math.ceil(player.health)} / {player.maxHealth}
                </span>
            </div>

            <div className="health-bar-track">
                {/* Background bar (max health) */}
                <div className="health-bar-background" />

                {/* Damage/heal animation bar */}
                {isAnimating && (
                    <div
                        className="health-bar-animation"
                        style={{
                            width: `${(prevHealth / player.maxHealth) * 100}%`,
                            backgroundColor:
                                player.health < prevHealth
                                    ? '#ef4444'
                                    : '#4ade80',
                        }}
                    />
                )}

                {/* Current health bar */}
                <div
                    className="health-bar-fill"
                    style={{
                        width: `${healthPercentage}%`,
                        backgroundColor: getHealthColor(),
                        transition: 'width 0.5s ease-out',
                    }}
                />
            </div>

            {/* Low Health Warning Text */}
            {isLowHealth && !player.isDead && (
                <div className="health-warning">⚠ NYAWA HAMPIR HABIS</div>
            )}

            {/* Dead State */}
            {player.isDead && <div className="health-dead">☠ MENINGGAL</div>}

            {/* Hiding Status Indicator */}
            {player.isHiding && (
                <div className="hiding-indicator">🛡️ BERSEMBUNYI</div>
            )}
        </div>
    );
};

export default HealthBar;
