import { KEYWORDS } from '../config/keywords';
import { FEATURES } from '../config/features';

const normalizeSpeechText = (text) => {
  let normalized = (text || '').toLowerCase();

  const replacements = [
    [/\bi\s*a\b/g, 'ia'],
    [/\be\s*a\b/g, 'ia'],
    [/\bintelig[eê]ncia\s+artificial\b/g, 'ia'],
    [/\bchat\s*g\s*p\s*t\b/g, 'chatgpt'],
    [/\bwi\s*fi\b/g, 'wifi'],
    [/\bb\s*n\s*c\s*c\b/g, 'bncc'],
  ];

  for (const [pattern, value] of replacements) {
    normalized = normalized.replace(pattern, value);
  }

  return normalized.replace(/\s+/g, ' ').trim();
};

const pickByKeywords = (text, dict, fallback) => {
  const lower = text.toLowerCase();
  for (const [label, words] of Object.entries(dict)) {
    if (words.some((w) => lower.includes(w))) return label;
  }
  return fallback;
};

const firstSentence = (text) => {
  const chunks = text.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);
  return chunks[0] || '';
};

const summarize = (text, maxChars = 700) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars - 3).trim() + '...';
};

const extractResources = (text) => {
  const map = [
    ['Projetor / Datashow', ['projetor', 'datashow']],
    ['Internet / Wi-Fi', ['internet', 'wifi', 'wi-fi']],
    ['Celulares (BYOD)', ['celular', 'smartphone']],
    ['Laboratorio de Informatica', ['laboratorio', 'informatica']],
    ['Tablets', ['tablet']],
    ['Quadro Branco', ['quadro']],
    ['IA Generativa', ['ia', 'chatgpt', 'gemini', 'copilot', 'claude']],
    ['Jogos', ['jogo', 'gamificacao']],
    ['Livro Didatico', ['livro didatico', 'apostila']],
  ];

  const lower = text.toLowerCase();
  const found = map.filter(([, words]) => words.some((w) => lower.includes(w))).map(([label]) => label);
  return found;
};

export const processTranscript = async (transcript, defaults = {}) => {
  const raw = (transcript || '').trim();
  if (raw.length < 20) {
    throw new Error('Transcricao muito curta. Fale mais sobre a pratica.');
  }

  const normalized = normalizeSpeechText(raw);

  if (FEATURES.useLocalAI) {
    try {
      const { ensureLocalAIReady, processWithLocalAI } = await import('./localAi');
      await ensureLocalAIReady();
      const localResult = await processWithLocalAI(raw);

      if (localResult) {
        return {
          ...localResult,
          disciplina: defaults.disciplina || localResult.disciplina || 'Geral',
        };
      }
    } catch (e) {
      console.warn('Falha ao processar com IA local:', e?.message || e);
    }
  }

  const tituloBase = firstSentence(raw);
  const disciplina = defaults.disciplina || 'Geral';

  return {
    titulo: tituloBase ? tituloBase.slice(0, 90) : 'Pratica pedagogica com IA',
    disciplina,
    nivel: pickByKeywords(normalized, KEYWORDS.niveis, ''),
    modelo_ia: pickByKeywords(normalized, KEYWORDS.modelos, ''),
    categoria: pickByKeywords(normalized, KEYWORDS.categorias, 'Outro'),
    bncc: '',
    metodologia: pickByKeywords(normalized, KEYWORDS.metodologias, 'Outra'),
    duracao: '',
    recursos: extractResources(normalized),
    experiencia: summarize(raw, 950),
    resultados: summarize(raw, 350),
    processedWith: 'local-fallback',
  };
};
