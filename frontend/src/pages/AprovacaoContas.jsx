import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
    ShieldCheck, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User, 
    Mail, 
    School, 
    BookOpen,
    Loader2
} from 'lucide-react';

const AprovacaoContas = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); 

    useEffect(() => {
        verificarAcesso();
    }, []);

    // --- NOVA TRAVA DE SEGURANÇA NO FRONTEND ---
    const verificarAcesso = async () => {
        try {
            const perfilRes = await api.get('api/user/me/');
            
            if (!perfilRes.data.is_superuser) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acesso Negado',
                    text: 'Você não tem privilégios de administrador para acessar esta página.',
                    confirmButtonColor: '#2563EB'
                });
                navigate('/dashboard');
                return;
            }

            // Se for superuser, permite carregar a lista
            carregarUsuarios();

        } catch (error) {
            console.error("Erro ao validar permissões", error);
            navigate('/dashboard');
        }
    };

    const carregarUsuarios = async () => {
        try {
            const response = await api.get('api/admin/pending-users/');
            setUsuarios(response.data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                Swal.fire('Erro!', 'Erro ao carregar lista de aprovação. Verifique sua conexão.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAcao = async (id, nome, acao) => {
        const result = await Swal.fire({
            title: `Confirmar Ação`,
            text: `Tem certeza que deseja marcar a conta de ${nome} como ${acao.toUpperCase()}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: acao === 'Aprovado' ? '#10B981' : '#EF4444',
            cancelButtonColor: '#94A3B8',
            confirmButtonText: `Sim, ${acao}!`,
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;
        
        setProcessingId(id);
        
        try {
            await api.post(`api/admin/approve-user/${id}/`, { acao: acao });
            
            // Remove o usuário aprovado/rejeitado da lista imediatamente
            setUsuarios(usuarios.filter(u => u.id !== id));
            
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: `Conta de ${nome} foi ${acao.toLowerCase()}.`,
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error("Erro ao aprovar/rejeitar:", error);
            Swal.fire('Erro!', 'Falha ao executar ação. Tente novamente.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <Loader2 size={32} color="#1565C0" className="spin" />
                <p style={{ color: '#546E7A', marginTop: '10px' }}>Verificando credenciais de segurança...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleArea}>
                    <ShieldCheck size={28} color="#1565C0" />
                    <h2 style={styles.title}>Aprovação de Contas</h2>
                </div>
                <div style={styles.badge}>
                    {usuarios.length} {usuarios.length === 1 ? 'pendente' : 'pendentes'}
                </div>
            </div>

            {usuarios.length === 0 ? (
                <div style={styles.emptyState}>
                    <Clock size={48} color="#90A4AE" style={{ marginBottom: '15px' }} />
                    <h3 style={styles.emptyTitle}>Tudo limpo por aqui!</h3>
                    <p style={styles.emptyText}>Não há nenhuma conta aguardando aprovação no momento.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Usuário</th>
                                <th style={styles.th}>Área / Disciplina</th>
                                <th style={styles.th}>Escola</th>
                                <th style={styles.th}>Data de Cadastro</th>
                                <th style={styles.th}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={styles.userName}>
                                                <User size={14} style={{ marginRight: '6px' }} /> 
                                                {u.nome}
                                            </span>
                                            <span style={styles.userEmail}>
                                                <Mail size={12} style={{ marginRight: '6px' }} />
                                                {u.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.infoBadge}>
                                            <BookOpen size={14} /> {u.disciplina}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '14px' }}>
                                            <School size={16} color="#64748B" /> {u.escola || 'Não informada'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ color: '#64748B', fontSize: '13px' }}>{u.data_cadastro}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionButtons}>
                                            <button 
                                                onClick={() => handleAcao(u.id, u.nome, 'Aprovado')} 
                                                disabled={processingId === u.id}
                                                style={{...styles.btnAprovar, opacity: processingId === u.id ? 0.6 : 1}}
                                            >
                                                <CheckCircle size={16} /> Aprovar
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleAcao(u.id, u.nome, 'Rejeitado')} 
                                                disabled={processingId === u.id}
                                                style={{...styles.btnRejeitar, opacity: processingId === u.id ? 0.6 : 1}}
                                            >
                                                <XCircle size={16} /> Rejeitar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
    
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    titleArea: { display: 'flex', alignItems: 'center', gap: '12px' },
    title: { color: '#1E293B', fontSize: '24px', fontWeight: '800', margin: 0 },
    badge: { backgroundColor: '#FEF08A', color: '#854D0E', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
    
    emptyState: { backgroundColor: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', border: '1px dashed #CBD5E1' },
    emptyTitle: { color: '#334155', fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
    emptyText: { color: '#64748B', fontSize: '14px', margin: 0 },
    
    tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHeader: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
    th: { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' },
    td: { padding: '16px', verticalAlign: 'middle' },
    
    userName: { display: 'flex', alignItems: 'center', color: '#0F172A', fontWeight: '600', fontSize: '14px', marginBottom: '4px' },
    userEmail: { display: 'flex', alignItems: 'center', color: '#64748B', fontSize: '12px' },
    
    infoBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F1F5F9', color: '#475569', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' },
    
    actionButtons: { display: 'flex', gap: '10px' },
    btnAprovar: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
    btnRejeitar: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }
};

export default AprovacaoContas;