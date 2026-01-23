/**
 * AI Processing Service
 * Handles the extraction and structuring of educational activity data from voice transcripts
 */

/**
 * Creates a structured prompt for AI to extract information from transcript
 * @param {string} transcript - The voice transcript to process
 * @returns {string} The formatted prompt for AI
 */
const createExtractionPrompt = (transcript) => {
    return `Você é um assistente especializado em catalogar atividades didáticas. Analise o seguinte relato de um professor sobre uma atividade em sala de aula e extraia as informações estruturadas.

IMPORTANTE: 
- Anonimize todos os dados pessoais (nomes de alunos, professores, escolas específicas)
- Use termos genéricos como "Aluno A", "Escola X", etc.
- Mantenha apenas informações pedagógicas relevantes

RELATO DO PROFESSOR:
"${transcript}"

EXTRAIA AS SEGUINTES INFORMAÇÕES E RETORNE EM FORMATO JSON:
{
  "titulo": "Título descritivo e objetivo da atividade (max 100 caracteres)",
  "disciplina": "Uma das opções: Geral, Matematica, Historia, Portugues, Ciencias, Geografia, Artes, Filosofia",
  "nivel_ensino": "Uma das opções: Fundamental1, Fundamental2, Medio, Superior, EJA",
  "modelo_ia": "Nome do modelo de IA mencionado pelo professor (se não mencionado, use 'ChatGPT-3.5')",
  "prompt": "O prompt exato que o professor disse ter usado com a IA (se mencionado). Se não foi mencionado, deixe vazio.",
  "relato": "Relato completo da experiência, anonimizado, em terceira pessoa, bem estruturado e profissional (3-5 parágrafos)",
  "dicas": "Lista de dicas práticas extraídas do relato (separadas por ponto e vírgula)",
  "confianca": {
    "titulo": "alta/media/baixa",
    "disciplina": "alta/media/baixa",
    "nivel_ensino": "alta/media/baixa"
  }
}

REGRAS:
1. Se algo não foi mencionado claramente, indique confiança "baixa"
2. Anonimize TODOS os nomes próprios
3. O relato deve estar em 3ª pessoa e linguagem formal
4. Dicas devem ser práticas e aplicáveis
5. Responda APENAS com o JSON, sem texto adicional`;
};

/**
 * Process transcript with AI (backend integration)
 * @param {string} transcript - The voice transcript
 * @returns {Promise<Object>} Structured data extracted from transcript
 */
export const processWithBackendAI = async (transcript) => {
    const prompt = createExtractionPrompt(transcript);
    
    try {
        const token = localStorage.getItem('access_token');
        
        // Call your Django backend endpoint
        const response = await fetch('http://127.0.0.1:8000/kipo_playground/api/ai/process-transcript/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                transcript,
                prompt
            })
        });

        if (!response.ok) {
            throw new Error('Backend AI processing failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Backend AI error:', error);
        throw error;
    }
};

/**
 * Process transcript with client-side fallback (rule-based extraction)
 * Used when AI service is unavailable
 * @param {string} transcript - The voice transcript
 * @returns {Object} Structured data extracted from transcript
 */
