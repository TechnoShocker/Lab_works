# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational Three.js project demonstrating augmented reality concepts in the browser. It renders a 3D cube overlaid on webcam video feed.

## Running the Project

Open `index.html` directly in a browser or serve via a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve
```

Note: Camera access requires serving via HTTP/HTTPS (not `file://`).

## Architecture

- **index.html**: Entry point with importmap for Three.js module loading from unpkg CDN
- **main.js**: Three.js scene setup creating a green cube (1x1x1 units) positioned at (1,0,-2), rendered with transparency over webcam video feed using `getUserMedia`

The project uses ES modules with Three.js v0.172.0 loaded from CDN. Code comments are in Ukrainian.