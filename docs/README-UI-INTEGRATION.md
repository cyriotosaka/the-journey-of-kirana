# 👤 Member C - UI & Integration Programming Guide

## 📋 Checklist Implementasi

### ✅ Phase 1: Foundation
- [x] `package.json` - Dependencies configuration
- [x] `vite.config.js` - Build tool setup
- [x] `index.html` - HTML entry point
- [x] `.env.example` - Environment variables template

### ✅ Phase 2: Core Systems
- [x] `src/game/systems/EventBus.js` - React ↔ Phaser bridge
- [x] `src/stores/useGameStore.js` - Zustand state management
- [x] `src/hooks/useGameState.js` - Custom React hooks
- [x] `src/game/config/gameConfig.js` - Phaser configuration

### ✅ Phase 3: Components
- [x] `src/components/Game/PhaserContainer.jsx` - Game canvas wrapper
- [x] `src/components/UI/MainMenu.jsx` - Main menu screen
- [x] `src/components/UI/DialogBox.jsx` - Dialog system
- [x] `src/components/HUD/HealthBar.jsx` - Health display
- [x] `src/components/HUD/InventoryBar.jsx` - Inventory UI
- [x] `src/components/Layout.jsx` - Main layout wrapper

### ✅ Phase 4: Styling
- [x] `src/styles/index.css` - Base reset
- [x] `src/styles/App.css` - Global app styles
- [x] `src/styles/Layout.css` - Layout styles
- [x] `src/styles/DialogBox.css` - Dialog styles
- [x] `src/styles/HealthBar.css` - Health bar styles
- [x] `src/styles/InventoryBar.css` - Inventory styles
- [x] `src/styles/MainMenu.css` - Menu styles

### ✅ Phase 5: Services
- [x] `src/services/geminiAPI.js` - AI dialog generation

### ✅ Phase 6: Entry Points
- [x] `src/App.jsx` - Root component
- [x] `src/main.jsx` - React entry point

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan isi Gemini API key
# Dapatkan dari: https://makersuite.google.com/app/apikey
```

### 3. Run Development Server
```bash
npm run dev
```

Game akan buka di `http://localhost:3000`

---

## 🏗️ Arsitektur Sistem

### Event Flow
```
Phaser Game → EventBus.emit() → useGameState Hook → Zustand Store → React Components
                                                                          ↓
React Components → EventBus.emit() → Phaser Game (mendengarkan events)
```

### State Management
- **Zustand Store**: Single source of truth untuk UI state
- **EventBus**: Communication layer antara Phaser dan React
- **Custom Hooks**: Abstraksi untuk akses state

---

## 📦 Component Structure

### PhaserContainer
**File**: `src/components/Game/PhaserContainer.jsx`

**Responsibility**:
- Mount Phaser game instance ke React
- Handle lifecycle (mount, unmount, resize)
- Auto pause saat tab tidak aktif

**Usage**:
```jsx
import PhaserContainer from './components/Game/PhaserContainer';

<PhaserContainer />
```

---

### DialogBox
**File**: `src/components/UI/DialogBox.jsx`

**Features**:
- Typewriter effect
- Multiple choice support
- Keyboard navigation (Enter, Number keys)
- Character avatar display

**Triggering dari Phaser**:
```javascript
import { GameEvents } from '../systems/EventBus';

GameEvents.showDialog({
  character: 'Kirana',
  text: 'Aku harus mencari jalan keluar...',
  avatar: '/assets/images/characters/kirana_avatar.png',
  choices: [
    { text: 'Pergi ke kiri', action: 'go_left' },
    { text: 'Pergi ke kanan', action: 'go_right' }
  ]
});
```

---

### HealthBar
**File**: `src/components/HUD/HealthBar.jsx`

**Features**:
- Smooth health transitions
- Color-coded based on percentage
- Low health warning animation
- Hiding status indicator

**Auto-updates dari Phaser**:
```javascript
GameEvents.updateHealth(currentHealth, maxHealth);
```

---

### InventoryBar
**File**: `src/components/HUD/InventoryBar.jsx`

**Features**:
- 6-slot grid system
- Item tooltips on hover
- Quantity stacking
- Quick use dengan number keys (1-6)

**Menambah item dari Phaser**:
```javascript
GameEvents.collectItem({
  id: 'golden_key',
  name: 'Kunci Emas',
  description: 'Kunci untuk membuka pintu terkunci',
  icon: '/assets/images/props/key.png',
  stackable: false,
  usable: true
});
```

