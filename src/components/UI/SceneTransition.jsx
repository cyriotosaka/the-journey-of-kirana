/**
 * 🎬 SCENE TRANSITION COMPONENT
 *
 * Overlay transisi saat pindah scene/level
 * Features:
 * - Fade to black
 * - Level name display
 * - Loading indicator
 */

import { useEffect, useState } from 'react';
import useGameStore from '../../stores/useGameStore';
import '../../styles/SceneTransition.css';

const SceneTransition = () => {
    const transition = useGameStore((state) => state.transition);
    const [phase, setPhase] = useState('idle'); // idle, fadeIn, hold, fadeOut

    useEffect(() => {
        if (transition.isActive) {
            setPhase('fadeIn');
            
            // After fade in, hold for a moment then fade out
            const holdTimer = setTimeout(() => {
                setPhase('hold');
            }, 500);

            const fadeOutTimer = setTimeout(() => {
                setPhase('fadeOut');
            }, transition.duration || 2000);

            return () => {
                clearTimeout(holdTimer);
                clearTimeout(fadeOutTimer);
            };
        } else {
            setPhase('idle');
        }
    }, [transition.isActive, transition.duration]);

    if (!transition.isActive && phase === 'idle') return null;

    return (
        <div className={`scene-transition phase-${phase}`}>
            <div className="transition-content">
                {transition.levelName && (
                    <h1 className="transition-level-name">{transition.levelName}</h1>
                )}
                {transition.subtitle && (
                    <p className="transition-subtitle">{transition.subtitle}</p>
                )}
                {transition.showLoading && (
                    <div className="transition-loading">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SceneTransition;