export const processWithFallback = (transcript) => {
    console.log('Using fallback rule-based extraction');
    
    // Basic extraction using keywords and patterns
    const disciplinas = {
        'matemática|matematica|calculo|algebra|geometria': 'Matematica',
        'história|historia|guerra|revolução': 'Historia',
        'português|portugues|redação|literatura|leitura': 'Portugues',
        'ciências|ciencia|biologia|quimica|fisica': 'Ciencias',
        'geografia': 'Geografia',
        'artes|arte|música|musica|pintura': 'Artes',
        'filosofia|etica': 'Filosofia'
    };

    const niveis = {
        'fundamental (1|I)|anos iniciais|1º ao 5º': 'Fundamental1',
        'fundamental (2|II)|anos finais|6º ao 9º': 'Fundamental2',
        'médio|medio|ensino médio|2º grau': 'Medio',
        'superior|faculdade|universidade': 'Superior',
        'EJA|educação de jovens': 'EJA'
    };

    const modelos = {
        'gpt-4|chatgpt 4|chat gpt 4': 'ChatGPT-4',
        'chatgpt|gpt|chat gpt': 'ChatGPT-3.5',
        'gemini|google gemini|bard': 'Gemini',
        'claude': 'Claude',
        'copilot': 'Microsoft Copilot',
        'llama': 'Llama (Local)'
    };

    // Extract discipline
    let disciplina = 'Geral';
    for (const [pattern, value] of Object.entries(disciplinas)) {
        if (new RegExp(pattern, 'i').test(transcript)) {
            disciplina = value;
            break;
        }
    }

    // Extract education level
    let nivel_ensino = 'Medio';
    for (const [pattern, value] of Object.entries(niveis)) {
        if (new RegExp(pattern, 'i').test(transcript)) {
            nivel_ensino = value;
            break;
        }
    }

    // Extract AI model
    let modelo_ia = 'ChatGPT-3.5';
    for (const [pattern, value] of Object.entries(modelos)) {
        if (new RegExp(pattern, 'i').test(transcript)) {
            modelo_ia = value;
            break;
        }
    }

    // Extract prompt if mentioned
    const promptMatch = transcript.match(/(?:prompt|perguntei|pedi|solicitei|comando)[:\s]+"([^"]+)"|(?:prompt|perguntei|pedi)[:\s]+(.+?)(?:\.|$)/i);
    const prompt = promptMatch ? (promptMatch[1] || promptMatch[2]) : '';

    // Anonymize transcript
    const anonymized = anonymizeText(transcript);

    // Create title (first 10 words or first sentence)
    const firstSentence = transcript.split(/[.!?]/)[0];
    const titulo = firstSentence.length > 100 
        ? firstSentence.substring(0, 97) + '...'
        : firstSentence;

    // Extract tips
    const tipPatterns = /(?:dica|recomendação|sugestão|importante)[:\s]+([^.!?]+)/gi;
    const tips = [];
    let tipMatch;
    while ((tipMatch = tipPatterns.exec(transcript)) !== null) {
        tips.push(tipMatch[1].trim());
    }

    return {
        titulo: titulo.trim() || 'Atividade Didática com IA',
        disciplina,
        nivel_ensino,
        modelo_ia,
        prompt: prompt.trim(),
        relato: anonymized,
        dicas: tips.length > 0 ? tips.join('; ') : 'Consulte o relato completo para mais detalhes',
        confianca: {
            titulo: 'media',
            disciplina: disciplina !== 'Geral' ? 'alta' : 'baixa',
            nivel_ensino: nivel_ensino !== 'Medio' ? 'alta' : 'baixa'
        },
        processedWith: 'fallback'
    };
};

/**
 * Anonymize personal data in text
 * @param {string} text - Text to anonymize
 * @returns {string} Anonymized text
 */
const anonymizeText = (text) => {
    let anonymized = text;
    
    // Replace common personal identifiers
    // Names: Any capitalized word that looks like a name
    const namePattern = /\b[A-Z][a-zà-ú]+(?:\s[A-Z][a-zà-ú]+)*\b/g;
    const names = new Set();
    let match;
    
    while ((match = namePattern.exec(text)) !== null) {
        const word = match[0];
        // Skip common words that might be capitalized
        if (!['Professor', 'Aluno', 'Turma', 'Escola', 'ChatGPT', 'Gemini', 'Claude'].includes(word)) {
            names.add(word);
        }
    }
    
    // Replace names with generic identifiers
    let nameCounter = 1;
    names.forEach(name => {
        const placeholder = `Aluno ${nameCounter}`;
        anonymized = anonymized.replaceAll(name, placeholder);
        nameCounter++;
    });

    // Replace specific school names
    anonymized = anonymized.replace(/(?:Escola|Colégio|Instituto)\s+[A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*/gi, 'Escola X');
    
    // Remove specific dates with sensitive context
    anonymized = anonymized.replace(/\b(?:nasceu|aniversário|idade)[:\s]+\d{1,2}\/\d{1,2}\/\d{2,4}/gi, '[data removida]');
    
    return anonymized;
};

/**
 * Main processing function with automatic fallback
 * @param {string} transcript - The voice transcript
 * @param {boolean} useBackend - Whether to try backend first (default: true)
 * @returns {Promise<Object>} Structured data
 */
export const processTranscript = async (transcript, useBackend = true) => {
    if (!transcript || transcript.trim().length < 20) {
        throw new Error('Transcrição muito curta. Fale mais sobre a atividade.');
    }

    // Try backend AI first if available
    if (useBackend) {
        try {
            const result = await processWithBackendAI(transcript);
            return { ...result, processedWith: 'backend' };
        } catch (error) {
            console.warn('Backend AI unavailable, using fallback:', error.message);
            // Fall through to fallback
        }
    }

    // Use fallback extraction
    return processWithFallback(transcript);
};
