import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    Users, 
    FileText, 
    MessageSquare, 
    Trash2, 
    ShieldAlert, 
    Eye, 
    Search,
    AlertTriangle,
    Activity
} from 'lucide-react';

export default function Admin() {
    const navigate = useNavigate();
    
    // Estados Gerais
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('usuarios');
    const [busca, setBusca] = useState('');
    
    // Dados
    const [usuarios, setUsuarios] = useState([]);
    const [producoes, setProducoes] = useState([]);
    const [topicos, setTopicos] = useState([]);
    const [estatisticas, setEstatisticas] = useState({ users: 0, prods: 0, forum: 0 });

    useEffect(() => {
        verificarPermissaoECarregar();
    }, []);

    // 1. VERIFICA SE É ADMIN E CARREGA TUDO
    const verificarPermissaoECarregar = async () => {
        try {
            // CORREÇÃO AQUI: A ROTA CORRETA É api/user/me/
            const perfilRes = await api.get('api/user/me/');
            
            if (!perfilRes.data.is_superuser) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acesso Negado',
                    text: 'Você não tem privilégios de administrador.',
                    confirmButtonColor: '#2563EB'
                });
                navigate('/dashboard');
                return;
            }

            // Se for admin, busca os dados das 3 áreas
            await buscarDados('usuarios');
            await buscarDados('producoes');
            await buscarDados('topicos');
            setLoading(false);

        } catch (error) {
            console.error("Erro ao validar admin", error);
            navigate('/dashboard');
        }
    };

    // 2. BUSCADOR DE DADOS
    const buscarDados = async (tipo) => {
        try {
            if (tipo === 'usuarios') {
                const res = await api.get('api/admin/users/');
                setUsuarios(res.data);
                setEstatisticas(prev => ({ ...prev, users: res.data.length }));
            } 
            else if (tipo === 'producoes') {
                const res = await api.get('api/admin/productions/');
                setProducoes(res.data);
                setEstatisticas(prev => ({ ...prev, prods: res.data.length }));
            } 
            else if (tipo === 'topicos') {
                const res = await api.get('api/admin/forum/');
                setTopicos(res.data);
                setEstatisticas(prev => ({ ...prev, forum: res.data.length }));
            }
        } catch (error) {
            console.error(`Erro ao buscar ${tipo}:`, error);
        }
    };

    // 3. FUNÇÕES DE EXCLUSÃO (Com SweetAlert de Confirmação Dupla)
    const handleDeletar = async (tipo, id, nome) => {
        const titulos = {
            'usuario': 'Excluir Usuário',
            'producao': 'Apagar Produção',
            'topico': 'Remover Tópico'
        };

        const endpoints = {
            'usuario': `api/admin/users/${id}/delete/`,
            'producao': `api/admin/productions/${id}/delete/`,
            'topico': `api/admin/forum/${id}/delete/`
        };

        const result = await Swal.fire({
            title: titulos[tipo],
            html: `Tem certeza que deseja excluir permanentemente <strong>${nome}</strong>?<br/>Esta ação não pode ser desfeita.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(endpoints[tipo]);
                Swal.fire('Excluído!', 'Registro apagado com sucesso.', 'success');
                
                // Recarrega apenas a aba afetada
                if (tipo === 'usuario') buscarDados('usuarios');
                if (tipo === 'producao') buscarDados('producoes');
                if (tipo === 'topico') buscarDados('topicos');
                
            } catch (error) {
                Swal.fire('Erro!', 'Ocorreu um erro ao tentar excluir.', 'error');
            }
        }
    };

    // 4. FILTROS DE BUSCA
    const usuariosFiltrados = usuarios.filter(u => u.username.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()));
    const producoesFiltradas = producoes.filter(p => p.titulo.toLowerCase().includes(busca.toLowerCase()));
    const topicosFiltrados = topicos.filter(t => t.titulo.toLowerCase().includes(busca.toLowerCase()));

    if (loading) return <div style={styles.loading}>Verificando credenciais e carregando painel...</div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                
                {/* CABEÇALHO ADMIN */}
                <div style={styles.header}>
                    <div style={styles.titleGroup}>
                        <div style={styles.iconCircleRed}>
                            <ShieldAlert size={28} color="#DC2626" />
                        </div>
                        <div>
                            <h1 style={styles.pageTitle}>Painel do Administrador</h1>
                            <p style={styles.pageSubtitle}>Controle absoluto sobre usuários, produções e fórum.</p>
                        </div>
                    </div>
                </div>

                {/* CARDS DE ESTATÍSTICAS */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard} onClick={() => setActiveTab('usuarios')}>
                        <div style={styles.statIcon}><Users size={24} color="#2563EB" /></div>
                        <div>
                            <p style={styles.statLabel}>Usuários Cadastrados</p>
                            <h3 style={styles.statNumber}>{estatisticas.users}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard} onClick={() => setActiveTab('producoes')}>
                        <div style={styles.statIcon}><FileText size={24} color="#10B981" /></div>
                        <div>
                            <p style={styles.statLabel}>Produções na Base</p>
                            <h3 style={styles.statNumber}>{estatisticas.prods}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard} onClick={() => setActiveTab('topicos')}>
                        <div style={styles.statIcon}><MessageSquare size={24} color="#8B5CF6" /></div>
                        <div>
                            <p style={styles.statLabel}>Tópicos no Fórum</p>
                            <h3 style={styles.statNumber}>{estatisticas.forum}</h3>
                        </div>
                    </div>
                </div>

                {/* ÁREA PRINCIPAL COM ABAS */}
                <div style={styles.mainContent}>
                    
                    {/* Barra de Ferramentas (Abas + Busca) */}
                    <div style={styles.toolbar}>
                        <div style={styles.tabs}>
                            <button 
                                style={activeTab === 'usuarios' ? styles.tabActive : styles.tabInactive}
                                onClick={() => {setActiveTab('usuarios'); setBusca('');}}
                            >
                                <Users size={18} /> Usuários
                            </button>
                            <button 
                                style={activeTab === 'producoes' ? styles.tabActive : styles.tabInactive}
                                onClick={() => {setActiveTab('producoes'); setBusca('');}}
                            >
                                <FileText size={18} /> Produções
                            </button>
                            <button 
                                style={activeTab === 'topicos' ? styles.tabActive : styles.tabInactive}
                                onClick={() => {setActiveTab('topicos'); setBusca('');}}
                            >
                                <MessageSquare size={18} /> Fórum
                            </button>
                        </div>
                        
                        <div style={styles.searchBox}>
                            <Search size={16} color="#94A3B8" />
                            <input 
                                type="text" 
                                placeholder={`Buscar em ${activeTab}...`} 
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                    </div>

                    {/* TABELA DE DADOS DINÂMICA */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                {activeTab === 'usuarios' && (
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Nome</th>
                                        <th style={styles.th}>E-mail</th>
                                        <th style={styles.th}>Disciplina</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                )}
                                {activeTab === 'producoes' && (
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Título</th>
                                        <th style={styles.th}>Autor</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Data</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                )}
                                {activeTab === 'topicos' && (
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Título</th>
                                        <th style={styles.th}>Autor</th>
                                        <th style={styles.th}>Categoria</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {/* RENDERIZAÇÃO: USUÁRIOS */}
                                {activeTab === 'usuarios' && usuariosFiltrados.map(u => (
                                    <tr key={u.id} style={styles.tr}>
                                        <td style={styles.td}>#{u.id}</td>
                                        <td style={styles.td}><strong>{u.username}</strong></td>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>{u.disciplina}</td>
                                        <td style={styles.td}>
                                            <span style={{...styles.statusBadge, backgroundColor: u.is_superuser ? '#FEF2F2' : '#F0FDF4', color: u.is_superuser ? '#DC2626' : '#16A34A'}}>
                                                {u.is_superuser ? 'Admin' : 'Ativo'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {!u.is_superuser && (
                                                <button onClick={() => handleDeletar('usuario', u.id, u.username)} style={styles.btnDelete}>
                                                    <Trash2 size={16} /> Excluir
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* RENDERIZAÇÃO: PRODUÇÕES */}
                                {activeTab === 'producoes' && producoesFiltradas.map(p => (
                                    <tr key={p.id} style={styles.tr}>
                                        <td style={styles.td}>#{p.id}</td>
                                        <td style={styles.td}><strong>{p.titulo}</strong></td>
                                        <td style={styles.td}>{p.autor}</td>
                                        <td style={styles.td}>{p.status}</td>
                                        <td style={styles.td}>{p.data}</td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button onClick={() => navigate(`/dashboard/producao/${p.id}`)} style={styles.btnView}>
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleDeletar('producao', p.id, p.titulo)} style={styles.btnDeleteIcon}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* RENDERIZAÇÃO: TÓPICOS DO FÓRUM */}
                                {activeTab === 'topicos' && topicosFiltrados.map(t => (
                                    <tr key={t.id} style={styles.tr}>
                                        <td style={styles.td}>#{t.id}</td>
                                        <td style={styles.td}><strong>{t.titulo}</strong></td>
                                        <td style={styles.td}>{t.autor}</td>
                                        <td style={styles.td}>{t.categoria}</td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button onClick={() => navigate(`/dashboard/forum/${t.id}`)} style={styles.btnView}>
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleDeletar('topico', t.id, t.titulo)} style={styles.btnDeleteIcon}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mensagens de Vazio */}
                        {activeTab === 'usuarios' && usuariosFiltrados.length === 0 && <p style={styles.emptyText}>Nenhum usuário encontrado.</p>}
                        {activeTab === 'producoes' && producoesFiltradas.length === 0 && <p style={styles.emptyText}>Nenhuma produção encontrada.</p>}
                        {activeTab === 'topicos' && topicosFiltrados.length === 0 && <p style={styles.emptyText}>Nenhum tópico encontrado.</p>}
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- ESTILOS ---
const styles = {
    wrapper: { backgroundColor: '#F1F5F9', minHeight: '100vh', padding: '30px 20px', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1200px', margin: '0 auto' },
    loading: { textAlign: 'center', padding: '100px', color: '#64748B', fontSize: '18px', fontWeight: '600' },
    
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    titleGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
    iconCircleRed: { width: '50px', height: '50px', backgroundColor: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    pageTitle: { margin: 0, fontSize: '28px', color: '#0F172A', fontWeight: '900' },
    pageSubtitle: { margin: '4px 0 0 0', color: '#64748B', fontSize: '15px' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    statIcon: { padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '10px' },
    statLabel: { margin: 0, fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statNumber: { margin: '5px 0 0 0', fontSize: '32px', color: '#0F172A', fontWeight: '900' },

    mainContent: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' },
    
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: '15px' },
    tabs: { display: 'flex', gap: '5px' },
    tabActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '20px', background: 'none', border: 'none', borderBottom: '3px solid #2563EB', color: '#2563EB', fontWeight: '700', cursor: 'pointer', fontSize: '15px' },
    tabInactive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '20px', background: 'none', border: 'none', borderBottom: '3px solid transparent', color: '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '15px', transition: 'color 0.2s' },
    
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', minWidth: '250px' },
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#334155' },

    tableContainer: { overflowX: 'auto', padding: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '12px 15px', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' },
    td: { padding: '15px', color: '#334155', fontSize: '14px', verticalAlign: 'middle' },
    
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
    
    btnDelete: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' },
    btnDeleteIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' },
    btnView: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', backgroundColor: '#F0F9FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' },
    
    emptyText: { textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '15px' }
};