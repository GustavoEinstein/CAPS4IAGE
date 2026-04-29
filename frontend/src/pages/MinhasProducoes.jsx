import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Alert } from '../utils/alerts'; 
import { 
    FileText, 
    ClipboardCheck, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Eye, 
    Calendar, 
    Plus,
    User,
    Wrench,
    Edit3
} from 'lucide-react';

const MinhasProducoes = () => {
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };
    
    const [producoes, setProducoes] = useState([]);
    const [revisoes, setRevisoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('enviadas');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const resProd = await api.get('api/production/list/');
                setProducoes(resProd.data);

                try {
                    const resRev = await api.get('api/production/history/');
                    setRevisoes(resRev.data);
                } catch (e) {
                    setRevisoes([]); 
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                Alert.erro("Erro de Conexão", "Não foi possível carregar a sua lista de produções.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando...</div>;

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>Minhas Atividades</h1>
                        <p style={styles.pageSubtitle}>
                            Acompanhe o status das suas submissões e seu histórico de revisões.
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard/catalogar-producoes')} style={styles.newButton}>
                        <Plus size={16} style={{marginRight: '6px'}} /> Nova Produção
                    </button>
                </div>

                <div style={styles.tabsContainer}>
                    <button 
                        style={activeTab === 'enviadas' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab('enviadas')}
                    >
                        <FileText size={18} />
                        Minhas Produções ({producoes.length})
                    </button>
                    
                    <button 
                        style={activeTab === 'revisadas' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab('revisadas')}
                    >
                        <ClipboardCheck size={18} />
                        Histórico de Revisões ({revisoes.length})
                    </button>
                </div>

                <div style={styles.contentArea}>
                    {activeTab === 'enviadas' && (
                        <div style={styles.list}>
                            {producoes.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <FileText size={40} color="#CFD8DC" style={{marginBottom: '10px'}}/>
                                    <p style={{color: '#90A4AE'}}>Nenhuma produção encontrada.</p>
                                </div>
                            ) : (
                                producoes.map(item => (
                                    <CardProducao 
                                        key={item.id} 
                                        data={item} 
                                        navigate={navigate} 
                                        isMobile={isMobile} 
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'revisadas' && (
                        <div style={styles.list}>
                            {revisoes.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <ClipboardCheck size={40} color="#CFD8DC" style={{marginBottom: '10px'}}/>
                                    <p style={{color: '#90A4AE'}}>Nenhuma revisão realizada.</p>
                                </div>
                            ) : (
                                revisoes.map(item => (
                                    <CardHistorico 
                                        key={item.id} 
                                        data={item} 
                                        navigate={navigate} 
                                        isMobile={isMobile} 
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CardProducao = ({ data, navigate, isMobile }) => {
    const getStatusConfig = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('aprovado') || s.includes('publicado')) {
            return { color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircle2 size={16} />, label: 'Aprovado', border: '#C8E6C9' };
        }
        if (s.includes('rejeitado') || s.includes('correção')) {
            return { color: '#C62828', bg: '#FFEBEE', icon: <XCircle size={16} />, label: 'Rejeitado', border: '#FFCDD2' };
        }
        if (s.includes('rascunho')) {
            return { color: '#334155', bg: '#E2E8F0', icon: <Edit3 size={16} />, label: 'Rascunho Salvo', border: '#CBD5E1' };
        }
        return { color: '#F57C00', bg: '#FFF3E0', icon: <Clock size={16} />, label: 'Aguardando Revisão', border: '#FFE0B2' };
    };

    const config = getStatusConfig(data.status);
    const isRejected = config.label === 'Rejeitado';
    const isDraft = config.label === 'Rascunho Salvo'; 

    const rejectionMessage = (() => {
        const raw = data.feedback_revisor || "";
        if (!raw) return null;
        if (raw.includes("SUGESTÕES DE MELHORIA:")) return raw.split("SUGESTÕES DE MELHORIA:")[1].trim();
        if (raw.includes("PONTOS FORTES:")) return null; 
        return raw;
    })();

    return (
        <div 
            style={{
                ...styles.card,
                backgroundColor: isDraft ? '#F1F5F9' : '#FFFFFF', 
                // --- BORDAS SÓLIDAS APLICADAS AQUI ---
                border: isDraft ? '1px solid #94A3B8' : '1px solid #E0E0E0',
            }} 
            onClick={() => navigate(isDraft ? `/dashboard/editar-producao/${data.id}` : `/dashboard/minha-producao/${data.id}`)}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = isDraft ? '#64748B' : '#BBDEFB';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = isDraft ? '#94A3B8' : '#E0E0E0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)';
            }}
        >
            <div style={styles.cardMain}>
                <div style={styles.cardHeader}>
                    <span style={{...styles.disciplineBadge, opacity: isDraft ? 0.6 : 1}}>
                        {data.disciplina || "Geral"}
                    </span>
                    <span style={styles.dateText}>
                        <Calendar size={12} style={{marginRight:4}}/> Salvo em: {data.data || "Hoje"}
                    </span>
                </div>
                
                <h3 style={{...styles.cardTitle, color: isDraft ? '#475569' : '#333'}}>
                    {data.titulo || "(Rascunho sem título)"}
                </h3>
                
                {isRejected && rejectionMessage && (
                    <div style={styles.feedbackBox}>
                        <div style={styles.feedbackHeader}>
                            <AlertCircle size={16} style={{marginTop: '0px'}} />
                            MOTIVO DA REJEIÇÃO:
                        </div>
                        <p style={styles.feedbackText}>"{rejectionMessage}"</p>
                    </div>
                )}
            </div>

            <div style={{
                ...styles.cardStatusSide, 
                // --- LINHA DIVISÓRIA SÓLIDA AQUI ---
                borderLeft: isMobile ? 'none' : '1px solid #CBD5E1', 
                paddingLeft: isMobile ? 0 : '20px', 
                alignItems: isMobile ? 'flex-start' : 'flex-end', 
                paddingTop: isMobile ? '15px' : 0
            }}>
                <div style={{...styles.statusBadge, backgroundColor: config.bg, color: config.color, borderColor: config.border}}>
                    {config.icon} {config.label}
                </div>
                
                <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', width: isMobile ? '100%' : 'auto'}}>
                    
                    {isRejected && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/editar-producao/${data.id}`);
                            }}
                            style={styles.actionButtonEdit}
                        >
                            <Wrench size={12} /> EDITAR E REENVIAR
                        </button>
                    )}

                    {isDraft ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/editar-producao/${data.id}`);
                            }}
                            style={styles.actionButtonDraft}
                        >
                            <Edit3 size={14} /> Continuar Editando
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/minha-producao/${data.id}`);
                            }}
                            style={styles.actionButtonSecondary}
                        >
                            <Eye size={14} /> Visualizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CardHistorico = ({ data, navigate, isMobile }) => {
    const aprovou = data.meu_veredito && data.meu_veredito.toUpperCase().includes('APROVADO');

    return (
        <div 
            style={styles.card} 
            onClick={() => navigate(`/dashboard/producao/${data.id}`)}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#BBDEFB';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)';
            }}
        >
            <div style={styles.cardMain}>
                <div style={styles.cardHeader}>
                    <span style={{...styles.disciplineBadge, backgroundColor: '#ECEFF1', color: '#455A64'}}>
                        {data.disciplina}
                    </span>
                    <span style={styles.dateText}>Revisado em: {data.data_revisao}</span>
                </div>
                <h3 style={styles.cardTitle}>{data.titulo}</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#757575', marginTop: '5px'}}>
                    <User size={14} /> Autor: {data.autor_anonimo || "Anônimo"}
                </div>
            </div>

            <div style={{...styles.cardStatusSide, borderLeft: isMobile ? 'none' : '1px solid #F0F0F0', paddingLeft: isMobile ? 0 : '20px', alignItems: isMobile ? 'flex-start' : 'flex-end', paddingTop: isMobile ? '15px' : 0}}>
                <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                    <span style={{fontSize: '10px', color: '#90A4AE', textTransform: 'uppercase', fontWeight: '800'}}>SEU PARECER</span>
                    <div style={{
                        marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px',
                        color: aprovou ? '#2E7D32' : '#C62828'
                    }}>
                        {aprovou ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {aprovou ? "FAVORÁVEL" : "DESFAVORÁVEL"}
                    </div>
                </div>
                <div style={{marginTop: '15px'}}>
                    <button style={styles.actionButtonSecondary}>
                        <Eye size={14} /> Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '30px 20px' },
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' },
    
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
    pageTitle: { fontSize: '28px', color: '#1565C0', fontWeight: '800', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '15px', color: '#546E7A', margin: 0 },
    
    newButton: { backgroundColor: '#1565C0', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)', transition: 'transform 0.2s', fontSize: '14px' },

    tabsContainer: { display: 'flex', gap: '10px', borderBottom: '1px solid #E0E0E0', marginBottom: '30px' },
    tabActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'none', border: 'none', borderBottom: '3px solid #1565C0', color: '#1565C0', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
    tabInactive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'none', border: 'none', borderBottom: '3px solid transparent', color: '#757575', fontWeight: '600', cursor: 'pointer', fontSize: '14px', opacity: 0.7, transition: 'opacity 0.2s' },

    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    emptyState: { padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #DDD' },

    card: {
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        borderRadius: '12px',
        padding: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
        gap: '20px', cursor: 'pointer', transition: 'all 0.2s ease'
    },
    cardMain: { flex: 1, minWidth: '250px' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
    disciplineBadge: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    dateText: { fontSize: '12px', color: '#90A4AE', display: 'flex', alignItems: 'center' },
    
    cardTitle: { 
        fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0',
        wordBreak: 'break-word', overflowWrap: 'break-word' 
    },
    
    feedbackBox: {
        marginTop: '15px', 
        backgroundColor: '#FFEBEE', 
        padding: '15px', 
        borderRadius: '8px', 
        border: '1px solid #FFCDD2',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    feedbackHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: '900',
        color: '#B71C1C', 
        textTransform: 'uppercase'
    },
    feedbackText: {
        fontSize: '14px',
        color: '#C62828',
        margin: 0,
        lineHeight: '1.5',
        wordBreak: 'break-word', 
        overflowWrap: 'break-word'
    },

    cardStatusSide: { display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '160px' },
    statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid' },
    
    actionButtonSecondary: { background: '#FFFFFF', border: '1px solid #CFD8DC', color: '#546E7A', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', width: '100%' },
    actionButtonDraft: { backgroundColor: '#1E293B', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    
    actionButtonEdit: {
        backgroundColor: '#C62828', 
        border: '1px solid #B71C1C', 
        color: 'white', 
        padding: '6px 12px', 
        borderRadius: '20px', 
        cursor: 'pointer', 
        fontSize: '11px', 
        fontWeight: '800', 
        textTransform: 'uppercase', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '6px', 
        transition: 'all 0.2s',
        width: '100%',
        boxShadow: 'none' 
    }
};

export default MinhasProducoes;