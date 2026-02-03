import React, { useState, useEffect } from 'react';
import api from './services/api'; 
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
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
    Loader2
} from 'lucide-react';

const EditarProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customResource, setCustomResource] = useState("");

    // Lista de sugestões (Mesma do Catalogar)
    const RECURSOS_COMUNS = ["Projetor / Datashow", "Internet / Wi-Fi", "Celulares (BYOD)", "Laboratório de Informática", "Tablets", "Quadro Branco", "IA Generativa", "Jogos", "Livro Didático"];

    const [formData, setFormData] = useState({
        titulo: '', 
        disciplina: '', 
        nivel: '', 
        modelo_ia: '',
        categoria: '', 
        bncc: '', 
        metodologia: '', 
        duracao: '',
        recursos: [], // Array para gerenciar os chips
        experiencia: '', 
        resultados: '',
        arquivo: null // Arquivo novo (opcional)
    });
    
    // Arquivo antigo para mostrar na tela (apenas leitura visual)
    const [existingFile, setExistingFile] = useState(null);

    // --- 1. CARREGAR DADOS ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                const d = response.data;
                
                // Converte a string de recursos do banco ("Item1, Item2") volta para Array
                let recursosArray = [];
                if (d.recursos) {
                    // Remove espaços extras e separa por vírgula
                    recursosArray = d.recursos.split(',').map(r => r.trim()).filter(r => r !== "");
                }

                setFormData({
                    titulo: d.titulo || '', 
                    disciplina: d.disciplina || '', 
                    nivel: d.nivel || '', 
                    modelo_ia: d.modelo_ia || '', 
                    categoria: d.categoria || '', 
                    bncc: d.bncc || '',
                    metodologia: d.metodologia || '', 
                    duracao: d.duracao || '',
                    recursos: recursosArray, 
                    experiencia: d.experiencia || '', 
                    resultados: d.resultados || '',
                    arquivo: null
                });
                
                // Guarda a URL/Nome do arquivo existente se houver
                if (d.arquivo) {
                    setExistingFile(d.arquivo); 
                }

            } catch (error) {
                console.error("Erro ao carregar:", error);
                alert("Erro ao carregar dados da produção.");
                navigate('/dashboard/minhas-producoes');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // --- 2. MANIPULADORES (Iguais ao Catalogar) ---
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
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        const dataToSend = new FormData();
        
        // Campos de texto
        dataToSend.append('titulo', formData.titulo);
        dataToSend.append('disciplina', formData.disciplina);
        dataToSend.append('nivel_ensino', formData.nivel);
        dataToSend.append('modelo_ia', formData.modelo_ia);
        dataToSend.append('categoria', formData.categoria);
        dataToSend.append('bncc', formData.bncc);
        dataToSend.append('metodologia', formData.metodologia);
        dataToSend.append('duracao', formData.duracao);
        dataToSend.append('experiencia', formData.experiencia);
        dataToSend.append('resultados', formData.resultados);

        // Recursos (envia item por item para o Django tratar com getlist ou string)
        formData.recursos.forEach(r => dataToSend.append('recursos', r));

        // Arquivo (só envia se tiver um NOVO)
        if (formData.arquivo) {
            dataToSend.append('arquivo', formData.arquivo);
        }

        try {
            await api.put(`api/production/${id}/update/`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert("Produção corrigida e reenviada para a fila de revisão!");
            navigate('/dashboard/minhas-producoes');
            
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar produção. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando dados...</div>;

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* TOPO DA PÁGINA */}
                <div style={styles.topBar}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <ArrowLeft size={20} /> Cancelar
                    </button>
                    <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                        <h1 style={styles.pageTitle}>Editar Prática</h1>
                        <p style={styles.pageSubtitle}>Faça as correções solicitadas e reenvie.</p>
                    </div>
                </div>

                <div style={styles.mainCard}>
                    <form onSubmit={handleUpdate}>
                        
                        {/* LAYOUT DIVIDIDO (IGUAL CATALOGAR) */}
                        <div style={{...styles.splitLayout, flexDirection: isMobile ? 'column' : 'row'}}>
                            
                            {/* --- COLUNA ESQUERDA: FICHA TÉCNICA --- */}
                            <div style={{...styles.leftCol, width: isMobile ? '100%' : '35%'}}>
                                <h3 style={styles.sectionTitle}><FileText size={20} color="#1565C0" /> Ficha Técnica</h3>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Título</label>
                                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={styles.input} required />
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Disciplina</label>
                                    <div style={styles.lockedInputWrapper}>
                                        <Lock size={16} color="#78909C" style={{marginLeft: '12px'}}/>
                                        <input type="text" value={formData.disciplina} readOnly style={styles.lockedInput} title="Não editável"/>
                                    </div>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nível</label>
                                    <select name="nivel" value={formData.nivel} onChange={handleChange} style={styles.input} required>
                                        <option value="">Selecione...</option>
                                        <option value="Fundamental 1">Fundamental 1</option>
                                        <option value="Fundamental 2">Fundamental 2</option>
                                        <option value="Ensino Médio">Ensino Médio</option>
                                        <option value="Ensino Superior">Ensino Superior</option>
                                    </select>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Layers size={14}/> Categoria / Conteúdo</label>
                                    <select name="categoria" value={formData.categoria} onChange={handleChange} style={styles.input} required>
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
                                        </optgroup>
                                        <optgroup label="Atividades Práticas">
                                            <option value="Estudo de Caso">Estudo de Caso</option>
                                            <option value="Simulação / Roleplay">Simulação / Roleplay</option>
                                            <option value="Prompt para Alunos">Prompt para Alunos</option>
                                        </optgroup>
                                    </select>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Modelo de IA Utilizado</label>
                                    <input type="text" name="modelo_ia" value={formData.modelo_ia} onChange={handleChange} style={styles.input} required />
                                </div>
                                
                                {/* UPLOAD DE ARQUIVO */}
                                <div style={styles.uploadSection}>
                                    <label style={styles.label}><UploadCloud size={16}/> Anexar Arquivo</label>
                                    <div style={styles.uploadContainer}>
                                        <input type="file" id="file-upload" onChange={handleFileChange} style={{display: 'none'}} />
                                        <label htmlFor="file-upload" style={styles.uploadLabel}>
                                            {/* Se selecionou um novo */}
                                            {formData.arquivo ? (
                                                <div style={styles.fileSelected}>
                                                    <CheckCircle2 size={28} color="#4CAF50" />
                                                    <span style={styles.fileName}>Novo: {formData.arquivo.name}</span>
                                                </div>
                                            ) : (
                                                // Se não tem novo, mas tem o antigo
                                                existingFile ? (
                                                    <div style={styles.fileSelected}>
                                                        <FileText size={28} color="#1565C0" />
                                                        <span style={styles.fileName}>Manter atual (ou clique para trocar)</span>
                                                    </div>
                                                ) : (
                                                    // Se não tem nada
                                                    <>
                                                        <div style={styles.uploadIconCircle}>
                                                            <UploadCloud size={20} color="#1565C0" />
                                                        </div>
                                                        <span style={styles.uploadTextMain}>Substituir Arquivo</span>
                                                    </>
                                                )
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {!isMobile && <div style={styles.verticalDivider}></div>}
                            
                            {/* --- COLUNA DIREITA: DETALHAMENTO --- */}
                            <div style={{...styles.rightCol, width: isMobile ? '100%' : '65%'}}>
                                <h3 style={styles.sectionTitle}><BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico</h3>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>BNCC / Objetivos</label>
                                    <textarea name="bncc" value={formData.bncc} onChange={handleChange} style={styles.textarea} rows="2" required />
                                </div>
                                
                                <div style={styles.gridThree}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Wrench size={14}/> Metodologia</label>
                                        <input type="text" name="metodologia" value={formData.metodologia} onChange={handleChange} style={styles.input} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Clock size={14}/> Duração</label>
                                        <input type="text" name="duracao" value={formData.duracao} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>
                                
                                {/* RECURSOS (CHIPS) */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Package size={14}/> Recursos Utilizados</label>
                                    
                                    {/* Chips Sugeridos */}
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

                                    {/* Adicionar Outro */}
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

                                    {/* Chips Personalizados (Visualizar Selecionados que não são comuns) */}
                                    <div style={{marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                                        {formData.recursos.filter(r => !RECURSOS_COMUNS.includes(r)).map((res, i) => (
                                            <span key={i} style={styles.customChip}>
                                                {res} <X size={12} style={{cursor: 'pointer'}} onClick={() => toggleRecurso(res)}/>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Lightbulb size={14}/> Relato da Experiência</label>
                                    <textarea name="experiencia" value={formData.experiencia} onChange={handleChange} style={{...styles.textarea, minHeight: '100px'}} required />
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Target size={14}/> Resultados / Evidências</label>
                                    <textarea name="resultados" value={formData.resultados} onChange={handleChange} style={styles.textarea} rows="2" required />
                                </div>
                                
                                <div style={styles.formFooter}>
                                    <button type="submit" disabled={submitting} style={styles.submitButton}>
                                        {submitting ? <Loader2 className="spin" size={20}/> : <Save size={18} />} 
                                        {submitting ? " Salvando..." : " Salvar e Reenviar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS IDÊNTICOS AO CATALOGAR PRODUÇÃO ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '20px' },
    container: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    
    // CARDS
    mainCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E0E0E0' },

    // SPLIT LAYOUT
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
    pageTitle: { fontSize: '24px', color: '#1565C0', fontWeight: '800', margin: '0 0 4px 0' },
    pageSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },
    formFooter: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end' },
    submitButton: { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)', transition: 'transform 0.2s' },
};

export default EditarProducao;