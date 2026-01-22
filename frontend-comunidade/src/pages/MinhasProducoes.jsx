import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    FileText, 
    ClipboardCheck, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Eye,
    Calendar,
    Download
} from 'lucide-react';

// --- MOCK: PRODUÇÕES QUE EU (Ricardo/Filosofia) ENVIEI ---
const MOCK_ENVIADAS = [
    {
        id: "filosofia-01", // Linkado com a Home
        titulo: "Dilemas Éticos com IA na Sala de Aula",
        disciplina: "Filosofia",
        data_envio: "14/05/2024",
        status: "APROVADO",
        feedback: null
    },
    {
        id: "filosofia-11",
        titulo: "O Panóptico Digital: Foucault e Redes",
        disciplina: "Filosofia",
        data_envio: "Ontem",
        status: "PENDENTE",
        feedback: null
    },
    {
        id: "filosofia-old",
        titulo: "Simulação: O Mito da Caverna",
        disciplina: "Filosofia",
        data_envio: "20/04/2024",
        status: "REJEITADO",
        feedback: "A proposta pedagógica é válida, mas o roteiro técnico para a IA ficou vago. Especifique os prompts exatos para evitar alucinações sobre o texto original."
    }
];

// --- MOCK: REVISÕES QUE EU FIZ (Histórico) ---
const MOCK_REVISADAS = [
    {
        id: "rev-01",
        titulo_producao: "Lógica Aristotélica: Silogismos com IA",
        disciplina: "Filosofia",
        autor_anonimo: "Prof. Ensino Médio",
        data_revisao: "Hoje",
        meu_veredito: "APROVADO", 
    },
    {
        id: "rev-02",
        titulo_producao: "Estética: O Belo na Arte Generativa",
        disciplina: "Filosofia",
        autor_anonimo: "Prof. Universitário",
        data_revisao: "10/06/2024",
        meu_veredito: "REJEITADO",
    }
];

