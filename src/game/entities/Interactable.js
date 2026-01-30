/**
 * 🔮 INTERACTABLE - Base class untuk objek interaktif
 *
 * Door, Item, Switch, NPC, HidingSpot
 * Semua objek yang bisa di-interact player
 */

import Phaser from 'phaser';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

/**
 * Base Interactable class
 */
export class Interactable extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture, frame = 0, options = {}) {
        super(scene.matter.world, x, y, texture, frame);

        scene.add.existing(this);
        this.scene = scene;

        this.interactableType = options.type || 'generic';
        this.isInteractable = true;
        this.hasBeenUsed = options.singleUse ? false : null;
        this.requiresItem = options.requiresItem || null;
        this.dialogData = options.dialogData || null;

        // Prompt
        this.promptText = null;
        this.showingPrompt = false;

        this.setupPhysics(options);
    }

    setupPhysics(options) {
        this.setSensor(options.isSensor !== false);
        this.setStatic(options.isStatic !== false);
        this.body.label = 'interactable';
        this.body.gameObject = this;
    }

    interact(player) {
        if (!this.isInteractable) return false;
        if (this.hasBeenUsed === true) return false;

        // Check item requirement
        if (this.requiresItem) {
            // TODO: Check player inventory via EventBus
            console.log(`Membutuhkan: ${this.requiresItem}`);
        }

        // Show dialog jika ada
        if (this.dialogData) {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: this.dialogData.speaker || '',
                text: this.dialogData.text || '',
                avatar: this.dialogData.avatar || null,
                choices: this.dialogData.choices || [],
            });
        }

        this.playSound('sfx_interact');
        return true;
    }

    showPrompt() {
        if (this.showingPrompt) return;

        this.promptText = this.scene.add
            .text(this.x, this.y - 50, '[E] Interaksi', {
                fontSize: '14px',
                fontFamily: 'Georgia, serif',
                color: '#d4af37',
                backgroundColor: '#000000cc',
                padding: { x: 10, y: 6 },
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Bobbing animation
        this.scene.tweens.add({
            targets: this.promptText,
            y: this.y - 60,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.showingPrompt = true;
    }

    hidePrompt() {
        if (!this.showingPrompt) return;

        if (this.promptText) {
            this.promptText.destroy();
            this.promptText = null;
        }
        this.showingPrompt = false;
    }

    markAsUsed() {
        this.hasBeenUsed = true;
        this.isInteractable = false;
    }

    playSound(key, config = {}) {
        if (this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, { volume: 0.5, ...config });
        }
    }

    destroy() {
        this.hidePrompt();
        super.destroy();
    }
}

/**
 * 🚪 DOOR - Pintu yang bisa dibuka
 */
export class Door extends Interactable {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y, options.texture || 'prop_door', 0, {
            ...options,
            type: 'door',
            isSensor: false,
            isStatic: true,
        });

        this.isOpen = false;
        this.isLocked = options.isLocked || false;
        this.keyRequired = options.keyRequired || null;
        this.targetScene = options.targetScene || null;
        this.targetSpawn = options.targetSpawn || { x: 100, y: 500 };
    }

    interact(player) {
        if (this.isLocked) {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: '',
                text: 'Pintu ini terkunci. Kamu butuh kunci untuk membukanya.',
            });
            this.playSound('sfx_locked');
            return false;
        }

        if (!this.isOpen) {
            this.open();
        } else if (this.targetScene) {
            // Transisi ke scene lain
            this.scene.cameras.main.fadeOut(500);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.scene.start(this.targetScene, {
                    spawnX: this.targetSpawn.x,
                    spawnY: this.targetSpawn.y,
                });
            });
        }

        return true;
    }

    open() {
        this.isOpen = true;
        this.playAnimation('door_open');
        this.setSensor(true);
        this.playSound('sfx_door_open');
    }

    close() {
        this.isOpen = false;
        this.playAnimation('door_close');
        this.setSensor(false);
        this.playSound('sfx_door_close');
    }

    unlock() {
        this.isLocked = false;
        this.playSound('sfx_unlock');
    }

    playAnimation(key) {
        if (this.scene.anims.exists(key)) {
            this.play(key, true);
        }
    }
}

