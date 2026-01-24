# CAPS4IAGE – Comunidade Frontend

This app helps catalog classroom activities with voice input and AI-assisted structuring. It’s built with React + Vite and works entirely client-side by default.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Features Overview

- **Voice Capture:** Web Speech API for in-browser transcription.
- **AI Processing:** Orchestrates three paths: local AI (in-browser), backend AI (Django), and rule-based fallback.
- **Review & Save:** Edit extracted fields, add synonyms, and save (backend endpoint pending).
- **Keyword Config:** Merge default synonyms with user-added ones via localStorage.

## Key Files

- Voice: [src/hooks/useSpeechRecognition.js](src/hooks/useSpeechRecognition.js)
- Page: [src/pages/CatalogarProducoes.jsx](src/pages/CatalogarProducoes.jsx)
- AI Orchestrator: [src/services/aiProcessing.js](src/services/aiProcessing.js)
- Local AI: [src/services/localAi.js](src/services/localAi.js)
- Keywords: [src/config/keywords.js](src/config/keywords.js)
- Feature Toggles: [src/config/features.js](src/config/features.js)

## Using the Catalogar Page

1. Select voice mode and press record; speak your activity.
2. Click “Processar com IA” to extract fields.
3. Review results, edit if needed, and optionally add synonyms.
4. Save (requires backend endpoint implementation).

## Feature Toggles

Control behavior while exploring:

- `useLocalAI` (default: true): Enables in-browser AI via `@xenova/transformers`.
- `useBackendAI` (default: false): Enables Django endpoint calls.

Edit the toggles in [src/config/features.js](src/config/features.js).

## Troubleshooting

- **Local AI init error:** “Unexpected token '<' … not valid JSON” → Model download returned HTML (network/proxy). Options:
	- Ensure `huggingface.co` is reachable.
	- Disable local AI via feature toggle to rely on fallback.
	- Host models locally and point transformers to `/public/models` (optional).

- **Backend 404:** `/kipo_playground/api/ai/process-transcript/` not found → Endpoint not implemented. Set `useBackendAI` to false; the app will use fallback.

- **Large bundle warnings:** Non-blocking. Can be improved later with code-splitting.

## Dev Commands

```bash
npm run dev     # start local dev server
npm run build   # production build
```

## Dependencies

- React, Vite
- `@xenova/transformers` for local AI (browser-based)
