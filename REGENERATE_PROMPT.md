# Prompt untuk Meregenerasi Game "The Journey of Kirana"

## 🎮 RINGKASAN GAME

Buatkan game 2D horror-stealth side-scroller berbasis cerita rakyat Indonesia "Keong Mas" menggunakan **React + Phaser 3 + Matter.js physics**. Game ini menceritakan perjalanan Dewi Galuh Candra Kirana yang dikutuk menjadi keong emas oleh neneknya (Mbok Galuh) dan harus mencari jalan pulang sambil menghindari musuh-musuh berbahaya.

---

## 📚 CERITA & LATAR BELAKANG

**Protagonis**: Kirana - putri kerajaan yang dikutuk menjadi keong emas (ciri khas: cangkang emas, bisa bersembunyi dalam cangkang)

**Antagonis Utama**: 
- Mbok Galuh (Nenek jahat) - enemy di Level 1 & 2
- Buto Ijo (Raksasa Hijau) - enemy di Level 3-5 (kecil) dan Level 7 (boss besar)

**Alur Cerita (7 Level)**:
1. **Level 1 - Rumah Nenek**: Kirana terbangun di rumah nenek, harus kabur
2. **Level 2 - Hutan Terkutuk**: Melarikan diri melewati hutan gelap
3. **Level 3 - Jejak Raksasa**: Menemukan jejak Buto Ijo
4. **Level 4 - Rawa & Penyamaran**: Menyamar di rawa berbahaya
5. **Level 5 - Markas Buto Ijo**: Menyusup ke markas musuh
6. **Level 6 - Kebenaran Keong**: Kirana menemukan cara memecah kutukan
7. **Level 7 - Pembebasan**: Boss fight melawan Buto Ijo

---

## 🛠️ TECH STACK

```
- React 18+
- Vite (bundler)
- Phaser 3.90+ (game engine)
- Matter.js (physics engine, via Phaser)
- Zustand (state management)
- CSS3 (styling, no Tailwind)
```

---

## 📁 STRUKTUR PROJECT

```
src/
├── main.jsx                 # Entry point React
├── App.jsx                  # Root component dengan routing
├── components/
│   ├── Layout.jsx           # Main layout dengan HUD overlay
│   ├── PhaserContainer.jsx  # Container untuk Phaser game
│   ├── UI/
│   │   ├── MainMenu.jsx     # Menu utama (horror theme)
│   │   ├── PauseMenu.jsx    # Menu pause
│   │   ├── DialogBox.jsx    # Dialog RPG style dengan avatar
│   │   ├── InventoryBar.jsx # Inventory horizontal 6 slot
│   │   ├── HealthBar.jsx    # Health bar (hanya muncul di Level 7)
│   │   ├── DevMenu.jsx      # Dev tools (level switcher, invincible, dll)
│   │   └── Toast.jsx        # Notifikasi item pickup
│   └── styles/
│       ├── Layout.css
│       ├── MainMenu.css     # Horror theme dengan efek glitch
│       ├── DialogBox.css    # RPG portrait style
│       └── ...
├── game/
│   ├── main.js              # Phaser game config
│   ├── config/
│   │   └── GameConfig.js    # Konstanta game
│   ├── scenes/
│   │   ├── BootScene.js     # Loading, placeholder textures, animations
│   │   ├── Level1.js        # Rumah Nenek
│   │   ├── Level2.js        # Hutan Terkutuk
│   │   ├── Level3.js        # Jejak Raksasa
│   │   ├── Level4.js        # Rawa & Penyamaran
│   │   ├── Level5.js        # Markas Buto Ijo
│   │   ├── Level6.js        # Kebenaran Keong (peaceful, no enemies)
│   │   └── Level7.js        # Boss Fight
│   ├── entities/
│   │   ├── Player.js        # Kirana dengan state machine
│   │   ├── Enemy.js         # Base enemy class
│   │   └── Interactable.js  # Items, Doors, HidingSpots
│   ├── systems/
│   │   ├── EventBus.js      # Event system
│   │   ├── InputManager.js  # Keyboard input handling
│   │   └── LightingSystem.js # Dynamic lighting dengan shadows
│   └── utils/
│       └── StateMachine.js  # Player state management
├── stores/
│   └── useGameStore.js      # Zustand store
├── hooks/
│   ├── useGameState.js      # Game state hook
│   └── useKeyboardShortcuts.js
└── styles/
    ├── index.css            # Global styles
    └── variables.css        # CSS custom properties
```