/**
 * 💎 ITEM - Collectible item
 */
export class Item extends Interactable {
    constructor(scene, x, y, itemData, options = {}) {
        super(scene, x, y, itemData.texture || 'item', itemData.frame || 0, {
            ...options,
            type: 'item',
            singleUse: true,
        });

        this.itemData = {
            id: itemData.id,
            name: itemData.name,
            description: itemData.description || '',
            icon: itemData.icon || itemData.texture,
            stackable: itemData.stackable || false,
            usable: itemData.usable || false,
        };

        // Store reference to floating tween so we can stop it
        this.floatingTween = this.scene.tweens.add({
            targets: this,
            y: y - 8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Sparkle
        this.createSparkle();
    }

    createSparkle() {
        if (!this.scene.textures.exists('particle')) return;

        this.sparkle = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xd4af37, 0xffffff],
            lifespan: 800,
            frequency: 400,
            quantity: 1,
        });
    }

    interact(player) {
        // Kirim ke inventory React
        GameEvents.collectItem(this.itemData);

        this.playSound('sfx_pickup');

        // IMPORTANT: Stop floating tween before pickup animation
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }

        // Pickup animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 40,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                if (this.sparkle) this.sparkle.destroy();
                this.destroy();
            },
        });

        return true;
    }

    destroy() {
        // Stop any remaining tweens
        if (this.floatingTween) {
            this.floatingTween.stop();
            this.floatingTween = null;
        }
        if (this.sparkle) {
            this.sparkle.destroy();
            this.sparkle = null;
        }
        super.destroy();
    }
}

/**
 * 🔘 SWITCH - Lever/tombol
 */
export class Switch extends Interactable {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y, options.texture || 'switch', 0, {
            ...options,
            type: 'switch',
        });

        this.isActivated = false;
        this.targetIds = options.targetIds || [];
        this.toggleable = options.toggleable !== false;
    }

    interact(player) {
        if (!this.toggleable && this.isActivated) return false;

        this.isActivated = !this.isActivated;
        this.setFrame(this.isActivated ? 1 : 0);

        this.playSound('sfx_switch');

        // Emit untuk objek yang terhubung
        EventBus.emit('switch:activated', {
            switchId: this.name,
            activated: this.isActivated,
            targetIds: this.targetIds,
        });

        return true;
    }
}

/**
 * 👤 NPC - Non-player character
 */
export class NPC extends Interactable {
    constructor(scene, x, y, npcData, options = {}) {
        super(scene, x, y, npcData.texture || 'npc', npcData.frame || 0, {
            ...options,
            type: 'npc',
        });

        this.npcData = npcData;
        this.dialogIndex = 0;
        this.dialogs = npcData.dialogs || [{ text: npcData.dialog || 'Halo...' }];
    }

    interact(player) {
        const currentDialog = this.dialogs[this.dialogIndex];

        EventBus.emit(EVENTS.DIALOG_SHOW, {
            character: this.npcData.name || 'NPC',
            text: currentDialog.text,
            avatar: this.npcData.avatar || null,
            choices: currentDialog.choices || [],
        });

        // Advance dialog
        if (currentDialog.advanceOnInteract !== false) {
            this.dialogIndex = Math.min(this.dialogIndex + 1, this.dialogs.length - 1);
        }

        return true;
    }
}

/**
 * 🛡️ HIDING SPOT - Tempat sembunyi khusus
 */
export class HidingSpot extends Interactable {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y, options.texture || 'prop_hiding_spot', 0, {
            ...options,
            type: 'hiding_spot',
        });
        
        this.setScale(0.15); // Scale down huge asset
        this.isOccupied = false;
    }

    interact(player) {
        if (this.isOccupied) return false;

        this.isOccupied = true;
        player.enterShellMode();
        // this.setFrame(1); // Disabled for single image
        
        // Optional hint: Tint slightly to show occupied?
        this.setTint(0xcccccc);

        return true;
    }

    release(player) {
        this.isOccupied = false;
        player.exitShellMode();
        this.clearTint();
        // this.setFrame(0); // Disabled for single image
    }
}

export default Interactable;
