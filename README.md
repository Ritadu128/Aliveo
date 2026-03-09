# Aliveo — Art is waiting to speak.

> An interactive museum guide web app. Snap a photo of a sculpture, identify it, and start a conversation across centuries.

## Overview

Aliveo is a mobile-first web application that lets museum visitors:
1. **Snap** a photo of a sculpture using their phone camera
2. **Identify** the artwork through AI recognition
3. **Converse** with the artwork — hear its story in its own voice

## Pages

| Page | Description |
|------|-------------|
| Landing Page | Hero gallery view with featured sculptures and "Start Exploring" CTA |
| Camera Page | Full-screen camera with museum-style viewfinder frame and "Awaken" button |
| Recognition Result | Identified artwork card with match confidence, alternatives, and search |
| Conversation Page | Immersive dialogue with the artwork using typewriter text effect |

## Design System

**Style**: Neo-Museological — warm ivory backgrounds, Playfair Display serif titles, DM Sans body text, warm gold accents.

**Signature details**:
- Speech bubbles appear on artifact card hover ("Ready to fly?", "Hmm...")
- ✦ diamond decorators as section dividers
- Museum exhibit label typography (Cormorant Garamond, uppercase, letter-spaced)
- Match confidence bar on recognition result
- Artifact "mood" indicator changes per dialogue segment
- Typewriter effect for artifact dialogue

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + custom design tokens
- **Routing**: Single-page app with custom page state
- **UI Components**: shadcn/ui + Radix UI
- **Build**: Vite 7

## Getting Started

```bash
pnpm install
pnpm dev
```

## MVP Scope

This is the MVP implementation. Recognition uses simulated data (no live AI API). The conversation content is pre-written static dialogue. Future iterations will integrate real computer vision and LLM APIs.

---

*"Every sculpture has a story to tell."*
