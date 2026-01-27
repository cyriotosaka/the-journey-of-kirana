/**
 * 🛤️ PATH FOLLOWER - Utility untuk patrol path
 *
 * Digunakan Enemy untuk jalan bolak-balik
 */

export class PathFollower {
    constructor(entity, options = {}) {
        this.entity = entity;
        this.scene = entity.scene;

        // Path
        this.path = options.path || [];
        this.currentPointIndex = 0;
        this.isReversing = false;

        // Settings
        this.speed = options.speed || 2;
        this.waitTime = options.waitTime || 1500;
        this.loopType = options.loopType || 'pingpong'; // 'pingpong', 'loop', 'once'

        // State
        this.isActive = true;
        this.isWaiting = false;
        this.isPaused = false;

        this.reachThreshold = options.reachThreshold || 10;

        // Callbacks
        this.onReachPoint = options.onReachPoint || null;
        this.onPathComplete = options.onPathComplete || null;

        // Debug
        this.debugGraphics = null;
        if (options.debug) {
            this.createDebugGraphics();
        }
    }

    setPath(points) {
        this.path = points;
        this.currentPointIndex = 0;
        this.isReversing = false;
        this.updateDebugGraphics();
    }

    getCurrentTarget() {
        if (this.path.length === 0) return null;
        return this.path[this.currentPointIndex];
    }

    update(delta) {
        if (!this.isActive || this.isPaused || this.isWaiting) return null;
        if (this.path.length < 2) return null;

        const target = this.getCurrentTarget();
        if (!target) return null;

        const dx = target.x - this.entity.x;
        const distance = Math.abs(dx);

        // Reached point?
        if (distance <= this.reachThreshold) {
            this.onReachCurrentPoint();
            return null;
        }

        // Move towards target
        const direction = dx > 0 ? 1 : -1;
        this.entity.setVelocityX(direction * this.speed);

        // Flip sprite
        if (direction < 0) {
            this.entity.setFlipX(true);
        } else {
            this.entity.setFlipX(false);
        }

        return { direction, distance };
    }

    onReachCurrentPoint() {
        this.entity.setVelocityX(0);

        if (this.onReachPoint) {
            this.onReachPoint(this.currentPointIndex, this.path[this.currentPointIndex]);
        }

        this.isWaiting = true;

        this.scene.time.delayedCall(this.waitTime, () => {
            this.isWaiting = false;
            this.advanceToNextPoint();
        });
    }

    advanceToNextPoint() {
        if (this.loopType === 'pingpong') {
            if (!this.isReversing) {
                if (this.currentPointIndex >= this.path.length - 1) {
                    this.isReversing = true;
                    this.currentPointIndex--;
                } else {
                    this.currentPointIndex++;
                }
            } else {
                if (this.currentPointIndex <= 0) {
                    this.isReversing = false;
                    this.currentPointIndex++;
                } else {
                    this.currentPointIndex--;
                }
            }
        } else if (this.loopType === 'loop') {
            this.currentPointIndex = (this.currentPointIndex + 1) % this.path.length;
        } else {
            // once
            if (this.currentPointIndex < this.path.length - 1) {
                this.currentPointIndex++;
            } else {
                this.isActive = false;
                if (this.onPathComplete) this.onPathComplete();
            }
        }
    }

    pause() {
        this.isPaused = true;
        this.entity.setVelocityX(0);
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isActive = false;
        this.entity.setVelocityX(0);
    }

    start() {
        this.isActive = true;
        this.currentPointIndex = 0;
        this.isReversing = false;
        this.isWaiting = false;
    }

    reset() {
        this.currentPointIndex = 0;
        this.isReversing = false;
        this.isWaiting = false;
    }

    // Debug visualization
    createDebugGraphics() {
        this.debugGraphics = this.scene.add.graphics();
        this.updateDebugGraphics();
    }

    updateDebugGraphics() {
        if (!this.debugGraphics) return;

        this.debugGraphics.clear();
        if (this.path.length < 2) return;

        // Draw lines
        this.debugGraphics.lineStyle(2, 0x00ff00, 0.5);
        this.debugGraphics.beginPath();
        this.debugGraphics.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            this.debugGraphics.lineTo(this.path[i].x, this.path[i].y);
        }
        this.debugGraphics.strokePath();

        // Draw points
        for (let i = 0; i < this.path.length; i++) {
            const point = this.path[i];
            const isCurrent = i === this.currentPointIndex;

            this.debugGraphics.fillStyle(isCurrent ? 0xff0000 : 0x00ff00, 1);
            this.debugGraphics.fillCircle(point.x, point.y, isCurrent ? 8 : 5);
        }
    }

    destroy() {
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }
    }
}

/**
 * Helper: Create path dari Tiled object layer
 */
export function createPathFromTiled(map, layerName, pathName) {
    const layer = map.getObjectLayer(layerName);
    if (!layer) return [];

    const pathObj = layer.objects.find((obj) => obj.name === pathName);
    if (!pathObj || !pathObj.polyline) return [];

    return pathObj.polyline.map((point) => ({
        x: pathObj.x + point.x,
        y: pathObj.y + point.y,
    }));
}

export default PathFollower;
