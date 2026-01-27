/**
 * ⚙️ SETTINGS PANEL COMPONENT
 *
 * Panel pengaturan game dengan:
 * - Volume controls (BGM, SFX)
 * - Fullscreen toggle
 * - Save settings ke localStorage
 */

import { useSettingsStore } from '../../stores/useGameStore';
import '../styles/SettingsPanel.css';

const SettingsPanel = ({ onClose }) => {
    const bgmVolume = useSettingsStore((state) => state.bgmVolume);
    const sfxVolume = useSettingsStore((state) => state.sfxVolume);
    const isFullscreen = useSettingsStore((state) => state.isFullscreen);
    const setBgmVolume = useSettingsStore((state) => state.setBgmVolume);
    const setSfxVolume = useSettingsStore((state) => state.setSfxVolume);
    const toggleFullscreen = useSettingsStore((state) => state.toggleFullscreen);

    const handleBgmChange = (e) => {
        setBgmVolume(parseInt(e.target.value));
        // TODO: Member B akan connect ini ke audio system
    };

    const handleSfxChange = (e) => {
        setSfxVolume(parseInt(e.target.value));
        // TODO: Member B akan connect ini ke audio system
    };

    return (
        <div className="settings-overlay">
            <div className="settings-panel">
                <h2 className="settings-title">PENGATURAN</h2>

                {/* Volume Controls */}
                <div className="settings-section">
                    <h3 className="settings-section-title">🔊 Audio</h3>

                    <div className="settings-row">
                        <label className="settings-label">Musik Latar</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={bgmVolume}
                                onChange={handleBgmChange}
                                className="volume-slider"
                            />
                            <span className="volume-value">{bgmVolume}%</span>
                        </div>
                    </div>

                    <div className="settings-row">
                        <label className="settings-label">Efek Suara</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sfxVolume}
                                onChange={handleSfxChange}
                                className="volume-slider"
                            />
                            <span className="volume-value">{sfxVolume}%</span>
                        </div>
                    </div>
                </div>

                {/* Display Controls */}
                <div className="settings-section">
                    <h3 className="settings-section-title">🖥️ Tampilan</h3>

                    <div className="settings-row">
                        <label className="settings-label">Layar Penuh</label>
                        <button
                            className={`toggle-button ${isFullscreen ? 'active' : ''}`}
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? 'AKTIF' : 'NONAKTIF'}
                        </button>
                    </div>
                </div>

                {/* Controls Info */}
                <div className="settings-section">
                    <h3 className="settings-section-title">🎮 Kontrol</h3>
                    <div className="controls-info">
                        <div className="control-row">
                            <span className="control-key">A / D</span>
                            <span className="control-action">Bergerak</span>
                        </div>
                        <div className="control-row">
                            <span className="control-key">SPACE</span>
                            <span className="control-action">Lompat</span>
                        </div>
                        <div className="control-row">
                            <span className="control-key">SHIFT</span>
                            <span className="control-action">Sembunyi</span>
                        </div>
                        <div className="control-row">
                            <span className="control-key">E</span>
                            <span className="control-action">Interaksi</span>
                        </div>
                        <div className="control-row">
                            <span className="control-key">1-6</span>
                            <span className="control-action">Pilih Item</span>
                        </div>
                        <div className="control-row">
                            <span className="control-key">ESC</span>
                            <span className="control-action">Pause</span>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button className="settings-close-button" onClick={onClose}>
                    Kembali
                </button>
            </div>
        </div>
    );
};

export default SettingsPanel;
