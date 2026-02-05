import React, { useState, useEffect } from 'react';
import api from '../services/api'; // <--- API REAL
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, Clock, Bot, BookOpen, CheckCircle2,
    XCircle, AlertCircle, Wrench, Lightbulb, Target, Download, FileText, User,
    Bookmark, ShieldCheck, Package // <--- ADICIONADO AQUI!
} from 'lucide-react';

const DetalharProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false); // Estado local para botão de salvar

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Busca os dados REAIS do backend (Histórico ou Feed)
                const response = await api.get(`api/production/${id}/`);
                console.log("Dados da Produção:", response.data); 
                setData(response.data);
            } catch (error) {
                console.error("Erro ao carregar:", error);
                alert("Erro ao carregar a produção. Verifique sua conexão.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) fetchDetails();
    }, [id, navigate]);

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando detalhes...</div>;
    if (!data) return null;

    // --- CONFIGURAÇÃO DE STATUS ---
    // Verifica se está aprovado ou rejeitado para exibir o badge correto
    const isRejected = data.status && (data.status.toLowerCase().includes('rejeitado') || data.status.toLowerCase().includes('correção'));
    const isApproved = data.status && (data.status.toLowerCase().includes('aprovado') || data.status.toLowerCase().includes('publicado'));

    // Feedback do Revisor
    const rejectionMessage = (() => {
        const raw = data.feedback_revisor || "";
        if (!raw) return null;
        if (raw.includes("SUGESTÕES DE MELHORIA:")) {
            return raw.split("SUGESTÕES DE MELHORIA:")[1].trim();
        }
        if (raw.includes("PONTOS FORTES:")) return null; 
        return raw;
    })();

    // Cores Dinâmicas por Disciplina
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

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <ArrowLeft size={18} /> Voltar
                </button>

                <div style={styles.grid}>
                    {/* --- ESQUERDA: CONTEÚDO --- */}
                    <div style={styles.columnContent}>
                        <div style={styles.materialCard}>
                            
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
                                    <span style={styles.dateText}><User size={14} /> Autor: {data.autor || "Anônimo"}</span>
                                </div>
                            </div>

                            <div style={styles.techSheet}>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Wrench size={18} color={theme.main} /></div>
                                    <div><span style={{...styles.techLabel, color: theme.main}}>Metodologia</span><span style={styles.techValue}>{data.metodologia || '-'}</span></div>
                                </div>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Clock size={18} color={theme.main} /></div>
                                    <div><span style={{...styles.techLabel, color: theme.main}}>Duração</span><span style={styles.techValue}>{data.duracao || '-'}</span></div>
                                </div>
                                <div style={styles.techItem}>
                                    <div style={styles.iconCircle}><Package size={18} color={theme.main} /></div>
                                    <div><span style={{...styles.techLabel, color: theme.main}}>Recursos</span><span style={styles.techValue}>{data.recursos || '-'}</span></div>
                                </div>
                            </div>

                            <div style={styles.bnccBox}>
                                <h4 style={styles.bnccTitle}><BookOpen size={16}/> Alinhamento BNCC</h4>
                                <p style={styles.bnccText}>{data.bncc}</p>
                            </div>

                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}><Lightbulb size={20} color="#F57C00"/> Relato de Experiência</h3>
                                <div style={styles.textBody}>{data.experiencia}</div>
                            </div>

                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}><Target size={20} color="#2E7D32"/> Resultados</h3>
                                <div style={styles.resultsBox}>{data.resultados}</div>
                            </div>
                        </div>
                    </div>

                    {/* --- DIREITA: STATUS, DOWNLOAD E AÇÕES --- */}
                    <div style={styles.columnSidebar}>
                        
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>Status do Material</h3>

                            {isApproved && (
                                <div style={styles.statusBoxApproved}>
                                    <ShieldCheck size={24} color="#2E7D32" />
                                    <div>
                                        <span style={styles.statusTitleApproved}>APROVADO</span>
                                        <p style={styles.statusDesc}>Validado pela comunidade.</p>
                                    </div>
                                </div>
                            )}

                            {!isApproved && !isRejected && (
                                <div style={styles.statusBoxPending}>
                                    <Clock size={24} color="#EF6C00" />
                                    <div>
                                        <span style={styles.statusTitlePending}>EM ANÁLISE</span>
                                        <p style={styles.statusDesc}>Aguardando revisão.</p>
                                    </div>
                                </div>
                            )}

                            {isRejected && (
                                <div style={styles.statusBoxRejected}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                                        <XCircle size={20} color="#C62828" />
                                        <span style={styles.statusTitleRejected}>REJEITADO</span>
                                    </div>
                                    {rejectionMessage && (
                                        <div style={styles.feedbackBox}>
                                            <div style={styles.feedbackHeader}>
                                                <AlertCircle size={14} style={{marginTop: '1px'}} /> MOTIVO:
                                            </div>
                                            <p style={styles.feedbackText}>"{rejectionMessage}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={styles.divider}></div>

                            <h3 style={styles.sidebarTitle}>Downloads</h3>
                            {data.arquivo ? (
                                <>
                                    <div style={styles.filePreview}>
                                        <div style={styles.fileIconBig}><FileText size={24} color="#1565C0" /></div>
                                        <div style={{flex:1, overflow:'hidden'}}>
                                            <span style={styles.fileName}>Material Didático</span>
                                            <span style={styles.fileMeta}>Baixar arquivo</span>
                                        </div>
                                    </div>
                                    <a href={data.arquivo} download target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                                        <button style={styles.downloadBtn}>
                                            <Download size={18} /> Baixar Roteiro
                                        </button>
                                    </a>
                                </>
                            ) : (
                                <p style={{fontSize: '13px', color: '#999', fontStyle: 'italic'}}>Nenhum arquivo anexado.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS PADRONIZADOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F0F2F5', minHeight: '100vh', width: '100%', boxSizing: 'border-box', paddingTop: '20px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' },
    backButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#546E7A', fontWeight: '700', marginBottom: '15px' },
    grid: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
    columnContent: { flex: 1, minWidth: '0' },
    columnSidebar: { width: '320px', position: 'sticky', top: '20px' },

    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' },
    headerSection: { marginBottom: '20px', borderBottom: '1px solid #F0F0F0', paddingBottom: '15px' },
    badgesRow: { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    badgeNeutral: { backgroundColor: '#F5F5F5', color: '#616161', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    
    // Word-break para títulos longos
    title: { fontSize: '24px', fontWeight: '800', color: '#1A237E', margin: '0 0 8px 0', lineHeight: '1.2', wordBreak: 'break-word', overflowWrap: 'break-word' },
    metaRow: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' },
    iaTag: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#546E7A', backgroundColor: '#F5F5F5', padding: '4px 8px', borderRadius: '6px' },
    dateText: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#90A4AE' },

    techSheet: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' },
    techItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
    iconCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    techLabel: { display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', color: '#90A4AE', marginBottom: '2px' },
    techValue: { fontSize: '13px', color: '#37474F', fontWeight: '600' },

    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '6px', marginBottom: '30px' },
    bnccTitle: { margin: '0 0 5px 0', fontSize: '12px', color: '#EF6C00', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' },
    bnccText: { margin: 0, fontSize: '14px', color: '#3E2723', lineHeight: '1.5', wordBreak: 'break-word', overflowWrap: 'break-word' },
    
    section: { marginBottom: '30px' },
    sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#37474F', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
    textBody: { fontSize: '15px', lineHeight: '1.6', color: '#455A64', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
    resultsBox: { backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '8px', border: '1px solid #C8E6C9', color: '#1B5E20', fontSize: '14px', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' },

    sidebarCard: { backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    sidebarTitle: { margin: '0 0 15px 0', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', color: '#90A4AE', borderBottom: '1px solid #EEE', paddingBottom: '8px' },

    statusBoxApproved: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#E8F5E9', borderRadius: '8px', border: '1px solid #C8E6C9' },
    statusTitleApproved: { display: 'block', fontSize: '14px', fontWeight: '900', color: '#2E7D32', marginBottom: '2px' },
    
    statusBoxPending: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#FFF3E0', borderRadius: '8px', border: '1px solid #FFE0B2' },
    statusTitlePending: { display: 'block', fontSize: '14px', fontWeight: '900', color: '#EF6C00', marginBottom: '2px' },
    
    statusBoxRejected: { padding: '15px', backgroundColor: '#FFEBEE', borderRadius: '8px', border: '1px solid #FFCDD2' },
    statusTitleRejected: { fontSize: '13px', fontWeight: '900', color: '#C62828' },
    statusDesc: { fontSize: '11px', color: '#546E7A', margin: 0 },

    feedbackBox: { marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #C62828' },
    feedbackHeader: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '900', color: '#B71C1C', textTransform: 'uppercase', marginBottom: '4px' },
    feedbackText: { fontSize: '13px', color: '#C62828', margin: 0, lineHeight: '1.4', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' },

    divider: { height: '1px', backgroundColor: '#EEE', margin: '20px 0' },

    filePreview: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #BBDEFB', marginBottom: '15px' },
    fileIconBig: { backgroundColor: 'white', padding: '6px', borderRadius: '6px' },
    fileName: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#1565C0' },
    fileMeta: { fontSize: '10px', color: '#546E7A' },
    downloadBtn: { width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' },
    actionIconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
};

export default DetalharProducao;