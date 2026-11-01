# 🎬 CINEVERSE – Premium 3D Movie Discovery Platform

> A futuristic, professional OTT entertainment and discovery platform designed with cinematic 3D effects, glassmorphic UI, an authorized public-domain and Creative Commons download engine, user account personalization, and a persistent Admin CMS.

🌐 **Live GitHub Pages Website**: [https://aryan-shah04062005.github.io/cineverse-movie-platform/](https://aryan-shah04062005.github.io/cineverse-movie-platform/)
⚡ **High-Speed Global Mirror**: [https://cineverse-aryan.surge.sh](https://cineverse-aryan.surge.sh)
📁 **GitHub Repository**: [https://github.com/Aryan-Shah04062005/cineverse-movie-platform](https://github.com/Aryan-Shah04062005/cineverse-movie-platform)

---

## 🌟 Key Highlights

- **Cinematic 3D Design & Lighting**: Deep dark palette (`#07070b`), neon crimson, electric purple, and cyan lighting.
- **Interactive 3D Particle Space**: Dynamic Canvas background with 100+ depth-scaled particles reacting to mouse parallax.
- **Realistic 3D Card Tilt Physics**: `perspective(1000px) rotateX(...) rotateY(...)` calculated relative to cursor position with dynamic specular sheen glare.
- **Synthesized Web Audio SFX**: Futuristic UI sound effects for hover, click, and success states (toggleable in header).
- **Hero 3D Carousel**: Featured premieres with 3D title depth, crossfading backdrops, and action buttons.
- **Movie Details & Trailer Modal**: 16:9 HD video player, cast carousel, full metadata, specs, and screenshot lightbox.
- **Authorized 4K Download Engine**:
  - Resolution selector (480p, 720p, 1080p, 4K UHD) with exact file sizes, formats, bitrates, and audio tracks.
  - Legal fair-use confirmation requirement.
  - Interactive transfer progress with speed simulation and direct file trigger.
  - Strict restriction notice on commercial titles with Admin Override uploader.
- **Admin Media Uploader from Downloads**:
  - Drag & drop or choose video files directly from local computer or Downloads folder.
  - Auto-computes size, format, and bitrate.
  - Attach to existing movie downloads or create a brand new movie catalog draft instantly.
- **Intelligent Search & Multi-Filter**: Search across title, cast, director, and synopsis. Filter by genre, language, era, rating, and authorized-only.
- **User Account & Watchlist**: Personal Watchlist, Favorites, and Watch History with progress tracking.
- **Persistent Admin CMS**: Add, edit, or delete movies permanently with real-time updates and analytics dashboard.

---

## 🔑 Administrator Credentials

- **Username / Name**: `Aryan Shah` *(or `aryan.shah@cineverse.io`)*
- **Password**: `Aryan@1234`
- **Role**: `Administrator` (Full CMS access)

---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
cd "Movie website creation"

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the website.

---

## 📦 How to Push to Your GitHub Account

Run the following commands in this directory:

```bash
# 1. Add your GitHub repository remote
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 2. Rename branch to main (already set)
git branch -M main

# 3. Push to GitHub
git push -u origin main
```

> **Automated GitHub Pages Deployment**:
> This repository already contains `.github/workflows/deploy.yml`. Once pushed, enable **Settings -> Pages -> Source: GitHub Actions** on your repository to have GitHub Pages automatically deploy.