---

## 🎭 PLAYER (Kirana) SPECIFICATIONS

### Visual
- Sprite 64x64px dengan animasi: idle, walk, run, jump, fall, landing, hurt, death
- Animasi khusus: shell_enter, shell_idle, shell_exit (bersembunyi dalam cangkang)
- Warna: emas/gold (#d4af37)
- Scale: 0.18 (sprite asli besar, discale down)

### Physics (Matter.js)
- Body: Rectangle 28x44 dengan chamfer
- Ground sensor: Rectangle 20x6 di bawah kaki
- Compound body dengan fixed rotation
- PENTING: `setPosition()` harus dipanggil SETELAH `setExistingBody()` karena setExistingBody reset posisi

### Movement
- Move speed: 3.5
- Jump force: 8
- Friction: 0.1 (normal), 0.8 (dalam cangkang)

### State Machine States
- idle, walking, jumping, falling, landing
- hiding (dalam cangkang - invulnerable)
- hurt, dead

### Input
- WASD / Arrow keys: Movement
- SPACE: Jump
- E: Interact
- SHIFT: Hide in shell
- ESC: Pause

---

## 👹 ENEMY SPECIFICATIONS

### Galuh (Nenek Jahat)
- Texture: 'galuh' - warna ungu gelap
- Size: 96x96
- Digunakan di: Level 1, Level 2
- Perilaku: Patrol, Detect player, Chase

### Buto Ijo (Raksasa Hijau)
- Texture: 'buto_ijo' - warna hijau
- Size: 96x96 (normal), 2.5x scale (boss)
- Digunakan di: Level 3-5 (buto_ijo_kecil), Level 7 (boss)
- Perilaku: Patrol, Vision detection, Chase, Attack

### Enemy AI States
- patrol: Berjalan bolak-balik di patrol path
- alert: Mendeteksi pemain
- chase: Mengejar pemain
- search: Mencari pemain yang hilang
- return: Kembali ke patrol

---

## 🎨 VISUAL STYLE & UI

### Overall Theme
- Horror-stealth dengan nuansa folklore Indonesia
- Dark color palette dengan accent gold
- Pencahayaan dinamis dengan shadow overlay

### Main Menu
- Background gelap dengan efek fog/mist
- Judul dengan efek glitch/horror
- Tombol dengan glow effect saat hover
- Music: BGM horror ambient

### Dialog Box (RPG Style)
- Container semi-transparent dengan border gold
- Portrait karakter 150x200px di kiri
- Text area dengan typewriter effect
- Support untuk pilihan/choices

### Inventory Bar
- Posisi: Top-left
- 6 slot horizontal dengan border gold
- Item icons dengan label

### Health Bar
- HANYA muncul di Level 7 (Boss Fight)
- Posisi: Top-center
- Style: Bar merah dengan border gold

### Lighting System
- Overlay gelap menutupi seluruh screen
- Player light (radius mengikuti player)
- Static lights (torch, lantern effects)
- Ambient light level per-level (0.0-1.0)

---

## 🎵 AUDIO

### BGM (per level)
- bgm_level1: Ambient horror
- bgm_level2: Forest dark
- bgm_level3-5: Tension/suspense
- bgm_level6: Mystical/peaceful
- bgm_level7: Boss battle epic
- bgm_chase: Fast tempo untuk chase sequence

### SFX
- Player: footstep, jump, land, hurt, shell_enter, shell_exit
- Enemy: alert, chase, attack
- UI: dialog_typing, button_hover, item_pickup
- Environment: door_open, door_locked

---

## 📍 LEVEL DESIGN TEMPLATE

Setiap level harus memiliki:

```javascript
class LevelX extends Phaser.Scene {
    init(data) {
        this.spawnX = data?.spawnX || 100;
        this.spawnY = data?.spawnY || 640;
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
    }
    
    update(time, delta) {
        // PENTING: Lighting harus update SEBELUM pause check
        if (this.lightingSystem) this.lightingSystem.update(time, delta);
        
        if (this.isPaused || this.isGameOver) return;
        
        this.player.update(time, delta);
        this.enemies.forEach(e => e.update(time, delta));
    }
    
    // Dialog handlers
    onDialogShow() {
        if (!this.scene.isActive()) return; // Prevent cross-scene events
        this.onPause();
    }
    
    onDialogHide() {
        if (!this.scene.isActive()) return;
        this.onResume();
    }
    
    // Safe pause/resume
    onPause() {
        if (!this.matter || !this.matter.world) return;
        this.isPaused = true;
        this.matter.world.pause();
        if (this.player?.inputManager) this.player.inputManager.disable();
    }
    
    onResume() {
        if (!this.matter || !this.matter.world) return;
        this.isPaused = false;
        this.matter.world.resume();
        if (this.player?.inputManager) this.player.inputManager.enable();
    }
    
    cleanup() {
        // Remove ALL event listeners
        EventBus.off(EVENTS.DIALOG_SHOW, this.onDialogShow, this);
        EventBus.off(EVENTS.DIALOG_HIDE, this.onDialogHide, this);
        // ... cleanup lainnya
    }
    
    shutdown() { this.cleanup(); }
}
```

---

## 🔑 INTERACTABLES

### Item
- Collectable: auto-pickup on collision
- Properties: id, name, description, texture
- Emit: EVENTS.ITEM_COLLECTED

### Door
- States: locked, open
- Requires key item to unlock
- targetScene + targetSpawn untuk transisi level

### HidingSpot
- Visual: barrel, crate, etc.
- Player bisa bersembunyi di dalam
- Enemy tidak bisa mendeteksi player yang bersembunyi

---

## 🔧 IMPORTANT IMPLEMENTATION NOTES

### 1. Player Position Bug
Setelah `setExistingBody()`, posisi ter-reset ke (0,0). HARUS panggil `setPosition(spawnX, spawnY)` setelahnya.

### 2. Scene Isolation
Dialog events (`DIALOG_SHOW`, `DIALOG_HIDE`) adalah GLOBAL. Setiap level harus check `this.scene.isActive()` sebelum handle event untuk mencegah cross-scene interference.

### 3. Lighting During Pause
`lightingSystem.update()` HARUS dipanggil SEBELUM `if (isPaused) return` di update loop, agar layar tidak gelap saat dialog.

### 4. Placeholder Textures
BootScene harus generate placeholder textures untuk semua sprites agar game bisa jalan tanpa asset files:
- Gunakan `graphics.generateTexture()` untuk single image
- Gunakan `textures.addSpriteSheet()` untuk convert ke spritesheet dengan frames

### 5. React-Phaser Communication
Gunakan EventBus untuk komunikasi antara React UI dan Phaser scenes.

---

## 🎯 FITUR UTAMA YANG HARUS ADA

1. ✅ 7 level dengan cerita kohesif
2. ✅ Player dengan shell hiding mechanic
3. ✅ Enemy AI dengan patrol/detect/chase
4. ✅ Dynamic lighting system
5. ✅ Dialog system dengan typewriter effect
6. ✅ Inventory system (6 slot)
7. ✅ Door/Key puzzle
8. ✅ Boss fight di Level 7
9. ✅ Horror-themed UI
10. ✅ Dev menu untuk testing

---

## 🚀 CARA MEMULAI

```bash
npm create vite@latest the-journey-of-kirana -- --template react
cd the-journey-of-kirana
npm install phaser zustand
npm run dev
```

---

*Generated for AI Canvas regeneration - The Journey of Kirana v1.0*