---

### MainMenu
**File**: `src/components/UI/MainMenu.jsx`

**Features**:
- Keyboard navigation (Arrow keys, W/S)
- Animated background
- Credits screen
- Loading state indicator

---

## 🤖 Gemini AI Integration

### Setup
1. Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tambahkan ke `.env`:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### Usage
```javascript
import { generateAIDialog } from '../services/geminiAPI';

const dialog = await generateAIDialog({
  character: 'galuh',
  situation: 'Player memasuki dapur penyihir',
  playerAction: 'Membuka pintu',
  mood: 'menacing',
  maxLength: 150
});

GameEvents.showDialog({
  character: 'Galuh',
  text: dialog
});
```

---

## 🎨 Styling Guidelines

### CSS Variables
Semua warna dan spacing didefinisikan di `App.css`:
```css
var(--color-primary)     /* Gold #d4af37 */
var(--color-health)      /* Green #4ade80 */
var(--spacing-md)        /* 16px */
var(--transition-fast)   /* 0.15s ease */
```

### Dark Theme Consistency
- Background: `var(--color-bg-dark)` (#0a0a0a)
- Border: `var(--color-primary)` with transparency
- Text: `var(--color-text-primary)` (#e0e0e0)

---

## 🔗 Integration dengan Member A & B

### Dari Phaser (Member A & B) → React (Member C)

**1. Update Health**:
```javascript
// Di Player.js (Member A)
import { GameEvents } from '../systems/EventBus';

takeDamage(amount) {
  this.health -= amount;
  GameEvents.updateHealth(this.health, this.maxHealth);
}
```

**2. Show Dialog**:
```javascript
// Di Level1.js (Member B)
this.player.on('interact-npc', (npc) => {
  GameEvents.showDialog({
    character: npc.name,
    text: npc.dialog,
    avatar: npc.avatar
  });
});
```

**3. Collect Item**:
```javascript
// Di Interactable.js (Member A)
onCollect() {
  GameEvents.collectItem({
    id: this.itemId,
    name: this.itemName,
    icon: this.itemIcon
  });
}
```

### Dari React (Member C) → Phaser (Member A & B)

**Listen to Events**:
```javascript
// Di Player.js atau Level1.js
import { EventBus } from '../systems/EventBus';

create() {
  EventBus.on('item:use', (item) => {
    this.handleItemUse(item);
  });
  
  EventBus.on('dialog:choice:selected', (choice) => {
    this.handleDialogChoice(choice);
  });
}

destroy() {
  EventBus.off('item:use');
  EventBus.off('dialog:choice:selected');
}
```

---

## 🐛 Debugging Tips

### Phaser tidak muncul?
1. Check console untuk error
2. Pastikan `gameConfig.js` sudah import scenes yang benar
3. Verify `PhaserContainer` di-render di `Layout.jsx`

### EventBus tidak bekerja?
1. Pastikan `useGameState()` dipanggil di `Layout.jsx`
2. Check event name typo (gunakan `EVENTS` constants)
3. Verify listener cleanup di `useEffect` return function

### Gemini AI tidak response?
1. Check `.env` file ada dan API key valid
2. Verify network request di browser DevTools
3. Fallback ke default dialog akan dipakai jika API gagal

---

## 📚 Resources

- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [React Hooks](https://react.dev/reference/react)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Gemini API](https://ai.google.dev/docs)

---

## 🎯 Next Steps

Setelah semua file dibuat:

1. **Test Integration**:
   - Buat placeholder scene untuk testing
   - Verify EventBus communication
   - Test semua UI components

2. **Coordinate dengan Member A**:
   - Player health updates
   - Item collection
   - Hiding mechanic

3. **Coordinate dengan Member B**:
   - Scene transitions
   - Dialog triggers
   - Level events

4. **Polish**:
   - Add sound effects untuk UI interactions
   - Smooth animations
   - Loading states

---

## 💡 Best Practices

1. **Always cleanup listeners**: Gunakan `useEffect` cleanup function
2. **Use constants untuk events**: Jangan hardcode string
3. **Handle loading states**: Show spinners saat async operations
4. **Error boundaries**: Wrap components dengan error handlers
5. **Performance**: Avoid re-renders dengan proper Zustand selectors

---

Good luck! 🚀
