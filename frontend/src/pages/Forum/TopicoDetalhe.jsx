import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Download, CheckCircle, Trash2, Loader2, Send } from 'lucide-react';
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
            confirmButtonColor: '#059669', 
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
            confirmButtonColor: '#DC2626', 
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

    // --- LÓGICA DE CORES DAS TAGS ---
    const getCategoriaStyle = (cat) => {
        const catStyles = {
            'Dúvida BNCC': { bg: '#DBEAFE', color: '#1E40AF' }, 
            'Metodologia': { bg: '#FEF3C7', color: '#B45309' }, 
            'Uso de IA': { bg: '#F3E8FF', color: '#6B21A8' },   
            'Sugestão': { bg: '#DCFCE7', color: '#047857' },    
            'Geral': { bg: '#F1F5F9', color: '#475569' }        
        };
        return catStyles[cat] || catStyles['Geral'];
    };

    if (loading && !topico) return (
        <div style={styles.loadingContainer}>
            <Loader2 size={32} color="#2563EB" className="spin" />
            <p style={{ marginTop: '10px', color: '#64748B' }}>Carregando discussão...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
    
    if (!topico) return null;

    const catStyle = getCategoriaStyle(topico.categoria);
    const authorInitial = topico.autor ? topico.autor.charAt(0).toUpperCase() : 'P';

    return (
        <div style={styles.container}>
            <button type="button" onClick={() => navigate(-1)} style={styles.btnVoltar}>
                <ArrowLeft size={16} /> Voltar para o Fórum
            </button>

            {/* --- CABEÇALHO DO TÓPICO --- */}
            <div style={styles.topicCard}>
                <div style={styles.topicHeaderRow}>
                    <div style={{ flex: 1 }}>
                        <div style={styles.tagsContainer}>
                            <span style={{ ...styles.tag, backgroundColor: catStyle.bg, color: catStyle.color }}>
                                {topico.categoria}
                            </span>
                            {topico.resolvido && (
                                <span style={styles.tagResolved}>
                                    <CheckCircle size={14} /> Tópico Resolvido
                                </span>
                            )}
                        </div>
                        
                        <h1 style={styles.topicTitle}>{topico.titulo}</h1>
                        
                        <div style={styles.authorInfo}>
                            <div style={styles.avatarMini}>{authorInitial}</div>
                            <span>Publicado por Prof. <strong>{topico.autor}</strong> • {calcularTempoAtras(topico.data)}</span>
                        </div>
                    </div>

                    {/* AÇÕES DO DONO DO TÓPICO */}
                    {topico.is_dono_topico && (
                        <div style={styles.actionButtons}>
                            {!topico.resolvido && (
                                <button type="button" onClick={handleResolver} style={styles.btnResolve}>
                                    <CheckCircle size={16} /> Resolver
                                </button>
                            )}
                            <button type="button" onClick={handleExcluir} style={styles.btnDelete}>
                                <Trash2 size={16} /> Excluir
                            </button>
                        </div>
                    )}
                </div>

                <div style={styles.markdownContent}>
                    <ReactMarkdown>{topico.conteudo}</ReactMarkdown>
                </div>
                
                {topico.arquivo && (
                    <div style={styles.attachmentBox}>
                        <a href={topico.arquivo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button type="button" style={styles.btnDownload}>
                                <Download size={18} /> Baixar Material de Apoio
                            </button>
                        </a>
                    </div>
                )}
            </div>

            <h3 style={styles.commentsSectionTitle}>Discussão ({topico.comentarios.length})</h3>
            
            {/* --- LISTA DE COMENTÁRIOS --- */}
            <div style={styles.commentsList}>
                {topico.comentarios.map(comentario => {
                    const commentInitial = comentario.autor ? comentario.autor.charAt(0).toUpperCase() : 'U';
                    
                    return (
                        <div key={comentario.id} style={{ ...styles.commentCard, borderColor: comentario.is_autor_topico ? '#BFDBFE' : '#E2E8F0', backgroundColor: comentario.is_autor_topico ? '#EFF6FF' : '#F8FAFC' }}>
                            <div style={styles.commentHeader}>
                                <div style={{...styles.avatarMini, backgroundColor: comentario.is_autor_topico ? '#2563EB' : '#E2E8F0', color: comentario.is_autor_topico ? 'white' : '#475569'}}>
                                    {commentInitial}
                                </div>
                                <span style={styles.commentAuthor}>{comentario.autor}</span>
                                {comentario.is_autor_topico && (
                                    <span style={styles.badgeAuthor}>AUTOR</span>
                                )}
                                <span style={styles.commentTime}>{calcularTempoAtras(comentario.data)}</span>
                            </div>
                            <div style={styles.commentBody}>
                                <ReactMarkdown>{comentario.conteudo}</ReactMarkdown>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* --- ÁREA DE RESPOSTA --- */}
            {topico.resolvido ? (
                <div style={styles.resolvedNotice}>
                    <CheckCircle size={28} style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '15px' }}>Esta discussão foi marcada como resolvida pelo autor e está fechada para novos comentários.</p>
                </div>
            ) : (
                <form onSubmit={handleComentar} style={styles.commentForm}>
                    <h4 style={styles.formTitle}>Adicionar um comentário</h4>
                    <textarea 
                        value={novoComentario} 
                        onChange={(e) => setNovoComentario(e.target.value)} 
                        placeholder="Escreva sua sugestão ou dúvida..."
                        required 
                        rows="4" 
                        style={styles.textArea} 
                    />
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <button type="submit" style={styles.btnSubmitComment}>
                            <Send size={16} /> Enviar Comentário
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// --- ESTILOS ---
const styles = {
    container: { padding: '30px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
    
    btnVoltar: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', marginBottom: '25px', fontWeight: '600', fontSize: '14px', transition: 'color 0.2s' },
    
    // Tópico Principal
    topicCard: { backgroundColor: '#fff', padding: '35px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    topicHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
    tagsContainer: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' },
    tag: { fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tagResolved: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#059669', backgroundColor: '#D1FAE5', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' },
    topicTitle: { margin: '0 0 15px 0', color: '#0F172A', fontSize: '28px', fontWeight: '900', lineHeight: '1.2' },
    authorInfo: { display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', fontSize: '14px' },
    avatarMini: { width: '28px', height: '28px', backgroundColor: '#E2E8F0', color: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' },
    
    // Ações do Dono
    actionButtons: { display: 'flex', gap: '10px' },
    btnResolve: { padding: '8px 14px', backgroundColor: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'filter 0.2s' },
    btnDelete: { padding: '8px 14px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'filter 0.2s' },
    
    // Conteúdo
    markdownContent: { color: '#334155', lineHeight: '1.8', marginTop: '25px', borderTop: '1px solid #E2E8F0', paddingTop: '25px', fontSize: '16px' },
    attachmentBox: { marginTop: '30px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '10px', display: 'inline-block', border: '1px dashed #CBD5E1' },
    btnDownload: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
    
    // Comentários
    commentsSectionTitle: { color: '#1E293B', marginBottom: '20px', fontSize: '20px', fontWeight: '800' },
    commentsList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' },
    commentCard: { padding: '20px', borderRadius: '12px', border: '1px solid' },
    commentHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    commentAuthor: { fontWeight: '700', color: '#1E293B', fontSize: '15px' },
    badgeAuthor: { fontSize: '10px', fontWeight: '800', backgroundColor: '#BFDBFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.5px' },
    commentTime: { fontSize: '12px', color: '#94A3B8' },
    commentBody: { margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '15px' },
    
    // Área de Resposta
    resolvedNotice: { backgroundColor: '#F0FDF4', padding: '30px', borderRadius: '12px', textAlign: 'center', color: '#065F46', fontWeight: '600', border: '1px solid #A7F3D0' },
    commentForm: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    formTitle: { marginTop: 0, marginBottom: '15px', color: '#0F172A', fontSize: '18px', fontWeight: '800' },
    textArea: { width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #CBD5E1', marginBottom: '15px', fontFamily: 'inherit', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
    btnSubmitComment: { padding: '12px 24px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }
};