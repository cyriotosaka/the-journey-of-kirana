/**
 * 🐚 PLAYER - Kirana, Sang Putri Keong Emas
 *
 * Karakter utama dengan mekanik:
 * - Movement (jalan, lompat)
 * - Shell Mode (sembunyi dalam cangkang)
 * - Health system
 * - Interaction dengan objek
 */

import Phaser from 'phaser';
import { StateMachine, PlayerStates } from '../utils/StateMachine';
import { InputManager } from '../systems/InputManager';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

// ========== PLAYER CONFIGURATION ==========
// Extract all magic numbers for easy tuning
export const PLAYER_CONFIG = {
    // Stats
    MAX_HEALTH: 100,
    INITIAL_HEALTH: 100,
    
    // Movement
    MOVE_SPEED: 4,
    JUMP_FORCE: 10,
    NORMAL_FRICTION: 0.1,
    SHELL_FRICTION: 0.9,
    FRICTION_AIR: 0.02,
    
    // Physics
    BODY_WIDTH: 28,
    BODY_HEIGHT: 44,
    BODY_CHAMFER: 6,
    SENSOR_WIDTH: 20,
    SENSOR_HEIGHT: 6,
    SENSOR_OFFSET_Y: 24,
    
    // Combat
    INVINCIBILITY_DURATION: 1000,
    FLASH_DURATION: 100,
    
    // Rendering
    DEPTH: 10,
};

