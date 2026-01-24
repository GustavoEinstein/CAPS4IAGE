// Simple feature toggles to reduce confusion while exploring the app
export const FEATURES = {
  // In-browser AI via @xenova/transformers (downloads small models on first run)
  useLocalAI: false,
  // Server-side AI via Django endpoint (404 until implemented)
  useBackendAI: false,

  // Speech-to-text toggles
  useCloudASR: false,   // e.g., Whisper API/Deepgram (to be wired)
  useLocalASR: false,   // e.g., Whisper local (to be wired)
  useBrowserASR: true   // Web Speech API fallback (current behavior)
};
