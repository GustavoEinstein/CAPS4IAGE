import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    Star, CheckCircle2, Bot, Download, ArrowLeft, Clock, Wrench, 
    BookOpen, Target, Lightbulb, ThumbsUp, ShieldAlert, FileText, User, 
    AlertTriangle, Lock, PenTool, Eye, Cpu, Terminal, Link, ExternalLink 
} from 'lucide-react';

const Revisao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    const [producaoEmRevisao, setProducaoEmRevisao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [avaliacao, setAvaliacao] = useState({
        notaCoerencia: 0, notaQualidade: 0, notaMetodologia: 0,
        notaAvaliacao: 0, notaInclusao: 0, notaInovacao: 0,
        pontosFortes: '', pontosMelhoria: ''
    });

    const scores = [
        avaliacao.notaCoerencia, avaliacao.notaQualidade, avaliacao.notaMetodologia,
        avaliacao.notaAvaliacao, avaliacao.notaInclusao, avaliacao.notaInovacao
    ];
    const isFormComplete = scores.every(s => s > 0);
    const hasCriticalFail = scores.some(s => s > 0 && s <= 2);

    const handleDownload = async () => {
        if (!producaoEmRevisao || !producaoEmRevisao.arquivo) return;
        try {
            const urlRelativa = producaoEmRevisao.arquivo.replace('https://teia.cic.unb.br/kipo_playground/', '');
            const response = await api.get(urlRelativa, { responseType: 'blob' });
            const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = urlBlob;
            link.setAttribute('download', `producao-${producaoEmRevisao.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error("Erro no download:", error);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                setProducaoEmRevisao(response.data);
            } catch (error) {
                console.error("Erro ao carregar:", error);
                Swal.fire('Erro', 'Não foi possível carregar os detalhes.', 'error');
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

    const handleSubmit = async (veredito) => {
        if (!isFormComplete) return;
        if (veredito === false && !avaliacao.pontosMelhoria.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Para rejeitar a prática, é OBRIGATÓRIO preencher as Sugestões de Melhoria para orientar o colega.',
                confirmButtonColor: '#F57C00'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`api/production/${id}/review/`, { 
                aprovado: veredito, 
                pontos_fortes: avaliacao.pontosFortes,
                pontos_melhoria: avaliacao.pontosMelhoria,
                nota_coerencia: avaliacao.notaCoerencia,
                nota_qualidade: avaliacao.notaQualidade,
                nota_metodologia: avaliacao.notaMetodologia,
                nota_avaliacao: avaliacao.notaAvaliacao,
                nota_inclusao: avaliacao.notaInclusao,
                nota_inovacao: avaliacao.notaInovacao
            });
            
            if (veredito) { 
                const currentApprovals = producaoEmRevisao.total_aprovacoes || 0;
                
                if (currentApprovals === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Avaliação Registrada! (1/2)',
                        html: 'Sua aprovação foi salva com sucesso!<br><br>Como o sistema exige a revisão em <b>duplo-cego</b>, outro colega da área também precisará aprovar para que a prática seja finalmente publicada.',
                        confirmButtonColor: '#1565C0',
                        confirmButtonText: 'Continuar revisando'
                    }).then(() => navigate('/dashboard/revisao'));
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Prática Publicada! (2/2)',
                        html: 'Excelente trabalho! Você foi o <b>segundo revisor</b> a aprovar este material.<br><br>A prática acaba de ser <b>publicada no Fórum Público</b> da comunidade!',
                        confirmButtonColor: '#2E7D32',
                        confirmButtonText: 'Que legal!'
                    }).then(() => navigate('/dashboard/revisao'));
                }
            } else { 
                Swal.fire({
                    icon: 'error',
                    title: 'Devolvido para Correção',
                    text: 'A prática foi devolvida ao autor com as suas sugestões de melhoria.',
                    confirmButtonColor: '#C62828'
                }).then(() => navigate('/dashboard/revisao'));
            }

        } catch (error) {
            Swal.fire('Erro', 'Ocorreu um problema ao salvar sua revisão.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando...</div>;
    if (!producaoEmRevisao) return null;

    const CriteriaCard = ({ label, description, fieldName, value }) => (
        <div style={styles.criteriaCard}>
            <div style={styles.criteriaHeader}>
                <span style={styles.criteriaTitle}>{label}</span>
                <span style={{...styles.scoreBadge, color: value > 0 ? (value <= 2 ? '#D32F2F' : '#2E7D32') : '#E0E0E0'}}>
                    {value > 0 ? value : '-'}
                </span>
            </div>
            <p style={styles.criteriaDesc}>{description}</p>
            <div style={styles.starsWrapper}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleScoreChange(fieldName, star)} type="button" style={styles.starBtn}>
                        <Star size={24} fill={star <= value ? "#FFC107" : "#F5F5F5"} color={star <= value ? "#FFB300" : "#E0E0E0"} strokeWidth={2} />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <div style={styles.topBar}>
                    <button onClick={() => navigate('/dashboard/revisao')} style={styles.backButton}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div style={{textAlign: 'right'}}>
                        <h1 style={styles.pageTitle}>Sala de Revisão</h1>
                        <p style={styles.pageSubtitle}>Analise o conteúdo abaixo e preencha a avaliação no final.</p>
                    </div>
                </div>

                <div style={styles.materialCard}>
                    <div style={styles.materialHeader}>
                        <div style={styles.badgesRow}>
                            <span style={styles.badgeDisc}>{producaoEmRevisao.disciplina}</span>
                            <span style={styles.badgeLevel}>{producaoEmRevisao.nivel}</span>
                        </div>
                        <h2 style={styles.materialTitle}>{producaoEmRevisao.titulo}</h2>
                        <div style={styles.metaInfo}>
                            <span style={styles.metaItem}><Bot size={14}/> {producaoEmRevisao.modelo_ia}</span>
                            <span style={styles.metaItem}><User size={14}/> Autor Anônimo</span>
                        </div>
                    </div>

                    <div style={styles.techSheet}>
                        <div style={styles.techItem}><Wrench size={16} color="#1565C0"/><div><span style={styles.techLabel}>Metodologia</span><span style={styles.techValue}>{producaoEmRevisao.metodologia}</span></div></div>
                        <div style={styles.techItem}><Clock size={16} color="#1565C0"/><div><span style={styles.techLabel}>Duração</span><span style={styles.techValue}>{producaoEmRevisao.duracao}</span></div></div>
                        <div style={styles.techItem}><Package size={16} color="#1565C0"/><div>
                            <span style={styles.techLabel}>Recursos</span>
                            <span style={styles.techValue}>
                                {Array.isArray(producaoEmRevisao.recursos) 
                                    ? producaoEmRevisao.recursos.join(', ') 
                                    : (typeof producaoEmRevisao.recursos === 'string' 
                                        ? producaoEmRevisao.recursos.split(',').map(r => r.trim()).join(', ') 
                                        : '-')}
                            </span>
                        </div></div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><BookOpen size={18}/> Alinhamento BNCC</h3>
                        <div style={styles.bnccBox}>{producaoEmRevisao.bncc || "Não informado."}</div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><Cpu size={18}/> BNCC Computação</h3>
                        <div style={{...styles.bnccBox, backgroundColor: '#E3F2FD', borderLeftColor: '#1565C0'}}>
                            {producaoEmRevisao.bncc_computacao || "Não informado."}
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><Terminal size={18}/> Prompts Utilizados</h3>
                        <div style={styles.promptBox}>{producaoEmRevisao.prompts_ia || "Nenhum prompt registrado."}</div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><Lightbulb size={18}/> Relato de Experiência</h3>
                        <p style={styles.textBody}>{producaoEmRevisao.experiencia}</p>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}><Target size={18}/> Resultados</h3>
                        <div style={styles.resultsBox}>{producaoEmRevisao.resultados || "Sem resultados."}</div>
                    </div>

                    {/* --- INÍCIO DA SEÇÃO DE ARQUIVOS E LINKS --- */}
                    {(producaoEmRevisao.arquivo || producaoEmRevisao.link_material) && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}><FileText size={18}/> Arquivos e Materiais</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                
                                {producaoEmRevisao.arquivo && (
                                    <div style={{ ...styles.downloadContainer, marginTop: 0, flex: 1, minWidth: '250px' }}>
                                        <div style={styles.fileInfoBox}>
                                            <FileText size={24} color="#1565C0" />
                                            <div>
                                                <span style={styles.fileName}>Material de Apoio (Anexo)</span>
                                            </div>
                                        </div>
                                        <button onClick={handleDownload} style={styles.downloadBtnCompact}>
                                            <Download size={18} style={{marginRight: '6px'}}/> Baixar Arquivo
                                        </button>
                                    </div>
                                )}

                                {producaoEmRevisao.link_material && (
                                    <div style={{ ...styles.downloadContainer, marginTop: 0, flex: 1, minWidth: '250px', backgroundColor: '#F3E5F5', border: '1px solid #E1BEE7' }}>
                                        <div style={styles.fileInfoBox}>
                                            <Link size={24} color="#7B1FA2" />
                                            <div>
                                                <span style={{ ...styles.fileName, color: '#4A148C' }}>Material Externo / Vídeo</span>
                                            </div>
                                        </div>
                                        <a href={producaoEmRevisao.link_material} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <button style={{ ...styles.downloadBtnCompact, backgroundColor: '#7B1FA2', width: '100%' }}>
                                                <ExternalLink size={18} style={{marginRight: '6px'}}/> Abrir Link
                                            </button>
                                        </a>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                    {/* --- FIM DA SEÇÃO DE ARQUIVOS E LINKS --- */}

                    {/* MOSTRAR PARECER DO PRIMEIRO REVISOR SE EXISTIR (E TIVER SIDO APROVADO) */}
                    {producaoEmRevisao.avaliacoes_detalhadas && producaoEmRevisao.avaliacoes_detalhadas.length === 1 && (
                        <div style={styles.firstReviewerBox}>
                            <h3 style={styles.firstReviewerTitle}><Eye size={18}/> Parecer do 1º Revisor</h3>
                            <div style={styles.firstReviewerFeedback}>
                                {producaoEmRevisao.avaliacoes_detalhadas[0].pontos_fortes && (
                                    <div style={{marginBottom: '10px'}}>
                                        <strong style={{color: '#2E7D32', fontSize: '13px'}}><ThumbsUp size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> PONTOS FORTES:</strong>
                                        <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#37474F', wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>
                                            {producaoEmRevisao.avaliacoes_detalhadas[0].pontos_fortes}
                                        </p>
                                    </div>
                                )}
                                {producaoEmRevisao.avaliacoes_detalhadas[0].pontos_melhoria && (
                                    <div>
                                        <strong style={{color: '#E65100', fontSize: '13px'}}><AlertTriangle size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> SUGESTÕES:</strong>
                                        <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#37474F', wordBreak: 'break-word', whiteSpace: 'pre-wrap'}}>
                                            {producaoEmRevisao.avaliacoes_detalhadas[0].pontos_melhoria}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={styles.stepSeparator}>
                    <div style={styles.stepLine}></div>
                    <div style={styles.stepLabel}><PenTool size={16}/> Área de Avaliação</div>
                    <div style={styles.stepLine}></div>
                </div>

                <div style={styles.reviewSection}>
                    <h3 style={styles.reviewTitle}>Sua Avaliação</h3>
                    
                    <div style={styles.criteriaGrid}>
                        <CriteriaCard label="Coerência Pedagógica" description="Objetivos claros e alinhados?" fieldName="notaCoerencia" value={avaliacao.notaCoerencia} />
                        <CriteriaCard label="Qualidade do Prompt" description="Uso intencional da IA?" fieldName="notaQualidade" value={avaliacao.notaQualidade} />
                        <CriteriaCard label="Metodologia Ativa" description="Aluno protagonista?" fieldName="notaMetodologia" value={avaliacao.notaMetodologia} />
                        <CriteriaCard label="Avaliação" description="Critérios de verificação?" fieldName="notaAvaliacao" value={avaliacao.notaAvaliacao} />
                        <CriteriaCard label="Inclusão e Acessibilidade" description="Acessível a todos?" fieldName="notaInclusao" value={avaliacao.notaInclusao} />
                        <CriteriaCard label="Inovação e Criatividade" description="Ideias originais?" fieldName="notaInovacao" value={avaliacao.notaInovacao} />
                    </div>

                    <div style={styles.feedbackGrid}>
                        <div style={styles.feedbackBoxSuccess}>
                            <label style={styles.feedbackLabelSuccess}><ThumbsUp size={14}/> Pontos Fortes</label>
                            <textarea style={styles.textareaWhite} placeholder="O que se destacou positivamente?" value={avaliacao.pontosFortes} onChange={e => setAvaliacao({...avaliacao, pontosFortes: e.target.value})} />
                        </div>
                        <div style={styles.feedbackBoxDanger}>
                            <label style={styles.feedbackLabelDanger}><AlertTriangle size={14}/> Sugestões de Melhoria</label>
                            <textarea style={styles.textareaWhite} placeholder="O que precisa ser ajustado?" value={avaliacao.pontosMelhoria} onChange={e => setAvaliacao({...avaliacao, pontosMelhoria: e.target.value})} />
                        </div>
                    </div>

                    <div style={styles.actionButtonsRow}>
                        {!isFormComplete ? (
                            <button disabled style={styles.btnDisabled}>
                                <Lock size={16} /> Preencha todos os critérios acima para liberar a decisão
                            </button>
                        ) : (
                            <>
                                <button onClick={() => handleSubmit(false)} disabled={isSubmitting} style={hasCriticalFail ? styles.btnRejectPrimary : styles.btnRejectSecondary}>
                                    <ShieldAlert size={18}/> Rejeitar
                                </button>
                                <button onClick={() => handleSubmit(true)} disabled={isSubmitting || hasCriticalFail} style={!hasCriticalFail ? styles.btnApprovePrimary : styles.btnApproveSecondary}>
                                    <CheckCircle2 size={18}/> Aprovar
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const styles = {
    fullPageWrapper: { backgroundColor: '#F0F2F5', minHeight: '100vh', padding: '20px' },
    container: { maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#546E7A', fontWeight: '700' },
    pageTitle: { fontSize: '24px', fontWeight: '800', color: '#1A237E', margin: 0 },
    pageSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px', border: '1px solid #E0E0E0', marginBottom: '30px' },
    materialHeader: { marginBottom: '25px', borderBottom: '1px solid #F0F0F0', paddingBottom: '20px' },
    badgesRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
    badgeDisc: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
    badgeLevel: { backgroundColor: '#F5F5F5', color: '#616161', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    materialTitle: { fontSize: '28px', fontWeight: '800', color: '#333', margin: '0 0 10px 0', wordBreak: 'break-word', overflowWrap: 'break-word' },
    metaInfo: { display: 'flex', gap: '15px', color: '#78909C', fontSize: '13px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '5px' },
    techSheet: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#FAFAFA', borderRadius: '10px' },
    techItem: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    techLabel: { display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#90A4AE', fontWeight: '800' },
    techValue: { fontSize: '14px', color: '#37474F', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' },
    section: { marginBottom: '30px' },
    sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#37474F', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '6px', fontSize: '14px', wordBreak: 'break-word', overflowWrap: 'break-word' },
    textBody: { fontSize: '15px', lineHeight: '1.6', color: '#455A64', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
    promptBox: { backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #8B5CF6', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' },
    resultsBox: { backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', padding: '15px', borderRadius: '8px', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' },
    
    downloadContainer: { padding: '12px 15px', backgroundColor: '#F8F9FA', borderRadius: '10px', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    fileInfoBox: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    fileName: { fontSize: '13px', fontWeight: '700' },
    downloadBtnCompact: { backgroundColor: '#1565C0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    firstReviewerBox: { backgroundColor: '#F8FBFF', border: '1px solid #BBDEFB', borderRadius: '12px', padding: '20px', marginTop: '30px' },
    firstReviewerTitle: { fontSize: '15px', fontWeight: '800', color: '#1565C0', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
    firstReviewerFeedback: { backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '8px', border: '1px solid #E3F2FD' },
    
    stepSeparator: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', opacity: 0.8 },
    stepLine: { flex: 1, height: '1px', backgroundColor: '#B0BEC5' },
    stepLabel: { fontSize: '14px', fontWeight: '700', color: '#546E7A', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' },

    reviewSection: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' },
    reviewTitle: { fontSize: '18px', fontWeight: '800', color: '#1A237E', marginBottom: '20px' },
    
    criteriaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' },
    criteriaCard: { border: '1px solid #E0E0E0', borderRadius: '10px', padding: '15px', backgroundColor: '#FAFAFA' },
    criteriaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
    criteriaTitle: { fontSize: '13px', fontWeight: '700', color: '#37474F' },
    criteriaDesc: { fontSize: '11px', color: '#78909C', margin: '0 0 10px 0', minHeight: '32px' },
    starsWrapper: { display: 'flex', justifyContent: 'center', gap: '4px', marginTop: 'auto' },
    starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.1s' },
    scoreBadge: { fontSize: '14px', fontWeight: '800', minWidth: '20px', textAlign: 'center' },

    feedbackGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
    feedbackBoxSuccess: { backgroundColor: '#F1F8E9', border: '1px solid #C5E1A5', borderRadius: '10px', padding: '15px' },
    feedbackLabelSuccess: { color: '#2E7D32', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' },
    feedbackBoxDanger: { backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '15px' },
    feedbackLabelDanger: { color: '#C62828', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' },

    textareaWhite: { width: '100%', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#333' },

    actionButtonsRow: { display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '1px solid #F0F0F0' },
    btnDisabled: { width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #E0E0E0', backgroundColor: '#F5F5F5', color: '#B0BEC5', fontWeight: '700', fontSize: '14px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    
    btnApprovePrimary: { flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2E7D32', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' },
    btnApproveSecondary: { flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #C8E6C9', backgroundColor: '#F1F8E9', color: '#2E7D32', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', opacity: 0.6 },
    btnRejectPrimary: { flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#C62828', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(198, 40, 40, 0.3)' },
    btnRejectSecondary: { flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #FFCDD2', backgroundColor: '#FFEBEE', color: '#C62828', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', opacity: 0.6 }
};

export default Revisao;