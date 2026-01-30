# 🧠 AttentionOS

> **Your Personal Focus Command Center** — A Beautiful, Tony Stark-Inspired Productivity Tracker

AttentionOS is a **premium macOS productivity tracker** with a stunning holographic interface that transforms raw activity data into meaningful insights about your focus patterns. Built with a local-first philosophy: your data never leaves your machine.

---

## ✨ Key Features

### 🎯 **Focus Pulse** — 3D Energy Core Visualization
A mesmerizing **3D holographic orb** that visualizes your current focus state in real-time. Inspired by Tony Stark's arc reactor, this animated energy core displays:
- Glowing center sphere with rotating energy rings
- Dynamic particle systems that react to focus quality
- Real-time health percentage and focus streak tracking
- Smooth animations powered by React Three Fiber

### 🧬 **FocusDNA Helix** — Genetic Visualization
A stunning **3D double-helix** representing your focus patterns over time:
- Color-coded base pairs show session quality (green = good, yellow = average, red = poor)
- Energy beams connect the DNA strands with volumetric lighting
- Post-processing effects: bloom, vignette, chromatic aberration
- Full orbital camera controls to explore your data

### 📊 **Session Analytics**
- Detailed session history with focus scores
- Active time vs. idle time breakdown
- App switch frequency analysis
- Timeline view of all activities

### 🎲 **DEV/DEMO Mode** *(New!)*
Perfect for testing and demonstrations:
- Generates **20-50 realistic focus sessions** spanning 7 days
- Mix of productive apps (VSCode, Figma, Notion) and distractions (WhatsApp, YouTube)
- Varied session quality: good (80-95%), average (60-79%), bad (40-59%)
- Full timeline events and app switch tracking
- One-click regeneration via Settings → Developer Tools

### 🎨 **Premium Design**
- **Minimal Apple/Notion aesthetic** with generous whitespace
- **Dark mode** with smooth theme transitions
- **Premium glassmorphism** effects throughout
- **Micro-animations** for enhanced UX
- **Responsive design** that scales beautifully

---

## 🚀 Quick Start

### Prerequisites
- **macOS** (for the tracking agent)
- **Python 3.8+**
- **Node.js 16+** and npm

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SreeManas/Attention_OS.git
cd Attention_OS
```

### 2️⃣ Install Dependencies

**Agent** (macOS activity tracker):
```bash
pip install -r requirements.txt
```

**Backend** (FastAPI server):
```bash
cd backend
pip install fastapi uvicorn
cd ..
```

**Dashboard** (React frontend):
```bash
cd dashboard
npm install
cd ..
```

### 3️⃣ Start Everything

**Terminal 1 — Run the Tracking Agent:**
```bash
python main.py
```
This continuously tracks your active app and idle time, storing data in `data/attentionos.db`.

**Terminal 2 — Start the Backend API:**
```bash
cd backend
uvicorn main:app --reload
```
API runs at `http://localhost:8000` with auto-docs at `/docs`.

**Terminal 3 — Launch the Dashboard:**
```bash
cd dashboard
npm run dev
```
Dashboard runs at `http://localhost:5173` — open this in your browser!

---

## 🎮 Try Demo Mode

Don't want to wait for real data? Use **Demo Mode**:

1. Open the dashboard: `http://localhost:5173`
2. Navigate to **Settings** (top nav)
3. Scroll to **🛠 Developer Tools**
4. Click **🎲 Generate Data**
5. Watch as 25-45 sessions with realistic activity patterns populate instantly!

Now explore:
- **Dashboard** — See your Focus Pulse energy core glowing
- **Analytics** — Watch the DNA helix rotate with session data
- **Sessions** — Browse through generated sessions
- **Timeline** — View detailed activity logs

---

## 📁 Project Structure

