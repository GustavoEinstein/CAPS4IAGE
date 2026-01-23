// Local AI processing using @xenova/transformers
// Runs entirely in the browser (WebAssembly/WebGPU). First run downloads models.

let summarizer = null;
let classifier = null;
let initializing = false;
let lastProgress = null;

// Lazy initialize pipelines
const initPipelines = async (onProgress) => {
  if (initializing) return;
  initializing = true;
  try {
    const { pipeline } = await import('@xenova/transformers');
    // Summarization (small model)
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6', {
      progress_callback: (p) => { lastProgress = p; if (onProgress) onProgress(p); }
    });
    // Zero-shot classification (English MNLI; works reasonably on PT)
    classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli', {
      progress_callback: (p) => { lastProgress = p; if (onProgress) onProgress(p); }
    });
  } catch (e) {
    console.warn('Failed to init local AI pipelines:', e.message);
  } finally {
    initializing = false;
  }
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
    if (!summarizer || !classifier) {
      await initPipelines();
    }
    if (!summarizer || !classifier) return null;

    // 1) Summarize transcript to create structured relato
    const sum = await summarizer(transcript, { max_length: 180, min_length: 80 });
    const relato = anonymize(sum[0].summary_text);

    // 2) Classify discipline
    const disc = await classifier(transcript, DISCIPLINE_LABELS, { multi_label: false });
    const disciplina = disc.labels[0];
    const discScore = disc.scores[0];

    // 3) Classify level
    const lvl = await classifier(transcript, LEVEL_LABELS, { multi_label: false });
    const nivel_ensino = lvl.labels[0];
    const lvlScore = lvl.scores[0];

    // 4) Extract simple prompt heuristics
    const promptMatch = transcript.match(/(?:prompt|perguntei|pedi|solicitei|comando)[:\s]+"([^"]+)"|(?:prompt|perguntei|pedi)[:\s]+(.+?)(?:\.|$)/i);
    const prompt = promptMatch ? (promptMatch[1] || promptMatch[2]) : '';

    // 5) Title as first sentence
    const firstSentence = transcript.split(/[.!?]/)[0];
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
