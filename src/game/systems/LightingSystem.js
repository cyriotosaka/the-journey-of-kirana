/**
 * 🔦 LIGHTING SYSTEM - Sistem kegelapan dan cahaya
 *
 * Menciptakan atmosfer gelap ala Little Nightmares
 * - Ambient darkness
 * - Player light (lentera/cangkang)
 * - Torches dan light sources
 * - Vignette effect
 */

import Phaser from 'phaser';

export class LightingSystem {
    constructor(scene, options = {}) {
        this.scene = scene;

        // Config
        this.ambientLight = options.ambientLight || 0.1;
        this.darknessColor = options.darknessColor || 0x0a0a15;
        this.enabled = true;

        // Light sources
        this.lights = [];
        this.playerLight = null;

        // Graphics
        this.darkOverlay = null;
        this.vignette = null;

        this.setup();
    }

    setup() {
        const { width, height } = this.scene.cameras.main;

        // Dark overlay
        this.darkOverlay = this.scene.add.graphics();
        this.darkOverlay.setScrollFactor(0);
        this.darkOverlay.setDepth(90);
        this.darkOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

        // Vignette
        this.createVignette();
    }

    createVignette() {
        // Disabled vignette for clarity
        this.vignette = this.scene.add.graphics();
        this.vignette.setScrollFactor(0);
        this.vignette.setDepth(91);
    }

    // Add player light
    addPlayerLight(player, options = {}) {
        this.playerLight = {
            target: player,
            radius: options.radius || 100,
            intensity: options.intensity || 0.8,
            color: options.color || 0xffeedd,
            flicker: options.flicker !== false,
            flickerSpeed: options.flickerSpeed || 100,
            flickerAmount: options.flickerAmount || 0.1,
            _currentIntensity: options.intensity || 0.8,
        };

        return this.playerLight;
    }

    // Add static light
    addLight(x, y, options = {}) {
        const light = {
            x,
            y,
            radius: options.radius || 80,
            intensity: options.intensity || 0.7,
            color: options.color || 0xffaa44,
            flicker: options.flicker || false,
            flickerSpeed: options.flickerSpeed || 120,
            flickerAmount: options.flickerAmount || 0.15,
            active: true,
            _currentIntensity: options.intensity || 0.7,
        };

        this.lights.push(light);
        return light;
    }

    // Add torch with particles
    addTorch(x, y, options = {}) {
        const light = this.addLight(x, y, {
            radius: options.radius || 90,
            intensity: options.intensity || 0.8,
            color: 0xff6600,
            flicker: true,
            flickerSpeed: 80,
            flickerAmount: 0.2,
        });

        // Torch sprite
        if (this.scene.textures.exists('prop_torch')) {
            light.sprite = this.scene.add.sprite(x, y - 20, 'prop_torch');
            // Disable animation to prevent "drifting" (bad asset alignment)
            // light.sprite.play('torch_burn'); 
            light.sprite.setFrame(0);
            light.sprite.setDepth(-10); // Behind player
        } else if (this.scene.textures.exists('torch')) {
            light.sprite = this.scene.add.sprite(x, y - 20, 'torch');
            light.sprite.setFrame(0);
            light.sprite.setDepth(-10);
        }

        // Fire particles
        if (this.scene.textures.exists('particle')) {
            light.particles = this.scene.add.particles(x, y - 30, 'particle', {
                speed: { min: 20, max: 50 },
                angle: { min: -100, max: -80 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.8, end: 0 },
                tint: [0xff6600, 0xff4400, 0xffaa00],
                lifespan: 600,
                frequency: 80,
                quantity: 1,
            });
        }

        return light;
    }

    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            if (light.sprite) light.sprite.destroy();
            if (light.particles) light.particles.destroy();
            this.lights.splice(index, 1);
        }
    }

    // Update flicker
    updateFlicker(light, time) {
        if (!light.flicker) return;

        const flicker = Math.sin(time / light.flickerSpeed) * light.flickerAmount;
        light._currentIntensity = light.intensity + flicker;
    }

    // Render darkness with light holes
    render(time) {
        if (!this.enabled) {
            this.darkOverlay.setVisible(false);
            return;
        }

        const darkness = 1 - this.ambientLight;

        // FIX: Don't render artifacts if the scene is bright
        if (darkness <= 0.05) {
            this.darkOverlay.clear();
            return;
        }

        this.darkOverlay.setVisible(true);
        this.darkOverlay.clear();

        const { width, height } = this.scene.cameras.main;
        
        // Fill with darkness (Simple overlay for now to avoid artifacts)
        this.darkOverlay.fillStyle(this.darknessColor, darkness);
        this.darkOverlay.fillRect(0, 0, width, height);

        // Note: Advanced hole cutting disabled due to blend mode limitations
        // To properly implement lights in dark levels, we should use Phaser.Lights
        // or a GeometryMask solution in the future.
    }

    drawLightHole(x, y, radius, intensity) {
        // Gradient light hole
        const steps = 8;
        for (let i = steps; i > 0; i--) {
            const stepRadius = (radius * i) / steps;
            const alpha = (intensity * i) / steps;

            this.darkOverlay.fillStyle(0xffffff, alpha);
            this.darkOverlay.fillCircle(x, y, stepRadius);
        }
    }

    // Ambient light control
    setAmbientLight(level) {
        this.ambientLight = Phaser.Math.Clamp(level, 0, 1);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.darkOverlay.setVisible(enabled);
        if (this.vignette) this.vignette.setVisible(enabled);
    }

    // Fade effects
    async fadeToBlack(duration = 1000) {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                ambientLight: 0,
                duration,
                onComplete: resolve,
            });
        });
    }

    async fadeFromBlack(duration = 1000, targetLevel = 0.1) {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                ambientLight: targetLevel,
                duration,
                onComplete: resolve,
            });
        });
    }

    flash(duration = 100) {
        const originalAmbient = this.ambientLight;
        this.ambientLight = 1;

        this.scene.time.delayedCall(duration, () => {
            this.ambientLight = originalAmbient;
        });
    }

    // Update - panggil di scene update
    update(time, delta) {
        this.render(time);
    }

    destroy() {
        if (this.darkOverlay) this.darkOverlay.destroy();
        if (this.vignette) this.vignette.destroy();

        for (const light of this.lights) {
            if (light.sprite) light.sprite.destroy();
            if (light.particles) light.particles.destroy();
        }

        this.lights = [];
    }
}

export default LightingSystem;
