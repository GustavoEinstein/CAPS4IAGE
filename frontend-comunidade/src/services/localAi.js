// Local AI processing using @xenova/transformers
// Runs entirely in the browser (WebAssembly/WebGPU). First run downloads models.
import { getMergedKeywords } from '../config/keywords';

const MODEL_BASE = '/models';
const MODEL_IDS = {
  // Use folder names; env.localModelPath will prefix /models/...
  summarizer: 'distilbart-cnn-12-6',
  classifier: 'distilbert-base-uncased-mnli'
};

let summarizer = null;
let classifier = null;
let initializing = false;
let lastProgress = null;

// Lazy initialize pipelines
const initPipelines = async (onProgress) => {
  if (initializing) return;
  initializing = true;
  try {
    const { pipeline, env } = await import('@xenova/transformers');

    // Prefer local models served from /public/models when available; allow remote if missing
    env.allowLocalModels = true;
    env.localModelPath = MODEL_BASE;
    // Force local to avoid CORS issues now that models are present locally
    env.remoteModels = false;

    // Summarization (small model)
    summarizer = await pipeline('summarization', MODEL_IDS.summarizer, {
      progress_callback: (p) => { lastProgress = p; if (onProgress) onProgress(p); }
    });
    // Zero-shot classification (English MNLI; works reasonably on PT)
    classifier = await pipeline('zero-shot-classification', MODEL_IDS.classifier, {
      progress_callback: (p) => { lastProgress = p; if (onProgress) onProgress(p); }
    });
  } catch (e) {
    const hint = e?.message && e.message.includes('<')
      ? 'Possível bloqueio CORS/redirecionamento HTML do Hugging Face. Para evitar, baixe os modelos e sirva-os em /public/models.'
      : '';
    console.warn('Failed to init local AI pipelines:', e.message, hint);
  } finally {
    initializing = false;
  }
};

// Lightly normalize noisy ASR output before feeding models
const normalizeTranscript = (text) => {
  if (!text) return '';
  let t = text;
  const replacements = [
    [/cheque\s*g[btp]{1,2}t|check\s*g[btp]{1,2}t|chat\s*de\s*pt|chat\s*g[btp]{1,2}t|zeus\s*chat|xeus\s*chat/gi, 'ChatGPT'],
    [/gpt\s*4/gi, 'GPT-4'],
    [/ea\b/gi, 'IA'],
    [/ensino\s+medio/gi, 'ensino medio'],
    [/fundamental\s+dois|fundamental\s*2/gi, 'fundamental 2'],
    [/fundamental\s+um|fundamental\s*1/gi, 'fundamental 1'],
    [/algebra/gi, 'álgebra'],
    [/\s+/g, ' ']
  ];
  replacements.forEach(([re, val]) => { t = t.replace(re, val); });
  return t.trim();
};

// Append keyword hints to help the local models pick up intended entities when ASR is noisy
const appendKeywordHints = (text) => {
  try {
    const merged = getMergedKeywords();
    const flat = [];
    ['disciplinas', 'niveis', 'modelos'].forEach((section) => {
      Object.entries(merged[section]).forEach(([label, synonyms]) => {
        flat.push(label, ...synonyms);
      });
    });
    const unique = Array.from(new Set(flat.map((w) => w.toLowerCase())));
    return `${text}\n\nPalavras-chave possiveis: ${unique.join(', ')}`;
  } catch {
    return text;
  }
};

const dedupWords = (text) => {
  const parts = text.split(/\s+/);
  const deduped = [];
  for (const w of parts) {
    if (deduped.length === 0 || deduped[deduped.length - 1].toLowerCase() !== w.toLowerCase()) {
      deduped.push(w);
    }
  }
  return deduped.join(' ');
};

const polishRelato = (relato) => {
  let r = relato || '';
  r = r.replace(/Aluno alunos/gi, 'Aluno');
  r = r.replace(/Aluno\s+Aluno/gi, 'Aluno');
  r = dedupWords(r);
  return r.trim();
};

export const ensureLocalAIReady = async (onProgress) => {
  try {
    if (!summarizer || !classifier) {
      await initPipelines(onProgress);
    }
    return { ready: !!(summarizer && classifier), initializing, progress: lastProgress };
  } catch (e) {
    return { ready: false, initializing: false, error: e.message };
  }
};

// Map labels for classification
const DISCIPLINE_LABELS = ['Matematica','Historia','Portugues','Ciencias','Geografia','Artes','Filosofia','Geral'];
const LEVEL_LABELS = ['Fundamental1','Fundamental2','Medio','Superior','EJA'];

// Basic anonymization (reuse logic if necessary)
const anonymize = (text) => {
  return text
    .replace(/(?:Escola|Colégio|Instituto)\s+[A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*/gi, 'Escola X')
    .replace(/\b[A-Z][a-zà-ú]+(?:\s[A-Z][a-zà-ú]+)*\b/g, 'Aluno');
};

export const processWithLocalAI = async (transcript) => {
  try {
    const cleanTranscript = normalizeTranscript(transcript);
    const hintedTranscript = appendKeywordHints(cleanTranscript);
    if (!summarizer || !classifier) {
      await initPipelines();
    }
    if (!summarizer || !classifier) return null;

    // 1) Summarize transcript to create structured relato
    const sum = await summarizer(hintedTranscript, { max_length: 180, min_length: 80 });
    const relato = polishRelato(anonymize(sum[0].summary_text));

    // 2) Classify discipline
    const disc = await classifier(hintedTranscript, DISCIPLINE_LABELS, { multi_label: false });
    const disciplina = disc.labels[0];
    const discScore = disc.scores[0];

    // 3) Classify level
    const lvl = await classifier(hintedTranscript, LEVEL_LABELS, { multi_label: false });
    const nivel_ensino = lvl.labels[0];
    const lvlScore = lvl.scores[0];

    // 4) Extract simple prompt heuristics
    const promptMatch = cleanTranscript.match(/(?:prompt|perguntei|pedi|solicitei|comando)[:\s]+"([^"]+)"|(?:prompt|perguntei|pedi)[:\s]+(.+?)(?:\.|$)/i);
    const prompt = promptMatch ? (promptMatch[1] || promptMatch[2]) : '';

    // 5) Title as first sentence
    const firstSentence = cleanTranscript.split(/[.!?]/)[0];
    const titulo = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;

    // 6) Tips (simple)
    const tipPatterns = /(?:dica|recomendação|sugestão|importante)[:\s]+([^.!?]+)/gi;
    const tips = [];
    let tipMatch;
    while ((tipMatch = tipPatterns.exec(transcript)) !== null) {
      tips.push(tipMatch[1].trim());
    }

    return {
      titulo: titulo.trim() || 'Atividade Didática (Resumo)',
      disciplina,
      nivel_ensino,
      modelo_ia: 'ChatGPT-3.5',
      prompt: prompt.trim(),
      relato,
      dicas: tips.length ? tips.join('; ') : 'Consulte o relato completo para mais detalhes',
      confianca: {
        titulo: 'media',
        disciplina: discScore > 0.6 ? 'alta' : (discScore > 0.4 ? 'media' : 'baixa'),
        nivel_ensino: lvlScore > 0.6 ? 'alta' : (lvlScore > 0.4 ? 'media' : 'baixa')
      }
    };
  } catch (e) {
    console.warn('Local AI processing failed:', e.message);
    return null;
  }
};
