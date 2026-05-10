import React from 'react';
import { 
    Star, BarChart3, CheckCircle2, ShieldAlert, Clock, ThumbsUp, AlertTriangle, User
} from 'lucide-react';

const ParecerTecnico = ({ producao }) => {
    // Se não tiver produção ou não houver avaliações, não renderiza nada
    if (!producao || (!producao.revisao_realizada && (!producao.avaliacoes_detalhadas || producao.avaliacoes_detalhadas.length === 0))) return null;

    const avaliacoes = producao.avaliacoes_detalhadas || [];
    
    return (
        <div style={styles.container}>
            <div style={styles.mainHeader}>
                <BarChart3 size={24} color="#1565C0" />
                <div>
                    <h3 style={styles.mainTitle}>Histórico de Revisão</h3>
                    <p style={styles.mainSubtitle}>Veja o detalhamento do que os avaliadores acharam da sua prática.</p>
                </div>
            </div>

            <div style={styles.cardsWrapper}>
                {/* Renderiza as avaliações reais que vieram do banco */}
                {avaliacoes.map((aval) => (
                    <ReviewCard key={aval.ordem} avaliacao={aval} />
                ))}

                {/* Se só houver 1 avaliação, exibe o "Ghost Card" aguardando a segunda! */}
                {avaliacoes.length === 1 && !producao.status.toLowerCase().includes('rejeitado') && (
                    <GhostCard />
                )}
            </div>
        </div>
    );
};