const MinhasAtividades = () => {
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };
    const [activeTab, setActiveTab] = useState('enviadas');

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.pageTitle}>Minhas Atividades</h1>
                    <p style={styles.pageSubtitle}>
                        Acompanhe o status das suas submissões e seu histórico de revisões.
                    </p>
                </div>

                {/* --- NAVEGAÇÃO POR ABAS --- */}
                <div style={styles.tabsContainer}>
                    <button 
                        style={activeTab === 'enviadas' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab('enviadas')}
                    >
                        <FileText size={18} />
                        Minhas Produções ({MOCK_ENVIADAS.length})
                    </button>
                    
                    <button 
                        style={activeTab === 'revisadas' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab('revisadas')}
                    >
                        <ClipboardCheck size={18} />
                        Histórico de Revisões ({MOCK_REVISADAS.length})
                    </button>
                </div>

                {/* --- CONTEÚDO DAS ABAS --- */}
                <div style={styles.contentArea}>
                    
                    {/* ABA 1: ENVIADAS */}
                    {activeTab === 'enviadas' && (
                        <div style={styles.list}>
                            {MOCK_ENVIADAS.map(item => (
                                <CardEnviada key={item.id} data={item} navigate={navigate} isMobile={isMobile} />
                            ))}
                        </div>
                    )}

                    {/* ABA 2: REVISADAS */}
                    {activeTab === 'revisadas' && (
                        <div style={styles.list}>
                            {MOCK_REVISADAS.map(item => (
                                <CardRevisada key={item.id} data={item} navigate={navigate} isMobile={isMobile} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CARD: PRODUÇÃO ENVIADA (Visualização + Status) ---
const CardEnviada = ({ data, navigate, isMobile }) => {
    const getStatusConfig = (status) => {
        switch(status) {
            case 'APROVADO': return { color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircle2 size={16} />, label: 'Aprovado', border: '#C8E6C9' };
            case 'REJEITADO': return { color: '#C62828', bg: '#FFEBEE', icon: <XCircle size={16} />, label: 'Rejeitado', border: '#FFCDD2' };
            default: return { color: '#F57C00', bg: '#FFF3E0', icon: <Clock size={16} />, label: 'Aguardando Revisão', border: '#FFE0B2' };
        }
    };

    const config = getStatusConfig(data.status);

    return (
        <div 
            style={styles.card}
            // Torna o card clicável para visualizar
            onClick={() => navigate(`/dashboard/producao/${data.id}`)}
        >
            <div style={styles.cardMain}>
                <div style={styles.cardHeader}>
                    <span style={styles.disciplineBadge}>{data.disciplina}</span>
                    <span style={styles.dateText}>
                        <Calendar size={12} style={{marginRight:4}}/> 
                        Enviado em: {data.data_envio}
                    </span>
                </div>
                
                <h3 style={styles.cardTitle}>{data.titulo}</h3>

                {/* Exibe o Feedback se foi rejeitado (Resultado da Revisão) */}
                {data.status === 'REJEITADO' && (
                    <div style={styles.feedbackBox}>
                        <AlertCircle size={16} color="#C62828" style={{minWidth: '16px', marginTop: '2px'}} />
                        <div>
                            <span style={{fontWeight: '700', fontSize: '12px', color: '#B71C1C'}}>MOTIVO DA REJEIÇÃO:</span>
                            <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#B71C1C'}}>"{data.feedback}"</p>
                        </div>
                    </div>
                )}
            </div>

            <div style={{...styles.cardStatusSide, borderLeft: isMobile ? 'none' : '1px solid #F0F0F0', paddingLeft: isMobile ? 0 : '20px', alignItems: isMobile ? 'flex-start' : 'flex-end', paddingTop: isMobile ? '15px' : 0}}>
                <div style={{...styles.statusBadge, backgroundColor: config.bg, color: config.color, borderColor: config.border}}>
                    {config.icon}
                    {config.label}
                </div>
                
                {/* Botão de Ação Única: Visualizar */}
                <div style={{marginTop: '15px'}}>
                    <button style={styles.actionButtonSecondary}>
                        <Eye size={14} /> Visualizar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CARD: MINHA REVISÃO (Histórico) ---
const CardRevisada = ({ data, navigate, isMobile }) => {
    const aprovou = data.meu_veredito === 'APROVADO';

    return (
        <div 
            style={styles.card}
            // Navega para a mesma tela de detalhes (simulando que o revisor pode rever o material)
            onClick={() => navigate(`/dashboard/producao/${data.id}`)}
        >
            <div style={styles.cardMain}>
                <div style={styles.cardHeader}>
                    <span style={{...styles.disciplineBadge, backgroundColor: '#ECEFF1', color: '#455A64'}}>
                        {data.disciplina}
                    </span>
                    <span style={styles.dateText}>Revisado em: {data.data_revisao}</span>
                </div>
                <h3 style={styles.cardTitle}>{data.titulo_producao}</h3>
                <p style={{fontSize: '13px', color: '#757575', margin: '5px 0 0 0'}}>
                    Autor: {data.autor_anonimo}
                </p>
            </div>

            <div style={{...styles.cardStatusSide, borderLeft: isMobile ? 'none' : '1px solid #F0F0F0', paddingLeft: isMobile ? 0 : '20px', alignItems: isMobile ? 'flex-start' : 'flex-end', paddingTop: isMobile ? '15px' : 0}}>
                <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                    <span style={{fontSize: '11px', color: '#90A4AE', textTransform: 'uppercase', fontWeight: 'bold'}}>Seu Veredito</span>
                    <div style={{
                        marginTop: '4px',
                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '14px',
                        color: aprovou ? '#2E7D32' : '#C62828'
                    }}>
                        {aprovou ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {aprovou ? "FAVORÁVEL" : "DESFAVORÁVEL"}
                    </div>
                </div>
                
                <div style={{marginTop: '15px'}}>
                    <button style={styles.actionButtonSecondary}>
                        <Eye size={14} /> Ver Material
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '30px 20px' },
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' },
    
    header: { marginBottom: '30px' },
    pageTitle: { fontSize: '28px', color: '#1565C0', fontWeight: '800', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '15px', color: '#546E7A', margin: 0 },

    // Tabs
    tabsContainer: { display: 'flex', gap: '10px', borderBottom: '1px solid #E0E0E0', marginBottom: '30px' },
    tabActive: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
        background: 'none', border: 'none', borderBottom: '3px solid #1565C0',
        color: '#1565C0', fontWeight: '700', cursor: 'pointer', fontSize: '14px'
    },
    tabInactive: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
        background: 'none', border: 'none', borderBottom: '3px solid transparent',
        color: '#757575', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
        opacity: 0.7, transition: 'opacity 0.2s'
    },

    list: { display: 'flex', flexDirection: 'column', gap: '15px' },

    // CARD
    card: {
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E0E0E0',
        padding: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
        gap: '20px', cursor: 'pointer', transition: 'all 0.2s ease'
    },
    cardMain: { flex: 1, minWidth: '250px' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
    disciplineBadge: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
    dateText: { fontSize: '12px', color: '#90A4AE', display: 'flex', alignItems: 'center' },
    cardTitle: { fontSize: '18px', fontWeight: '700', color: '#333', margin: '0 0 10px 0' },
    
    feedbackBox: {
        marginTop: '15px', backgroundColor: '#FFEBEE', padding: '12px',
        borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start',
        border: '1px solid #FFCDD2'
    },

    cardStatusSide: { display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '160px' },
    
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
        borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid'
    },
    
    actionButtonSecondary: {
        background: 'none', border: '1px solid #CFD8DC', color: '#546E7A', padding: '8px 14px',
        borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        transition: 'all 0.2s'
    }
};

export default MinhasAtividades;