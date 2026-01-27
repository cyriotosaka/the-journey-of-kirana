/**
 * 👹 ENEMY - Musuh dengan AI patrol dan deteksi
 *
 * States: IDLE, PATROL, ALERT, CHASE, SEARCH, ATTACK
 * Vision cone untuk deteksi player
 */

import Phaser from 'phaser';
import { PathFollower } from '../utils/PathFollower';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

// Enemy States
const EnemyState = {
    IDLE: 'idle',
    PATROL: 'patrol',
    ALERT: 'alert',
    CHASE: 'chase',
    SEARCH: 'search',
    ATTACK: 'attack',
    RETURN: 'return',
};

export class Enemy extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture = 'galuh', options = {}) {
        super(scene.matter.world, x, y, texture, 0);

        scene.add.existing(this);
        this.scene = scene;
        this.enemyType = options.type || 'galuh';

        // ========== STATE ==========
        this.currentState = EnemyState.PATROL;
        this.previousState = null;

        // ========== DETECTION ==========
        this.target = null; // Reference ke player
        this.visionRange = options.visionRange || 200;
        this.visionAngle = options.visionAngle || 60;
        this.detectionDelay = options.detectionDelay || 500;
        this.isPlayerDetected = false;
        this.detectionTimer = 0;
        this.lastKnownPlayerPos = null;

        // ========== MOVEMENT ==========
        this.patrolSpeed = options.patrolSpeed || 1.5;
        this.chaseSpeed = options.chaseSpeed || 3.5;

        // ========== VISION CONE ==========
        this.visionCone = null;
        this.visionConeGraphics = null;

        // ========== PATROL ==========
        this.patrolPath = options.patrolPath || [];
        this.pathFollower = null;

        // ========== FACING ==========
        this.facing = 1;

        // ========== SETUP ==========
        this.setupPhysics();
        this.setupVisionCone();
        this.setupPatrol();

