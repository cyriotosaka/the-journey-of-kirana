/**
 * 💬 DIALOG BOX COMPONENT
 *
 * Visual novel style dialog system dengan:
 * - Typewriter effect
 * - Character avatar
 * - Multiple choice support
 * - Smooth animations
 */

import { useState, useEffect, useRef } from 'react';
import { useDialog } from '../../hooks/useGameState';
import { EventBus, EVENTS } from '../../game/systems/EventBus';
import '../styles/DialogBox.css';

const DialogBox = () => {
    const { dialog, hideDialog } = useDialog();
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [canAdvance, setCanAdvance] = useState(false);
    const typingIntervalRef = useRef(null);

    // ========== TYPEWRITER EFFECT ==========
    useEffect(() => {
        if (!dialog.isVisible || !dialog.text) {
            setDisplayedText('');
            return;
        }

        setIsTyping(true);
        setCanAdvance(false);
        setDisplayedText('');

        let currentIndex = 0;
        const fullText = dialog.text;
        const typingSpeed = 30; // ms per character

        typingIntervalRef.current = setInterval(() => {
            if (currentIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                // Typing selesai
                clearInterval(typingIntervalRef.current);
                setIsTyping(false);
                setCanAdvance(true);
            }
        }, typingSpeed);

        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, [dialog.text, dialog.isVisible]);

    // ========== SKIP TYPING ON CLICK ==========
    const handleDialogClick = () => {
        if (isTyping) {
            // Skip typewriter effect
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
            setDisplayedText(dialog.text);
            setIsTyping(false);
            setCanAdvance(true);
        } else if (canAdvance && dialog.choices.length === 0) {
            // Tidak ada choices, langsung close
            handleClose();
        }
    };

    // ========== HANDLE CHOICE SELECTION ==========
    const handleChoiceClick = (choice) => {
        // Kirim pilihan ke Phaser
        EventBus.emit('dialog:choice:selected', choice);

        // Execute choice action jika ada
        if (choice.action) {
            executeChoiceAction(choice.action);
        }

        hideDialog();
    };

    const executeChoiceAction = (action) => {
        switch (action) {
            case 'restart':
                EventBus.emit('game:restart');
                break;
            case 'menu':
                EventBus.emit('game:return_to_menu');
                break;
            case 'next_level':
                EventBus.emit('game:next_level');
                break;
            default:
                console.log('Unknown action:', action);
        }
    };

    // ========== CLOSE DIALOG ==========
    const handleClose = () => {
        if (dialog.onClose) {
            dialog.onClose();
        }
        hideDialog();
        EventBus.emit(EVENTS.DIALOG_NEXT);
    };

    // ========== KEYBOARD NAVIGATION ==========
    useEffect(() => {
        if (!dialog.isVisible) return;

        const handleKeyPress = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (isTyping) {
                    handleDialogClick();
                } else if (canAdvance && dialog.choices.length === 0) {
                    handleClose();
                }
            }

            // Number keys untuk choices (1, 2, 3...)
            if (dialog.choices.length > 0 && !isNaN(e.key)) {
                const choiceIndex = parseInt(e.key) - 1;
                if (choiceIndex >= 0 && choiceIndex < dialog.choices.length) {
                    handleChoiceClick(dialog.choices[choiceIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [dialog, isTyping, canAdvance]);

    if (!dialog.isVisible) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-container" onClick={handleDialogClick}>
                {/* Character Avatar */}
                {dialog.avatar && (
                    <div className="dialog-avatar">
                        <img src={dialog.avatar} alt={dialog.character} />
                    </div>
                )}

                {/* Dialog Box */}
                <div className="dialog-box">
                    {/* Character Name */}
                    <div className="dialog-character-name">
                        {dialog.character}
                    </div>

                    {/* Dialog Text */}
                    <div className="dialog-text">
                        {displayedText}
                        {isTyping && <span className="typing-cursor">▊</span>}
                    </div>

                    {/* Continue Indicator */}
                    {canAdvance && dialog.choices.length === 0 && (
                        <div className="dialog-continue">
                            ▼ Tekan Enter atau Klik untuk melanjutkan
                        </div>
                    )}

                    {/* Choices */}
                    {!isTyping && dialog.choices.length > 0 && (
                        <div className="dialog-choices">
                            {dialog.choices.map((choice, index) => (
                                <button
                                    key={index}
                                    className="dialog-choice-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleChoiceClick(choice);
                                    }}
                                >
                                    <span className="choice-number">
                                        {index + 1}
                                    </span>
                                    {choice.text}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DialogBox;
