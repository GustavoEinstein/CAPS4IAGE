import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    UploadCloud, 
    Lock, 
    BookOpen, 
    Wrench, 
    Clock, 
    Package, 
    Lightbulb, 
    Target, 
    FileText,
    CheckCircle2,
    Layers,
    Plus,
    X,
    Mic,
    Keyboard,
    Sparkles,
    Volume2,
    AlertCircle,
    Trash2
} from 'lucide-react';

const NewProduction = () => {
    const [mode, setMode] = useState('selecao'); // 'selecao', 'manual', 'voz'
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };

    // --- RENDERIZAÇÃO CONDICIONAL ---
    if (mode === 'selecao') {
        return <SelectionScreen onSelect={setMode} isMobile={isMobile} navigate={navigate} />;
    }

    if (mode === 'manual') {
        return <ManualFormSplit onBack={() => setMode('selecao')} navigate={navigate} isMobile={isMobile} />;
    }

    if (mode === 'voz') {
        return <VoiceFormV2 onBack={() => setMode('selecao')} navigate={navigate} isMobile={isMobile} />;
    }

    return null;
};

// =================================================================================
// 1. TELA DE SELEÇÃO (2 CARDS)
// =================================================================================
const SelectionScreen = ({ onSelect, isMobile, navigate }) => {
    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.containerCenter}>
                
                <button onClick={() => navigate(-1)} style={styles.backButtonSimple}>
                    <ArrowLeft size={20}/> Cancelar
                </button>

                <div style={{...styles.headerCenter, marginBottom: '40px'}}>
                    <h2 style={styles.titleCenter}>Como você deseja catalogar?</h2>
                    <p style={styles.subtitleCenter}>Escolha a forma mais confortável para registrar sua atividade.</p>
                </div>

                <div style={{
                    ...styles.selectionGrid,
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    {/* OPÇÃO 1: MANUAL */}
                    <div style={styles.selectionCard} onClick={() => onSelect('manual')}>
                        <div style={styles.iconCircleBlue}>
                            <Keyboard size={32} color="#1565C0" />
                        </div>
                        <h3 style={styles.cardTitle}>Preenchimento Manual</h3>
                        <p style={styles.cardDesc}>
                            Preencha o formulário detalhado com duas colunas. Ideal se você já tem o material pronto.
                        </p>
                        <span style={styles.fakeLink}>Ir para formulário &rarr;</span>
                    </div>

                    {/* OPÇÃO 2: VOZ (IA) */}
                    <div style={styles.selectionCardAi} onClick={() => onSelect('voz')}>
                        <div style={styles.iconCirclePurple}>
                            <Mic size={32} color="#7B1FA2" />
                        </div>
                        <h3 style={styles.cardTitle}>Catalogar por Voz</h3>
                        <div style={styles.badgeAi}>✨ Com IA</div>
                        <p style={styles.cardDesc}>
                            Conte para a IA como foi sua aula e ela preencherá os campos automaticamente.
                        </p>
                        <span style={{...styles.fakeLink, color: '#7B1FA2'}}>Iniciar gravação &rarr;</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================================================================================
// 2. FORMULÁRIO MANUAL (SPLIT LAYOUT - O QUE VOCÊ GOSTOU)
// =================================================================================
const ManualFormSplit = ({ onBack, navigate, isMobile }) => {
    const user = { nome: "Ricardo Silva", disciplina: "Filosofia" };
    
    const [formData, setFormData] = useState({
        titulo: '', disciplina: user.disciplina, nivel: '', modelo_ia: '',
        categoria: '', bncc: '', metodologia: '', duracao: '',
        recursos: [], experiencia: '', resultados: '', arquivo: null
    });
    
    const [customResource, setCustomResource] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const RECURSOS_COMUNS = ["Projetor / Datashow", "Internet / Wi-Fi", "Celulares (BYOD)", "Laboratório de Informática", "Tablets", "Quadro Branco", "IA Generativa", "Jogos", "Livro Didático"];

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleFileChange = (e) => { setFormData(prev => ({ ...prev, arquivo: e.target.files[0] })); };
    const toggleRecurso = (recurso) => {
        setFormData(prev => {
            const exists = prev.recursos.includes(recurso);
            return exists ? { ...prev, recursos: prev.recursos.filter(r => r !== recurso) } : { ...prev, recursos: [...prev.recursos, recurso] };
        });
    };
    const addCustomResource = (e) => {
        if ((e.key === 'Enter' || e.type === 'click') && customResource.trim()) {
            e.preventDefault();
            if (!formData.recursos.includes(customResource.trim())) setFormData(prev => ({ ...prev, recursos: [...prev.recursos, customResource.trim()] }));
            setCustomResource("");
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => { alert("Prática enviada!"); navigate('/dashboard/minhas-atividades'); }, 1500);
    };

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                <div style={styles.topBar}>
                    <button onClick={onBack} style={styles.backButton}><ArrowLeft size={20} /> Voltar</button>
                    <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                        <h1 style={styles.pageTitle}>Detalhes da Prática</h1>
                        <p style={styles.pageSubtitle}>Revise os dados da sua catalogação.</p>
                    </div>
                </div>

                <div style={styles.mainCard}>
                    <form onSubmit={handleSubmit}>
                        <div style={{...styles.splitLayout, flexDirection: isMobile ? 'column' : 'row'}}>
                            {/* ESQUERDA */}
                            <div style={{...styles.leftCol, width: isMobile ? '100%' : '35%'}}>
                                <h3 style={styles.sectionTitle}><FileText size={20} color="#1565C0" /> Ficha Técnica</h3>
                                <div style={styles.inputGroup}><label style={styles.label}>Título</label><input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={styles.input} required placeholder="Ex: Dilemas Éticos" /></div>
                                <div style={styles.inputGroup}><label style={styles.label}>Disciplina</label><div style={styles.lockedInputWrapper}><Lock size={16} color="#78909C" style={{marginLeft: '12px'}}/><input type="text" value={formData.disciplina} readOnly style={styles.lockedInput}/></div></div>
                                <div style={styles.inputGroup}><label style={styles.label}>Nível</label><select name="nivel" value={formData.nivel} onChange={handleChange} style={styles.input} required><option value="">Selecione...</option><option value="Fundamental 1">Fundamental 1</option><option value="Fundamental 2">Fundamental 2</option><option value="Ensino Médio">Ensino Médio</option><option value="Ensino Superior">Ensino Superior</option></select></div>
                                <div style={styles.inputGroup}><label style={styles.label}><Layers size={14}/> Conteúdo Gerado</label><select name="categoria" value={formData.categoria} onChange={handleChange} style={styles.input} required><option value="">O que a IA ajudou a criar?</option>
                                        <optgroup label="Planejamento">
                                            <option value="Plano de Aula">Plano de Aula / Roteiro</option>
                                            <option value="Sequência Didática">Sequência Didática</option>
                                            <option value="Rubrica de Avaliação">Rubrica de Avaliação</option>
                                        </optgroup>
                                        <optgroup label="Recursos Didáticos">
                                            <option value="Texto de Apoio">Texto de Apoio / Artigo</option>
                                            <option value="Slide / Apresentação">Slide / Apresentação</option>
                                            <option value="Lista de Exercícios">Lista de Exercícios</option>
                                            <option value="Quiz / Questões">Quiz / Banco de Questões</option>
                                        </optgroup>
                                        <optgroup label="Atividades Práticas">
                                            <option value="Estudo de Caso">Estudo de Caso</option>
                                            <option value="Simulação / Roleplay">Simulação / Roleplay</option>
                                            <option value="Prompt para Alunos">Prompt para Alunos</option>
                                        </optgroup></select></div>
                                <div style={styles.inputGroup}><label style={styles.label}>Modelo de IA</label><input type="text" name="modelo_ia" value={formData.modelo_ia} onChange={handleChange} style={styles.input} required placeholder="Ex: ChatGPT-4" /></div>
                                <div style={styles.uploadSection}><label style={styles.label}><UploadCloud size={16}/> Anexar</label><div style={styles.uploadContainer}><input type="file" id="file-upload" onChange={handleFileChange} style={{display: 'none'}} /><label htmlFor="file-upload" style={styles.uploadLabel}>{formData.arquivo ? (<div style={styles.fileSelected}><CheckCircle2 size={28} color="#4CAF50" /><span style={styles.fileName}>{formData.arquivo.name}</span></div>) : (<><div style={styles.uploadIconCircle}><UploadCloud size={20} color="#1565C0" /></div><span style={styles.uploadTextMain}>Carregar Arquivo</span></>)}</label></div></div>
                            </div>
                            {!isMobile && <div style={styles.verticalDivider}></div>}
                            {/* DIREITA */}
                            <div style={{...styles.rightCol, width: isMobile ? '100%' : '65%'}}>
                                <h3 style={styles.sectionTitle}><BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico</h3>
                                <div style={styles.inputGroup}><label style={styles.label}>BNCC / Objetivos</label><textarea name="bncc" value={formData.bncc} onChange={handleChange} style={styles.textarea} rows="2" required placeholder="Cite os códigos e objetivos..." /></div>
                                <div style={styles.gridThree}><div style={styles.inputGroup}><label style={styles.label}><Wrench size={14}/> Metodologia</label><input type="text" name="metodologia" value={formData.metodologia} onChange={handleChange} style={styles.input} placeholder="Ex: Sala Invertida" /></div><div style={styles.inputGroup}><label style={styles.label}><Clock size={14}/> Duração</label><input type="text" name="duracao" value={formData.duracao} onChange={handleChange} style={styles.input} placeholder="Ex: 50 min" /></div></div>
                                <div style={styles.inputGroup}><label style={styles.label}><Package size={14}/> Recursos (Clique para adicionar)</label><div style={styles.resourcesGrid}>{RECURSOS_COMUNS.map(res => (<button key={res} type="button" onClick={() => toggleRecurso(res)} style={{...styles.resourceChip, ...(formData.recursos.includes(res) ? styles.resourceChipActive : {})}}>{res}</button>))}</div><div style={styles.addResourceRow}><input type="text" placeholder="Outro..." value={customResource} onChange={(e) => setCustomResource(e.target.value)} onKeyDown={addCustomResource} style={styles.inputSmall} /><button type="button" onClick={addCustomResource} style={styles.addButton}><Plus size={16}/></button></div><div style={{marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>{formData.recursos.filter(r => !RECURSOS_COMUNS.includes(r)).map((res, i) => (<span key={i} style={styles.customChip}>{res} <X size={12} style={{cursor: 'pointer'}} onClick={() => toggleRecurso(res)}/></span>))}</div></div>
                                <div style={styles.inputGroup}><label style={styles.label}><Lightbulb size={14}/> Relato da Experiência</label><textarea name="experiencia" value={formData.experiencia} onChange={handleChange} style={{...styles.textarea, minHeight: '100px'}} required placeholder="Descreva como foi a aplicação em sala..." /></div>
                                <div style={styles.inputGroup}><label style={styles.label}><Target size={14}/> Resultados</label><textarea name="resultados" value={formData.resultados} onChange={handleChange} style={styles.textarea} rows="2" required placeholder="Quais foram as evidências de aprendizagem?" /></div>
                                <div style={styles.formFooter}><button type="submit" disabled={isSubmitting} style={styles.submitButton}><Save size={18} /> {isSubmitting ? "Enviando..." : "Enviar Prática para Revisão"}</button></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// =================================================================================
// 3. TELA DE VOZ (VISUAL "VERSÃO 2")
// =================================================================================
const VoiceFormV2 = ({ onBack, navigate }) => {
    // Apenas estados visuais, sem a simulação de "auto-fill"
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const toggleListening = () => {
        setIsListening(!isListening);
        if (!isListening) {
            // Placeholder apenas para feedback visual
            setTranscript("Ouvindo...");
        }
    };

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
                        <h2 style={{...styles.titleCenter, fontSize: '24px', color: '#4A148C'}}>
                            Entrevista com a IA
                        </h2>
                    </div>
                    
                    <p style={{...styles.subtitleCenter, maxWidth: '600px', margin: '0 auto 20px auto'}}>
                        Clique no microfone e descreva sua atividade didática. Fale sobre o tema, como os alunos reagiram e quais materiais usou. A IA vai estruturar tudo para você.
                    </p>

                    <div style={styles.talkingPoints}>
                        <p style={{margin: 0, color: '#7B1FA2', fontWeight: '700'}}>Dicas do que comentar:</p>
                        <ul style={styles.talkingList}>
                            <li>Disciplina e série (ex.: Matemática - Ensino Médio)</li>
                            <li>Objetivo da atividade (o que alunos deveriam aprender)</li>
                            <li>Como a IA foi usada (modelo, prompt, passos)</li>
                            <li>Materiais/recursos utilizados</li>
                            <li>Resultados e reações dos alunos</li>
                        </ul>
                    </div>

                    <div style={styles.micWrapper}>
                        <button 
                            onClick={toggleListening}
                            style={{
                                ...styles.micButton,
                                backgroundColor: isListening ? '#FFEBEE' : '#F3E5F5',
                                borderColor: isListening ? '#EF5350' : '#E1BEE7',
                                transform: isListening ? 'scale(1.1)' : 'scale(1)',
                            }}
                        >
                            <Mic size={48} color={isListening ? "#D32F2F" : "#7B1FA2"} />
                        </button>
                        <p style={styles.micStatus}>
                            {isListening ? (
                                <span style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#D32F2F'}}>
                                    <Volume2 size={18} />
                                    Gravando... (Clique para parar)
                                </span>
                            ) : (
                                "Toque para falar"
                            )}
                        </p>
                    </div>

                    <div style={styles.transcriptionBox}>
                        {transcript ? (
                            <p style={{color: '#333', lineHeight: '1.6', margin: 0}}>{transcript}</p>
                        ) : (
                            <p style={{color: '#999', fontStyle: 'italic'}}>Sua transcrição aparecerá aqui...</p>
                        )}
                    </div>

                    {transcript && (
                        <button style={{...styles.clearButton, marginBottom: '20px'}} onClick={() => setTranscript("")}>
                            <Trash2 size={16} style={{marginRight: '6px'}} /> Limpar
                        </button>
                    )}

                    <div style={styles.footerActions}>
                        <button style={styles.buttonCancel} onClick={onBack}>Cancelar</button>
                        <button style={{...styles.button, backgroundColor: '#7B1FA2'}}>
                            <Sparkles size={18} style={{marginRight: '8px'}} />
                            Processar com IA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS UNIFICADOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '20px' },
    
    // CONTAINERS
    container: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    containerCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', width: '100%', maxWidth: '1000px', margin: '0 auto' },
    
    // CARDS
    mainCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E0E0E0' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0', width: '100%', boxSizing: 'border-box' },

    // SELEÇÃO (CARDS)
    headerCenter: { textAlign: 'center', maxWidth: '600px' },
    titleCenter: { fontSize: '32px', color: '#1565C0', margin: '0 0 10px 0', fontWeight: '800' },
    subtitleCenter: { fontSize: '18px', color: '#546E7A', margin: 0 },
    selectionGrid: { display: 'flex', gap: '30px', justifyContent: 'center', width: '100%' },
    selectionCard: { flex: 1, backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', border: '1px solid #E0E0E0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '280px' },
    selectionCardAi: { flex: 1, backgroundColor: '#F3E5F5', padding: '40px 30px', borderRadius: '20px', border: '1px solid #E1BEE7', boxShadow: '0 4px 15px rgba(123, 31, 162, 0.1)', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '280px', position: 'relative' },
    iconCircleBlue: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
    iconCirclePurple: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '15px' },
    cardDesc: { fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '25px', flex: 1 },
    fakeLink: { fontSize: '14px', fontWeight: '700', color: '#1565C0' },
    badgeAi: { backgroundColor: '#E1BEE7', color: '#4A148C', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', marginBottom: '10px' },

    // SPLIT LAYOUT (FORM)
    splitLayout: { display: 'flex', gap: '40px' },
    verticalDivider: { width: '1px', backgroundColor: '#F0F0F0', alignSelf: 'stretch' },
    leftCol: { display: 'flex', flexDirection: 'column' },
    rightCol: { display: 'flex', flexDirection: 'column' },
    sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#37474F', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    // INPUTS
    inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
    label: { fontSize: '13px', fontWeight: '600', color: '#455A64', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
    input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box', height: '45px' },
    textarea: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' },
    lockedInputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#FAFAFA', border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden', height: '45px' },
    lockedInput: { flex: 1, border: 'none', backgroundColor: 'transparent', padding: '12px 15px', fontSize: '14px', fontWeight: '600', color: '#78909C', outline: 'none', cursor: 'not-allowed' },
    
    // RESOURCES CHIPS
    resourcesGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
    resourceChip: { padding: '8px 12px', borderRadius: '20px', border: '1px solid #CFD8DC', backgroundColor: '#FFFFFF', color: '#546E7A', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
    resourceChipActive: { backgroundColor: '#E3F2FD', color: '#1565C0', borderColor: '#1565C0', fontWeight: '600' },
    addResourceRow: { display: 'flex', gap: '8px', marginTop: '5px' },
    inputSmall: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '13px', outline: 'none' },
    addButton: { backgroundColor: '#F5F5F5', border: '1px solid #CFD8DC', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#546E7A' },
    customChip: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '20px', backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontSize: '12px', fontWeight: '600' },

    // UPLOAD
    uploadSection: { marginTop: 'auto', paddingTop: '10px' },
    uploadContainer: { border: '2px dashed #BBDEFB', borderRadius: '12px', backgroundColor: '#F8FBFF', textAlign: 'center', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
    uploadIconCircle: { backgroundColor: 'white', padding: '10px', borderRadius: '50%', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    uploadTextMain: { fontSize: '13px', fontWeight: '700', color: '#1565C0' },
    fileSelected: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    fileName: { fontSize: '13px', fontWeight: '600', color: '#333', marginTop: '5px' },

    // NAV & FOOTER
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap-reverse', gap: '20px' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '600', fontSize: '15px' },
    backButtonSimple: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '600', fontSize: '15px', marginBottom: '20px', alignSelf: 'flex-start' },
    pageTitle: { fontSize: '24px', color: '#1565C0', fontWeight: '800', margin: '0 0 4px 0' },
    pageSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },
    formFooter: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end' },
    submitButton: { backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)', transition: 'transform 0.2s' },

    // VOICE SCREEN STYLES
    voiceContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    voiceHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
    micWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '30px' },
    micButton: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    micStatus: { fontWeight: '600', color: '#555' },
    transcriptionBox: { width: '100%', maxWidth: '600px', height: '150px', backgroundColor: '#F9FAFB', border: '1px dashed #CCC', borderRadius: '12px', padding: '20px', overflowY: 'auto', marginBottom: '30px' },
    talkingPoints: { width: '100%', maxWidth: '700px', backgroundColor: '#F8EAF6', border: '1px solid #E1BEE7', borderRadius: '12px', padding: '16px', margin: '10px auto 24px' },
    talkingList: { margin: '8px 0 0', paddingLeft: '18px', color: '#4A148C', lineHeight: 1.6, fontSize: '14px' },
    footerActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', borderTop: '1px solid #EEE', paddingTop: '20px', width: '100%' },
    buttonCancel: { padding: '12px 24px', backgroundColor: 'transparent', color: '#546E7A', border: '1px solid #CFD8DC', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' },
    button: { padding: '12px 24px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '15px' },
    clearButton: { padding: '10px 20px', backgroundColor: 'transparent', color: '#D32F2F', border: '1px solid #FFCDD2', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }
};

export default NewProduction;