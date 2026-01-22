import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { 
    Star, 
    CheckCircle2, 
    Bot, 
    Download, 
    ArrowLeft,
    Clock,
    Wrench,
    BookOpen,
    Target,
    Lightbulb,
    ThumbsUp,
    ThumbsDown,
    ShieldAlert,
    Info,
    ListChecks
} from 'lucide-react';

const Revisao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    // --- DADOS MOCK (Cenário: Frações no Minecraft - Pendente) ---
    const [producaoEmRevisao, setProducaoEmRevisao] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setProducaoEmRevisao({
                id: id || "matematica-10",
                titulo: "Frações no Minecraft: Construção Guiada",
                disciplina: "Matematica",
                nivel: "Fundamental 1 (5º Ano)",
                modelo_ia: "ChatGPT-4o",
                categoria: "Gamificação",
                
                // Dados Pedagógicos
                bncc: "EF05MA03 - Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão ou à ideia de parte de um todo.",
                metodologia: "Aprendizagem Baseada em Jogos (GBL)",
                duracao: "3 aulas (150 min)",
                recursos: "Tablets/PCs com Minecraft Education, Projetor",
                
                experiencia_pessoal: "Notei que meus alunos tinham dificuldade em visualizar 'frações equivalentes' no papel. No Minecraft, ao construir muros, eles perceberam visualmente que 2/4 e 1/2 ocupavam o mesmo espaço. A IA gerou missões progressivas de construção.",
                resultados_observados: "O engajamento foi total. Na avaliação posterior, a turma teve 40% mais acertos em questões visuais de fração comparado ao ano anterior.",
                arquivo: "guia_minecraft_fracoes.pdf"
            });
        }, 500);
    }, [id]);

    // --- ESTADO DA RÚBRICA (6 Eixos) ---
    const [avaliacao, setAvaliacao] = useState({
        notaCoerencia: 0,
        notaQualidade: 0,
        notaMetodologia: 0,
        notaAvaliacao: 0,
        notaInclusao: 0,
        notaInovacao: 0,
        pontosFortes: '',
        pontosMelhoria: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleScoreChange = (campo, valor) => {
        setAvaliacao(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSubmit = (veredito) => {
        const notas = [
            avaliacao.notaCoerencia, avaliacao.notaQualidade, avaliacao.notaMetodologia,
            avaliacao.notaAvaliacao, avaliacao.notaInclusao, avaliacao.notaInovacao
        ];
        
        const preencheuTudo = notas.every(nota => nota > 0);

        if (!preencheuTudo) {
            alert("Por favor, atribua notas para todos os 6 critérios da rúbrica.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            alert(veredito ? "Parecer favorável registrado! Publicando..." : "Parecer desfavorável registrado. Retornando ao autor.");
            setIsSubmitting(false);
            navigate('/dashboard/revisao');
        }, 1500);
    };

    if (!producaoEmRevisao) {
        return <div style={{padding: '50px', textAlign: 'center', color: '#666'}}>Carregando dossiê...</div>;
    }

    // --- COMPONENTE DE LINHA DE CRITÉRIO ---
    const CriteriaRow = ({ letter, label, questions, fieldName, value }) => (
        <div style={styles.criteriaContainer}>
            <div style={styles.criteriaHeader}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={styles.letterBadge}>{letter}</span>
                    <label style={styles.criteriaLabel}>{label}</label>
                </div>
                <span style={{fontWeight: 'bold', color: value > 0 ? '#F57C00' : '#CCC', fontSize: '14px'}}>{value}/5</span>
            </div>
            
            <ul style={styles.criteriaList}>
                {questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                ))}
            </ul>

            <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleScoreChange(fieldName, star)}
                        type="button"
                        style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
                        title={`Nota ${star}`}
                    >
                        <Star 
                            size={22} 
                            color={star <= value ? "#FFC107" : "#E0E0E0"} 
                            fill={star <= value ? "#FFC107" : "none"} 
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        // WRAPPER DE FUNDO (Correção Visual)
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate('/dashboard/revisao')} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar para Fila de Revisão
                </button>

                <div style={{...styles.gridContainer, flexDirection: isMobile ? 'column' : 'row'}}>
                    
                    {/* --- COLUNA ESQUERDA: MATERIAL --- */}
                    <div style={{...styles.columnMaterial, width: isMobile ? '100%' : '50%'}}>
                        <div style={styles.materialCard}>
                            {/* Header */}
                            <div style={styles.materialHeader}>
                                <div style={{display:'flex', gap: '8px', marginBottom: '10px'}}>
                                    <span style={styles.badge}>{producaoEmRevisao.disciplina}</span>
                                    <span style={styles.levelBadge}>{producaoEmRevisao.nivel}</span>
                                </div>
                                <h1 style={styles.materialTitle}>{producaoEmRevisao.titulo}</h1>
                                <div style={{display:'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#546E7A'}}>
                                    <Bot size={14} /> Gerado com <strong>{producaoEmRevisao.modelo_ia}</strong>
                                </div>
                            </div>

                            {/* Ficha Técnica */}
                            <div style={styles.techSheet}>
                                <div style={styles.techItem}>
                                    <Wrench size={16} color="#1565C0" />
                                    <div><span style={styles.techLabel}>Metodologia</span>{producaoEmRevisao.metodologia}</div>
                                </div>
                                <div style={styles.techItem}>
                                    <Clock size={16} color="#1565C0" />
                                    <div><span style={styles.techLabel}>Duração</span>{producaoEmRevisao.duracao}</div>
                                </div>
                            </div>

                            {/* BNCC */}
                            <div style={styles.bnccBox}>
                                <h4 style={styles.bnccTitle}><BookOpen size={16}/> Intencionalidade Pedagógica (BNCC)</h4>
                                <p style={styles.bnccText}>{producaoEmRevisao.bncc}</p>
                            </div>

                            {/* Relato */}
                            <div style={styles.sectionBox}>
                                <h3 style={styles.sectionTitle}><Lightbulb size={20} color="#F57C00" /> Relato da Aplicação</h3>
                                <p style={styles.textBody}>{producaoEmRevisao.experiencia_pessoal}</p>
                            </div>

                            <div style={styles.sectionBox}>
                                <h3 style={styles.sectionTitle}><Target size={20} color="#2E7D32" /> Resultados e Evidências</h3>
                                <div style={styles.resultsBox}>{producaoEmRevisao.resultados_observados}</div>
                            </div>

                            <div style={styles.attachmentBox}>
                                <Download size={20} color="#1565C0" />
                                <div>
                                    <span style={{display:'block', fontWeight: '600', color: '#1565C0'}}>Material Completo (PDF)</span>
                                    <span style={{fontSize: '12px', color: '#546E7A'}}>{producaoEmRevisao.arquivo}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
                    <div style={{...styles.columnForm, width: isMobile ? '100%' : '50%'}}>
                        <div style={styles.formCard}>
                            <div style={styles.formHeader}>
                                <h2 style={styles.formTitle}>Rúbrica de Avaliação</h2>
                                <p style={styles.formSubtitle}>Analise os 6 eixos de qualidade pedagógica.</p>
                            </div>

                            {/* Área rolável para Rúbrica */}
                            <div style={styles.scrollableRubric}>
                                
                                <CriteriaRow 
                                    letter="A" label="Coerência Pedagógica" 
                                    questions={["Objetivos de aprendizagem estão claros?", "Há alinhamento entre objetivos, conteúdos e atividades?"]}
                                    fieldName="notaCoerencia" value={avaliacao.notaCoerencia} 
                                />

                                <CriteriaRow 
                                    letter="B" label="Qualidade Didática" 
                                    questions={["Linguagem adequada ao público?", "Clareza das instruções?", "Progressão do conteúdo?"]}
                                    fieldName="notaQualidade" value={avaliacao.notaQualidade} 
                                />

                                <CriteriaRow 
                                    letter="C" label="Metodologia e Estratégias" 
                                    questions={["Metodologias ativas ou adequadas?", "Estímulo ao pensamento crítico?"]}
                                    fieldName="notaMetodologia" value={avaliacao.notaMetodologia} 
                                />

                                <CriteriaRow 
                                    letter="D" label="Avaliação da Aprendizagem" 
                                    questions={["Instrumentos coerentes com objetivos?", "Critérios claros e justos?"]}
                                    fieldName="notaAvaliacao" value={avaliacao.notaAvaliacao} 
                                />

                                <CriteriaRow 
                                    letter="E" label="Inclusão e Acessibilidade" 
                                    questions={["Linguagem inclusiva?", "Adequação para diferentes perfis?", "Recursos acessíveis?"]}
                                    fieldName="notaInclusao" value={avaliacao.notaInclusao} 
                                />

                                <CriteriaRow 
                                    letter="F" label="Inovação e Relevância" 
                                    questions={["Uso criativo de recursos?", "Tema relevante e atual?"]}
                                    fieldName="notaInovacao" value={avaliacao.notaInovacao} 
                                />

                            </div>

                            {/* Feedback */}
                            <div style={styles.feedbackSection}>
                                <h3 style={styles.sectionHeaderSmall}>Parecer Descritivo</h3>
                                <div style={styles.inputGroup}>
                                    <label style={{...styles.label, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                        <ThumbsUp size={14} /> Pontos Fortes
                                    </label>
                                    <textarea 
                                        style={{...styles.textarea, borderColor: '#A5D6A7'}} rows="2"
                                        placeholder="O que se destacou nesta prática?"
                                        value={avaliacao.pontosFortes}
                                        onChange={(e) => setAvaliacao({...avaliacao, pontosFortes: e.target.value})}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={{...styles.label, color: '#C62828', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                        <ThumbsDown size={14} /> Sugestões de Melhoria
                                    </label>
                                    <textarea 
                                        style={{...styles.textarea, borderColor: '#FFCDD2'}} rows="2"
                                        placeholder="O que precisa ser ajustado?"
                                        value={avaliacao.pontosMelhoria}
                                        onChange={(e) => setAvaliacao({...avaliacao, pontosMelhoria: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Veredito */}
                            <div style={styles.verdictSection}>
                                <div style={styles.verdictButtons}>
                                    <button onClick={() => handleSubmit(false)} disabled={isSubmitting} style={styles.btnReject}>
                                        <ShieldAlert size={18} /> Rejeitar
                                    </button>
                                    <button onClick={() => handleSubmit(true)} disabled={isSubmitting} style={styles.btnApprove}>
                                        <CheckCircle2 size={18} /> Validar e Publicar
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS CORRIGIDOS (Sem linhas pretas) ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '20px' },
    container: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#546E7A', fontWeight: '600', marginBottom: '20px', fontSize: '15px' },
    gridContainer: { display: 'flex', gap: '25px', alignItems: 'flex-start' },
    
    // MATERIAL CARD
    materialCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #E0E0E0' },
    materialHeader: { marginBottom: '25px' },
    badge: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    levelBadge: { backgroundColor: '#F5F5F5', color: '#616161', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    materialTitle: { fontSize: '26px', fontWeight: '800', color: '#1A237E', margin: '15px 0 10px 0', lineHeight: '1.3' },
    
    techSheet: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #EEE' },
    techItem: { display: 'flex', flexDirection: 'column' },
    techLabel: { fontSize: '11px', color: '#90A4AE', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' },
    
    // BNCC
    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', borderRadius: '0 8px 8px 0', marginBottom: '30px' },
    bnccTitle: { margin: '0 0 5px 0', fontSize: '13px', color: '#F57C00', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700' },
    bnccText: { margin: 0, fontSize: '14px', color: '#5D4037', lineHeight: '1.5' },

    sectionBox: { marginBottom: '30px' },
    sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#37474F', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
    textBody: { fontSize: '15px', lineHeight: '1.7', color: '#455A64', whiteSpace: 'pre-wrap' },
    resultsBox: { backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50', padding: '15px', borderRadius: '0 8px 8px 0', color: '#2E7D32', fontSize: '14px', fontStyle: 'italic' },
    attachmentBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '12px', border: '1px dashed #1565C0', cursor: 'pointer' },

    // FORM CARD
    formCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 25px rgba(0,0,0,0.08)', border: '1px solid #E0E0E0', position: 'sticky', top: '20px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
    formHeader: { marginBottom: '15px', borderBottom: '1px solid #EEE', paddingBottom: '10px' },
    formTitle: { fontSize: '18px', fontWeight: '700', color: '#1565C0', margin: 0 },
    formSubtitle: { fontSize: '12px', color: '#78909C', margin: '5px 0 0 0' },
    
    scrollableRubric: { flex: 1, overflowY: 'auto', paddingRight: '5px', marginBottom: '10px' },
    
    // CRITERIA (Com Borda Explícita)
    criteriaContainer: { marginBottom: '15px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E0E0E0' },
    criteriaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    letterBadge: { width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' },
    criteriaLabel: { fontSize: '14px', fontWeight: '700', color: '#37474F' },
    criteriaList: { margin: '0 0 8px 0', paddingLeft: '20px', fontSize: '11px', color: '#607D8B', lineHeight: '1.4' },

    feedbackSection: { borderTop: '1px solid #EEE', paddingTop: '15px' },
    sectionHeaderSmall: { fontSize: '13px', textTransform: 'uppercase', color: '#546E7A', fontWeight: '800', marginBottom: '10px' },
    inputGroup: { marginBottom: '12px' },
    label: { fontSize: '13px', fontWeight: '700', marginBottom: '4px' },
    textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CFD8DC', backgroundColor: '#FAFAFA', fontSize: '13px', lineHeight: '1.4', boxSizing: 'border-box', resize: 'vertical', outline: 'none' },

    verdictSection: { marginTop: '10px', paddingTop: '10px' },
    verdictButtons: { display: 'flex', gap: '10px' },
    btnReject: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #FFCDD2', backgroundColor: '#FFEBEE', color: '#C62828', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', transition: 'background 0.2s' },
    btnApprove: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2E7D32', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)', transition: 'transform 0.2s' }
};

export default Revisao;