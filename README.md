# 🚀 TaskFlow
> The Next-Gen Kanban Project Management Tool with 3D-Style Aesthetics.

![3D Interface Concept](https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop)

## 🧭 Quick Navigation
- [What Can TaskFlow Do?](#-what-can-taskflow-do)
- [Core Features](#-core-features)
- [How to Work](#-how-to-work)
- [Personalized 3D Customization](#-personalized-interface-customization-3d-pages)
- [Why Choose TaskFlow?](#-why-choose-taskflow)
- [Quick Start](#-quick-start)
- [Detailed Usage Guide](#-detailed-usage-guide)
- [See How People Use](#-see-how-people-use)
- [Community & Support](#-community--support)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 What Can TaskFlow Do?
TaskFlow isn't just a to-do list; it's a spatial productivity engine.
- **Organize** complex projects into visual Boards.
- **Visualize** workflow stages with customizable Lists.
- **Prioritize** tasks using an O(1) high-performance Drag & Drop engine.
- **Experience** a premium, glassmorphic UI that feels alive.

---

## � Core Features
| Feature | Description |
| :--- | :--- |
| **⚡ Instant Reordering** | Powered by [Fractional Indexing](./DSA.md) for zero-latency sorting. |
| **🎨 3D Glassmorphism** | Deep, layered UI design with blur effects and rich gradients. |
| **🚀 Optimistic UI** | Interactions happen instantly; the server syncs in the background. |
| **🔒 Enterprise Security** | PWM-hashing, JWT Authentication, and Safe SQL handling. |
| **🐳 Container Ready** | Fully Dockerized with local SQLite fallback for offline dev. |

---

## ⚙️ How to Work
1.  **Create a Board**: Start a new project space (e.g., "Marketing Launch", "Home Reno").
2.  **Add Lists**: Define your stages (e.g., "Idea", "Doing", "Done").
3.  **Create Cards**: Drop in your tasks, bugs, or ideas.
4.  **Drag & Drop**: Move cards between lists or reorder them instantly.
5.  **Focus**: Use the "Personalized Interface" settings to adjust the 3D depth and theme (Coming Soon).

---

## 🎨 Personalized Interface Customization (3D Pages)
TaskFlow introduces a **Personalized 3D Interface**:
- **Depth Control**: Elements react to your mouse with subtle parallax effects.
- **Dynamic Lighting**: Cards glow faintly when active, simulating a 3D surface.
- **Custom Themes**: Switch between "Deep Space" (Dark Mode) and "Glass House" (Light Mode).
*(Note: Full 3D customization settings are in active development).*

---

## 🏆 Why Choose TaskFlow?

### 1. Performance First
Unlike legacy tools that slow down with thousands of cards, TaskFlow's **dsa-optimized backend** handles massive boards effortlessly using O(1) complexity algorithms. [Read the Engineering Deep Dive](./DSA.md).

### 2. Zero-Config Local Run
No internet? No Docker? No problem. TaskFlow intelligently falls back to a local SQLite file so you can code essentially anywhere `python` and `node` run.

### 3. Aesthetics Matter
We believe productivity tools should be beautiful. TaskFlow uses modern CSS tokens, backdrop filters, and smooth transitions to reduce eye strain and increase joy.

---

## ❓ Quick Q&A
**Q: Do I need Docker?**
A: **No!** While we create a `docker-compose.yml` for production, you can [run locally](#-quick-start) in seconds.

**Q: Is it real-time?**
A: Yes, the UI updates optimistically, making it feel instantaneous.

**Q: Can I lose data?**
A: We use "Soft Deletes" – nothing is ever truly gone unless you purge the database.

---

## 👥 See How People Use
- **Developers**: Tracking sprint tickets and bug fixes.
- **Students**: Managing assignment due dates and study topics.
- **Content Creators**: Planning video pipelines from Script -> Filming -> Edit -> Upload.
- **Families**: Organizing chore charts and vacation planning with a visual flair.

---

## 📰 Community Articles
- **[Understanding Fractional Indexing in TaskFlow](./DSA.md)** - *Deep dive into the O(1) sorting algorithm.*
- **[From Python to React: Full Stack Guide](./README.md)** - *How this project is structured.*

---

## 📚 Detailed Usage Guide
1.  **Sign Up/Login**: Use any email (e.g., `user@example.com`). The demo mode is permissive.
2.  **Dashboard**: You'll see your active boards. Click "+" to add one.
3.  **Inside a Board**:
    - **Header**: Rename board, Switch boards.
    - **Canvas**: Horizontal scrollable area for lists.
    - **Lists**: Click "Add Link". Enter title.
    - **Cards**: Click "Add Card" or `+` icon.
4.  **Edit Mode**: Click an existing card to edit its title inline.

---

## 🚀 Quick Start
Run TaskFlow on your machine in 2 minutes.

### 1. Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Visit: **[`http://localhost:3000`](http://localhost:3000)**

---

## 🤝 Community & Support
- **Issues**: Please file bugs in the GitHub Issues tab.
- **Discussions**: Join our Discord (Link Pending) for feature requests.
- **Roadmap**: Check out our Public Board to see what's next (e.g., Dark Mode Toggle, Mobile App).

---

## 🛠 Contributing
We love PRs!
1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/3d-mode`).
3.  Commit changes (`git commit -m "Add 3D tilt effect"`).
4.  Push and Open PR.

---

## 📄 License
MIT License. Free to use, modify, and distribute for personal and commercial projects.

---
*Built with ❤️ by the AscendoAI Team using React, FastAPI, and 3D Coffee.*
