/**
 * 🎬 ANIMATION MANAGER - Definisi semua animasi game
 *
 * Dipanggil di BootScene setelah asset di-load
 */

export class AnimationManager {
    static createAnimations(scene) {
        const anims = scene.anims;

        this.createPlayerAnimations(anims);
        this.createEnemyAnimations(anims);
        this.createInteractableAnimations(anims);
        this.createEffectAnimations(anims);

        console.log('✅ Semua animasi berhasil dibuat');
    }

    // ============================================
    // PLAYER ANIMATIONS (Kirana)
    // ============================================
    static createPlayerAnimations(anims) {
        if (anims.exists('kirana_idle')) return;

        // Idle - breathing
        anims.create({
            key: 'kirana_idle',
            frames: anims.generateFrameNumbers('kirana', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1,
        });

        // Walk
        anims.create({
            key: 'kirana_walk',
            frames: anims.generateFrameNumbers('kirana', { start: 4, end: 11 }),
            frameRate: 12,
            repeat: -1,
        });

        // Jump
        anims.create({
            key: 'kirana_jump',
            frames: anims.generateFrameNumbers('kirana', { start: 12, end: 14 }),
            frameRate: 12,
            repeat: 0,
        });

        // Fall
        anims.create({
            key: 'kirana_fall',
            frames: anims.generateFrameNumbers('kirana', { start: 15, end: 16 }),
            frameRate: 8,
            repeat: -1,
        });

        // Shell enter
        anims.create({
            key: 'kirana_shell_enter',
            frames: anims.generateFrameNumbers('kirana', { start: 17, end: 21 }),
            frameRate: 15,
            repeat: 0,
        });

        // Shell idle
        anims.create({
            key: 'kirana_shell_idle',
            frames: anims.generateFrameNumbers('kirana', { start: 21, end: 22 }),
            frameRate: 4,
            repeat: -1,
        });

        // Shell exit
        anims.create({
            key: 'kirana_shell_exit',
            frames: anims.generateFrameNumbers('kirana', { start: 21, end: 17 }),
            frameRate: 15,
            repeat: 0,
        });

        // Hurt
        anims.create({
            key: 'kirana_hurt',
            frames: anims.generateFrameNumbers('kirana', { start: 23, end: 24 }),
            frameRate: 10,
            repeat: 0,
        });

        // Death
        anims.create({
            key: 'kirana_death',
            frames: anims.generateFrameNumbers('kirana', { start: 25, end: 30 }),
            frameRate: 8,
            repeat: 0,
        });
    }

    // ============================================
    // ENEMY ANIMATIONS
    // ============================================
    static createEnemyAnimations(anims) {
        // Galuh (Witch)
        if (!anims.exists('galuh_idle')) {
            anims.create({
                key: 'galuh_idle',
                frames: anims.generateFrameNumbers('galuh', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_walk',
                frames: anims.generateFrameNumbers('galuh', { start: 4, end: 11 }),
                frameRate: 8,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_alert',
                frames: anims.generateFrameNumbers('galuh', { start: 12, end: 15 }),
                frameRate: 10,
                repeat: 0,
            });

            anims.create({
                key: 'galuh_chase',
                frames: anims.generateFrameNumbers('galuh', { start: 16, end: 23 }),
                frameRate: 12,
                repeat: -1,
            });

            anims.create({
                key: 'galuh_search',
                frames: anims.generateFrameNumbers('galuh', { start: 24, end: 29 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        // Giant
        if (!anims.exists('giant_idle')) {
            anims.create({
                key: 'giant_idle',
                frames: anims.generateFrameNumbers('giant', { start: 0, end: 3 }),
                frameRate: 3,
                repeat: -1,
            });

            anims.create({
                key: 'giant_walk',
                frames: anims.generateFrameNumbers('giant', { start: 4, end: 11 }),
                frameRate: 6,
                repeat: -1,
            });

            anims.create({
                key: 'giant_stomp',
                frames: anims.generateFrameNumbers('giant', { start: 12, end: 19 }),
                frameRate: 10,
                repeat: 0,
            });
        }
    }

    // ============================================
    // INTERACTABLE ANIMATIONS
    // ============================================
    static createInteractableAnimations(anims) {
        // Door
        if (!anims.exists('door_open')) {
            anims.create({
                key: 'door_open',
                frames: anims.generateFrameNumbers('door', { start: 0, end: 4 }),
                frameRate: 10,
                repeat: 0,
            });

            anims.create({
                key: 'door_close',
                frames: anims.generateFrameNumbers('door', { start: 4, end: 0 }),
                frameRate: 10,
                repeat: 0,
            });
        }

        // Torch
        if (!anims.exists('torch_burn')) {
            anims.create({
                key: 'torch_burn',
                frames: anims.generateFrameNumbers('torch', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1,
            });
        }
    }

    // ============================================
    // EFFECT ANIMATIONS
    // ============================================
    static createEffectAnimations(anims) {
        // Dust
        if (!anims.exists('dust_puff')) {
            anims.create({
                key: 'dust_puff',
                frames: anims.generateFrameNumbers('dust', { start: 0, end: 5 }),
                frameRate: 15,
                repeat: 0,
            });
        }

        // Sparkle
        if (!anims.exists('sparkle')) {
            anims.create({
                key: 'sparkle',
                frames: anims.generateFrameNumbers('sparkle', { start: 0, end: 5 }),
                frameRate: 12,
                repeat: -1,
            });
        }
    }

    // Helper untuk create simple animation
    static createSimple(anims, key, texture, start, end, frameRate, repeat = -1) {
        if (anims.exists(key)) return;

        anims.create({
            key,
            frames: anims.generateFrameNumbers(texture, { start, end }),
            frameRate,
            repeat,
        });
    }
}

export default AnimationManager;