// --- Componente: CARD DO REVISOR REAL ---
const ReviewCard = ({ avaliacao }) => {
    const isAprovado = avaliacao.aprovado;
    const { notas, pontos_fortes, pontos_melhoria, ordem } = avaliacao;

    return (
        <div style={styles.card(isAprovado)}>
            
            {/* CABEÇALHO DO PARECER */}
            <div style={styles.header(isAprovado)}>
                <div style={styles.headerTitle(isAprovado)}>
                    {isAprovado ? <CheckCircle2 size={22}/> : <ShieldAlert size={22}/>}
                    <span>PARECER DO {ordem}º AVALIADOR</span>
                </div>
                <div style={styles.badge(isAprovado)}>
                    {isAprovado ? 'APROVADO' : 'AJUSTES NECESSÁRIOS'}
                </div>
            </div>

            <div style={styles.content}>
                
                {/* 1. GRÁFICO DE NOTAS */}
                <div style={styles.sectionTitle}>
                    <BarChart3 size={16} color="#546E7A"/> 
                    Notas Atribuídas
                </div>

                <div style={styles.gridScores}>
                    <ScoreItem label="Coerência Pedagógica" valor={notas.coerencia} />
                    <ScoreItem label="Qualidade do Prompt" valor={notas.qualidade} />
                    <ScoreItem label="Metodologia Ativa" valor={notas.metodologia} />
                    <ScoreItem label="Critérios de Avaliação" valor={notas.avaliacao} />
                    <ScoreItem label="Inclusão e Acessibilidade" valor={notas.inclusao} />
                    <ScoreItem label="Inovação e Criatividade" valor={notas.inovacao} />
                </div>

                <hr style={styles.divider} />

                {/* 2. FEEDBACK FATIADO */}
                <div style={styles.sectionTitle}>
                    <User size={16} color="#546E7A"/> 
                    Comentários do Revisor
                </div>

                <div style={styles.feedbackGrid}>
                    {/* Pontos Fortes (Só aparece se tiver escrito algo) */}
                    {pontos_fortes && (
                        <div style={styles.feedbackBoxSuccess}>
                            <div style={styles.feedbackLabelSuccess}><ThumbsUp size={16}/> Pontos Fortes</div>
                            <div style={styles.feedbackTextSuccess}>{pontos_fortes}</div>
                        </div>
                    )}

                    {/* Sugestões de Melhoria (Só aparece se tiver escrito algo) */}
                    {pontos_melhoria && (
                        <div style={styles.feedbackBoxDanger}>
                            <div style={styles.feedbackLabelDanger}><AlertTriangle size={16}/> Sugestões de Melhoria</div>
                            <div style={styles.feedbackTextDanger}>{pontos_melhoria}</div>
                        </div>
                    )}

                    {/* Fallback caso não tenha conseguido fatiar e seja texto puro */}
                    {!pontos_fortes && !pontos_melhoria && avaliacao.feedback_texto && (
                         <div style={styles.feedbackBoxNeutral}>
                            <div style={styles.feedbackTextNeutral}>{avaliacao.feedback_texto}</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// --- Componente: GHOST CARD DE ESPERA ---
const GhostCard = () => (
    <div style={styles.ghostCard}>
        <div style={styles.ghostHeader}>
            <div style={styles.ghostTitle}>
                <Clock size={22} color="#90A4AE" />
                <span>AGUARDANDO 2º AVALIADOR</span>
            </div>
            <div style={styles.ghostBadge}>NA FILA</div>
        </div>
        <div style={styles.ghostContent}>
            <p style={styles.ghostText}>
                Esta produção já recebeu a sua primeira avaliação e agora aguarda o parecer de mais um colega educador para ser finalizada no formato de duplo-cego.
            </p>
        </div>
    </div>
);

// Componente das Estrelinhas
const ScoreItem = ({ label, valor }) => (
    <div style={styles.scoreRow}>
        <span style={styles.label}>{label}</span>
        <div style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    fill={star <= valor ? (valor <= 2 ? "#EF5350" : "#FFB300") : "#E0E0E0"}
                    color="transparent" 
                    style={{ marginRight: 2 }}
                />
            ))}
            <span style={{...styles.numberValue, color: valor <= 2 ? '#D32F2F' : '#2E7D32'}}>
                {valor}/5
            </span>
        </div>
    </div>
);

// ESTILOS
const styles = {
    container: {
        marginTop: '40px',
        borderTop: '1px solid #E0E0E0',
        paddingTop: '30px'
    },
    mainHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
    },
    mainTitle: { fontSize: '20px', fontWeight: '800', color: '#1A237E', margin: '0 0 4px 0' },
    mainSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
    
    cardsWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },

    // ESTILOS DO CARD DINÂMICO
    card: (aprovado) => ({
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: aprovado ? '1px solid #A5D6A7' : '1px solid #EF9A9A', // Verde ou Vermelho
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    }),
    header: (aprovado) => ({
        backgroundColor: aprovado ? '#E8F5E9' : '#FFEBEE',
        padding: '15px 25px',
        borderBottom: aprovado ? '1px solid #C8E6C9' : '1px solid #FFCDD2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
    }),
    headerTitle: (aprovado) => ({
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px',
        color: aprovado ? '#2E7D32' : '#C62828'
    }),
    badge: (aprovado) => ({
        fontSize: '11px', fontWeight: '800', letterSpacing: '1px',
        backgroundColor: aprovado ? '#C8E6C9' : '#FFCDD2', 
        color: aprovado ? '#1B5E20' : '#B71C1C',
        padding: '6px 12px', borderRadius: '20px'
    }),
    content: { padding: '25px' },
    
    sectionTitle: {
        fontSize: '13px', fontWeight: '800', color: '#78909C',
        marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px',
        textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    
    gridScores: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px 30px'
    },
    scoreRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FAFAFA', padding: '8px 12px', borderRadius: '8px',
        border: '1px solid #F0F0F0'
    },
    label: { fontSize: '13px', color: '#455A64', fontWeight: '600' },
    starsContainer: { display: 'flex', alignItems: 'center' },
    numberValue: { fontSize: '13px', fontWeight: '800', marginLeft: '8px', minWidth: '25px', textAlign: 'right' },
    
    divider: { border: 'none', borderTop: '1px dashed #CFD8DC', margin: '25px 0' },
    
    // CAIXAS DE FEEDBACK
    feedbackGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    
    feedbackBoxSuccess: { backgroundColor: '#F1F8E9', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #7CB342' },
    feedbackLabelSuccess: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#33691E', marginBottom: '8px', textTransform: 'uppercase' },
    feedbackTextSuccess: { fontSize: '14px', color: '#33691E', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit' },
    
    feedbackBoxDanger: { backgroundColor: '#FFF3E0', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #FF9800' },
    feedbackLabelDanger: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#E65100', marginBottom: '8px', textTransform: 'uppercase' },
    feedbackTextDanger: { fontSize: '14px', color: '#E65100', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit' },

    feedbackBoxNeutral: { backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #90A4AE' },
    feedbackTextNeutral: { fontSize: '14px', color: '#455A64', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit' },

    // ESTILOS DO GHOST CARD (Espera)
    ghostCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: '12px',
        border: '2px dashed #CFD8DC',
        overflow: 'hidden',
        opacity: 0.8
    },
    ghostHeader: {
        backgroundColor: '#F5F7FA',
        padding: '15px 25px',
        borderBottom: '1px solid #ECEFF1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ghostTitle: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px',
        color: '#90A4AE'
    },
    ghostBadge: {
        fontSize: '11px', fontWeight: '800', letterSpacing: '1px',
        backgroundColor: '#ECEFF1', color: '#90A4AE',
        padding: '6px 12px', borderRadius: '20px'
    },
    ghostContent: { padding: '25px', textAlign: 'center' },
    ghostText: { margin: 0, fontSize: '14px', color: '#78909C', lineHeight: '1.6' }
};

export default ParecerTecnico;