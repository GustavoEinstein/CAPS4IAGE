import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { MessageSquare, PlusCircle, Paperclip, CheckCircle, Filter, Search, ChevronDown } from 'lucide-react';

export default function Forum() {
    const [topicos, setTopicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Estados de Filtro e Busca
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [busca, setBusca] = useState(''); 
    const categoriasDisponiveis = ['Todas', 'Dúvida BNCC', 'Metodologia', 'Uso de IA', 'Sugestão', 'Geral'];

    // Estados do Formulário
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [categoria, setCategoria] = useState('Geral');
    const [arquivo, setArquivo] = useState(null);

    useEffect(() => {
        carregarTopicos();
    }, []);

    const carregarTopicos = async () => {
        try {
            const response = await api.get('/api/forum/topicos/');
            setTopicos(response.data);
        } catch (error) {
            console.error("Erro ao buscar tópicos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCriarTopico = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('conteudo', conteudo);
        formData.append('categoria', categoria);
        if (arquivo) formData.append('arquivo', arquivo);

        try {
            await api.post('api/forum/topicos/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setTitulo(''); setConteudo(''); setCategoria('Geral'); setArquivo(null);
            carregarTopicos(); 
        } catch (error) {
            alert("Erro ao criar o tópico.");
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
        } catch (e) {
            return dataString;
        }
    };

    // Lógica combinada: Categoria + Busca por título
    const topicosFiltrados = topicos.filter(t => {
        const matchCategoria = filtroCategoria === 'Todas' || t.categoria === filtroCategoria;
        const matchBusca = t.titulo.toLowerCase().includes(busca.toLowerCase());
        return matchCategoria && matchBusca;
    });

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#1E293B' }}>Fórum de Rascunhos e Dúvidas</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    <PlusCircle size={18} /> Novo Tópico
                </button>
            </div>

            {/* BARRA DE FERRAMENTAS */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                
                {/* Busca */}
                <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar discussão pelo título..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ width: '100%', padding: '12px 15px 12px 42px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Dropdown de Categorias */}
                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <select 
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 40px 12px 42px', 
                            borderRadius: '8px', 
                            border: '1px solid #CBD5E1', 
                            appearance: 'none', 
                            backgroundColor: '#fff', 
                            fontSize: '15px', 
                            color: '#334155',
                            cursor: 'pointer',
                            outline: 'none',
                            fontWeight: '500'
                        }}
                    >
                        {categoriasDisponiveis.map(cat => (
                            <option key={cat} value={cat}>{cat === 'Todas' ? 'Todas as Categorias' : cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                </div>
            </div>

            {loading ? (
                <p>Carregando discussões...</p>
            ) : topicosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                    <p style={{ color: '#64748B', margin: 0 }}>Nenhum tópico encontrado.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {topicosFiltrados.map(topico => (
                        <Link to={`/dashboard/forum/${topico.id}`} key={topico.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
                                 onMouseOver={(e) => e.currentTarget.style.borderColor = '#93C5FD'}
                                 onMouseOut={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                            >
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', backgroundColor: '#F1F5F9', color: '#475569', borderRadius: '6px', textTransform: 'uppercase' }}>
                                        {topico.categoria}
                                    </span>
                                    {topico.resolvido && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 8px', borderRadius: '6px' }}>
                                            <CheckCircle size={14} /> Resolvido
                                        </span>
                                    )}
                                </div>

                                <h3 style={{ margin: '0', color: '#0F172A', fontSize: '18px' }}>{topico.titulo}</h3>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginTop: '5px' }}>
                                    <span>Por Prof. <strong>{topico.autor}</strong> ({topico.disciplina_autor}) • {calcularTempoAtras(topico.data)}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                                        <MessageSquare size={16} /> {topico.total_comentarios} Respostas
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal de Criação */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0F172A' }}>Criar Nova Discussão</h3>
                        <form onSubmit={handleCriarTopico}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Categoria</label>
                                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}>
                                    {categoriasDisponiveis.filter(c => c !== 'Todas').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Título</label>
                                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Sua dúvida ou contexto</label>
                                <textarea 
                                    value={conteudo} 
                                    onChange={(e) => setConteudo(e.target.value)} 
                                    required 
                                    rows="5" 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} 
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#2563EB', fontWeight: '500', backgroundColor: '#EFF6FF', padding: '8px 12px', borderRadius: '6px' }}>
                                    <Paperclip size={18} /> Anexar Rascunho (Opcional)
                                    <input type="file" onChange={(e) => setArquivo(e.target.files[0])} style={{ display: 'none' }} />
                                </label>
                                {arquivo && <span style={{ marginLeft: '10px', fontSize: '13px', color: '#64748B' }}>{arquivo.name}</span>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 15px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Publicar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}