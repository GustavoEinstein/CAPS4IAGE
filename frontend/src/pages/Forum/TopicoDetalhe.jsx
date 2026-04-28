import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Download, UserCircle, CheckCircle, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2'; 

export default function TopicoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [topico, setTopico] = useState(null);
    const [novoComentario, setNovoComentario] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [pausarPolling, setPausarPolling] = useState(false);

    useEffect(() => {
        carregarDetalhes();
        
        const intervalo = setInterval(() => { 
            if (!pausarPolling) {
                carregarDetalhes(); 
            }
        }, 5000);
        
        return () => clearInterval(intervalo);
    }, [id, pausarPolling]);

    const carregarDetalhes = async () => {
        try {
            const response = await api.get(`api/forum/topicos/${id}/`);
            setTopico(response.data);
        } catch (error) {
            navigate('/dashboard/forum');
        } finally {
            setLoading(false);
        }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!novoComentario.trim()) return;
        try {
            await api.post(`api/forum/topicos/${id}/`, { conteudo: novoComentario });
            setNovoComentario('');
            carregarDetalhes(); 
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: 'Erro ao enviar comentário.',
                confirmButtonColor: '#2563EB'
            });
        }
    };

    // --- RESOLVER TÓPICO COM SWEETALERT ---
    const handleResolver = async (e) => {
        e.preventDefault();
        
        const result = await Swal.fire({
            title: 'Marcar como resolvido?',
            text: "Deseja marcar esta discussão como resolvida? Isso impedirá novos comentários.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669', // Verde do botão original
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Sim, marcar como resolvido!',
            cancelButtonText: 'Cancelar'
        });

        if(result.isConfirmed) {
            try {
                await api.put(`api/forum/topicos/${id}/`);
                carregarDetalhes();
                Swal.fire({
                    icon: 'success',
                    title: 'Resolvido!',
                    text: 'O tópico foi marcado como resolvido.',
                    confirmButtonColor: '#2563EB',
                    timer: 2000
                });
            } catch (error) {
                Swal.fire('Erro!', 'Erro ao fechar o tópico.', 'error');
            }
        }
    };

    // --- EXCLUIR TÓPICO COM SWEETALERT ---
    const handleExcluir = async (e) => {
        e.preventDefault();
        setPausarPolling(true); 

        const result = await Swal.fire({
            title: 'Você tem certeza?',
            text: "Esta ação excluirá permanentemente o tópico e todos os seus comentários. Não é possível desfazer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626', // Vermelho do botão original
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Sim, excluir permanentemente!',
            cancelButtonText: 'Cancelar'
        });

        if(result.isConfirmed) {
            try {
                await api.delete(`api/forum/topicos/${id}/`);
                await Swal.fire({
                    icon: 'success',
                    title: 'Excluído!',
                    text: 'O tópico foi apagado com sucesso.',
                    confirmButtonColor: '#2563EB',
                    timer: 2000
                });
                navigate('/dashboard/forum'); 
            } catch (error) {
                Swal.fire('Erro!', 'Erro ao excluir tópico.', 'error');
                setPausarPolling(false); 
            }
        } else {
            setPausarPolling(false); 
        }
    };

    const calcularTempoAtras = (dataString) => {
        if (!dataString) return '';
        try {
            const [data, hora] = dataString.split(' ');
            const [dia, mes, ano] = data.split('/');
            const [h, m] = hora.split(':');
            const dataObj = new Date(ano, mes - 1, dia, h, m);
            const agora = new Date();
            const diffSegundos = Math.floor((agora - dataObj) / 1000);
            
            if (diffSegundos < 60) return 'agora mesmo';
            if (diffSegundos < 3600) return `há ${Math.floor(diffSegundos / 60)} min`;
            if (diffSegundos < 86400) return `há ${Math.floor(diffSegundos / 3600)}h`;
            if (diffSegundos < 604800) return `há ${Math.floor(diffSegundos / 86400)} dias`;
            return dataString; 
        } catch (e) { return dataString; }
    };

    if (loading && !topico) return <p style={{ padding: '20px' }}>Carregando a discussão...</p>;
    if (!topico) return null;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <button type="button" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Voltar para o Fórum
            </button>

            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '6px', textTransform: 'uppercase' }}>
                                {topico.categoria}
                            </span>
                            {topico.resolvido && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '6px' }}>
                                    <CheckCircle size={14} /> Tópico Resolvido
                                </span>
                            )}
                        </div>
                        <h1 style={{ marginTop: 0, color: '#0F172A', fontSize: '24px', marginBottom: '10px' }}>{topico.titulo}</h1>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Publicado por <strong>{topico.autor}</strong> {calcularTempoAtras(topico.data)}</p>
                    </div>

                    {topico.is_dono_topico && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {!topico.resolvido && (
                                <button type="button" onClick={handleResolver} style={{ padding: '8px 12px', backgroundColor: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={16} /> Marcar tópico como resolvido
                                </button>
                            )}
                            <button type="button" onClick={handleExcluir} style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Trash2 size={16} /> Excluir
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ color: '#334155', lineHeight: '1.6', marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                    <ReactMarkdown>{topico.conteudo}</ReactMarkdown>
                </div>
                
                {topico.arquivo && (
                    <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '6px', display: 'inline-block' }}>
                        <a href={topico.arquivo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <Download size={18} /> Baixar Material de Apoio.
                            </button>
                        </a>
                    </div>
                )}
            </div>

            <h3 style={{ color: '#1E293B', marginBottom: '15px' }}>Discussão ({topico.comentarios.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {topico.comentarios.map(comentario => (
                    <div key={comentario.id} style={{ backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '8px', border: comentario.is_autor_topico ? '1px solid #BFDBFE' : '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <UserCircle size={24} color={comentario.is_autor_topico ? "#2563EB" : "#64748B"} />
                            <span style={{ fontWeight: 'bold', color: '#334155' }}>{comentario.autor}</span>
                            {comentario.is_autor_topico && (
                                <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px' }}>AUTOR</span>
                            )}
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{calcularTempoAtras(comentario.data)}</span>
                        </div>
                        <div style={{ margin: 0, color: '#475569' }}>
                            <ReactMarkdown>{comentario.conteudo}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>

            {topico.resolvido ? (
                <div style={{ backgroundColor: '#F0FDF4', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#065F46', fontWeight: 'bold', border: '1px solid #A7F3D0' }}>
                    <CheckCircle size={24} style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0 }}>Esta discussão foi marcada como resolvida pelo autor e está fechada para novos comentários.</p>
                </div>
            ) : (
                <form onSubmit={handleComentar} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <h4 style={{ marginTop: 0 }}>Adicionar um comentário</h4>
                    <textarea 
                        value={novoComentario} 
                        onChange={(e) => setNovoComentario(e.target.value)} 
                        placeholder="Escreva sua sugestão ou dúvida..."
                        required 
                        rows="4" 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px', fontFamily: 'inherit' }} 
                    />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Enviar Comentário
                    </button>
                </form>
            )}
        </div>
    );
}