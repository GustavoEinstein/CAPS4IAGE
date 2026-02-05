import React from 'react';
import { 
    Star, BarChart3, FileText, CheckCircle2, ShieldAlert 
} from 'lucide-react';

const ParecerTecnico = ({ producao }) => {
    // Se não tiver dados ou a flag for false, não renderiza nada
    if (!producao || !producao.revisao_realizada) return null;

    const { notas, feedback_texto, is_aprovado } = producao;

    return (
        <div style={styles.card(is_aprovado)}>
            
            {/* CABEÇALHO DO PARECER */}
            <div style={styles.header(is_aprovado)}>
                <div style={styles.headerTitle(is_aprovado)}>
                    {is_aprovado ? <CheckCircle2 size={22}/> : <ShieldAlert size={22}/>}
                    <span>PARECER DA CURADORIA</span>
                </div>
                <div style={styles.badge}>
                    {is_aprovado ? 'APROVADO' : 'CORREÇÃO SOLICITADA'}
                </div>
            </div>

            <div style={styles.content}>
                
                {/* 1. GRÁFICO DE NOTAS (Lê o objeto 'notas' da view) */}
                <div style={styles.sectionTitle}>
                    <BarChart3 size={18} color="#546E7A"/> 
                    Avaliação por Critérios
                </div>

                <div style={styles.gridScores}>
                    <ScoreItem label="Coerência Pedagógica" valor={notas.coerencia} />
                    <ScoreItem label="Qualidade do Prompt" valor={notas.qualidade} />
                    <ScoreItem label="Metodologia Ativa" valor={notas.metodologia} />
                    <ScoreItem label="Critérios de Avaliação" valor={notas.avaliacao} />
                    <ScoreItem label="Inclusão e Acessibilidade" valor={notas.inclusao} />
                    <ScoreItem label="Inovação e Criatividade" valor={notas.inovacao} />
                </div>

                {/* 2. FEEDBACK DE TEXTO (Lê o 'feedback_texto' concatenado) */}
                {feedback_texto && (
                    <>
                        <hr style={styles.divider} />
                        <div style={styles.feedbackSection}>
                            <h4 style={styles.feedbackTitle}>
                                <FileText size={16} /> Detalhes da Análise:
                            </h4>
                            {/* 'whiteSpace: pre-wrap' é o segredo para respeitar os \n do Python */}
                            <div style={styles.feedbackText}>
                                {feedback_texto}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

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
    card: (aprovado) => ({
        marginTop: '30px',
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
        alignItems: 'center'
    }),
    headerTitle: (aprovado) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '16px', fontWeight: '800',
        color: aprovado ? '#2E7D32' : '#C62828'
    }),
    badge: {
        fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
        backgroundColor: 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '4px'
    },
    content: { padding: '25px' },
    sectionTitle: {
        fontSize: '14px', fontWeight: '700', color: '#546E7A',
        marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px',
        textTransform: 'uppercase'
    },
    gridScores: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '10px 40px', marginBottom: '10px'
    },
    scoreRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #F5F5F5', paddingBottom: '8px'
    },
    label: { fontSize: '14px', color: '#455A64' },
    starsContainer: { display: 'flex', alignItems: 'center' },
    numberValue: { fontSize: '13px', fontWeight: '800', marginLeft: '8px', minWidth: '25px', textAlign: 'right' },
    
    divider: { border: 'none', borderTop: '1px solid #ECEFF1', margin: '20px 0' },
    
    feedbackSection: {
        backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '20px',
        borderLeft: '4px solid #90A4AE'
    },
    feedbackTitle: {
        margin: '0 0 10px 0', fontSize: '14px', color: '#37474F',
        display: 'flex', alignItems: 'center', gap: '6px'
    },
    feedbackText: {
        fontSize: '14px', color: '#37474F', lineHeight: '1.6',
        whiteSpace: 'pre-wrap', // ISSO MANTÉM OS PARÁGRAFOS DO PYTHON
        fontFamily: 'inherit'
    }
};

export default ParecerTecnico;