# Minesweeper (React)

Minimal Minesweeper built with React + Vite. Includes a GitHub Actions workflow to build and publish a Docker image to GitHub Container Registry.

Quick start

Install deps:

```bash
npm ci
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Build Docker image locally:

```bash
docker build -t minesweeper:local .
```

CI builds to `ghcr.io/<owner>/minesweeper:latest` on pushes to `main`.

# minesweeper
