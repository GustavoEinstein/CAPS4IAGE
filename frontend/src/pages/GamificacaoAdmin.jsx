import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Trophy, History, Plus, 
    TrendingUp, Award, User, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GamificacaoAdmin() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState({ conquistas_disponiveis: [], auditoria_xp: [] });
    
    const [novaConquista, setNovaConquista] = useState({
        nome: '', descricao: '', xp_bonus: 50, icone: 'award'
    });

    useEffect(() => {
        fetchDados();
    }, []);

    const fetchDados = async () => {
        try {
            const response = await api.get('api/admin/gamificacao/');
            setDados(response.data);
        } catch (err) {
            console.error("Erro ao carregar gestão", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBadge = async (e) => {
        e.preventDefault();
        try {
            await api.post('api/admin/gamificacao/', novaConquista);
            alert("Badge criada com sucesso!");
            fetchDados();
            setNovaConquista({ nome: '', descricao: '', xp_bonus: 50, icone: 'award' });
        } catch (err) {
            alert("Erro ao criar badge.");
        }
    };

    const handleDeleteBadge = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta badge?")) return;
        
        try {
            await api.delete(`api/admin/gamificacao/${id}/delete/`);
            fetchDados();
        } catch (err) {
            console.error("Erro ao excluir badge:", err);
            alert("Erro ao excluir badge.");
        }
    };

    if (loading) return <div style={styles.loading}>Carregando painel de elite...</div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <button onClick={() => navigate('/dashboard/central-admin')} style={styles.backBtn}>
                        <ArrowLeft size={18} /> Voltar à Central
                    </button>
                    <h1 style={styles.title}>Gestão do Hall da Fama</h1>
                    <p style={styles.subtitle}>Gerencie a economia de XP e medalhas da plataforma.</p>
                </header>

                <div style={styles.statsGrid}>
                    <StatCard icon={<Trophy color="#F59E0B" />} label="Total de Badges" value={dados.conquistas_disponiveis.length} />
                    <StatCard icon={<TrendingUp color="#10B981" />} label="Movimentações de XP" value={dados.auditoria_xp.length} />
                </div>

                <div style={styles.mainGrid}>
                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <History size={20} color="#1565C0" />
                            <h2 style={styles.sectionTitle}>Auditoria de XP</h2>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Professor</th>
                                        <th style={styles.th}>Ação</th>
                                        <th style={styles.th}>Valor</th>
                                        <th style={styles.th}>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.auditoria_xp.map((log, i) => (
                                        <tr key={i} style={styles.tr}>
                                            <td style={styles.td}><User size={14} style={{marginRight: 5}}/> {log.usuario}</td>
                                            <td style={styles.td}>{log.descricao}</td>
                                            <td style={{...styles.td, color: '#10B981', fontWeight: 'bold'}}>+{log.quantidade}</td>
                                            <td style={styles.td}>{log.data}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside style={styles.sidebar}>
                        <div style={styles.formCard}>
                            <div style={styles.sectionHeader}>
                                <Plus size={20} color="#1565C0" />
                                <h2 style={styles.sectionTitle}>Nova Badge</h2>
                            </div>
                            <form onSubmit={handleCreateBadge} style={styles.form}>
                                <input 
                                    style={styles.input} placeholder="Nome da Medalha" 
                                    value={novaConquista.nome} onChange={e => setNovaConquista({...novaConquista, nome: e.target.value})}
                                    required 
                                />
                                <textarea 
                                    style={styles.textarea} placeholder="Descrição..." 
                                    value={novaConquista.descricao} onChange={e => setNovaConquista({...novaConquista, descricao: e.target.value})}
                                    required
                                />
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>XP Bônus:</label>
                                    <input 
                                        type="number" style={styles.inputSmall} 
                                        value={novaConquista.xp_bonus} onChange={e => setNovaConquista({...novaConquista, xp_bonus: e.target.value})}
                                    />
                                </div>
                                <button type="submit" style={styles.submitBtn}>Criar Badge</button>
                            </form>
                        </div>

                        <div style={styles.listCard}>
                            <h3 style={styles.miniTitle}>Badges Ativas</h3>
                            {dados.conquistas_disponiveis.map(c => (
                                <div key={c.id} style={styles.badgeItem}>
                                    <Award size={18} color="#F59E0B" />
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{c.nome}</span>
                                        <small style={{ color: '#64748B' }}>{c.xp_bonus} XP</small>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDeleteBadge(c.id)}
                                        style={styles.deleteBtn}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                                            e.currentTarget.style.color = '#EF4444';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#94A3B8';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <div style={styles.statCard}>
        <div style={styles.statIcon}>{icon}</div>
        <div>
            <p style={styles.statLabel}>{label}</p>
            <h3 style={styles.statValue}>{value}</h3>
        </div>
    </div>
);

const styles = {
    wrapper: { backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', marginBottom: '15px', fontWeight: '600' },
    title: { fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: 0 },
    subtitle: { color: '#64748B', marginTop: '5px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #E2E8F0' },
    statIcon: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statLabel: { margin: 0, fontSize: '13px', color: '#64748B', fontWeight: '600' },
    statValue: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#0F172A' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' },
    section: { backgroundColor: 'white', borderRadius: '20px', padding: '25px', border: '1px solid #E2E8F0' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '12px', borderBottom: '2px solid #F1F5F9', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '12px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', color: '#475569' },
    tr: { transition: 'background 0.2s' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
    textarea: { padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '80px' },
    inputGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    label: { fontSize: '13px', color: '#64748B', fontWeight: '600' },
    inputSmall: { width: '80px', padding: '5px', borderRadius: '6px', border: '1px solid #E2E8F0' },
    submitBtn: { padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#1565C0', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    listCard: { backgroundColor: '#F1F5F9', padding: '15px', borderRadius: '12px' },
    miniTitle: { fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '10px', marginTop: 0 },
    badgeItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '8px' },
    
    // BOTÃO DE LIXEIRA (CLEAN)
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        color: '#94A3B8',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748B', fontWeight: 'bold' }
};