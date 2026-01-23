import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Save, 
    Upload, 
    AlertCircle, 
    Mic, 
    ArrowLeft, 
    Sparkles, 
    Keyboard,
    Volume2,
    Trash2,
    CheckCircle,
    Edit3,
    AlertTriangle
} from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processTranscript } from '../services/aiProcessing';
import { ensureLocalAIReady } from '../services/localAi';
import { addUserKeyword } from '../config/keywords';

const NewProduction = () => {
    const [mode, setMode] = useState('selecao'); 
    const navigate = useNavigate();
    
    const context = useOutletContext(); 
    const isMobile = context ? context.isMobile : false;

    // --- RENDERIZAÇÃO CONDICIONAL ---
    if (mode === 'selecao') {
        return <SelectionScreen onSelect={setMode} isMobile={isMobile} />;
    }

    if (mode === 'manual') {
        return <ManualForm onBack={() => setMode('selecao')} navigate={navigate} isMobile={isMobile} />;
    }

    if (mode === 'voz') {
        return <VoiceForm onBack={() => setMode('selecao')} navigate={navigate} isMobile={isMobile} />;
    }

    return null;
};

// --- 1. TELA DE SELEÇÃO (O HUB) ---
const SelectionScreen = ({ onSelect, isMobile }) => {
    return (
        <div style={styles.containerCenter}>
            <div style={{...styles.headerCenter, marginBottom: '40px'}}>
                <h2 style={styles.titleCenter}>Como você deseja catalogar?</h2>
                <p style={styles.subtitleCenter}>Escolha a forma mais confortável para registrar sua atividade.</p>
            </div>

            <div style={{
                ...styles.selectionGrid,
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                {/* OPÇÃO 1: MANUAL */}
                <div 
                    style={styles.selectionCard} 
                    onClick={() => onSelect('manual')}
                >
                    <div style={styles.iconCircleBlue}>
                        <Keyboard size={32} color="#1565C0" />
                    </div>
                    <h3 style={styles.cardTitle}>Preenchimento Manual</h3>
                    <p style={styles.cardDesc}>
                        Preencha o formulário padrão com campos detalhados. Ideal se você já tem o texto pronto ou quer revisar campo a campo.
                    </p>
                    <span style={styles.fakeLink}>Ir para formulário &rarr;</span>
                </div>

                {/* OPÇÃO 2: VOZ (IA) */}
                <div 
                    style={styles.selectionCardAi} 
                    onClick={() => onSelect('voz')}
                >
                    <div style={styles.iconCirclePurple}>
                        <Mic size={32} color="#7B1FA2" />
                    </div>
                    <h3 style={styles.cardTitle}>Catalogar por Voz</h3>
                    <p style={styles.cardDesc}>
                        Conte para a IA como foi sua aula e ela preencherá os campos automaticamente para você revisar depois.
                    </p>
                    <span style={{...styles.fakeLink, color: '#7B1FA2'}}>Iniciar gravação &rarr;</span>
                </div>
            </div>
        </div>
    );
};

// --- 2. TELA MANUAL (FORMULÁRIO COMPLETO) ---
const ManualForm = ({ onBack, navigate, isMobile }) => {
    const [arquivo, setArquivo] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        disciplina: 'Geral',
        nivel_ensino: 'Medio',
        modelo_ia: 'ChatGPT-3.5',
        prompt: '',
        relato: '',
        dicas: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setArquivo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulação ou chamada real
            const token = localStorage.getItem('access_token');
            const url = 'http://127.0.0.1:8000/kipo_playground/api/production/create/';
            
            const dataToSend = new FormData();
            // Appends...
            // await axios.post...
            
            // Simulando delay para teste visual
            setTimeout(() => {
                alert('Produção salva com sucesso!');
                navigate('/dashboard');
            }, 1000);

        } catch (err) {
            console.error(err);
            setError('Erro ao salvar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F0F2F5', paddingBottom: '20px'}}>
                    <button onClick={onBack} style={styles.backButton}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{...styles.title, margin: 0, marginLeft: '10px', fontSize: '24px'}}>Catalogar Nova Produção</h2>
                        <p style={{margin: '0 0 0 10px', color: '#546E7A', fontSize: '14px'}}>Preenchimento manual detalhado</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Título da Atividade</label>
                        <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={styles.input} placeholder="Ex: Simulação de Júri Histórico..." required />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Disciplina</label>
                            <select name="disciplina" value={formData.disciplina} onChange={handleChange} style={styles.select}>
                                <option value="Geral">Geral / Gestão</option>
                                <option value="Matematica">Matemática</option>
                                <option value="Historia">História</option>
                                <option value="Portugues">Língua Portuguesa</option>
                                <option value="Ciencias">Ciências / Biologia</option>
                                <option value="Geografia">Geografia</option>
                                <option value="Artes">Artes</option>
                                <option value="Filosofia">Filosofia</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nível de Ensino</label>
                            <select name="nivel_ensino" value={formData.nivel_ensino} onChange={handleChange} style={styles.select}>
                                <option value="Fundamental1">Fund. Anos Iniciais</option>
                                <option value="Fundamental2">Fund. Anos Finais</option>
                                <option value="Medio">Ensino Médio</option>
                                <option value="Superior">Ensino Superior</option>
                                <option value="EJA">EJA</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Modelo de IA</label>
                            <select name="modelo_ia" value={formData.modelo_ia} onChange={handleChange} style={styles.select}>
                                <option value="ChatGPT-3.5">ChatGPT-3.5</option>
                                <option value="ChatGPT-4">ChatGPT-4</option>
                                <option value="Gemini">Google Gemini</option>
                                <option value="Claude">Claude 3</option>
                                <option value="Copilot">Microsoft Copilot</option>
                                <option value="Llama">Llama (Local)</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Prompt (Comando exato dado à IA)</label>
                        <textarea name="prompt" value={formData.prompt} onChange={handleChange} style={{...styles.textarea, height: '120px'}} placeholder="Cole aqui o prompt..." required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Relato da Experiência</label>
                        <textarea name="relato" value={formData.relato} onChange={handleChange} style={{...styles.textarea, height: '140px'}} placeholder="Como foi aplicar isso?" />
                    </div>

                    <div style={styles.row}>
                        <div style={{...styles.inputGroup, flex: 2}}>
                            <label style={styles.label}>Dicas de Aplicação</label>
                            <textarea name="dicas" value={formData.dicas} onChange={handleChange} style={{...styles.textarea, height: '80px'}} placeholder="Dicas rápidas..." />
                        </div>
                        <div style={{...styles.inputGroup, flex: 1}}>
                            <label style={styles.label}>Anexo (Opcional)</label>
                            <div style={styles.fileWrapper}>
                                <input type="file" onChange={handleFileChange} style={styles.fileInput} accept="image/*,.pdf,.doc,.docx" />
                                <div style={styles.fileCustomButton}>
                                    <Upload size={20} style={{marginBottom: '5px'}} />
                                    {arquivo ? <span style={{color: '#1565C0', fontWeight: 'bold'}}>{arquivo.name}</span> : <span>Upload Arquivo</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <AlertCircle size={18} style={{marginRight: '8px'}} />
                            {error}
                        </div>
                    )}

                    <div style={styles.footerActions}>
                        <button type="button" onClick={onBack} style={styles.buttonCancel}>Cancelar</button>
                        <button type="submit" style={isLoading ? styles.buttonDisabled : styles.button} disabled={isLoading}>
                            <Save size={18} style={{marginRight: '8px'}} />
                            {isLoading ? 'Salvando...' : 'Salvar Produção'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 3. TELA DE VOZ ---
const VoiceForm = ({ onBack, navigate, isMobile }) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        error,
        toggleListening,
        resetTranscript
    } = useSpeechRecognition({ lang: 'pt-BR', continuous: true, interimResults: true });

    const [isProcessing, setIsProcessing] = useState(false);
    const [processedData, setProcessedData] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [localAIMessage, setLocalAIMessage] = useState('');

    // Process transcript with AI
    const processWithAI = async () => {
        if (!transcript.trim()) {
            alert('Por favor, grave algo antes de processar.');
            return;
        }

        if (transcript.trim().length < 50) {
            alert('A transcrição está muito curta. Fale mais sobre a atividade.');
            return;
        }

        setIsProcessing(true);
        setAiError(null);
        
        try {
            // Pre-init local AI to show progress if first run
            setLocalAIMessage('');
            const status = await ensureLocalAIReady((p) => {
                if (p && p.status) {
                    setLocalAIMessage(`Baixando modelos (${p.status})...`);
                }
            });
            if (!status.ready && status.initializing) {
                setLocalAIMessage('Inicializando IA local (primeira execução)...');
            }

            // Process with AI service (tries backend, falls back to rule-based)
            const processed = await processTranscript(transcript, true);
            
            console.log('Processed data:', processed);
            setProcessedData(processed);
            setShowReview(true);
            setLocalAIMessage('');
            
        } catch (err) {
            console.error('Processing error:', err);
            setAiError(err.message || 'Erro ao processar com IA. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Save processed data to backend
    const saveProduction = async () => {
        if (!processedData) return;

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('access_token');
            const url = 'http://127.0.0.1:8000/kipo_playground/api/production/create/';
            
            const formData = new FormData();
            formData.append('titulo', processedData.titulo);
            formData.append('disciplina', processedData.disciplina);
            formData.append('nivel_ensino', processedData.nivel_ensino);
            formData.append('modelo_ia', processedData.modelo_ia);
            formData.append('prompt', processedData.prompt);
            formData.append('relato', processedData.relato);
            formData.append('dicas', processedData.dicas);

            await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('✅ Produção salva com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Save error:', err);
            alert('Erro ao salvar. Tente novamente ou use o formulário manual.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Update a specific field in processed data
    const updateField = (field, value) => {
        setProcessedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fullTranscript = transcript + interimTranscript;

    // Review screen after AI processing
    if (showReview && processedData) {
        return <ReviewForm 
            data={processedData} 
            onBack={() => setShowReview(false)}
            onSave={saveProduction}
            onEdit={updateField}
            isProcessing={isProcessing}
        />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button onClick={onBack} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar para seleção
                </button>

                <div style={styles.voiceContainer}>
                    <div style={styles.voiceHeader}>
                        <div style={styles.iconCirclePurple}>
                            <Sparkles size={24} color="#7B1FA2" />
                        </div>
                        <h2 style={{...styles.title, color: '#4A148C', fontSize: '24px'}}>
                            Entrevista com a IA
                        </h2>
                    </div>
                    
                    <p style={{...styles.subtitle, textAlign: 'center', maxWidth: '600px', margin: '0 auto 20px auto'}}>
                        Clique no microfone e descreva sua atividade didática. Fale sobre o tema, como os alunos reagiram e quais materiais usou. A IA vai estruturar tudo para você.
                    </p>

                    {/* Talking points to guide the teacher */}
                    <div style={styles.talkingPoints}>
                        <p style={{margin: 0, color: '#7B1FA2', fontWeight: '700'}}>Dicas do que comentar:</p>
                        <ul style={styles.talkingList}>
                            <li>Disciplina e série (ex.: Matemática - Ensino Médio)</li>
                            <li>Objetivo da atividade (o que alunos deveriam aprender)</li>
                            <li>Como a IA foi usada (modelo, prompt, passos)</li>
                            <li>Materiais/recursos utilizados (slides, livros, apps)</li>
                            <li>Resultados e reações dos alunos</li>
                            <li>Dicas e cuidados para outros professores</li>
                        </ul>
                    </div>

                    {/* Browser support warning */}
                    {!isSupported && (
                        <div style={{...styles.errorBox, marginBottom: '20px'}}>
                            <AlertCircle size={18} style={{marginRight: '8px'}} />
                            Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.
                        </div>
                    )}

                    {/* Error/info display */}
                    {(error || aiError || localAIMessage) && (
                        <div style={{...styles.errorBox, marginBottom: '20px'}}>
                            <AlertCircle size={18} style={{marginRight: '8px'}} />
                            {error || aiError || localAIMessage}
                        </div>
                    )}

                    <div style={styles.micWrapper}>
                        <button 
                            onClick={toggleListening}
                            disabled={!isSupported || isProcessing}
                            style={{
                                ...styles.micButton,
                                backgroundColor: isListening ? '#FFEBEE' : '#F3E5F5',
                                borderColor: isListening ? '#EF5350' : '#E1BEE7',
                                transform: isListening ? 'scale(1.1)' : 'scale(1)',
                                opacity: !isSupported || isProcessing ? 0.5 : 1,
                                cursor: !isSupported || isProcessing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Mic size={48} color={isListening ? "#D32F2F" : "#7B1FA2"} />
                        </button>
                        <p style={styles.micStatus}>
                            {isListening ? (
                                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <Volume2 size={18} />
                                    Gravando... (Clique para parar)
                                </span>
                            ) : (
                                "Toque para falar"
                            )}
                        </p>
                    </div>

                    <div style={styles.transcriptionBox}>
                        {fullTranscript ? (
                            <div>
                                <p style={{color: '#333', lineHeight: '1.6', margin: 0}}>
                                    {transcript}
                                    {interimTranscript && (
                                        <span style={{color: '#999', fontStyle: 'italic'}}>
                                            {interimTranscript}
                                        </span>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p style={{color: '#999', fontStyle: 'italic'}}>
                                {isListening ? "Ouvindo sua voz..." : "Sua transcrição aparecerá aqui..."}
                            </p>
                        )}
                    </div>

                    {/* Clear transcript button */}
                    {transcript && !isListening && (
                        <button 
                            onClick={resetTranscript}
                            style={{...styles.clearButton, marginBottom: '20px'}}
                        >
                            <Trash2 size={16} style={{marginRight: '6px'}} />
                            Limpar Transcrição
                        </button>
                    )}

                    <div style={styles.footerActions}>
                        <button style={styles.buttonCancel} onClick={onBack} disabled={isProcessing}>
                            Cancelar
                        </button>
                        <button 
                            onClick={processWithAI}
                            disabled={!transcript.trim() || isListening || isProcessing || !isSupported}
                            style={{
                                ...styles.button, 
                                backgroundColor: '#7B1FA2',
                                opacity: (!transcript.trim() || isListening || isProcessing) ? 0.5 : 1,
                                cursor: (!transcript.trim() || isListening || isProcessing) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Sparkles size={18} style={{marginRight: '8px'}} />
                            {isProcessing ? 'Processando...' : 'Processar com IA'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. TELA DE REVISÃO (Review AI-processed data) ---
const ReviewForm = ({ data, onBack, onSave, onEdit, isProcessing }) => {
    const [formData, setFormData] = useState(data);
    const [newDiscSyn, setNewDiscSyn] = useState('');
    const [newLevelSyn, setNewLevelSyn] = useState('');
    const [newModelSyn, setNewModelSyn] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        onEdit(field, value);
    };

    const getConfidenceBadge = (level) => {
        const styles = {
            alta: { bg: '#E8F5E9', color: '#2E7D32', text: 'Alta confiança' },
            media: { bg: '#FFF3E0', color: '#E65100', text: 'Confiança média' },
            baixa: { bg: '#FFEBEE', color: '#C62828', text: 'Baixa confiança - Revise!' }
        };
        const style = styles[level] || styles.media;
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                marginLeft: '8px'
            }}>
                {style.text}
            </span>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F0F2F5', paddingBottom: '20px'}}>
                    <button onClick={onBack} style={styles.backButton}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{flex: 1, marginLeft: '10px'}}>
                        <h2 style={{...styles.title, margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center'}}>
                            <Edit3 size={24} style={{marginRight: '10px'}} />
                            Revisar Dados Extraídos pela IA
                        </h2>
                        <p style={{margin: '5px 0 0 34px', color: '#546E7A', fontSize: '14px'}}>
                            {data.processedWith === 'backend' ? '✨ Processado com IA do servidor' : '⚡ Processado com extração automática'}
                        </p>
                    </div>
                </div>

                {/* Warning if low confidence */}
                {(data.confianca?.titulo === 'baixa' || data.confianca?.disciplina === 'baixa' || data.confianca?.nivel_ensino === 'baixa') && (
                    <div style={{...styles.warningBox, marginBottom: '20px'}}>
                        <AlertTriangle size={18} style={{marginRight: '8px'}} />
                        Alguns campos têm baixa confiança. Por favor, revise e ajuste conforme necessário.
                    </div>
                )}

                <form style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Título da Atividade
                            {data.confianca?.titulo && getConfidenceBadge(data.confianca.titulo)}
                        </label>
                        <input 
                            type="text" 
                            value={formData.titulo} 
                            onChange={(e) => handleChange('titulo', e.target.value)}
                            style={styles.input} 
                            required 
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Disciplina
                                {data.confianca?.disciplina && getConfidenceBadge(data.confianca.disciplina)}
                            </label>
                            <select 
                                value={formData.disciplina} 
                                onChange={(e) => handleChange('disciplina', e.target.value)}
                                style={styles.select}
                            >
                                <option value="Geral">Geral / Gestão</option>
                                <option value="Matematica">Matemática</option>
                                <option value="Historia">História</option>
                                <option value="Portugues">Língua Portuguesa</option>
                                <option value="Ciencias">Ciências / Biologia</option>
                                <option value="Geografia">Geografia</option>
                                <option value="Artes">Artes</option>
                                <option value="Filosofia">Filosofia</option>
                            </select>
                            <div style={styles.inlineAdd}>
                                <input 
                                    type="text" 
                                    placeholder={`Adicionar sinônimo para ${formData.disciplina}`}
                                    value={newDiscSyn}
                                    onChange={(e) => setNewDiscSyn(e.target.value)}
                                    style={styles.smallInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => { if (newDiscSyn.trim()) { addUserKeyword('disciplinas', formData.disciplina, newDiscSyn.trim()); setNewDiscSyn(''); } }}
                                    style={styles.smallButton}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Nível de Ensino
                                {data.confianca?.nivel_ensino && getConfidenceBadge(data.confianca.nivel_ensino)}
                            </label>
                            <select 
                                value={formData.nivel_ensino} 
                                onChange={(e) => handleChange('nivel_ensino', e.target.value)}
                                style={styles.select}
                            >
                                <option value="Fundamental1">Fund. Anos Iniciais</option>
                                <option value="Fundamental2">Fund. Anos Finais</option>
                                <option value="Medio">Ensino Médio</option>
                                <option value="Superior">Ensino Superior</option>
                                <option value="EJA">EJA</option>
                            </select>
                            <div style={styles.inlineAdd}>
                                <input 
                                    type="text" 
                                    placeholder={`Adicionar sinônimo para ${formData.nivel_ensino}`}
                                    value={newLevelSyn}
                                    onChange={(e) => setNewLevelSyn(e.target.value)}
                                    style={styles.smallInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => { if (newLevelSyn.trim()) { addUserKeyword('niveis', formData.nivel_ensino, newLevelSyn.trim()); setNewLevelSyn(''); } }}
                                    style={styles.smallButton}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Modelo de IA</label>
                            <select 
                                value={formData.modelo_ia} 
                                onChange={(e) => handleChange('modelo_ia', e.target.value)}
                                style={styles.select}
                            >
                                <option value="ChatGPT-3.5">ChatGPT-3.5</option>
                                <option value="ChatGPT-4">ChatGPT-4</option>
                                <option value="Gemini">Google Gemini</option>
                                <option value="Claude">Claude 3</option>
                                <option value="Copilot">Microsoft Copilot</option>
                                <option value="Llama">Llama (Local)</option>
                            </select>
                            <div style={styles.inlineAdd}>
                                <input 
                                    type="text" 
                                    placeholder={`Adicionar sinônimo para ${formData.modelo_ia}`}
                                    value={newModelSyn}
                                    onChange={(e) => setNewModelSyn(e.target.value)}
                                    style={styles.smallInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => { if (newModelSyn.trim()) { addUserKeyword('modelos', formData.modelo_ia, newModelSyn.trim()); setNewModelSyn(''); } }}
                                    style={styles.smallButton}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Prompt (Comando dado à IA)</label>
                        <textarea 
                            value={formData.prompt} 
                            onChange={(e) => handleChange('prompt', e.target.value)}
                            style={{...styles.textarea, height: '100px'}} 
                            placeholder="Prompt usado com a IA..."
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Relato da Experiência (Anonimizado)
                            <span style={{fontWeight: 'normal', fontSize: '12px', marginLeft: '8px', color: '#666'}}>
                                ✅ Dados pessoais removidos automaticamente
                            </span>
                        </label>
                        <textarea 
                            value={formData.relato} 
                            onChange={(e) => handleChange('relato', e.target.value)}
                            style={{...styles.textarea, height: '180px'}} 
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Dicas de Aplicação</label>
                        <textarea 
                            value={formData.dicas} 
                            onChange={(e) => handleChange('dicas', e.target.value)}
                            style={{...styles.textarea, height: '80px'}} 
                            placeholder="Dicas práticas extraídas..."
                        />
                    </div>

                    <div style={styles.footerActions}>
                        <button type="button" onClick={onBack} style={styles.buttonCancel} disabled={isProcessing}>
                            Voltar para Editar
                        </button>
                        <button 
                            type="button" 
                            onClick={onSave}
                            style={isProcessing ? styles.buttonDisabled : {...styles.button, backgroundColor: '#4CAF50'}} 
                            disabled={isProcessing}
                        >
                            <Save size={18} style={{marginRight: '8px'}} />
                            {isProcessing ? 'Salvando...' : 'Salvar Produção'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ESTILOS AJUSTADOS ---
const styles = {
    // Layout Geral
    container: {
        display: 'flex', 
        justifyContent: 'center', 
        padding: '30px', 
        width: '100%', 
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 70px)' // GARANTE ALTURA MÍNIMA para evitar barra preta
    },
    
    // ESTILOS DA TELA DE SELEÇÃO (AJUSTADOS)
    containerCenter: {
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        // Mudança aqui: de 'center' para 'flex-start' para subir o conteúdo
        justifyContent: 'flex-start', 
        paddingTop: '60px', // Empurra para baixo apenas o necessário
        paddingBottom: '40px',
        width: '100%', 
        minHeight: 'calc(100vh - 70px)', // Ocupa toda a altura disponível
        boxSizing: 'border-box'
    },
    
    card: {
        width: '100%', maxWidth: '1000px', padding: '40px', backgroundColor: '#ffffff',
        borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0',
        display: 'flex', flexDirection: 'column'
    },
    
    // Tela de Seleção
    headerCenter: { textAlign: 'center', maxWidth: '600px' },
    titleCenter: { fontSize: '32px', color: '#1565C0', margin: '0 0 10px 0', fontWeight: '800' },
    subtitleCenter: { fontSize: '18px', color: '#546E7A', margin: 0 },
    selectionGrid: { display: 'flex', gap: '30px', justifyContent: 'center', width: '100%', maxWidth: '900px' },
    
    // Cartões de Seleção
    selectionCard: {
        flex: 1, backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px',
        border: '1px solid #E0E0E0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', minWidth: '280px'
    },
    selectionCardAi: {
        flex: 1, backgroundColor: '#F3E5F5', padding: '40px 30px', borderRadius: '20px',
        border: '1px solid #E1BEE7', boxShadow: '0 4px 15px rgba(123, 31, 162, 0.1)',
        cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', minWidth: '280px', position: 'relative'
    },
    iconCircleBlue: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
    iconCirclePurple: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '15px' },
    cardDesc: { fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '25px', flex: 1 },
    fakeLink: { fontSize: '14px', fontWeight: '700', color: '#1565C0' },

    // Tela de Voz
    voiceContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    voiceHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
    micWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '30px' },
    micButton: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    micStatus: { fontWeight: '600', color: '#555' },
    transcriptionBox: { width: '100%', maxWidth: '600px', height: '150px', backgroundColor: '#F9FAFB', border: '1px dashed #CCC', borderRadius: '12px', padding: '20px', overflowY: 'auto', marginBottom: '30px' },
    talkingPoints: { width: '100%', maxWidth: '700px', backgroundColor: '#F8EAF6', border: '1px solid #E1BEE7', borderRadius: '12px', padding: '16px', margin: '10px auto 24px' },
    talkingList: { margin: '8px 0 0', paddingLeft: '18px', color: '#4A148C', lineHeight: 1.6, fontSize: '14px' },

    // Comuns
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#546E7A', fontWeight: '600', marginBottom: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' },
    row: { display: 'flex', gap: '25px', flexWrap: 'wrap' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' },
    
    label: { color: '#37474F', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px' },
    input: { padding: '14px', borderRadius: '8px', border: '1px solid #CFD8DC', backgroundColor: '#F7F9FC', color: '#101010', fontSize: '15px', fontWeight: '500', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' },
    select: { padding: '14px', borderRadius: '8px', border: '1px solid #CFD8DC', backgroundColor: '#F7F9FC', color: '#101010', fontSize: '15px', fontWeight: '500', width: '100%', cursor: 'pointer', outline: 'none' },
    textarea: { padding: '14px', borderRadius: '8px', border: '1px solid #CFD8DC', backgroundColor: '#F7F9FC', color: '#101010', fontSize: '15px', fontWeight: '500', width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Segoe UI', sans-serif", lineHeight: '1.5' },
    
    fileWrapper: { position: 'relative', height: '80px', width: '100%' },
    fileInput: { position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 },
    fileCustomButton: { width: '100%', height: '100%', borderRadius: '8px', border: '2px dashed #90CAF9', backgroundColor: '#E3F2FD', color: '#1565C0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box' },
    
    footerActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', borderTop: '1px solid #EEE', paddingTop: '20px', width: '100%' },
    button: { padding: '12px 24px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px' },
    buttonDisabled: { padding: '12px 24px', backgroundColor: '#B0BEC5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'not-allowed' },
    buttonCancel: { padding: '12px 24px', backgroundColor: 'transparent', color: '#546E7A', border: '1px solid #CFD8DC', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' },
    inlineAdd: { display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' },
    smallInput: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #CFD8DC', backgroundColor: '#F7F9FC', fontSize: '13px', flex: 1 },
    smallButton: { padding: '8px 12px', backgroundColor: '#E1BEE7', color: '#4A148C', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },
    clearButton: { padding: '10px 20px', backgroundColor: 'transparent', color: '#D32F2F', border: '1px solid #FFCDD2', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
    errorBox: { backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    warningBox: { backgroundColor: '#FFF3E0', color: '#E65100', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', fontWeight: '600' },
    title: { color: '#1565C0', fontSize: '26px', fontWeight: '800' },
    subtitle: { color: '#546E7A', fontSize: '15px' },
};

export default NewProduction;