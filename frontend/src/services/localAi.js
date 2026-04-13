import { KEYWORDS } from '../config/keywords';

const MODEL_IDS = {
  summarizer: 'Xenova/distilbart-cnn-12-6',
  classifier: 'Xenova/distilbert-base-uncased-mnli',
};

let summarizer = null;
let classifier = null;
let initializing = false;
let lastProgress = null;

const initPipelines = async (onProgress) => {
  if (initializing) return;
  initializing = true;

  try {
    const { pipeline, env } = await import('@xenova/transformers');

    env.allowLocalModels = false;
    env.useBrowserCache = true;
    env.localModelPath = '/models';

    summarizer = await pipeline('summarization', MODEL_IDS.summarizer, {
      progress_callback: (p) => {
        lastProgress = p;
        if (onProgress) onProgress(p);
      },
    });

    classifier = await pipeline('zero-shot-classification', MODEL_IDS.classifier, {
      progress_callback: (p) => {
        lastProgress = p;
        if (onProgress) onProgress(p);
      },
    });
  } catch (e) {
    console.warn('Falha ao inicializar IA local:', e?.message || e);
  } finally {
    initializing = false;
  }
};

const normalizeTranscript = (text) => {
  if (!text) return '';

  let t = text;
  const replacements = [
    [/\bi\s*a\b/gi, 'IA'],
    [/\be\s*a\b/gi, 'IA'],
    [/\bintelig[eê]ncia\s+artificial\b/gi, 'IA'],
    [/\bchat\s*g\s*p\s*t\b/gi, 'ChatGPT'],
    [/\bg\s*m\s*i\s*n\s*i\b/gi, 'Gemini'],
    [/\bc\s*l\s*a\s*u\s*d\s*e\b/gi, 'Claude'],
    [/\bwi\s*fi\b/gi, 'Wi-Fi'],
    [/\bb\s*n\s*c\s*c\b/gi, 'BNCC'],
  ];

  replacements.forEach(([re, val]) => {
    t = t.replace(re, val);
  });

  return t.replace(/\s+/g, ' ').trim();
};

const appendKeywordHints = (text) => {
  try {
    const flat = [];
    ['categorias', 'metodologias', 'niveis', 'modelos'].forEach((section) => {
      Object.entries(KEYWORDS[section] || {}).forEach(([label, synonyms]) => {
        flat.push(label, ...(synonyms || []));
      });
    });
    const unique = Array.from(new Set(flat.map((w) => String(w).toLowerCase())));
    return `${text}\n\nPalavras-chave possiveis: ${unique.join(', ')}`;
  } catch {
    return text;
  }
};

const dedupWords = (text) => {
  const parts = (text || '').split(/\s+/);
  const deduped = [];

  for (const word of parts) {
    if (!word) continue;
    if (deduped.length === 0 || deduped[deduped.length - 1].toLowerCase() !== word.toLowerCase()) {
      deduped.push(word);
    }
  }

  return deduped.join(' ');
};

const anonymize = (text) => {
  return (text || '')
    .replace(/(?:Escola|Col[eé]gio|Instituto)\s+[A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*/gi, 'Escola X')
    .replace(/\b[A-Z][a-zà-ú]+(?:\s[A-Z][a-zà-ú]+)*\b/g, 'Aluno');
};

const polishRelato = (relato) => dedupWords(anonymize(relato)).trim();

export const ensureLocalAIReady = async (onProgress) => {
  try {
    if (!summarizer || !classifier) {
      await initPipelines(onProgress);
    }

    return {
      ready: !!(summarizer && classifier),
      initializing,
      progress: lastProgress,
    };
  } catch (e) {
    return { ready: false, initializing: false, error: e?.message || String(e) };
  }
};

const classifyBest = async (text, labels) => {
  if (!classifier) return { label: '', score: 0 };
  const result = await classifier(text, labels, { multi_label: false });
  return { label: result.labels?.[0] || '', score: result.scores?.[0] || 0 };
};

const extractPrompt = (text) => {
  const match = text.match(/(?:prompt|perguntei|pedi|solicitei|comando)[:\s]+"([^"]+)"|(?:prompt|perguntei|pedi)[:\s]+(.+?)(?:\.|$)/i);
  return match ? (match[1] || match[2] || '').trim() : '';
};

const extractTips = (text) => {
  const tipPatterns = /(?:dica|recomenda[cç][aã]o|sugest[aã]o|importante)[:\s]+([^.!?]+)/gi;
  const tips = [];
  let match;

  while ((match = tipPatterns.exec(text)) !== null) {
    tips.push(match[1].trim());
  }

  return tips;
};

export const processWithLocalAI = async (transcript) => {
  try {
    const cleanTranscript = normalizeTranscript(transcript);
    const hintedTranscript = appendKeywordHints(cleanTranscript);

    if (!summarizer || !classifier) {
      await initPipelines();
    }

    if (!summarizer || !classifier) return null;

    const sum = await summarizer(hintedTranscript, { max_length: 180, min_length: 80 });
    const relato = polishRelato(sum?.[0]?.summary_text || cleanTranscript);

    const categorias = Object.keys(KEYWORDS.categorias || {});
    const metodologias = Object.keys(KEYWORDS.metodologias || {});
    const niveis = Object.keys(KEYWORDS.niveis || {});
    const modelos = Object.keys(KEYWORDS.modelos || {});

    const disc = await classifyBest(hintedTranscript, categorias);
    const met = await classifyBest(hintedTranscript, metodologias);
    const lvl = await classifyBest(hintedTranscript, niveis);
    const model = await classifyBest(hintedTranscript, modelos);

    const firstSentence = cleanTranscript.split(/[.!?]/)[0];

    return {
      titulo: firstSentence.length > 100 ? `${firstSentence.substring(0, 97)}...` : firstSentence,
      disciplina: '',
      nivel: lvl.label,
      modelo_ia: model.label,
      categoria: disc.label,
      bncc: '',
      metodologia: met.label,
      duracao: '',
      recursos: [],
      experiencia: relato,
      resultados: relato,
      prompt: extractPrompt(cleanTranscript),
      dicas: extractTips(cleanTranscript).join('; '),
      processedWith: 'local-ai',
      confidences: {
        categoria: disc.score,
        metodologia: met.score,
        nivel: lvl.score,
        modelo_ia: model.score,
      },
    };
  } catch (e) {
    console.warn('Local AI processing failed:', e?.message || e);
    return null;
  }
};
