# 🐚 The Journey of Kirana - Member C Progress Report

> **Last Updated**: 27 Januari 2026
> **Role**: Member C - UI & Integration Programmer

---

## 📋 Project Overview

**Game**: The Journey of Kirana
**Genre**: 2.5D Cinematic Stealth Platformer / Survival Horror
**Inspiration**: Little Nightmares, Inside, Limbo + Indonesian folklore "Keong Mas"
**Tech Stack**: Phaser 3 + React 19 + Zustand + Vite 7

---

## 👥 Team Structure

| Member | Role | Focus |
|--------|------|-------|
| **A** | Game Engine Programmer | Player, mechanics, physics, input |
| **B** | World & AI Programmer | Levels, visuals, enemies, assets, audio |
| **C** | UI & Integration | React components, EventBus, state, Gemini AI |

---

## 📁 Member C's Files (Ownership)

```
src/
├── components/
│   ├── Game/
│   │   └── PhaserContainer.jsx    ✅ Done
│   ├── HUD/
│   │   ├── HealthBar.jsx          ✅ Done
│   │   └── InventoryBar.jsx       ✅ Done
│   ├── UI/
│   │   ├── DialogBox.jsx          ✅ Done
│   │   ├── MainMenu.jsx           ✅ Updated (save/load)
│   │   └── SettingsPanel.jsx      ✅ NEW
│   └── Layout.jsx                 ✅ Updated (keyboard hooks)
├── game/systems/
│   └── EventBus.js                ✅ Done
├── hooks/
│   ├── useGameState.js            ✅ Done
│   └── useKeyboardShortcuts.js    ✅ NEW
├── services/
│   └── geminiAPI.js               ✅ Done
├── stores/
│   └── useGameStore.js            ✅ Updated (persist)
├── styles/
│   ├── index.css                  ✅ Updated (cursor, vars)
│   ├── MainMenu.css               ✅ Updated
│   ├── SettingsPanel.css          ✅ NEW
│   └── (other CSS files)          ✅ Done
├── App.jsx                        ✅ Done
└── main.jsx                       ✅ Done
```

---

## ✅ Completed Features

### 1. React-Phaser Bridge
- `PhaserContainer.jsx` mounts Phaser game
- Cleanup on unmount prevents memory leaks
- Visibility change handling (pause when tab inactive)

### 2. EventBus System
- Singleton EventEmitter for Phaser ↔ React communication
- Events: health, dialog, inventory, game state, pause/resume

### 3. Zustand State Management
- `useGameStore` - Session game state (player, inventory, dialog, UI)
- `useSettingsStore` - Persisted settings (volume, fullscreen)
- `useSaveDataStore` - Persisted save data (level, health, inventory)

### 4. UI Components
- **MainMenu**: New Game, Continue (with save detection), Settings, Credits
- **DialogBox**: Typewriter effect, choices, keyboard nav
- **HealthBar**: Animated, color changes, low health warning
- **InventoryBar**: 6 slots, tooltips, quantity display
- **SettingsPanel**: Volume sliders, fullscreen toggle, controls info

### 5. Keyboard Shortcuts
- `1-6` → Inventory quick select
- `ESC` → Pause menu toggle
- `TAB` / `I` → Inventory toggle

### 6. Save/Load System
- localStorage persistence via Zustand middleware
- "LANJUTKAN" menu enabled when save exists
- Settings auto-saved

### 7. Custom Cursor & Theme
- CSS variables for golden horror theme
- Cursor states, scrollbar styling, selection styling

### 8. Gemini AI Integration
- `geminiAPI.js` for dynamic NPC dialog generation
- Character personalities defined (Kirana, Galuh, Spirit)
- Fallback dialogs if API unavailable

---

## 🔄 Pending / Future Work

| Task | Priority | Notes |
|------|----------|-------|
| Auto-save on checkpoint | Medium | Needs Phaser trigger from Member B |
| Custom PNG cursors | Low | Placeholder ready in CSS |
| Toast/notification system | Medium | For item pickup feedback |
| Scene transition overlays | Low | Fade effects between levels |
| Connect volume to audio | High | Awaits Member B audio system |

---

## 🔗 Integration Points with Other Members

### → Member A (Player/Mechanics)
- EventBus events to emit: `player:health:changed`, `player:hiding`, `item:collected`
- Input: Player should check `useGameStore.isPaused` before processing input

### → Member B (World/Audio)
- `useSettingsStore.bgmVolume` and `sfxVolume` (0-100) ready for audio system
- EventBus: `game:pause`, `game:resume` for audio pause
- Call `useSaveDataStore.saveGame(data)` on checkpoint

---

## 🛠️ How to Test

```bash
cd ~/Documents/the-journey-of-kirana
npm install
npm run dev
```

1. Open `http://localhost:5173`
2. Click "PENGATURAN" → adjust volume → close → reopen (saved)
3. Press `ESC` during game to pause
4. Press `1-6` to select inventory slots

---

## 📝 Notes for Next AI Session

- CSS paths: Components in `src/components/UI/` import CSS with `../../styles/`
- Zustand exports: `useGameStore` (default), `useSettingsStore`, `useSaveDataStore` (named)
- Game config file is `GameConfig.js` (capital G) not `gameConfig.js`
