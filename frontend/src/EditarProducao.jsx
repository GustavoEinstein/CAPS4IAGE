import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';
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
    Loader2,
    Send,
    Link as LinkIcon
} from 'lucide-react';

const EditarProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customResource, setCustomResource] = useState("");

    const RECURSOS_COMUNS = ["Projetor / Datashow", "Internet / Wi-Fi", "Celulares (BYOD)", "Laboratório de Informática", "Tablets", "Quadro Branco", "IA Generativa", "Jogos", "Livro Didático"];

    const [formData, setFormData] = useState({
        titulo: '', 
        disciplina: '', 
        nivel: '', 
        modelo_ia: '',
        prompts_ia: '', 
        categoria: '', 
        bncc: '', 
        metodologia: '', 
        duracao: '',
        recursos: [], 
        experiencia: '', 
        resultados: '',
        arquivo: null,
        link_material: '' // <-- NOVO CAMPO
    });
    
    const [existingFile, setExistingFile] = useState(null);
    const [isDraftStatus, setIsDraftStatus] = useState(false); 

    // --- 1. CARREGAR DADOS ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                const d = response.data;
                
                let recursosArray = [];
                if (d.recursos && typeof d.recursos === 'string') {
                    recursosArray = d.recursos.split(',').map(r => r.trim()).filter(r => r !== "");
                } else if (Array.isArray(d.recursos)) {
                    recursosArray = d.recursos;
                }

                setIsDraftStatus(d.status === 'Rascunho' || d.status === 'Correção solicitada');

                setFormData({
                    titulo: d.titulo || '', 
                    disciplina: d.disciplina || '', 
                    nivel: d.nivel || '', 
                    modelo_ia: d.modelo_ia || '', 
                    prompts_ia: d.prompts_ia || '', 
                    categoria: d.categoria || '', 
                    bncc: d.bncc || '',
                    metodologia: d.metodologia || '', 
                    duracao: d.duracao || '',
                    recursos: recursosArray, 
                    experiencia: d.experiencia || '', 
                    resultados: d.resultados || '',
                    arquivo: null,
                    link_material: d.link_material || '' // Carrega o link se existir
                });
                
                if (d.arquivo) {
                    setExistingFile(d.arquivo); 
                }

            } catch (error) {
                console.error("Erro ao carregar:", error);
                Swal.fire("Erro", "Erro ao carregar dados da produção.", "error");
                navigate('/dashboard/minhas-producoes');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // --- 2. MANIPULADORES ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, arquivo: e.target.files[0] }));
    };

    const toggleRecurso = (recurso) => {
        setFormData(prev => {
            const exists = prev.recursos.includes(recurso);
            if (exists) {
                return { ...prev, recursos: prev.recursos.filter(r => r !== recurso) };
            } else {
                return { ...prev, recursos: [...prev.recursos, recurso] };
            }
        });
    };

    const addCustomResource = (e) => {
        if ((e.key === 'Enter' || e.type === 'click') && customResource.trim()) {
            e.preventDefault();
            if (!formData.recursos.includes(customResource.trim())) {
                setFormData(prev => ({ ...prev, recursos: [...prev.recursos, customResource.trim()] }));
            }
            setCustomResource("");
        }
    };

    // --- 3. SALVAR EDIÇÃO ---
    const handleUpdate = async (isDraft) => {
        if (!isDraft) {
            if (!formData.titulo || !formData.nivel || !formData.categoria || !formData.experiencia) {
                Swal.fire('Campos Incompletos', 'Preencha os campos obrigatórios para enviar para revisão.', 'warning');
                return;
            }
        }

        setSubmitting(true);
        const dataToSend = new FormData();
        
        dataToSend.append('is_draft', isDraft);
        dataToSend.append('titulo', formData.titulo);
        dataToSend.append('disciplina', formData.disciplina);
        dataToSend.append('nivel_ensino', formData.nivel);
        dataToSend.append('modelo_ia', formData.modelo_ia);
        dataToSend.append('prompts_ia', formData.prompts_ia);
        dataToSend.append('categoria', formData.categoria);
        dataToSend.append('bncc', formData.bncc);
        dataToSend.append('metodologia', formData.metodologia);
        dataToSend.append('duracao', formData.duracao);
        dataToSend.append('experiencia', formData.experiencia);
        dataToSend.append('resultados', formData.resultados);
        dataToSend.append('link_material', formData.link_material); // <-- Envia o link

        formData.recursos.forEach(r => dataToSend.append('recursos', r));

        if (formData.arquivo) {
            dataToSend.append('arquivo', formData.arquivo);
        }

        try {
            await api.put(`api/production/${id}/update/`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({
                icon: 'success',
                title: isDraft ? 'Alterações Salvas!' : 'Prática Reenviada!',
                confirmButtonColor: '#1565C0'
            });
            navigate('/dashboard/minhas-producoes');
            
        } catch (error) {
            console.error(error);
            Swal.fire("Erro", "Erro ao atualizar produção.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh'}}>
            <Loader2 size={32} color="#1565C0" className="spin" />
            <p style={{ marginTop: '10px', color: '#64748B' }}>Carregando dados...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <div style={styles.topBar}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                        <h1 style={styles.pageTitle}>{isDraftStatus ? "Continuar Editando" : "Editar Prática"}</h1>
                        <p style={styles.pageSubtitle}>
                            {isDraftStatus ? "Termine de preencher seu rascunho." : "Faça as correções solicitadas e reenvie."}
                        </p>
                    </div>
                </div>

                <div style={styles.mainCard}>
                    <div>
                        <div style={{...styles.splitLayout, flexDirection: isMobile ? 'column' : 'row'}}>
                            
                            {/* --- COLUNA ESQUERDA --- */}
                            <div style={{...styles.leftCol, width: isMobile ? '100%' : '35%'}}>
                                <h3 style={styles.sectionTitle}><FileText size={20} color="#1565C0" /> Ficha Técnica</h3>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Título <span style={styles.asterisk}>*</span></label>
                                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={styles.input} placeholder="Ex: Dilemas Éticos com IA" />
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Disciplina</label>
                                    <div style={styles.lockedInputWrapper}>
                                        <Lock size={16} color="#78909C" style={{marginLeft: '12px'}}/>
                                        <input type="text" value={formData.disciplina} readOnly style={styles.lockedInput} title="Não editável"/>
                                    </div>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nível <span style={styles.asterisk}>*</span></label>
                                    <select name="nivel" value={formData.nivel} onChange={handleChange} style={styles.input}>
                                        <option value="">Selecione...</option>
                                        <option value="Fundamental 1">Fundamental 1</option>
                                        <option value="Fundamental 2">Fundamental 2</option>
                                        <option value="Ensino Médio">Ensino Médio</option>
                                        <option value="Ensino Superior">Ensino Superior</option>
                                    </select>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Layers size={14}/> Categoria <span style={styles.asterisk}>*</span></label>
                                    <select name="categoria" value={formData.categoria} onChange={handleChange} style={styles.input}>
                                        <option value="">O que foi criado?</option>
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
                                            <option value="Imagens / Vídeos">Imagens / Vídeos</option>
                                        </optgroup>
                                        <optgroup label="Atividades Práticas">
                                            <option value="Estudo de Caso">Estudo de Caso</option>
                                            <option value="Simulação / Roleplay">Simulação / Roleplay</option>
                                            <option value="Prompt para Alunos">Prompt para Alunos</option>
                                        </optgroup>
                                    </select>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Modelo de IA</label>
                                    <input type="text" name="modelo_ia" value={formData.modelo_ia} onChange={handleChange} style={styles.input} placeholder="Ex: ChatGPT-4, Gemini, Claude..." />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Prompts Utilizados</label>
                                    <textarea
                                        name="prompts_ia"
                                        value={formData.prompts_ia}
                                        onChange={handleChange}
                                        style={{ ...styles.textarea, minHeight: "80px" }}
                                        placeholder="Ex: 'Atue como um professor do ensino médio e crie uma lista de exercícios sobre...'"
                                    />
                                </div>
                                
                                <div style={styles.uploadSection}>
                                    <label style={styles.label}><UploadCloud size={16}/> Arquivo Anexado</label>
                                    <div style={styles.uploadContainer}>
                                        <input type="file" id="file-upload" onChange={handleFileChange} style={{display: 'none'}} />
                                        <label htmlFor="file-upload" style={styles.uploadLabel}>
                                            {formData.arquivo ? (
                                                <div style={styles.fileSelected}>
                                                    <CheckCircle2 size={28} color="#4CAF50" />
                                                    <span style={styles.fileName}>Novo: {formData.arquivo.name}</span>
                                                </div>
                                            ) : (
                                                existingFile ? (
                                                    <div style={styles.fileSelected}>
                                                        <FileText size={28} color="#1565C0" />
                                                        <span style={styles.fileName}>Manter atual (clique para trocar)</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={styles.uploadIconCircle}><UploadCloud size={20} color="#1565C0" /></div>
                                                        <span style={styles.uploadTextMain}>Substituir Arquivo</span>
                                                    </>
                                                )
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* NOVO CAMPO: LINK EXTERNO */}
                                <div style={{ ...styles.inputGroup, marginTop: "15px" }}>
                                    <label style={styles.label}><LinkIcon size={14} /> Link Externo (Opcional)</label>
                                    <input 
                                        type="url" 
                                        name="link_material" 
                                        value={formData.link_material} 
                                        onChange={handleChange} 
                                        style={styles.input} 
                                        placeholder="Ex: https://youtu.be/..." 
                                    />
                                    <span style={{ fontSize: "11px", color: "#78909C", marginTop: "4px" }}>
                                        Cole o link do YouTube ou Drive caso o material seja pesado.
                                    </span>
                                </div>
                            </div>
                            
                            {!isMobile && <div style={styles.verticalDivider}></div>}
                            
                            {/* --- COLUNA DIREITA --- */}
                            <div style={{...styles.rightCol, width: isMobile ? '100%' : '65%'}}>
                                <h3 style={styles.sectionTitle}><BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico</h3>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>BNCC / Objetivos</label>
                                    <textarea name="bncc" value={formData.bncc} onChange={handleChange} style={styles.textarea} rows="2" placeholder="Cite os códigos e objetivos da BNCC relacionados..." />
                                </div>
                                
                                <div style={styles.gridThree}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Wrench size={14}/> Metodologia</label>
                                        <input type="text" name="metodologia" value={formData.metodologia} onChange={handleChange} style={styles.input} placeholder="Ex: Sala Invertida, PBL..." />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Clock size={14}/> Duração</label>
                                        <input type="text" name="duracao" value={formData.duracao} onChange={handleChange} style={styles.input} placeholder="Ex: 50 min, 2 aulas..." />
                                    </div>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Package size={14}/> Recursos Didáticos</label>
                                    <div style={styles.resourcesGrid}>
                                        {RECURSOS_COMUNS.map(res => (
                                            <button 
                                                key={res} 
                                                type="button" 
                                                onClick={() => toggleRecurso(res)} 
                                                style={{
                                                    ...styles.resourceChip, 
                                                    ...(formData.recursos.includes(res) ? styles.resourceChipActive : {})
                                                }}
                                            >
                                                {res}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={styles.addResourceRow}>
                                        <input 
                                            type="text" 
                                            placeholder="Outro recurso..." 
                                            value={customResource} 
                                            onChange={(e) => setCustomResource(e.target.value)} 
                                            onKeyDown={addCustomResource} 
                                            style={styles.inputSmall} 
                                        />
                                        <button type="button" onClick={addCustomResource} style={styles.addButton}><Plus size={16}/></button>
                                    </div>

                                    <div style={{marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                                        {formData.recursos.filter(r => !RECURSOS_COMUNS.includes(r)).map((res, i) => (
                                            <span key={i} style={styles.customChip}>
                                                {res} <X size={12} style={{cursor: 'pointer'}} onClick={() => toggleRecurso(res)}/>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Lightbulb size={14}/> Relato da Experiência <span style={styles.asterisk}>*</span></label>
                                    <textarea name="experiencia" value={formData.experiencia} onChange={handleChange} style={{...styles.textarea, minHeight: '100px'}} placeholder="Descreva como foi a aplicação em sala de aula..." />
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Target size={14}/> Resultados / Evidências</label>
                                    <textarea name="resultados" value={formData.resultados} onChange={handleChange} style={styles.textarea} rows="2" placeholder="O que os alunos produziram ou demonstraram?" />
                                </div>
                                
                                <div style={styles.formFooter}>
                                    {isDraftStatus && (
                                        <button type="button" disabled={submitting} onClick={() => handleUpdate(true)} style={styles.draftButton}>
                                            <Save size={18} /> Salvar Alterações
                                        </button>
                                    )}
                                    
                                    <button type="button" disabled={submitting} onClick={() => handleUpdate(false)} style={styles.submitButton}>
                                        {submitting ? <Loader2 className="spin" size={18}/> : <Send size={18} />} 
                                        {submitting ? " Enviando..." : isDraftStatus ? " Enviar para Revisão" : " Salvar e Reenviar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '20px' },
    container: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    mainCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E0E0E0' },
    splitLayout: { display: 'flex', gap: '40px' },
    verticalDivider: { width: '1px', backgroundColor: '#F0F0F0', alignSelf: 'stretch' },
    leftCol: { display: 'flex', flexDirection: 'column' },
    rightCol: { display: 'flex', flexDirection: 'column' },
    sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#37474F', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
    label: { fontSize: "13px", fontWeight: "600", color: "#455A64", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" },
    asterisk: { color: "#D32F2F", marginLeft: "2px" },
    input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box', height: '45px' },
    textarea: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' },
    lockedInputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#FAFAFA', border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden', height: '45px' },
    lockedInput: { flex: 1, border: 'none', backgroundColor: "transparent", padding: "12px 15px", fontSize: "14px", fontWeight: "600", color: "#78909C", outline: "none", cursor: "not-allowed" },
    resourcesGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
    resourceChip: { padding: '8px 12px', borderRadius: '20px', border: '1px solid #CFD8DC', backgroundColor: '#FFFFFF', color: '#546E7A', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
    resourceChipActive: { backgroundColor: '#E3F2FD', color: '#1565C0', borderColor: '#1565C0', fontWeight: '600' },
    addResourceRow: { display: 'flex', gap: '8px', marginTop: '5px' },
    inputSmall: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '13px', outline: 'none' },
    addButton: { backgroundColor: '#F5F5F5', border: '1px solid #CFD8DC', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#546E7A' },
    customChip: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '20px', backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontSize: '12px', fontWeight: '600' },
    uploadSection: { marginTop: 'auto', paddingTop: '10px' },
    uploadContainer: { border: '2px dashed #BBDEFB', borderRadius: '12px', backgroundColor: '#F8FBFF', textAlign: 'center', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px' },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
    uploadIconCircle: { backgroundColor: 'white', padding: '10px', borderRadius: '50%', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    uploadTextMain: { fontSize: '13px', fontWeight: '700', color: '#1565C0' },
    fileSelected: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    fileName: { fontSize: '13px', fontWeight: '600', color: '#333', marginTop: '5px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap-reverse', gap: '20px' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '600', fontSize: '15px' },
    pageTitle: { fontSize: '24px', color: '#1565C0', fontWeight: '800', margin: '0 0 4px 0' },
    pageSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },
    formFooter: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px', flexWrap: 'wrap' },
    draftButton: { backgroundColor: "white", color: "#1565C0", border: "1px solid #1565C0", borderRadius: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" },
    submitButton: { backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)', transition: 'transform 0.2s' },
};

export default EditarProducao;