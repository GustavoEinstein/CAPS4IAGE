import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, Clock, Bot, BookOpen, CheckCircle2,
    XCircle, Wrench, Lightbulb, Target, Download, FileText, User, Package, Star,
    CornerDownRight, UserCog, ThumbsUp, AlertTriangle, Send, RefreshCw, History
} from 'lucide-react';

const VisualizarMinhaProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                setData(response.data);
            } catch (error) {
                console.error("Erro ao carregar:", error);
                alert("Erro ao carregar os detalhes da produção.");
                navigate('/dashboard/minhas-producoes');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchDetails();
        }
    }, [id, navigate]);

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando...</div>;
    if (!data) return null;

    // --- CONFIGURAÇÃO DE STATUS ---
    const statusLower = data.status ? data.status.toLowerCase() : "";
    const isRejected = statusLower.includes('rejeitado') || statusLower.includes('correção') || statusLower.includes('correcao');
    const isApproved = statusLower.includes('aprovado') || statusLower.includes('publicado');
    const isPending = statusLower.includes('em revisão') || statusLower.includes('pendente');

    // DETECTA SE É UM REENVIO (Está em revisão mas JÁ tem histórico de notas/data)
    const isResubmitted = isPending && (data.notas || data.feedback_revisor);

    // --- PARSER DE FEEDBACK ---
    const feedbackData = (() => {
        const raw = data.feedback_revisor || "";
        if (!raw) return null;

        let strengths = "";
        let improvements = "";
        let general = "";

        if (raw.includes("PONTOS FORTES:") && raw.includes("SUGESTÕES DE MELHORIA:")) {
            const parts = raw.split("SUGESTÕES DE MELHORIA:");
            strengths = parts[0].replace("PONTOS FORTES:", "").trim();
            improvements = parts[1].trim();
            return { strengths, improvements, general: null };
        } else if (raw.includes("SUGESTÕES DE MELHORIA:")) {
             improvements = raw.replace("SUGESTÕES DE MELHORIA:", "").trim();
             return { strengths: null, improvements, general: null };
        } else {
            general = raw;
            return { strengths: null, improvements: null, general };
        }
    })();

    // Cores por Disciplina
    const getTheme = (disciplina) => {
        const disc = disciplina ? disciplina.trim() : "Outra";
        const themes = {
            'História': { main: '#7B1FA2', bg: '#F3E5F5' },
            'Geografia': { main: '#E65100', bg: '#FFF3E0' },
            'Filosofia': { main: '#455A64', bg: '#ECEFF1' },
            'Sociologia': { main: '#5D4037', bg: '#EFEBE9' },
            'Projeto de vida': { main: '#0277BD', bg: '#E1F5FE' },
            'Pedagogia': { main: '#F9A825', bg: '#FFFDE7' },
            'Matemática': { main: '#C2185B', bg: '#FCE4EC' },
            'Ciências': { main: '#2E7D32', bg: '#E8F5E9' },
            'Física': { main: '#283593', bg: '#E8EAF6' },
            'Química': { main: '#00838F', bg: '#E0F7FA' },
            'Biologia': { main: '#388E3C', bg: '#E8F5E9' },
            'Português': { main: '#1565C0', bg: '#E3F2FD' },
            'Inglês': { main: '#B71C1C', bg: '#FFEBEE' },
            'Artes': { main: '#AD1457', bg: '#FCE4EC' },
            'Educação Física': { main: '#F57C00', bg: '#FFF3E0' },
            'Outra': { main: '#616161', bg: '#F5F5F5' },
            'Default': { main: '#1565C0', bg: '#E3F2FD' }
        };
        return themes[disc] || themes['Default'];
    };
    const theme = getTheme(data.disciplina);

    // Componente de Estrelas
    const StarRating = ({ score }) => {
        const finalScore = score || 0;
        return (
            <div style={{display: 'flex', gap: '2px'}}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={14} 
                        fill={star <= finalScore ? "#FFC107" : "#E0E0E0"} 
                        color={star <= finalScore ? "#FFB300" : "#BDBDBD"} 
                        strokeWidth={star <= finalScore ? 0 : 1.5}
                    />
                ))}
            </div>
        );
    };

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <ArrowLeft size={18} /> Voltar
                </button>

                <div style={{...styles.grid, flexDirection: isMobile ? 'column' : 'row'}}>
                    
                    {/* --- COLUNA ESQUERDA: CONTEÚDO --- */}
                    <div style={styles.columnContent}>
                        <div style={styles.materialCard}>
                            
                            {/* Header */}
                            <div style={styles.headerSection}>
                                <div style={styles.badgesRow}>
                                    <span style={{...styles.badge, backgroundColor: theme.bg, color: theme.main}}>
                                        {data.disciplina}
                                    </span>
                                    <span style={styles.badgeNeutral}>{data.nivel}</span>
                                </div>
                                <h1 style={styles.title}>{data.titulo}</h1>
                                <div style={styles.metaRow}>
                                    <div style={styles.iaTag}><Bot size={14} /> {data.modelo_ia}</div>
                                    <span style={styles.dateText}><Calendar size={14} /> {data.data}</span>
                                    <span style={styles.dateText}><User size={14} /> Autor: Prof. de {data.disciplina}</span>
                                </div>
                            </div>

                            {/* Detalhes Técnicos */}
                            <div style={styles.techSheet}>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Wrench size={18} color={theme.main} /></div>
                                    <div style={styles.techContent}>
                                        <span style={{...styles.techLabel, color: theme.main}}>Metodologia</span>
                                        <span style={styles.techValue}>{data.metodologia || '-'}</span>
                                    </div>
                                </div>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Clock size={18} color={theme.main} /></div>
                                    <div style={styles.techContent}>
                                        <span style={{...styles.techLabel, color: theme.main}}>Duração</span>
                                        <span style={styles.techValue}>{data.duracao || '-'}</span>
                                    </div>
                                </div>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Package size={18} color={theme.main} /></div>
                                    <div style={styles.techContent}>
                                        <span style={{...styles.techLabel, color: theme.main}}>Recursos</span>
                                        <span style={styles.techValue}>{data.recursos || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* BNCC */}
                            <div style={styles.bnccBox}>
                                <h4 style={styles.bnccTitle}><BookOpen size={16}/> Alinhamento BNCC</h4>
                                <p style={styles.bnccText}>{data.bncc}</p>
                            </div>

                            {/* Conteúdo */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}><Lightbulb size={20} color="#F57C00"/> Relato de Experiência</h3>
                                <div style={styles.textBody}>{data.experiencia}</div>
                            </div>
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}><Target size={20} color="#2E7D32"/> Resultados</h3>
                                <div style={styles.resultsBox}>{data.resultados}</div>
                            </div>

                            {/* --- LINHA DO TEMPO "RASTREIO" COMPLETA --- */}
                            {(isRejected || isApproved || data.notas || isResubmitted) && (
                                <div style={styles.timelineSection}>
                                    <h3 style={styles.timelineMainTitle}>Histórico de Rastreamento</h3>
                                    
                                    {/* 1. ENVIO ORIGINAL */}
                                    <div style={styles.timelineItem}>
                                        <div style={styles.timelineLeft}>
                                            <div style={styles.timelineDot} />
                                            <div style={styles.timelineLine} />
                                        </div>
                                        <div style={styles.timelineContent}>
                                            <span style={styles.timelineDate}>{data.data}</span>
                                            <h4 style={styles.timelineTitle}>Produção criada e enviada para fila</h4>
                                        </div>
                                    </div>

                                    {/* 2. HISTÓRICO DA REVISÃO ANTERIOR (Sempre mostra se tiver notas) */}
                                    {data.notas && (
                                        <div style={styles.timelineItem}>
                                            <div style={styles.timelineLeft}>
                                                <div style={isApproved ? styles.timelineDotApproved : styles.timelineDotRejected}>
                                                    {isApproved ? <CheckCircle2 size={14} color="white"/> : <UserCog size={14} color="white"/>}
                                                </div>
                                                <div style={styles.timelineLine} />
                                            </div>
                                            
                                            <div style={styles.timelineContent}>
                                                <span style={styles.timelineDate}>
                                                    {data.data_revisao ? `Avaliado em: ${data.data_revisao}` : "Avaliação Realizada"}
                                                </span>
                                                
                                                {/* CARD DE AVALIAÇÃO (Histórico) */}
                                                <div style={isApproved ? styles.reviewCardApproved : styles.reviewCardRejected}>
                                                    <div style={styles.reviewHeader}>
                                                        <span style={isApproved ? styles.statusTitleApprovedInline : styles.statusTitleRejectedInline}>
                                                            {isApproved ? "APROVADO PELO PARECERISTA" : "PARECER TÉCNICO (Versão Anterior)"}
                                                        </span>
                                                    </div>

                                                    {/* Rubrica */}
                                                    <div style={styles.rubricGrid}>
                                                        <div style={styles.rubricItem}><span>Coerência</span><StarRating score={data.notas.coerencia} /></div>
                                                        <div style={styles.rubricItem}><span>Didática</span><StarRating score={data.notas.qualidade} /></div>
                                                        <div style={styles.rubricItem}><span>Metodologia</span><StarRating score={data.notas.metodologia} /></div>
                                                        <div style={styles.rubricItem}><span>Avaliação</span><StarRating score={data.notas.avaliacao} /></div>
                                                        <div style={styles.rubricItem}><span>Inclusão</span><StarRating score={data.notas.inclusao} /></div>
                                                        <div style={styles.rubricItem}><span>Inovação</span><StarRating score={data.notas.inovacao} /></div>
                                                    </div>

                                                    {/* Feedbacks */}
                                                    {feedbackData && feedbackData.strengths && (
                                                        <div style={styles.feedbackSectionGreen}>
                                                            <strong style={{fontSize:'11px', color: '#1B5E20', display:'block'}}>PONTOS FORTES:</strong>
                                                            <span style={styles.feedbackTextGreen}>"{feedbackData.strengths}"</span>
                                                        </div>
                                                    )}
                                                    {feedbackData && feedbackData.improvements && (
                                                        <div style={styles.feedbackSectionYellow}>
                                                            <strong style={{fontSize:'11px', color: '#E65100', display:'block'}}>MELHORIAS SOLICITADAS:</strong>
                                                            <span style={styles.feedbackTextYellow}>"{feedbackData.improvements}"</span>
                                                        </div>
                                                    )}
                                                    {feedbackData && feedbackData.general && (
                                                        <div style={styles.reviewFeedbackBox}>"{feedbackData.general}"</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. EVENTO DE DEVOLUÇÃO (HISTÓRICO) */}
                                    {/* Mostra se for rejeitado OU se já foi reenviado (para manter histórico) */}
                                    {(isRejected || isResubmitted) && (
                                        <div style={styles.timelineItem}>
                                            <div style={styles.timelineLeft}>
                                                <div style={{...styles.timelineDotRejected, backgroundColor: '#C62828', boxShadow: '0 0 0 4px #FFEBEE', zIndex: 3}}>
                                                    <CornerDownRight size={14} color="white"/>
                                                </div>
                                                {/* Se foi reenviado, a linha continua */}
                                                {isResubmitted && <div style={{...styles.timelineLine, backgroundColor: '#90CAF9'}} />}
                                            </div>
                                            <div style={{...styles.timelineContent, paddingTop: '5px'}}>
                                                {isResubmitted ? (
                                                    <span style={styles.timelineDate}>Etapa Concluída</span>
                                                ) : (
                                                    <span style={{...styles.timelineDate, color: '#C62828'}}>Status Atual</span>
                                                )}
                                                
                                                <h4 style={{...styles.timelineTitle, color: '#555', fontSize: '14px'}}>
                                                    Devolvido ao autor para revisões
                                                </h4>
                                                <p style={styles.timelineDesc}>
                                                    Material retornou para ajustes conforme parecer técnico.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. EVENTO DE REENVIO (O NOVO!) */}
                                    {isResubmitted && (
                                        <div style={styles.timelineItem}>
                                            <div style={styles.timelineLeft}>
                                                <div style={{...styles.timelineDotApproved, backgroundColor: '#1565C0', boxShadow: '0 0 0 4px #E3F2FD'}}>
                                                    <Send size={14} color="white"/>
                                                </div>
                                            </div>
                                            <div style={{...styles.timelineContent, paddingTop: '5px'}}>
                                                <span style={{...styles.timelineDate, color: '#1565C0'}}>Agora</span>
                                                <div style={{backgroundColor: '#E3F2FD', padding: '15px', borderRadius: '8px', border: '1px solid #BBDEFB'}}>
                                                    <h4 style={{...styles.timelineTitle, color: '#0D47A1', fontSize: '15px', display:'flex', alignItems:'center', gap:'8px'}}>
                                                        <RefreshCw size={16}/> Produção reenviada para análise
                                                    </h4>
                                                    <p style={{...styles.timelineDesc, color: '#1565C0', marginTop: '5px'}}>
                                                        O material atualizado foi encaminhado para a fila de revisão de um <strong>novo professor</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                            {/* ------------------------------------------------ */}

                        </div>
                    </div>

                    {/* --- COLUNA DIREITA: STATUS --- */}
                    <div style={styles.columnSidebar}>
                        
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>Status</h3>

                            {isApproved && (
                                <div style={styles.statusBoxApproved}>
                                    <CheckCircle2 size={24} color="#2E7D32" />
                                    <div>
                                        <span style={styles.statusTitleApproved}>PUBLICADO</span>
                                        <p style={styles.statusDesc}>Visível na comunidade.</p>
                                    </div>
                                </div>
                            )}

                            {/* CARD AZUL DE REENVIO */}
                            {isResubmitted && (
                                <div style={{...styles.statusBoxPending, backgroundColor: '#E3F2FD', border: '1px solid #90CAF9'}}>
                                    <History size={24} color="#1976D2" />
                                    <div>
                                        <span style={{...styles.statusTitlePending, color: '#1565C0'}}>REENVIADO</span>
                                        <p style={styles.statusDesc}>Aguardando nova avaliação.</p>
                                    </div>
                                </div>
                            )}

                            {!isApproved && !isRejected && !isResubmitted && (
                                <div style={styles.statusBoxPending}>
                                    <Clock size={24} color="#EF6C00" />
                                    <div>
                                        <span style={styles.statusTitlePending}>EM REVISÃO</span>
                                        <p style={styles.statusDesc}>Aguardando análise.</p>
                                    </div>
                                </div>
                            )}

                            {isRejected && (
                                <div style={styles.statusBoxRejected}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                                        <XCircle size={20} color="#C62828" />
                                        <span style={styles.statusTitleRejected}>AÇÃO NECESSÁRIA</span>
                                    </div>
                                    <p style={styles.statusDesc}>
                                        Sua produção precisa de ajustes.
                                    </p>
                                    
                                    <button 
                                        onClick={() => navigate(`/dashboard/editar-producao/${data.id}`)}
                                        style={styles.editButton}
                                    >
                                        <Wrench size={18} /> Editar e Reenviar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{...styles.sidebarCard, marginTop: '20px'}}>
                            <h3 style={styles.sidebarTitle}>Arquivo</h3>
                            {data.arquivo ? (
                                <div style={styles.filePreview}>
                                    <div style={styles.fileIconBig}><FileText size={24} color="#1565C0" /></div>
                                    <div style={{flex:1, overflow:'hidden'}}>
                                        <span style={styles.fileName}>Material Didático</span>
                                        <span style={styles.fileMeta}>Baixar anexo</span>
                                    </div>
                                    <a href={data.arquivo} download target="_blank" rel="noopener noreferrer">
                                        <button style={styles.downloadBtn}><Download size={18} /></button>
                                    </a>
                                </div>
                            ) : (
                                <p style={{fontSize: '13px', color: '#999', fontStyle: 'italic'}}>Nenhum arquivo.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F0F2F5', minHeight: '100vh', width: '100%', boxSizing: 'border-box', paddingTop: '20px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' },
    backButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#546E7A', fontWeight: '700', marginBottom: '15px' },
    
    grid: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
    columnContent: { flex: 1, minWidth: '0' }, 
    columnSidebar: { width: '320px', minWidth: '320px', position: 'sticky', top: '20px' },

    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' },
    
    headerSection: { marginBottom: '20px', borderBottom: '1px solid #F0F0F0', paddingBottom: '20px' },
    badgesRow: { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    badgeNeutral: { backgroundColor: '#F5F5F5', color: '#616161', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    title: { fontSize: '28px', fontWeight: '800', color: '#1A237E', margin: '0 0 10px 0', lineHeight: '1.2', wordBreak: 'break-word', overflowWrap: 'break-word' },
    metaRow: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', flexWrap: 'wrap' },
    iaTag: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#546E7A', backgroundColor: '#F5F5F5', padding: '4px 8px', borderRadius: '6px' },
    dateText: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#90A4AE' },

    techSheet: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    techItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
    techContent: { flex: 1, minWidth: '0' },
    iconCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    techLabel: { display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '2px' },
    techValue: { fontSize: '13px', color: '#37474F', fontWeight: '600', wordBreak: 'break-word', overflowWrap: 'break-word' },

    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '6px', marginBottom: '30px' },
    bnccTitle: { margin: '0 0 5px 0', fontSize: '12px', color: '#EF6C00', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' },
    bnccText: { margin: 0, fontSize: '14px', color: '#3E2723', lineHeight: '1.5', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' },
    
    section: { marginBottom: '30px' },
    sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#37474F', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
    textBody: { fontSize: '15px', lineHeight: '1.6', color: '#455A64', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
    resultsBox: { backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '8px', border: '1px solid #C8E6C9', color: '#1B5E20', fontSize: '14px', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' },

    // --- TIMELINE STYLES ---
    timelineSection: { marginTop: '50px', borderTop: '2px dashed #E0E0E0', paddingTop: '30px' },
    timelineMainTitle: { fontSize: '18px', fontWeight: '800', color: '#37474F', marginBottom: '25px' },
    
    timelineItem: { display: 'flex', gap: '15px', marginBottom: '20px', position: 'relative' },
    
    timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' },
    timelineDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#B0BEC5', zIndex: 2, marginTop: '2px' },
    timelineDotRejected: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#C62828', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    timelineDotApproved: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    timelineLine: { width: '2px', flex: 1, backgroundColor: '#E0E0E0', marginTop: '5px', minHeight: '30px' },
    
    timelineContent: { flex: 1, paddingBottom: '20px', minWidth: '0' },
    timelineDate: { fontSize: '11px', color: '#90A4AE', fontWeight: '600', display: 'block', marginBottom: '4px' },
    timelineTitle: { fontSize: '14px', fontWeight: '700', color: '#455A64', margin: '0 0 4px 0' },
    timelineDesc: { fontSize: '13px', color: '#546E7A', marginTop: '2px', lineHeight: '1.4' },

    // REVIEW CARDS
    reviewCardRejected: { backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '20px', marginTop: '10px' },
    reviewCardApproved: { backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', padding: '20px', marginTop: '10px' },
    
    reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' },
    statusTitleApprovedInline: { fontSize: '12px', fontWeight: '900', color: '#2E7D32', textTransform: 'uppercase' },
    statusTitleRejectedInline: { fontSize: '12px', fontWeight: '900', color: '#C62828', textTransform: 'uppercase' },
    
    // RUBRICA
    rubricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' },
    rubricItem: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#555', fontWeight: '600' },
    
    // FEEDBACK SECTIONS
    feedbackSectionGreen: { backgroundColor: 'rgba(255,255,255,0.7)', padding: '12px', borderRadius: '6px', marginBottom: '10px', borderLeft: '3px solid #2E7D32' },
    feedbackTextGreen: { fontSize: '13px', color: '#1B5E20', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' },
    
    feedbackSectionYellow: { backgroundColor: 'rgba(255,255,255,0.7)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #EF6C00' },
    feedbackTextYellow: { fontSize: '13px', color: '#E65100', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' },

    reviewFeedbackBox: { backgroundColor: 'rgba(255,255,255,0.7)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#333', lineHeight: '1.5', fontStyle: 'italic', borderLeft: '3px solid #999' },

    // Sidebar
    sidebarCard: { backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    sidebarTitle: { margin: '0 0 15px 0', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', color: '#90A4AE', borderBottom: '1px solid #EEE', paddingBottom: '8px' },
    
    statusBoxApproved: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#E8F5E9', borderRadius: '8px', border: '1px solid #C8E6C9' },
    statusTitleApproved: { display: 'block', fontSize: '14px', fontWeight: '900', color: '#2E7D32', marginBottom: '2px' },
    
    statusBoxPending: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#FFF3E0', borderRadius: '8px', border: '1px solid #FFE0B2' },
    statusTitlePending: { display: 'block', fontSize: '14px', fontWeight: '900', color: '#EF6C00', marginBottom: '2px' },
    
    statusBoxRejected: { padding: '15px', backgroundColor: '#FFEBEE', borderRadius: '8px', border: '1px solid #FFCDD2' },
    statusTitleRejected: { fontSize: '13px', fontWeight: '900', color: '#C62828' },
    statusDesc: { fontSize: '11px', color: '#546E7A', margin: 0 },
    
    editButton: { marginTop: '15px', width: '100%', padding: '12px', backgroundColor: '#C62828', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 2px 5px rgba(198, 40, 40, 0.3)' },
    
    filePreview: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #BBDEFB' },
    fileIconBig: { backgroundColor: 'white', padding: '6px', borderRadius: '6px' },
    fileName: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#1565C0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    fileMeta: { fontSize: '10px', color: '#546E7A' },
    downloadBtn: { background: 'white', border: 'none', color: '#1565C0', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
};

export default VisualizarMinhaProducao;