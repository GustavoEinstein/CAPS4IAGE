import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, Clock, Bot, BookOpen, CheckCircle2,
    XCircle, Wrench, Lightbulb, Target, Download, FileText, User, Package, Star,
    Send, MapPin, Search, AlertCircle, RefreshCw, File, ChevronRight,
    BarChart3, ShieldAlert, ThumbsUp, AlertTriangle // Novos ícones importados
} from 'lucide-react';

const handleDownload = async () => {
  try {
    const response = await api.get(data.arquivo, {
      responseType: 'blob', // Importante para arquivos!
    });

    // Cria um link temporário na memória do navegador
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Define um nome para o arquivo (pode ser dinâmico)
    link.setAttribute('download', `material-${data.id}.pdf`); 
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    alert("Não foi possível baixar o arquivo. Verifique se você tem permissão.");
  }
};

const VisualizarMinhaProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                setData(response.data);
            } catch (error) {
                console.error("Erro ao carregar detalhes:", error);
                alert("Não foi possível carregar os detalhes da produção.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#90A4AE'}}>Carregando detalhes...</div>;
    if (!data) return null;

    // --- LÓGICA DE ESTADOS ---
    const statusLower = data.status ? data.status.toLowerCase() : "";
    const isApproved = statusLower.includes('aprovado') || statusLower.includes('publicado') || statusLower.includes('concluído');
    const isRejected = statusLower.includes('rejeitado') || statusLower.includes('correção');
    const isPending = !isApproved && !isRejected;

    const theme = { main: '#1565C0', bg: '#E3F2FD' }; 

    // --- COMPONENTE: TIMELINE CARD ---
    const TimelineCard = () => {
        const steps = [
            { id: 1, label: "Envio Realizado", date: data.created_at || data.data, status: "done" },
            { id: 2, label: "Revisão por Pares", date: isPending ? "Em andamento..." : "Concluída", status: isPending ? "current" : "done" },
            { id: 3, label: "Resultado Final", date: (isApproved || isRejected) ? (isApproved ? "Aprovado" : "Devolvido") : "Aguardando", status: (isApproved || isRejected) ? (isApproved ? "approved" : "rejected") : "waiting" }
        ];

        return (
            <div style={styles.timelineCard}>
                <h3 style={styles.sectionTitleSmall}>Andamento do Processo</h3>
                <div style={styles.timelineList}>
                    {steps.map((step, index) => {
                        let icon = <div style={styles.dotWaiting}></div>;
                        let lineColor = '#E0E0E0';
                        let textColor = '#90A4AE';

                        if (step.status === "done") {
                            icon = <CheckCircle2 size={20} color="#2E7D32" fill="#E8F5E9"/>;
                            lineColor = '#2E7D32';
                            textColor = '#37474F';
                        } else if (step.status === "current") {
                            icon = <div style={styles.dotCurrent}><div style={styles.pulse}></div></div>;
                            lineColor = '#E0E0E0';
                            textColor = '#1565C0';
                        } else if (step.status === "approved") {
                            icon = <CheckCircle2 size={20} color="#2E7D32" fill="#E8F5E9"/>;
                            textColor = '#2E7D32';
                        } else if (step.status === "rejected") {
                            icon = <XCircle size={20} color="#C62828" fill="#FFEBEE"/>;
                            textColor = '#C62828';
                        }

                        const showLine = index < steps.length - 1;

                        return (
                            <div key={step.id} style={styles.timelineItem}>
                                <div style={styles.timelineIconCol}>
                                    {icon}
                                    {showLine && <div style={{...styles.timelineLine, backgroundColor: step.status === 'done' ? '#2E7D32' : '#E0E0E0'}}></div>}
                                </div>
                                <div style={styles.timelineContent}>
                                    <span style={{...styles.stepTitle, color: textColor}}>{step.label}</span>
                                    <span style={styles.stepDate}>{step.date}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
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
                    
                    {/* --- COLUNA ESQUERDA: CONTEÚDO PRINCIPAL --- */}
                    <div style={styles.columnContent}>
                        <div style={styles.materialCard}>
                            
                            {/* Header */}
                            <div style={styles.headerSection}>
                                <div>
                                    <div style={styles.badgesRow}>
                                        <span style={{...styles.badge, backgroundColor: theme.bg, color: theme.main}}>{data.disciplina}</span>
                                        <span style={styles.badgeNeutral}>{data.nivel_ensino || data.nivel}</span>
                                    </div>
                                    <h1 style={styles.title}>{data.titulo}</h1>
                                </div>
                                
                                <div style={styles.metaRow}>
                                    <div style={styles.iaTag}><Bot size={14} /> {data.modelo_ia}</div>
                                    <span style={styles.dateText}><User size={14} /> Autor: {data.autor || "Você"}</span>
                                </div>
                            </div>

                            {/* Detalhes Técnicos */}
                            <div style={styles.techSheet}>
                                <div style={styles.techItem}>
                                    <span style={styles.techLabel}>Metodologia</span>
                                    <span style={styles.techValue}>{data.metodologia || '-'}</span>
                                </div>
                                <div style={styles.techItem}>
                                    <span style={styles.techLabel}>Duração</span>
                                    <span style={styles.techValue}>{data.duracao || '-'}</span>
                                </div>
                                <div style={styles.techItem}>
                                    <span style={styles.techLabel}>Recursos</span>
                                    <span style={styles.techValue}>{data.recursos || '-'}</span>
                                </div>
                            </div>

                            <div style={styles.section}><h3 style={styles.sectionTitle}><BookOpen size={18}/> Intencionalidade (BNCC)</h3><p style={styles.textBody}>{data.bncc}</p></div>
                            <div style={styles.section}><h3 style={styles.sectionTitle}><Lightbulb size={18}/> Relato de Experiência</h3><p style={styles.textBody}>{data.experiencia || data.relato}</p></div>
                            <div style={styles.section}><h3 style={styles.sectionTitle}><Target size={18}/> Resultados</h3><div style={styles.resultsBox}>{data.resultados || "Sem resultados registrados."}</div></div>
                            
                            {/* --- PARECER TÉCNICO INSERIDO AQUI --- */}
                            {/* Passamos o objeto inteiro 'data' pois ele já contém os campos 'notas', 'revisao_realizada' e 'feedback_texto' vindos da API */}
                            <ParecerTecnico producao={data} />

                        </div>
                    </div>

                    {/* --- COLUNA DIREITA: TIMELINE & DOWNLOAD --- */}
                    <div style={styles.columnSidebar}>
                        
                        {/* 1. TIMELINE CARD */}
                        <TimelineCard />

                        {/* 2. AÇÕES EXTRAS (Se rejeitado) */}
                        {isRejected && (
                            <button onClick={() => navigate(`/dashboard/editar-producao/${data.id}`)} style={styles.editButton}>
                                <Wrench size={16} /> Realizar Correções
                            </button>
                        )}

                        {/* 3. CARD DE ARQUIVO */}
                        <div style={{...styles.sidebarCard, marginTop: '20px'}}>
                            <h3 style={styles.sidebarTitle}>Arquivo</h3>
                            {data.arquivo ? (
                                <div style={styles.downloadContainer}>
                                    <div style={styles.fileInfoBox}>
                                        <FileText size={32} color="#1565C0" style={{flexShrink: 0}} />
                                        <div style={{overflow: 'hidden'}}>
                                            <span style={styles.fileName}>{decodeURIComponent(data.arquivo.split('/').pop())}</span>
                                            <span style={styles.fileType}>Documento PDF/DOCX</span>
                                        </div>
                                    </div>
<button onClick={handleDownload} style={styles.downloadBtn}>
  <Download size={18} /> Baixar Roteiro
</button>
                                </div>
                            ) : (
                                <div style={styles.emptyState}>
                                    <File size={24} color="#CFD8DC"/>
                                    <p>Nenhum arquivo anexado.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE INTERNO DE PARECER TÉCNICO ---
// Mantendo a identidade visual da página
const ParecerTecnico = ({ producao }) => {
    // 1. Verificações de segurança
    if (!producao) return null;

    // Se a API retornar 'revisao_realizada', usamos. 
    // Senão, checamos se existe alguma nota > 0 manualmente (fallback).
    const temRevisao = producao.revisao_realizada || (producao.notas && producao.notas.coerencia > 0) || producao.nota_coerencia > 0;
    
    if (!temRevisao) return null;

    // 2. Normalização dos dados (caso venham da raiz ou do objeto 'notas')
    // Ajuste conforme seu backend retorna (o exemplo anterior retornava dentro de 'notas')
    const notas = producao.notas || {
        coerencia: producao.nota_coerencia,
        qualidade: producao.nota_qualidade,
        metodologia: producao.nota_metodologia,
        avaliacao: producao.nota_avaliacao,
        inclusao: producao.nota_inclusao,
        inovacao: producao.nota_inovacao
    };

    // Feedback de texto: tenta usar o campo formatado ou o bruto
    const feedbackTexto = producao.feedback_texto || producao.feedback_revisor || producao.feedback_revisao;
    
    // Status visual
    const statusLower = producao.status ? producao.status.toLowerCase() : "";
    const isAprovado = statusLower.includes('aprovado') || statusLower.includes('concluído') || producao.is_aprovado;

    // ESTILOS LOCAIS DO PARECER
    const pStyles = {
        container: {
            marginTop: '40px',
            borderTop: '1px solid #E0E0E0',
            paddingTop: '30px'
        },
        headerTitle: {
            fontSize: '18px', fontWeight: '800', color: '#37474F', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px'
        },
        statusBadge: {
            fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '20px',
            backgroundColor: isAprovado ? '#E8F5E9' : '#FFEBEE',
            color: isAprovado ? '#2E7D32' : '#C62828',
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px'
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px 30px', marginBottom: '25px'
        },
        scoreRow: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #F5F5F5', paddingBottom: '8px'
        },
        label: { fontSize: '13px', color: '#546E7A', fontWeight: '600' },
        stars: { display: 'flex', alignItems: 'center' },
        val: { fontSize: '13px', fontWeight: '800', marginLeft: '8px', minWidth: '24px', textAlign: 'right' },
        
        feedbackBox: {
            backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '20px', borderLeft: '4px solid #90A4AE'
        },
        feedbackTitle: { fontSize: '14px', fontWeight: '700', color: '#455A64', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
        feedbackText: { fontSize: '14px', lineHeight: '1.6', color: '#37474F', whiteSpace: 'pre-wrap' } // Importante para quebra de linha
    };

    // Componente Helper de Estrela
    const ScoreItem = ({ label, valor }) => (
        <div style={pStyles.scoreRow}>
            <span style={pStyles.label}>{label}</span>
            <div style={pStyles.stars}>
                {[1, 2, 3, 4, 5].map(v => (
                    <Star 
                        key={v} size={14} 
                        fill={v <= valor ? (valor <= 2 ? "#EF5350" : "#FFB300") : "#E0E0E0"} 
                        color="transparent" 
                        style={{ marginRight: 2 }}
                    />
                ))}
                <span style={{...pStyles.val, color: valor <= 2 ? '#D32F2F' : '#2E7D32'}}>{valor}/5</span>
            </div>
        </div>
    );

    return (
        <div style={pStyles.container}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <h3 style={pStyles.headerTitle}>
                    <BarChart3 size={20} color="#1565C0" />
                    Parecer Técnico da Curadoria
                </h3>
                <div style={pStyles.statusBadge}>
                    {isAprovado ? <><CheckCircle2 size={14}/> APROVADO</> : <><ShieldAlert size={14}/> AJUSTES NECESSÁRIOS</>}
                </div>
            </div>

            {/* Grid de Notas */}
            <div style={pStyles.grid}>
                <ScoreItem label="Coerência Pedagógica" valor={notas.coerencia} />
                <ScoreItem label="Qualidade do Prompt" valor={notas.qualidade} />
                <ScoreItem label="Metodologia Ativa" valor={notas.metodologia} />
                <ScoreItem label="Critérios de Avaliação" valor={notas.avaliacao} />
                <ScoreItem label="Inclusão e Acessibilidade" valor={notas.inclusao} />
                <ScoreItem label="Grau de Inovação" valor={notas.inovacao} />
            </div>

            {/* Texto de Feedback */}
            {feedbackTexto && (
                <div style={pStyles.feedbackBox}>
                    <div style={pStyles.feedbackTitle}>
                        <FileText size={16} /> Detalhes da Análise:
                    </div>
                    <div style={pStyles.feedbackText}>
                        {feedbackTexto}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- ESTILOS GERAIS DA PÁGINA ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F0F2F5', minHeight: '100vh', width: '100%', boxSizing: 'border-box', paddingTop: '20px' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px 40px 20px' },
    backButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#546E7A', fontWeight: '700', marginBottom: '15px' },
    
    grid: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
    columnContent: { flex: 1, minWidth: '0' }, 
    columnSidebar: { width: '300px', minWidth: '300px', position: 'sticky', top: '20px' },

    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '35px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #E0E0E0' },
    
    headerSection: { marginBottom: '25px' },
    badgesRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    badgeNeutral: { backgroundColor: '#F5F5F5', color: '#616161', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    title: { fontSize: '26px', fontWeight: '800', color: '#1A237E', margin: 0, lineHeight: '1.2' },
    metaRow: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '12px' },
    iaTag: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#546E7A', backgroundColor: '#F5F5F5', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' },
    dateText: { display:'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#90A4AE' },

    techSheet: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px', padding: '15px', backgroundColor: '#FAFAFA', borderRadius: '8px' },
    techItem: { display: 'flex', flexDirection: 'column' },
    techLabel: { fontSize: '10px', textTransform: 'uppercase', color: '#90A4AE', fontWeight: '700' },
    techValue: { fontSize: '13px', color: '#37474F', fontWeight: '600' },

    section: { marginBottom: '30px' },
    sectionTitle: { fontSize: '16px', fontWeight: '800', color: '#37474F', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
    textBody: { fontSize: '15px', lineHeight: '1.6', color: '#455A64' },
    resultsBox: { backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #1565C0', color: '#333', fontSize: '14px', fontStyle: 'italic' },

    // --- TIMELINE STYLES ---
    timelineCard: { backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' },
    sectionTitleSmall: { fontSize: '12px', textTransform: 'uppercase', color: '#90A4AE', fontWeight: '800', marginBottom: '15px' },
    timelineList: { display: 'flex', flexDirection: 'column' },
    timelineItem: { display: 'flex', gap: '12px', minHeight: '50px' },
    timelineIconCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' },
    timelineLine: { width: '2px', flex: 1, backgroundColor: '#E0E0E0', margin: '4px 0' },
    dotWaiting: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E0E0E0', border: '2px solid #FFF', boxShadow: '0 0 0 1px #B0BEC5' },
    dotCurrent: { width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#1565C0', border: '2px solid #E3F2FD', position: 'relative' },
    timelineContent: { paddingBottom: '20px' },
    stepTitle: { display: 'block', fontSize: '13px', fontWeight: '700', lineHeight: '1.2' },
    stepDate: { fontSize: '11px', color: '#90A4AE' },

    // SIDEBAR CARDS
    sidebarCard: { backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px' },
    sidebarTitle: { margin: '0 0 15px 0', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', color: '#90A4AE', borderBottom: '1px solid #F5F5F5', paddingBottom: '8px' },
    editButton: { marginTop: '12px', width: '100%', padding: '10px', backgroundColor: '#C62828', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },

    // DOWNLOAD
    downloadContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    fileInfoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #E0E0E0' },
    fileName: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' },
    fileType: { fontSize: '11px', color: '#90A4AE' },
    downloadBtnPrimary: { backgroundColor: '#1565C0', color: 'white', border: 'none', width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)', transition: 'background 0.2s' },
    emptyState: { textAlign: 'center', padding: '15px', color: '#B0BEC5', fontSize: '13px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }
};

export default VisualizarMinhaProducao;