export class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'kirana', 0);

        scene.add.existing(this);
        this.scene = scene;

        // ========== PLAYER STATS (from config) ==========
        this.health = PLAYER_CONFIG.INITIAL_HEALTH;
        this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;

        // ========== STATE FLAGS ==========
        this.isHiding = false;
        this.isInvincible = false;
        this.isDead = false;
        this.canInteract = false;
        this.currentInteractable = null;

        // ========== MOVEMENT CONFIG (from config) ==========
        this.moveSpeed = PLAYER_CONFIG.MOVE_SPEED;
        this.jumpForce = PLAYER_CONFIG.JUMP_FORCE;
        this.normalFriction = PLAYER_CONFIG.NORMAL_FRICTION;
        this.shellFriction = PLAYER_CONFIG.SHELL_FRICTION;

        // ========== GROUND DETECTION ==========
        this.touchingGround = false;
        this.groundSensor = null;

        // ========== FACING ==========
        this.facing = 1; // 1 = kanan, -1 = kiri

        // ========== SETUP ==========
        this.setupPhysics();
        this.inputManager = new InputManager(scene);
        this.stateMachine = new StateMachine(this);
        this.stateMachine.addStates(PlayerStates);
        this.stateMachine.setState('idle');

        // Emit initial health
        GameEvents.updateHealth(this.health, this.maxHealth);

        // Set depth (from config)
        this.setDepth(PLAYER_CONFIG.DEPTH);
    }

    setupPhysics() {
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { BODY_WIDTH, BODY_HEIGHT, BODY_CHAMFER, SENSOR_WIDTH, SENSOR_HEIGHT, SENSOR_OFFSET_Y, FRICTION_AIR } = PLAYER_CONFIG;

        // Main body
        const mainBody = Bodies.rectangle(0, 0, BODY_WIDTH, BODY_HEIGHT, {
            chamfer: { radius: BODY_CHAMFER },
            label: 'player_body',
        });

        // Ground sensor di kaki
        this.groundSensor = Bodies.rectangle(0, SENSOR_OFFSET_Y, SENSOR_WIDTH, SENSOR_HEIGHT, {
            isSensor: true,
            label: 'player_ground_sensor',
        });

        // Compound body
        const compoundBody = Body.create({
            parts: [mainBody, this.groundSensor],
            friction: this.normalFriction,
            frictionAir: FRICTION_AIR,
            restitution: 0,
            label: 'player',
        });

        this.setExistingBody(compoundBody);
        this.setFixedRotation();

        // Collision events
        this.scene.matter.world.on('collisionstart', this.onCollisionStart, this);
        this.scene.matter.world.on('collisionend', this.onCollisionEnd, this);
    }

    // ============================================
    // COLLISION HANDLING
    // ============================================

    onCollisionStart(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            // Ground detection
            if (this.isGroundSensorCollision(bodyA, bodyB)) {
                const otherBody = bodyA.label === 'player_ground_sensor' ? bodyB : bodyA;
                if (this.isGroundBody(otherBody)) {
                    this.touchingGround = true;
                }
            }

            // Interactable detection
            if (bodyA.label === 'interactable' || bodyB.label === 'interactable') {
                const interactableBody = bodyA.label === 'interactable' ? bodyA : bodyB;
                this.canInteract = true;
                this.currentInteractable = interactableBody.gameObject;
                if (this.currentInteractable?.showPrompt) {
                    this.currentInteractable.showPrompt();
                }
            }

            // Enemy/hazard detection
            if (bodyA.label === 'enemy_attack' || bodyB.label === 'enemy_attack') {
                if (!this.isHiding && !this.isInvincible) {
                    const direction = bodyA.position.x < this.x ? 1 : -1;
                    this.stateMachine.setState('hurt', 25, direction);
                }
            }
        });
    }

    onCollisionEnd(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            if (this.isGroundSensorCollision(bodyA, bodyB)) {
                const otherBody = bodyA.label === 'player_ground_sensor' ? bodyB : bodyA;
                if (this.isGroundBody(otherBody)) {
                    this.touchingGround = false;
                }
            }

            if (bodyA.label === 'interactable' || bodyB.label === 'interactable') {
                if (this.currentInteractable?.hidePrompt) {
                    this.currentInteractable.hidePrompt();
                }
                this.canInteract = false;
                this.currentInteractable = null;
            }
        });
    }

    isGroundSensorCollision(bodyA, bodyB) {
        return bodyA.label === 'player_ground_sensor' || bodyB.label === 'player_ground_sensor';
    }

    isGroundBody(body) {
        return ['ground', 'platform', 'tilemap'].includes(body.label) || body.gameObject?.tile;
    }

    // ============================================
    // MOVEMENT
    // ============================================

    move(direction, multiplier = 1) {
        this.setVelocityX(direction * this.moveSpeed * multiplier);

        // Flip sprite
        if (direction < 0) {
            this.setFlipX(true);
            this.facing = -1;
        } else if (direction > 0) {
            this.setFlipX(false);
            this.facing = 1;
        }
    }

    jump() {
        if (this.isOnGround()) {
            this.setVelocityY(-this.jumpForce);
            this.playSound('sfx_jump');
        }
    }

    isOnGround() {
        return this.touchingGround;
    }

    onLand() {
        // Landing effect
        this.playSound('sfx_land');
        // Could add dust particles here
    }

    // ============================================
    // SHELL MECHANIC (Fitur Utama!)
    // ============================================

    enterShellMode() {
        this.isHiding = true;
        this.setVelocityX(0);
        this.setFriction(this.shellFriction);

        // Emit ke React UI
        EventBus.emit(EVENTS.PLAYER_HIDING);

        this.playSound('sfx_shell_enter');
    }

    exitShellMode() {
        this.isHiding = false;
        this.setFriction(this.normalFriction);

        // Emit ke React UI
        EventBus.emit(EVENTS.PLAYER_REVEALED);

        this.playSound('sfx_shell_exit');
    }

    // ============================================
    // HEALTH & DAMAGE
    // ============================================

    receiveDamage(amount) {
        if (this.isInvincible || this.isHiding || this.isDead) return;

        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Update React UI
        GameEvents.updateHealth(this.health, this.maxHealth);

        this.playSound('sfx_hurt');

        if (this.health <= 0) {
            this.stateMachine.setState('dead');
        } else {
            this.setInvincible(1000);
        }
    }

    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.health, this.maxHealth);
        GameEvents.updateHealth(this.health, this.maxHealth);
    }

    setInvincible(duration) {
        this.isInvincible = true;

        // Flashing effect
        this.flashTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.4,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(duration / 200),
        });

        this.scene.time.delayedCall(duration, () => {
            this.isInvincible = false;
            this.setAlpha(1);
            if (this.flashTween) this.flashTween.stop();
        });
    }

    onDeath() {
        this.isDead = true;
        this.inputManager.disable();

        // Emit ke React
        EventBus.emit(EVENTS.PLAYER_DIED);

        this.playSound('sfx_death');
    }

    // ============================================
    // INTERACTION
    // ============================================

    tryInteract() {
        if (this.canInteract && this.currentInteractable) {
            this.currentInteractable.interact(this);
            return true;
        }
        return false;
    }

    // ============================================
    // ANIMATION
    // ============================================

    playAnimation(name) {
        const animKey = `kirana_${name}`;
        if (this.scene.anims.exists(animKey)) {
            this.play(animKey, true);
        }
    }

    // ============================================
    // SOUND
    // ============================================

    playSound(key, config = {}) {
        if (this.scene.sound.get(key) || this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, { volume: 0.5, ...config });
        }
    }

    // ============================================
    // UPDATE
    // ============================================

    update(time, delta) {
        if (this.isDead) return;

        // Check interact input
        if (this.inputManager.isInteractJustPressed()) {
            this.tryInteract();
        }

        // NOTE: Pause is now handled by React's useKeyboardShortcuts hook
        // to avoid double-triggering and ensure UI state stays in sync

        // Update state machine
        this.stateMachine.update(delta);
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        // Safe cleanup - check if scene and matter still exist
        if (this.scene && this.scene.matter && this.scene.matter.world) {
            this.scene.matter.world.off('collisionstart', this.onCollisionStart, this);
            this.scene.matter.world.off('collisionend', this.onCollisionEnd, this);
        }

        if (this.inputManager) this.inputManager.destroy();
        if (this.flashTween) this.flashTween.stop();

        super.destroy();
    }
}

export default Player;