        this.playAnimation('idle');
        this.setDepth(10);
    }

    setupPhysics() {
        this.setRectangle(40, 70);
        this.setFixedRotation();
        this.setFriction(0.1);
        this.setFrictionAir(0.05);
        this.body.label = 'enemy';
        this.body.gameObject = this;
    }

    setupVisionCone() {
        this.visionConeGraphics = this.scene.add.graphics();
        this.visionConeGraphics.setDepth(5);
        this.updateVisionCone();
    }

    setupPatrol() {
        if (this.patrolPath.length >= 2) {
            this.pathFollower = new PathFollower(this, {
                path: this.patrolPath,
                speed: this.patrolSpeed,
                waitTime: 2000,
                loopType: 'pingpong',
                onReachPoint: (index, point) => {
                    this.onReachPatrolPoint(index, point);
                },
            });
        }
    }

    setTarget(player) {
        this.target = player;
    }

    setPatrolPath(points) {
        this.patrolPath = points;
        if (this.pathFollower) {
            this.pathFollower.setPath(points);
        } else {
            this.setupPatrol();
        }
    }

    // ============================================
    // VISION CONE
    // ============================================

    updateVisionCone() {
        this.visionConeGraphics.clear();

        const coneLength = this.visionRange;
        const halfAngle = Phaser.Math.DegToRad(this.visionAngle / 2);
        const baseAngle = this.facing === 1 ? 0 : Math.PI;

        const apex = { x: this.x, y: this.y };

        const point1 = {
            x: this.x + Math.cos(baseAngle - halfAngle) * coneLength,
            y: this.y + Math.sin(baseAngle - halfAngle) * coneLength,
        };

        const point2 = {
            x: this.x + Math.cos(baseAngle + halfAngle) * coneLength,
            y: this.y + Math.sin(baseAngle + halfAngle) * coneLength,
        };

        this.visionCone = new Phaser.Geom.Triangle(
            apex.x, apex.y,
            point1.x, point1.y,
            point2.x, point2.y
        );

        this.drawVisionCone(apex, point1, point2);
    }

    drawVisionCone(apex, point1, point2) {
        let color = 0xffff00;
        let alpha = 0.15;

        if (this.currentState === EnemyState.ALERT) {
            color = 0xffa500;
            alpha = 0.3;
        } else if (this.currentState === EnemyState.CHASE) {
            color = 0xff0000;
            alpha = 0.4;
        }

        this.visionConeGraphics.fillStyle(color, alpha);
        this.visionConeGraphics.beginPath();
        this.visionConeGraphics.moveTo(apex.x, apex.y);
        this.visionConeGraphics.lineTo(point1.x, point1.y);
        this.visionConeGraphics.lineTo(point2.x, point2.y);
        this.visionConeGraphics.closePath();
        this.visionConeGraphics.fill();

        this.visionConeGraphics.lineStyle(2, color, alpha + 0.1);
        this.visionConeGraphics.strokeTriangle(
            apex.x, apex.y,
            point1.x, point1.y,
            point2.x, point2.y
        );
    }

    checkVision() {
        if (!this.target || !this.visionCone) return false;

        // Player hiding = tidak terdeteksi
        if (this.target.isHiding) {
            this.isPlayerDetected = false;
            this.detectionTimer = 0;
            return false;
        }

        const playerInCone = Phaser.Geom.Triangle.Contains(
            this.visionCone,
            this.target.x,
            this.target.y
        );

        return playerInCone;
    }

    // ============================================
    // STATE MACHINE
    // ============================================

    setState(newState) {
        if (this.currentState === newState) return;

        this.previousState = this.currentState;
        this.currentState = newState;
        this.onStateEnter(newState);
    }

    onStateEnter(state) {
        switch (state) {
            case EnemyState.IDLE:
                this.setVelocityX(0);
                this.playAnimation('idle');
                break;

            case EnemyState.PATROL:
                this.playAnimation('walk');
                if (this.pathFollower) this.pathFollower.resume();
                break;

            case EnemyState.ALERT:
                this.setVelocityX(0);
                this.playAnimation('alert');
                this.playSound('sfx_enemy_alert');
                break;

            case EnemyState.CHASE:
                this.playAnimation('chase');
                EventBus.emit('enemy:chase_started', { enemy: this });
                break;

            case EnemyState.SEARCH:
                this.playAnimation('search');
                break;

            case EnemyState.ATTACK:
                this.playAnimation('attack');
                break;

            case EnemyState.RETURN:
                this.playAnimation('walk');
                break;
        }
    }

    updateState(delta) {
        switch (this.currentState) {
            case EnemyState.IDLE:
                this.updateIdle(delta);
                break;
            case EnemyState.PATROL:
                this.updatePatrol(delta);
                break;
            case EnemyState.ALERT:
                this.updateAlert(delta);
                break;
            case EnemyState.CHASE:
                this.updateChase(delta);
                break;
            case EnemyState.SEARCH:
                this.updateSearch(delta);
                break;
            case EnemyState.ATTACK:
                this.updateAttack(delta);
                break;
            case EnemyState.RETURN:
                this.updateReturn(delta);
                break;
        }
    }

    updateIdle(delta) {
        if (this.checkVision()) {
            this.setState(EnemyState.ALERT);
        }
    }

    updatePatrol(delta) {
        if (this.pathFollower) {
            this.pathFollower.update(delta);
        }

        // Update facing
        if (this.body.velocity.x < -0.1) {
            this.facing = -1;
            this.setFlipX(true);
        } else if (this.body.velocity.x > 0.1) {
            this.facing = 1;
            this.setFlipX(false);
        }

        if (this.checkVision()) {
            if (this.pathFollower) this.pathFollower.pause();
            this.setState(EnemyState.ALERT);
        }
    }

    updateAlert(delta) {
        this.detectionTimer += delta;

        // Face player
        if (this.target) {
            this.facing = this.target.x > this.x ? 1 : -1;
            this.setFlipX(this.facing === -1);
        }

        if (this.detectionTimer >= this.detectionDelay) {
            if (this.checkVision()) {
                this.setState(EnemyState.CHASE);
            } else {
                this.detectionTimer = 0;
                this.setState(EnemyState.PATROL);
            }
        }
    }

    updateChase(delta) {
        if (!this.target) {
            this.setState(EnemyState.SEARCH);
            return;
        }

        if (this.target.isHiding) {
            this.lastKnownPlayerPos = { x: this.target.x, y: this.target.y };
            this.setState(EnemyState.SEARCH);
            return;
        }

        // Move towards player
        const dx = this.target.x - this.x;
        const direction = dx > 0 ? 1 : -1;

        this.setVelocityX(direction * this.chaseSpeed);
        this.facing = direction;
        this.setFlipX(direction === -1);

        this.lastKnownPlayerPos = { x: this.target.x, y: this.target.y };

        // Attack jika dekat
        const distance = Math.abs(dx);
        if (distance < 50) {
            this.setState(EnemyState.ATTACK);
        }

        // Lost sight
        if (!this.checkVision()) {
            this.setState(EnemyState.SEARCH);
        }
    }

    updateSearch(delta) {
        if (this.lastKnownPlayerPos) {
            const dx = this.lastKnownPlayerPos.x - this.x;
            const distance = Math.abs(dx);

            if (distance > 15) {
                const direction = dx > 0 ? 1 : -1;
                this.setVelocityX(direction * this.patrolSpeed);
                this.facing = direction;
                this.setFlipX(direction === -1);
            } else {
                this.setVelocityX(0);
                this.lastKnownPlayerPos = null;
            }
        } else {
            this.setState(EnemyState.RETURN);
        }

        if (this.checkVision()) {
            this.setState(EnemyState.CHASE);
        }
    }

    updateAttack(delta) {
        this.setVelocityX(0);

        // Check if player in range and not hiding
        if (this.target && !this.target.isHiding && !this.target.isInvincible) {
            const distance = Math.abs(this.target.x - this.x);
            if (distance < 60) {
                // GAME OVER!
                GameEvents.gameOver('Kirana tertangkap oleh ' + this.enemyType);
            }
        }

        // After attack, chase or search
        this.scene.time.delayedCall(600, () => {
            if (this.checkVision()) {
                this.setState(EnemyState.CHASE);
            } else {
                this.setState(EnemyState.SEARCH);
            }
        });
    }

    updateReturn(delta) {
        if (this.patrolPath.length > 0) {
            const startPoint = this.patrolPath[0];
            const dx = startPoint.x - this.x;
            const distance = Math.abs(dx);

            if (distance > 15) {
                const direction = dx > 0 ? 1 : -1;
                this.setVelocityX(direction * this.patrolSpeed);
                this.facing = direction;
                this.setFlipX(direction === -1);
            } else {
                this.detectionTimer = 0;
                this.setState(EnemyState.PATROL);
            }
        } else {
            this.setState(EnemyState.IDLE);
        }

        if (this.checkVision()) {
            this.setState(EnemyState.ALERT);
        }
    }

    onReachPatrolPoint(index, point) {
        // Could add custom behavior here
    }

    // ============================================
    // ANIMATION & SOUND
    // ============================================

    playAnimation(name) {
        const animKey = `${this.enemyType}_${name}`;
        if (this.scene.anims.exists(animKey)) {
            this.play(animKey, true);
        }
    }

    playSound(key, config = {}) {
        if (this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, { volume: 0.5, ...config });
        }
    }

    // ============================================
    // UPDATE
    // ============================================

    update(time, delta) {
        this.updateVisionCone();
        this.updateState(delta);
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        if (this.visionConeGraphics) {
            this.visionConeGraphics.destroy();
        }
        if (this.pathFollower) {
            this.pathFollower.destroy();
        }
        super.destroy();
    }
}

export default Enemy;