```
Attention_OS/
│
├── main.py                    # 🎯 macOS tracking agent (PyObjC + pynput)
│
├── backend/
│   └── main.py                # 🚀 FastAPI backend with demo data generator
│
├── dashboard/                 # ⚛️ React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard with FocusPulse
│   │   │   ├── Analytics.jsx       # DNA helix visualization
│   │   │   ├── Sessions.jsx        # Session list
│   │   │   ├── Timeline.jsx        # Activity timeline
│   │   │   └── Settings.jsx        # Settings + Demo mode
│   │   │
│   │   ├── components/
│   │   │   ├── FocusPulse.jsx      # Energy core container
│   │   │   ├── FocusCore.jsx       # 3D orb visualization (R3F)
│   │   │   ├── FocusDNA3D.jsx      # DNA helix (R3F)
│   │   │   ├── AchievementShelf.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   └── Onboarding.jsx
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx    # Dark/light mode
│   │   │
│   │   └── utils/
│   │       ├── api.js              # API wrapper
│   │       └── achievements.js      # Achievement system
│   │
│   └── index.css                   # Global styles with CSS variables
│
└── data/
    └── attentionos.db              # 💾 SQLite database (auto-created)
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Agent** | Python 3, PyObjC (macOS APIs), pynput (idle detection), SQLite |
| **Backend** | FastAPI, Uvicorn, SQLite3 |
| **Frontend** | React 18, Vite, React Router, Framer Motion |
| **3D Graphics** | React Three Fiber (@react-three/fiber), Three.js, @react-three/drei, @react-three/postprocessing |
| **Charts** | Recharts |
| **Styling** | CSS Variables, Custom CSS (no Tailwind) |

---

## 🎨 Design Philosophy

AttentionOS follows a **premium, minimal aesthetic** inspired by Apple and Notion:

- **No sidebars** — Clean top navigation
- **Centered layouts** — Max 1200px container for focus
- **Single accent color** — Indigo/purple gradient (#8b5cf6 → #6366f1)
- **Generous whitespace** — Breathing room for clarity
- **Glassmorphism** — Subtle backdrops and borders
- **Smooth micro-animations** — Framer Motion for delightful interactions
- **Dark mode first** — Optimized for low-light work sessions

---

## 📊 Database Schema

### `sessions`
Session summaries with aggregated metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `start_time` | TEXT | ISO 8601 timestamp |
| `end_time` | TEXT | ISO 8601 timestamp |
| `total_active_seconds` | INTEGER | Time actively working |
| `total_idle_seconds` | INTEGER | Time idle |
| `app_switches` | INTEGER | Number of app changes |
| `focus_score` | REAL | 0-100 focus quality score |

### `activity_logs`
Individual app usage events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `app_name` | TEXT | Application name |
| `start_time` | TEXT | ISO 8601 timestamp |
| `end_time` | TEXT | ISO 8601 timestamp |
| `duration_seconds` | INTEGER | Event duration |

### `app_switches`
Application switch events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `from_app` | TEXT | Previous app |
| `to_app` | TEXT | New app |
| `timestamp` | TEXT | ISO 8601 timestamp |

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/sessions` | Get all sessions |
| `GET` | `/api/timeline` | Get all activity logs |
| `GET` | `/api/app-switches` | Get app switch events |
| `POST` | `/api/dev/generate-demo-data` | Generate demo sessions (DEV MODE) |

**Docs:** `http://localhost:8000/docs` (auto-generated by FastAPI)

---

## 🔒 Privacy First

**Your data stays on your machine. Period.**

- ✅ **100% local** — No cloud sync, no external servers
- ✅ **No tracking** — No analytics, no telemetry
- ✅ **No ads** — Clean, ad-free experience
- ✅ **Open source** — Audit the code yourself
- ✅ **SQLite database** — Stored in `data/attentionos.db`

---

## 🎯 Focus Score Algorithm

The **focus score** (0-100) is calculated based on:

1. **Active Time Ratio** (50% weight)
   - Higher active time = higher score
   
2. **App Switch Frequency** (30% weight)
   - Fewer switches = better focus
   
3. **Session Duration** (20% weight)
   - Longer sessions = sustained focus

**Categories:**
- 🟢 **Thriving** (85-100): Peak focus state
- 🟡 **Focused** (70-84): Good concentration
- 🟠 **Distracted** (55-69): Some interruptions
- 🔴 **Struggling** (0-54): High distraction

---

## 🚧 Roadmap

- [ ] **Weekly/Monthly Reports** — Trend analysis over time
- [ ] **Smart Notifications** — Gentle focus reminders
- [ ] **Goal Setting** — Daily focus targets
- [ ] **Export Data** — CSV/JSON export
- [ ] **Custom App Categories** — Label apps as productive/neutral/distracting
- [ ] **Pomodoro Timer** — Built-in focus sessions
- [ ] **Cross-platform** — Windows & Linux support

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Submit feature requests
- Open pull requests

---

## 📄 License

**MIT License** — Free to use, modify, and distribute.

---

## 🙏 Acknowledgments

Built with love using:
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for 3D magic
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [FastAPI](https://fastapi.tiangolo.com/) for blazing-fast APIs
- [Recharts](https://recharts.org/) for beautiful charts

---

**Made with 💜 by [SreeManas](https://github.com/SreeManas)**

*Transform your productivity, one focus session at a time.* 🚀
