/**
 * 🏠 LEVEL 2 - Dapur Nenek Galuh
 *
 * Level kedua - interior gelap dan claustrophobic
 * - Ruangan tertutup, lebih gelap
 * - Galuh lebih agresif
 * - Lebih banyak hiding spots
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Item, Door, HidingSpot } from '../entities/Interactable';
import { LightingSystem } from '../systems/LightingSystem';
import { EventBus, EVENTS, GameEvents } from '../systems/EventBus';

export class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
    }

    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 500;
        this.isPaused = false;
        this.isGameOver = false;
    }

    create() {
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        this.createBackground();
        this.createTilemap();
        this.createPlayer();
        this.createEnemies();
        this.createInteractables();
        this.createLighting();
        this.setupCamera();
        this.setupAudio();
        this.setupEvents();

        EventBus.emit(EVENTS.SCENE_CHANGED, 'Level2');

        // Show level intro dialog
        this.time.delayedCall(1500, () => {
            EventBus.emit(EVENTS.DIALOG_SHOW, {
                character: 'Kirana',
                text: 'Dapur ini... bau busuk dan gelap. Aku harus hati-hati...',
                avatar: null,
            });
        });
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // ========== LAYER 1: Back layer (furthest, slowest scroll) ==========
        if (this.textures.exists('bg_level2_layer1')) {
            this.bgLayer1 = this.add.tileSprite(0, 0, width, height, 'bg_level2_layer1')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-50)
                .setDisplaySize(width, height);
        } else {
            // Fallback dark background
            this.add.rectangle(0, 0, width * 2, height, 0x0a0808)
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-50);
        }

        // ========== LAYER 2: Mid-back ==========
        if (this.textures.exists('bg_level2_layer2')) {
            this.bgLayer2 = this.add.tileSprite(0, 0, width, height, 'bg_level2_layer2')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-40)
                .setDisplaySize(width, height);
        }

        // ========== LAYER 3: Mid-front ==========
        if (this.textures.exists('bg_level2_layer3')) {
            this.bgLayer3 = this.add.tileSprite(0, 0, width, height, 'bg_level2_layer3')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-30)
                .setDisplaySize(width, height);
        }

        // ========== LAYER 4: Front layer (closest, fastest scroll) ==========
        if (this.textures.exists('bg_level2_layer4')) {
            this.bgLayer4 = this.add.tileSprite(0, 0, width, height, 'bg_level2_layer4')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-20)
                .setDisplaySize(width, height);
        }
    }

    createTilemap() {
        if (!this.cache.tilemap.exists('map_level2')) {
            this.createPlaceholderLevel();
            return;
        }

        this.map = this.make.tilemap({ key: 'map_level2' });
        const tileset = this.map.addTilesetImage('tileset_interior', 'tileset_interior');

        this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
        this.furnitureLayer = this.map.createLayer('Furniture', tileset, 0, 0);

        if (this.groundLayer) {
            this.groundLayer.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(this.groundLayer);
        }

        if (this.wallsLayer) {
            this.wallsLayer.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(this.wallsLayer);
        }

        const spawnPoint = this.map.findObject('Objects', (obj) => obj.name === 'PlayerSpawn');
        if (spawnPoint) {
            this.spawnX = spawnPoint.x;
            this.spawnY = spawnPoint.y;
        }
    }

    createPlaceholderLevel() {
        const { width, height } = this.cameras.main;
        const groundY = height - 60;

        // Floor
        this.matter.add.rectangle(width, groundY + 30, width * 2, 60, {
            isStatic: true,
            label: 'ground',
        });

        const floorGraphics = this.add.graphics();
        floorGraphics.fillStyle(0x1a1515);
        floorGraphics.fillRect(0, groundY, width * 2, 60);

        // Ceiling
        this.matter.add.rectangle(width, 30, width * 2, 60, {
            isStatic: true,
            label: 'ceiling',
        });

        const ceilingGraphics = this.add.graphics();
        ceilingGraphics.fillStyle(0x0a0808);
        ceilingGraphics.fillRect(0, 0, width * 2, 60);

        // Left wall
        this.matter.add.rectangle(30, height / 2, 60, height, {
            isStatic: true,
            label: 'wall',
        });

        // Right wall
        this.matter.add.rectangle(width * 2 - 30, height / 2, 60, height, {
            isStatic: true,
            label: 'wall',
        });

        // Furniture platforms (tables, shelves)
        const furniture = [
            { x: 350, y: groundY - 80, w: 180, h: 20 },   // Table 1
            { x: 700, y: groundY - 120, w: 150, h: 20 },  // Shelf
            { x: 1050, y: groundY - 70, w: 200, h: 20 },  // Table 2
            { x: 1400, y: groundY - 150, w: 120, h: 20 }, // High shelf
            { x: 1700, y: groundY - 90, w: 160, h: 20 },  // Counter
        ];

        furniture.forEach((f) => {
            this.matter.add.rectangle(f.x, f.y + f.h / 2, f.w, f.h, {
                isStatic: true,
                label: 'platform',
            });

            const furnitureGraphics = this.add.graphics();
            furnitureGraphics.fillStyle(0x2a2020);
            furnitureGraphics.fillRect(f.x - f.w / 2, f.y, f.w, f.h);
            
            // Table legs
            furnitureGraphics.fillStyle(0x1a1515);
            furnitureGraphics.fillRect(f.x - f.w / 2 + 10, f.y + f.h, 15, groundY - f.y - f.h);
            furnitureGraphics.fillRect(f.x + f.w / 2 - 25, f.y + f.h, 15, groundY - f.y - f.h);
        });

        this.matter.world.setBounds(0, 0, width * 2, height);
    }

    createPlayer() {
        this.player = new Player(this, this.spawnX, this.spawnY);
    }

    createEnemies() {
        this.enemies = [];
        const { height } = this.cameras.main;

        // Galuh (Nenek) - more aggressive in her kitchen
        const galuh = new Enemy(this, 900, height - 160, 'galuh', {
            type: 'galuh',
            visionRange: 250,      // Wider vision
            visionAngle: 70,       // Wider angle
            patrolSpeed: 2,        // Faster patrol
            chaseSpeed: 4.5,       // Faster chase
            detectionDelay: 300,   // Faster detection
        });
        galuh.setTarget(this.player);
        galuh.setPatrolPath([
            { x: 300, y: height - 160 },
            { x: 800, y: height - 160 },
            { x: 1200, y: height - 160 },
            { x: 1600, y: height - 160 },
        ]);
        this.enemies.push(galuh);
    }

    createInteractables() {
        this.interactables = [];
        const { height } = this.cameras.main;

        // Hiding spots - pots and barrels
        const hidingPositions = [
            { x: 200, y: height - 90 },
            { x: 500, y: height - 90 },
            { x: 850, y: height - 90 },
            { x: 1150, y: height - 90 },
            { x: 1500, y: height - 90 },
        ];

        hidingPositions.forEach((pos, i) => {
            const texture = i % 2 === 0 ? 'prop_pot' : 'prop_barrel';
            const spot = new HidingSpot(this, pos.x, pos.y, { texture });
            this.interactables.push(spot);
        });

        // Key (hidden on high shelf)
        const key = new Item(this, 1400, height - 220, {
            id: 'key_level2',
            name: 'Kunci Gudang',
            description: 'Kunci menuju kebebasan.',
            texture: 'item_key',
        });
        this.interactables.push(key);

        // Shell fragment
        const fragment = new Item(this, 700, height - 190, {
            id: 'shell_fragment_2',
            name: 'Pecahan Cangkang',
            description: 'Pecahan kedua dari cangkang emas.',
            texture: 'item_shell_fragment',
        });
        this.interactables.push(fragment);

        // Exit door (far right)
        const exitDoor = new Door(this, 1900, height - 100, {
            isLocked: true,
            keyRequired: 'key_level2',
            targetScene: 'GameComplete', // Or next level
            targetSpawn: { x: 100, y: 500 },
        });
        this.interactables.push(exitDoor);
    }

    createLighting() {
        // Much darker atmosphere
        this.lightingSystem = new LightingSystem(this, {
            ambientLight: 0.06,        // Very dark
            darknessColor: 0x050305,   // Almost black with red tint
        });

        // Smaller player light (claustrophobic)
        this.lightingSystem.addPlayerLight(this.player, {
            radius: 70,
            intensity: 0.7,
            flicker: true,
            flickerAmount: 0.15,
        });

        // Candles/lanterns scattered around
        const { height } = this.cameras.main;
        
        this.lightingSystem.addLight(250, height - 150, {
            radius: 50,
            intensity: 0.5,
            color: 0xff6644,
            flicker: true,
        });

        this.lightingSystem.addLight(600, height - 100, {
            radius: 60,
            intensity: 0.6,
            color: 0xff8844,
            flicker: true,
        });

        this.lightingSystem.addLight(1100, height - 130, {
            radius: 55,
            intensity: 0.5,
            color: 0xff6644,
            flicker: true,
        });

        this.lightingSystem.addLight(1550, height - 100, {
            radius: 65,
            intensity: 0.6,
            color: 0xff8844,
            flicker: true,
        });

        // Slow fade from black
        this.lightingSystem.fadeFromBlack(3000, 0.06);
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        const mapWidth = this.map ? this.map.widthInPixels : 1280 * 2;
        const mapHeight = this.map ? this.map.heightInPixels : 720;

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        
        // Slight zoom for claustrophobic feel
        this.cameras.main.setZoom(1.1);
    }

    setupAudio() {
        // Darker, more oppressive music
        if (this.cache.audio.exists('bgm_dungeon')) {
            this.bgm = this.sound.add('bgm_dungeon', { volume: 0.25, loop: true });
            this.bgm.play();
        }

        // Kitchen ambience (creaking, dripping)
        if (this.cache.audio.exists('amb_kitchen')) {
            this.ambience = this.sound.add('amb_kitchen', { volume: 0.3, loop: true });
            this.ambience.play();
        }
    }

    setupEvents() {
        EventBus.on(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.on(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.on(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.on(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.on(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.on('enemy:chase_started', this.onChaseStarted, this);

        // ========== DEV EVENTS ==========
        EventBus.on('dev:switch_level', this.onDevSwitchLevel, this);
        EventBus.on('dev:set_health', this.onDevSetHealth, this);
        EventBus.on('dev:toggle_invincible', this.onDevToggleInvincible, this);
    }

    // ========== DEV HANDLERS ==========
    onDevSwitchLevel(levelKey) {
        console.log(`🚀 Switching to ${levelKey}`);
        this.cleanup();
        this.scene.start(levelKey);
    }

    onDevSetHealth(health) {
        if (this.player) this.player.currentHealth = health;
    }

    onDevToggleInvincible() {
        if (this.player) {
            this.player.isInvincible = !this.player.isInvincible;
            console.log(`🛡️ Invincible: ${this.player.isInvincible}`);
        }
    }

    onGameOver(data) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.player.inputManager.disable();
        
        // More intense shake for kitchen
        this.cameras.main.shake(700, 0.03);
        
        // Flash red
        this.cameras.main.flash(300, 100, 0, 0);

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.cleanup();
                this.scene.restart();
            });
        });
    }

    onPause() {
        this.isPaused = true;
        this.matter.world.pause();
        this.player.inputManager.disable();
    }

    onResume() {
        this.isPaused = false;
        this.matter.world.resume();
        this.player.inputManager.enable();
    }

    onDialogShow() {
        this.onPause();
    }

    onDialogHide() {
        this.onResume();
    }

    onChaseStarted() {
        if (this.bgm) {
            this.tweens.add({ targets: this.bgm, volume: 0, duration: 300 });
        }

        if (this.cache.audio.exists('bgm_chase')) {
            this.chaseBgm = this.sound.add('bgm_chase', { volume: 0.6, loop: true });
            this.chaseBgm.play();
        }

        // Intensify lighting flicker during chase
        if (this.lightingSystem && this.lightingSystem.playerLight) {
            this.lightingSystem.playerLight.flickerAmount = 0.25;
        }
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        this.player.update(time, delta);
        this.enemies.forEach((enemy) => enemy.update(time, delta));
        this.lightingSystem.update(time, delta);

        // ========== PARALLAX SCROLLING ==========
        const camX = this.cameras.main.scrollX;
        
        // Each layer scrolls at different speed for depth effect
        if (this.bgLayer1) this.bgLayer1.tilePositionX = camX * 0.1;  // Slowest
        if (this.bgLayer2) this.bgLayer2.tilePositionX = camX * 0.3;
        if (this.bgLayer3) this.bgLayer3.tilePositionX = camX * 0.5;
        if (this.bgLayer4) this.bgLayer4.tilePositionX = camX * 0.7;  // Fastest
    }

    cleanup() {
        EventBus.off(EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.off(EVENTS.GAME_PAUSED, this.onPause, this);
        EventBus.off(EVENTS.GAME_RESUMED, this.onResume, this);
        EventBus.off(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.off(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        EventBus.off('enemy:chase_started', this.onChaseStarted, this);

        if (this.bgm) this.bgm.stop();
        if (this.ambience) this.ambience.stop();
        if (this.chaseBgm) this.chaseBgm.stop();
        if (this.lightingSystem) this.lightingSystem.destroy();
    }

    shutdown() {
        this.cleanup();
    }
}

export default Level2;
