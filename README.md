<div align="center">

# 🐌 The Journey of Kirana

<img src="https://img.shields.io/badge/Game-2.5D%20Platformer-blueviolet?style=for-the-badge" alt="Game Genre"/>
<img src="https://img.shields.io/badge/Engine-Phaser%203-orange?style=for-the-badge&logo=phaser" alt="Phaser 3"/>
<img src="https://img.shields.io/badge/Framework-React%2019-61DAFB?style=for-the-badge&logo=react" alt="React"/>
<img src="https://img.shields.io/badge/Build-Vite%207-646CFF?style=for-the-badge&logo=vite" alt="Vite"/>

<br/>

**🌙 "When Folklore Meets Nightmare." 🌙**

*A Dark Adaptation of Indonesian Folklore "Keong Mas"*

<br/>

[🎮 Play Demo](#-cara-menjalankan) • [📖 Story](#-cerita) • [🛠️ Tech Stack](#-tech-stack) • [🤝 Contribute](#-kontribusi)

</div>

---

## 💀 Apa Itu Keong Mas... Versi Gelap?

<table>
<tr>
<td width="60%">

Lupakan dongeng pengantar tidur yang biasa dibacain ibumu. **The Journey of Kirana** bukan cerita tentang pangeran ganteng nyari putri cantik.

Ini adalah **Survival Horror Platformer** — terinspirasi dari *Little Nightmares*, *Inside*, dan *Limbo* — di mana kamu bermain sebagai **Kirana**, seorang putri yang dikutuk menjadi makhluk kecil bercangkang emas.

> 🎭 Dunia di sekitarmu berubah menjadi **raksasa, gelap, dan mematikan**. Sungai yang tenang jadi arus deras mematikan, dan dapur nenek tua... well, itu neraka dunia.

**Tugasmu simpel:** *Bertahan hidup, jangan sampai keinjek, dan cari cara balik jadi manusia.*

</td>
<td width="40%" align="center">

```
    🌲🌲   🌙   🌲🌲
   🌲🌲🌲       🌲🌲🌲
  ━━━━━━━━━━━━━━━━━━━━
       🐚 ← You are here
  ━━━━━━━━━━━━━━━━━━━━
   ~~~💧~~~~~💧~~~💧~~~
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
```
*Kirana, menghadapi dunia yang kejam*

</td>
</tr>
</table>

---

## 🔥 Key Features

<table>
<tr>
<td align="center" width="25%">

### 🐚
**Shell Mechanic**

Tombol `SHIFT` adalah nyawamu. Masuk ke dalam cangkang emas untuk sembunyi, menahan reruntuhan, atau menyamar. *Tapi kamu tidak bisa bergerak!*

</td>
<td align="center" width="25%">

### 👁️
**Hide or Die**

Musuh tidak bisa dilawan. Kalau ketahuan? *Run for your life* atau jadi santapan. Stealth is your only weapon.

</td>
<td align="center" width="25%">

### 🎨
**2.5D Atmosphere**

Grafis hand-drawn dengan efek Parallax berlapis dan lighting remang-remang yang bikin parno.

</td>
<td align="center" width="25%">

### 🧩
**Physics Puzzles**

Dorong sendok raksasa, panjat taplak meja, gulingkan guci. Fisika realistis powered by Matter.js.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---|:---|
| 🎮 | **Phaser 3** | Game engine, rendering, physics (Matter.js) |
| ⚛️ | **React 19** | UI overlay, menus, dialogs, HUD |
| ⚡ | **Vite 7** | Lightning-fast dev server & bundler |
| 🧠 | **Zustand** | Global state management |
| 🎭 | **Gemini AI** | Dynamic NPC dialog generation |

</div>

---

## 📂 Arsitektur Project

```
the-journey-of-kirana/
│
├── 📁 public/assets/          # 🎨 Game Assets
│   ├── audio/                 # BGM & SFX
│   ├── images/
│   │   ├── backgrounds/       # Parallax layers
│   │   ├── characters/        # Spritesheets
│   │   ├── props/             # Interactive objects
│   │   └── ui/                # UI graphics
│   └── maps/                  # Tiled JSON exports
│
├── 📁 src/
│   ├── 📁 components/         # ⚛️ REACT LAYER
│   │   ├── Game/              # Phaser container
│   │   ├── HUD/               # Health, inventory bars
│   │   └── UI/                # Dialogs, menus
│   │
│   ├── 📁 game/               # 🎮 PHASER LAYER
│   │   ├── config/            # Game configuration
│   │   ├── entities/          # Player, Enemy, Items
│   │   ├── scenes/            # Levels & game states
│   │   └── systems/           # EventBus, Lighting
│   │
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 services/           # API services (Gemini)
│   ├── 📁 stores/             # Zustand stores
│   └── 📁 styles/             # CSS stylesheets
│
└── 📄 vite.config.js          # Build configuration
```

---

## 🚀 Cara Menjalankan

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** atau **yarn**

### Installation

```bash
# 1️⃣ Clone repository
git clone https://github.com/your-username/the-journey-of-kirana.git
cd the-journey-of-kirana

# 2️⃣ Install dependencies
npm install

# 3️⃣ Setup environment (optional, for Gemini AI)
cp .env.example .env
# Edit .env dengan API key kamu

# 4️⃣ Run development server
npm run dev
```

🎉 Buka browser di `http://localhost:5173` — Selamat datang di mimpi buruk Kirana!

### Available Scripts

| Command | Description |
|:---:|:---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🎮 Controls

<div align="center">

| Key | Action | Note |
|:---:|:---|:---|
| `A` / `D` atau `←` / `→` | Bergerak | Pelan-pelan asal selamat |
| `SPACE` / `W` | Lompat | Hati-hati kepeleset! |
| `SHIFT` *(tahan)* | **SEMBUNYI** 🐚 | *Ultimate skill.* Musuh akan bingung |
| `E` | Interaksi | Buka pintu, ambil item, baca tulisan |
| `ESC` | Pause | Istirahat sejenak |

</div>

---

## 👥 Tim Pengembang

Project ini dikembangkan oleh **Tim Keong Balap** dengan pembagian tugas:

<table>
<tr>
<td align="center" width="33%">

### 👤 Member A
**Game Programmer**

*Phaser scenes, physics, level design*

</td>
<td align="center" width="33%">

### 👤 Member B
**Entity Programmer**

*Player, enemies, game objects*

</td>
<td align="center" width="33%">

### 👤 Member C
**UI & Integration**

*React components, EventBus, Gemini AI*

</td>
</tr>
</table>

---

## 🤝 Kontribusi

Punya ide gila? Nemu bug konyol? Atau jago bikin pixel art?

1. **Fork** repository ini
2. Buat **branch** fitur (`git checkout -b feature/fitur-keren`)
3. **Commit** perubahan (`git commit -m 'Add fitur keren'`)
4. **Push** ke branch (`git push origin feature/fitur-keren`)
5. Buat **Pull Request**

> 💡 Cek [docs/README-UI-INTEGRATION.md](docs/README-UI-INTEGRATION.md) untuk dokumentasi teknis komponen UI.

---

## 📜 Lisensi

Project ini dibuat untuk **tujuan edukasi dan portofolio**. 

Karakter "Keong Mas" adalah milik cerita rakyat Indonesia 🇮🇩, tapi codebase ini licensed under **MIT License** — bebas digunakan dan dimodifikasi.

---

<div align="center">

### 🌟 Star repo ini kalau kamu suka!

<br/>

Made with ❤️, ☕, and a little bit of 😱

by **Sukolilo Team**

<br/>

*"Dalam kegelapan, cangkang emas adalah satu-satunya perlindungan."*

</div>