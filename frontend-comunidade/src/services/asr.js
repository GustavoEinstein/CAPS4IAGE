import { FEATURES } from '../config/features';

// Placeholder: implement actual calls for cloud/local ASR here when available.
const transcribeWithCloud = async (_audioBlob, _onPartial) => {
  // TODO: plug Whisper API / Deepgram; return { text, source: 'cloud' }
  return null;
};

const transcribeWithLocal = async (_audioBlob, _onPartial) => {
  // TODO: plug local Whisper/transformers.js; return { text, source: 'local' }
  return null;
};

// Browser ASR is currently handled by useSpeechRecognition (Web Speech API)
// This stub is for symmetry; real-time usage stays in the hook.
const transcribeWithBrowser = async () => {
  return { text: null, source: 'browser-hook' };
};

/**
 * Orchestrate ASR with fallbacks: cloud -> local -> browser hook.
 * Returns { text, source } or null if nothing produced text.
 */
export const transcribeAudio = async ({ audioBlob, onPartial } = {}) => {
  // Try cloud ASR
  if (FEATURES.useCloudASR) {
    try {
      const r = await transcribeWithCloud(audioBlob, onPartial);
      if (r?.text) return r;
    } catch (e) {
      console.warn('Cloud ASR failed, continuing:', e.message);
    }
  }

  // Try local ASR
  if (FEATURES.useLocalASR) {
    try {
      const r = await transcribeWithLocal(audioBlob, onPartial);
      if (r?.text) return r;
    } catch (e) {
      console.warn('Local ASR failed, continuing:', e.message);
    }
  }

  // Fallback to browser hook (Web Speech API already in use elsewhere)
  if (FEATURES.useBrowserASR) {
    return transcribeWithBrowser();
  }

  return null;
};
