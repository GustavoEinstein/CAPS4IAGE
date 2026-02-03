import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { 
    Star, CheckCircle2, Bot, Download, ArrowLeft, Clock, Wrench, 
    BookOpen, Target, Lightbulb, ThumbsUp, ThumbsDown, ShieldAlert, FileText, User
} from 'lucide-react';

const Revisao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    // --- ESTADOS ---
    const [producaoEmRevisao, setProducaoEmRevisao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ESTADO DA RÚBRICA E FEEDBACK ---
    const [avaliacao, setAvaliacao] = useState({
        notaCoerencia: 0, notaQualidade: 0, notaMetodologia: 0,
        notaAvaliacao: 0, notaInclusao: 0, notaInovacao: 0,
        pontosFortes: '', pontosMelhoria: ''
    });

    // --- CARREGAR DADOS ---
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                setProducaoEmRevisao(response.data);
            } catch (error) {
                console.error("Erro ao carregar:", error);
                alert("Erro ao carregar. Você pode não ter permissão.");
                navigate('/dashboard/revisao');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const handleScoreChange = (campo, valor) => {
        setAvaliacao(prev => ({ ...prev, [campo]: valor }));
    };

    // --- ENVIAR REVISÃO (ATUALIZADO) ---
    const handleSubmit = async (veredito) => {
        const notas = [
            avaliacao.notaCoerencia, avaliacao.notaQualidade, avaliacao.notaMetodologia,
            avaliacao.notaAvaliacao, avaliacao.notaInclusao, avaliacao.notaInovacao
        ];
        
        // Validação: Todas as notas são obrigatórias
        if (!notas.every(nota => nota > 0)) {
            alert("Por favor, atribua notas para todos os 6 critérios.");
            return;
        }

        // Validação: Se rejeitar, precisa explicar
        if (veredito === false && !avaliacao.pontosMelhoria.trim()) {
            alert("Para rejeitar, é OBRIGATÓRIO preencher as sugestões de melhoria.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Envia notas e feedback para o backend
            await api.post(`api/production/${id}/review/`, { 
                aprovado: veredito, 
                pontos_fortes: avaliacao.pontosFortes,
                pontos_melhoria: avaliacao.pontosMelhoria,
                
                // --- NOVOS CAMPOS ENVIADOS ---
                nota_coerencia: avaliacao.notaCoerencia,
                nota_qualidade: avaliacao.notaQualidade,
                nota_metodologia: avaliacao.notaMetodologia,
                nota_avaliacao: avaliacao.notaAvaliacao,
                nota_inclusao: avaliacao.notaInclusao,
                nota_inovacao: avaliacao.notaInovacao
            });

            alert(veredito ? "Aprovado com sucesso!" : "Devolvido para correção.");
            navigate('/dashboard/revisao');

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar revisão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando dossiê...</div>;
    if (!producaoEmRevisao) return null;

    // --- COMPONENTE DE CRITÉRIO (COMPACTO) ---
    const CriteriaRow = ({ letter, label, questions, fieldName, value }) => (
        <div style={styles.criteriaCard}>
            <div style={styles.criteriaHeader}>
                <div style={styles.criteriaTitleGroup}>
                    <div style={styles.letterBadge}>{letter}</div>
                    <span style={styles.criteriaLabel}>{label}</span>
                </div>
                <span style={{fontWeight: '800', color: value > 0 ? '#1565C0' : '#E0E0E0', fontSize: '13px'}}>
                    {value}/5
                </span>
            </div>
            
            <ul style={styles.criteriaList}>
                {questions.map((q, idx) => <li key={idx}>{q}</li>)}
            </ul>

            <div style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star} 
                        onClick={() => handleScoreChange(fieldName, star)} 
                        type="button" 
                        style={styles.starButton}
                        title={`Nota ${star}`}
                    >
                        <Star 
                            size={20} 
                            strokeWidth={1.5} 
                            color={star <= value ? "#FFC107" : "#CFD8DC"} 
                            fill={star <= value ? "#FFC107" : "none"} 
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate('/dashboard/revisao')} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar para Fila
                </button>

                <div style={{...styles.gridContainer, flexDirection: isMobile ? 'column' : 'row'}}>
                    
                    {/* --- ESQUERDA: MATERIAL --- */}
                    <div style={{...styles.columnContent, width: isMobile ? '100%' : '55%'}}>
                        <div style={styles.materialCard}>
                            
                            <div style={styles.materialHeader}>
                                <div style={{display:'flex', gap: '8px', marginBottom: '10px'}}>
                                    <span style={styles.badge}>{producaoEmRevisao.disciplina}</span>
                                    <span style={styles.levelBadge}>{producaoEmRevisao.nivel}</span>
                                </div>
                                
                                <h1 style={styles.materialTitle}>{producaoEmRevisao.titulo}</h1>
                                
                                <div style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                                    <div style={styles.iaTag}>
                                        <Bot size={14} /> Gerado com <strong>{producaoEmRevisao.modelo_ia}</strong>
                                    </div>
                                    
                                    <div style={{fontSize: '12px', color: '#90A4AE', display: 'flex', gap: '5px', alignItems: 'center'}}>
                                        <User size={14} /> Autor: Prof. de {producaoEmRevisao.disciplina}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.techSheetContainer}>
                                <div style={styles.techItem}>
                                    <Wrench size={16} color="#1565C0" style={{marginTop:'2px'}}/>
                                    <div>
                                        <span style={styles.techLabel}>Metodologia</span>
                                        <span style={styles.techValue}>{producaoEmRevisao.metodologia || "N/A"}</span>
                                    </div>
                                </div>
                                <div style={styles.techItem}>
                                    <Clock size={16} color="#1565C0" style={{marginTop:'2px'}}/>
                                    <div>
                                        <span style={styles.techLabel}>Duração</span>
                                        <span style={styles.techValue}>{producaoEmRevisao.duracao || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.bnccBox}>
                                <h4 style={styles.bnccTitle}><BookOpen size={16}/> Intencionalidade Pedagógica (BNCC)</h4>
                                <p style={styles.bnccText}>{producaoEmRevisao.bncc || "Sem alinhamento."}</p>
                            </div>

                            <div style={styles.sectionBox}>
                                <h3 style={styles.sectionTitle}><Lightbulb size={20} color="#F57C00" /> Relato da Aplicação</h3>
                                <div style={styles.textBodyBox}>{producaoEmRevisao.experiencia || "Sem relato."}</div>
                            </div>

                            <div style={styles.sectionBox}>
                                <h3 style={styles.sectionTitle}><Target size={20} color="#2E7D32" /> Resultados e Evidências</h3>
                                <div style={styles.resultsBox}>{producaoEmRevisao.resultados || "Sem resultados."}</div>
                            </div>

                            {producaoEmRevisao.arquivo && (
                                <div style={styles.downloadCard}>
                                    <div style={styles.fileIconBig}><FileText size={24} color="#1565C0" /></div>
                                    <div style={{flex: 1}}>
                                        <span style={styles.fileName}>{producaoEmRevisao.arquivo.split('/').pop()}</span>
                                        <span style={styles.fileLabel}>Material Completo (PDF)</span>
                                    </div>
                                    <a 
                                        href={producaoEmRevisao.arquivo} 
                                        download target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}
                                    >
                                        <button style={styles.downloadBtn}><Download size={18} /></button>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- DIREITA: RÚBRICA --- */}
                    <div style={{...styles.columnSidebar, width: isMobile ? '100%' : '45%'}}>
                        <div style={styles.formCard}>
                            <div style={styles.formHeader}>
                                <h2 style={styles.formTitle}>Rúbrica de Avaliação</h2>
                                <p style={styles.formSubtitle}>Analise os 6 eixos pedagógicos.</p>
                            </div>

                            <div style={styles.scrollableRubric}>
                                <CriteriaRow letter="A" label="Coerência Pedagógica" questions={["Objetivos claros?", "Alinhamento com a BNCC?"]} fieldName="notaCoerencia" value={avaliacao.notaCoerencia} />
                                <CriteriaRow letter="B" label="Qualidade Didática" questions={["Linguagem adequada?", "Instruções claras?"]} fieldName="notaQualidade" value={avaliacao.notaQualidade} />
                                <CriteriaRow letter="C" label="Metodologia Ativa" questions={["Estratégias engajam?", "Estimula pensamento?"]} fieldName="notaMetodologia" value={avaliacao.notaMetodologia} />
                                <CriteriaRow letter="D" label="Avaliação" questions={["Critérios justos?", "Instrumentos claros?"]} fieldName="notaAvaliacao" value={avaliacao.notaAvaliacao} />
                                <CriteriaRow letter="E" label="Inclusão" questions={["Acessível a todos?", "Material adaptável?"]} fieldName="notaInclusao" value={avaliacao.notaInclusao} />
                                <CriteriaRow letter="F" label="Inovação/IA" questions={["Uso criativo da IA?", "Relevância tecnológica?"]} fieldName="notaInovacao" value={avaliacao.notaInovacao} />
                            
                                <div style={styles.feedbackSection}>
                                    <h3 style={styles.sectionHeaderSmall}>Parecer Descritivo</h3>
                                    
                                    <div style={styles.inputContainerSuccess}>
                                        <div style={styles.inputHeaderSuccess}><ThumbsUp size={14}/> Pontos Fortes</div>
                                        <textarea 
                                            style={styles.textareaSuccess} rows="2"
                                            placeholder="O que se destacou?"
                                            value={avaliacao.pontosFortes}
                                            onChange={(e) => setAvaliacao({...avaliacao, pontosFortes: e.target.value})}
                                        />
                                    </div>

                                    <div style={styles.inputContainerDanger}>
                                        <div style={styles.inputHeaderDanger}><ThumbsDown size={14}/> Sugestões de Melhoria</div>
                                        <textarea 
                                            style={styles.textareaDanger} rows="2"
                                            placeholder="O que precisa ser ajustado?"
                                            value={avaliacao.pontosMelhoria}
                                            onChange={(e) => setAvaliacao({...avaliacao, pontosMelhoria: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.verdictSection}>
                                <button onClick={() => handleSubmit(false)} disabled={isSubmitting} style={styles.btnReject}>
                                    <ShieldAlert size={18} /> REJEITAR
                                </button>
                                <button onClick={() => handleSubmit(true)} disabled={isSubmitting} style={styles.btnApprove}>
                                    <CheckCircle2 size={18} /> APROVAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F0F2F5', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' },
    container: { maxWidth: '1300px', margin: '0 auto' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '700', marginBottom: '15px', fontSize: '14px' },
    
    gridContainer: { display: 'flex', gap: '15px', alignItems: 'flex-start' },
    columnContent: { minWidth: 0 },
    columnSidebar: { position: 'sticky', top: '20px', height: 'calc(100vh - 40px)' }, 

    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' },
    materialHeader: { marginBottom: '20px', borderBottom: '1px solid #F0F0F0', paddingBottom: '15px' },
    badge: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    levelBadge: { backgroundColor: '#F5F5F5', color: '#616161', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    
    materialTitle: { 
        fontSize: '24px', fontWeight: '800', color: '#1A237E', margin: '10px 0 5px 0', lineHeight: '1.2',
        wordBreak: 'break-word', overflowWrap: 'break-word' 
    },
    
    iaTag: { display:'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#546E7A', backgroundColor: '#F5F5F5', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' },

    techSheetContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
    techItem: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    techLabel: { display: 'block', fontSize: '10px', color: '#90A4AE', textTransform: 'uppercase', fontWeight: '800' },
    techValue: { fontSize: '13px', color: '#37474F', fontWeight: '600' },

    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '6px', marginBottom: '20px' },
    bnccTitle: { margin: '0 0 5px 0', fontSize: '12px', color: '#EF6C00', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' },
    
    bnccText: { 
        margin: 0, fontSize: '14px', color: '#3E2723', lineHeight: '1.5',
        wordBreak: 'break-word', overflowWrap: 'break-word'
    },

    sectionBox: { marginBottom: '25px' },
    sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#37474F', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
    
    textBodyBox: { 
        fontSize: '15px', lineHeight: '1.6', color: '#455A64', whiteSpace: 'pre-wrap',
        wordBreak: 'break-word', overflowWrap: 'break-word'
    },
    
    resultsBox: { 
        backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', padding: '15px', borderRadius: '8px', color: '#1B5E20', fontSize: '14px', fontStyle: 'italic',
        wordBreak: 'break-word', overflowWrap: 'break-word'
    },

    downloadCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '10px', border: '1px solid #BBDEFB', marginTop: '20px' },
    fileIconBig: { backgroundColor: 'white', padding: '8px', borderRadius: '8px' },
    fileName: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#1565C0' },
    fileLabel: { fontSize: '11px', color: '#64B5F6' },
    downloadBtn: { background: 'white', border: 'none', color: '#1565C0', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },

    formCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E0E0E0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    formHeader: { padding: '15px 20px', borderBottom: '1px solid #EEE', backgroundColor: '#FAFAFA' },
    formTitle: { fontSize: '16px', fontWeight: '800', color: '#1565C0', margin: 0 },
    formSubtitle: { fontSize: '11px', color: '#78909C', margin: '2px 0 0 0' },

    scrollableRubric: { flex: 1, overflowY: 'auto', padding: '15px 20px', backgroundColor: 'white' },

    criteriaCard: { 
        backgroundColor: 'white', 
        border: '1px solid #E0E0E0', 
        borderRadius: '8px', 
        padding: '10px 12px', 
        marginBottom: '10px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
    },
    criteriaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
    criteriaTitleGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    letterBadge: { width: '20px', height: '20px', borderRadius: '5px', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' },
    criteriaLabel: { fontSize: '13px', fontWeight: '700', color: '#37474F' },
    criteriaList: { paddingLeft: '20px', fontSize: '11px', color: '#607D8B', margin: '0 0 5px 0', lineHeight: '1.3' },
    
    starsContainer: { display: 'flex', gap: '2px', borderTop: '1px dashed #EEE', paddingTop: '5px' },
    starButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.1s' },

    feedbackSection: { marginTop: '15px', borderTop: '2px solid #F5F5F5', paddingTop: '15px' },
    sectionHeaderSmall: { fontSize: '11px', textTransform: 'uppercase', color: '#90A4AE', fontWeight: '800', marginBottom: '10px' },
    
    inputContainerSuccess: { marginBottom: '10px', border: '1px solid #C8E6C9', borderRadius: '8px', overflow: 'hidden' },
    inputHeaderSuccess: { backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '6px 10px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' },
    textareaSuccess: { width: '100%', padding: '10px', border: 'none', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '50px' },

    inputContainerDanger: { marginBottom: '5px', border: '1px solid #FFCDD2', borderRadius: '8px', overflow: 'hidden' },
    inputHeaderDanger: { backgroundColor: '#FFEBEE', color: '#C62828', padding: '6px 10px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' },
    textareaDanger: { width: '100%', padding: '10px', border: 'none', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '50px' },

    verdictSection: { padding: '15px 20px', borderTop: '1px solid #EEE', backgroundColor: '#FAFAFA', display: 'flex', gap: '10px' },
    btnReject: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #EF9A9A', backgroundColor: '#FFEBEE', color: '#C62828', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' },
    btnApprove: { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2E7D32', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.25)' }
};

export default Revisao;