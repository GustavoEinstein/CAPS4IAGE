import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Clock, 
    Bot, 
    ArrowRight, 
    Tag, 
    BookOpen,
    Filter,
    Lock
} from 'lucide-react';

// --- MOCK GERAL (O Banco de dados tem tudo, mas o Front só mostra o permitido) ---
const BANCO_DE_PRODUCOES = [
    // ITENS DE FILOSOFIA (O que o usuário VAI ver)
    {
        id: "filosofia-10", 
        titulo: "Dilemas Éticos com IA: O Carro Autônomo",
        disciplina: "Filosofia", // MATCH
        nivel: "Ensino Médio",
        modelo_ia: "Claude 3",
        categoria: "Estudo de Caso",
        data_envio: "Há 2 horas",
        resumo_pratica: "Os alunos debateram se a IA deve priorizar o passageiro ou o pedestre em um acidente, aplicando Kant e Utilitarismo...",
        status: "PENDENTE"
    },
    {
        id: "filosofia-11",
        titulo: "O Panóptico Digital: Foucault e Redes Sociais",
        disciplina: "Filosofia", // MATCH
        nivel: "Ensino Médio",
        modelo_ia: "ChatGPT-4",
        categoria: "Análise Crítica",
        data_envio: "Há 1 dia",
        resumo_pratica: "Usamos a IA para analisar termos de uso de redes sociais e compará-los com o conceito de vigilância de Foucault...",
        status: "PENDENTE"
    },
    {
        id: "filosofia-12",
        titulo: "Simulação: O Mito da Caverna Hoje",
        disciplina: "Filosofia", // MATCH
        nivel: "Superior",
        modelo_ia: "Gemini",
        categoria: "Roleplay",
        data_envio: "Há 3 dias",
        resumo_pratica: "A IA criou diálogos de pessoas 'presas' em bolhas de algoritmo para os alunos encenarem e analisarem...",
        status: "PENDENTE"
    },

    // ITENS DE OUTRAS ÁREAS (O que o usuário NÃO PODE ver)
    {
        id: "mat-01", 
        titulo: "Frações no Minecraft", 
        disciplina: "Matematica", // NO MATCH
        status: "PENDENTE"
    },
    {
        id: "hist-02", 
        titulo: "Revolução Francesa RPG", 
        disciplina: "Historia", // NO MATCH
        status: "PENDENTE"
    }
];

const ListaRevisao = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    // --- SIMULAÇÃO: PERFIL DO PROFESSOR LOGADO ---
    // No sistema real, isso viria de `auth.user.disciplina`
    const userDisciplina = "Filosofia"; 

    // --- FILTRAGEM RÍGIDA (REGRA DE NEGÓCIO) ---
    // Só mostro produções onde disciplina_item === disciplina_usuario
    const queueItems = BANCO_DE_PRODUCOES.filter(item => item.disciplina === userDisciplina);

    return (
        // WRAPPER
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* Cabeçalho da Área Restrita */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.lockTag}>
                            <Lock size={12} /> Área Restrita
                        </div>
                        <h1 style={styles.pageTitle}>Fila de Validação</h1>
                        <p style={styles.pageSubtitle}>
                            Exibindo apenas produções de <strong style={{color: '#1565C0'}}>{userDisciplina}</strong>.
                        </p>
                    </div>
                    <div style={styles.counterBadge}>
                        <Clock size={16} color="#E65100" />
                        <span>{queueItems.length} Pendentes</span>
                    </div>
                </div>

                {/* Lista Filtrada */}
                <div style={styles.listContainer}>
                    {queueItems.length > 0 ? (
                        queueItems.map((item) => (
                            <ReviewCard 
                                key={item.id} 
                                data={item} 
                                onClick={() => navigate(`/dashboard/revisao/${item.id}`)} 
                                isMobile={isMobile} 
                            />
                        ))
                    ) : (
                        <EmptyState disciplina={userDisciplina} />
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CARD DE REVISÃO (Mantido o design anterior, focado na prática) ---
const ReviewCard = ({ data, onClick, isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Cores específicas para Filosofia (já que só veremos ela aqui)
    const theme = { bg: '#ECEFF1', text: '#455A64' };

    return (
        <div 
            style={{
                ...styles.card,
                ...(isHovered ? styles.cardHover : {}),
                flexDirection: isMobile ? 'column' : 'row'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div style={styles.cardContent}>
                <div style={styles.cardTopRow}>
                    {/* Badge da Disciplina (Fixo) */}
                    <span style={{...styles.subjectBadge, backgroundColor: theme.bg, color: theme.text}}>
                        {data.disciplina}
                    </span>
                    <div style={styles.aiBadge}>
                        <Bot size={14} style={{marginRight: '4px'}} />
                        {data.modelo_ia}
                    </div>
                    <div style={styles.metaData}>
                        <Clock size={14} style={{marginRight: '4px'}} />
                        {data.data_envio}
                    </div>
                </div>

                <h3 style={styles.cardTitle}>{data.titulo}</h3>

                <div style={styles.practicePreview}>
                    <BookOpen size={14} color="#546E7A" style={{minWidth: '14px', marginTop: '3px'}} />
                    <span style={{marginLeft: '8px', color: '#546E7A', fontSize: '13px'}}>
                        "{data.resumo_pratica}..."
                    </span>
                </div>

                <div style={styles.cardFooter}>
                    <div style={styles.footerItem}>
                        <Tag size={14} color="#90A4AE" />
                        <span>{data.categoria}</span>
                    </div>
                    <span style={styles.separator}>•</span>
                    <div style={styles.footerItem}>
                        <span style={styles.levelText}>{data.nivel}</span>
                    </div>
                </div>
            </div>

            <div style={{
                ...styles.cardAction,
                borderLeft: isMobile ? 'none' : '1px solid #E0E0E0',
                borderTop: isMobile ? '1px solid #E0E0E0' : 'none',
                paddingTop: isMobile ? '15px' : '25px',
                paddingLeft: isMobile ? '25px' : '25px',
                width: isMobile ? '100%' : '200px'
            }}>
                <button style={styles.reviewButton}>
                    Revisar Prática 
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

// Estado vazio caso não tenha nada daquela matéria
const EmptyState = ({ disciplina }) => (
    <div style={{textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #DDD'}}>
        <div style={{marginBottom: '15px', color: '#4CAF50'}}>✓</div>
        <h3 style={{color: '#333', margin: '0 0 10px 0'}}>Tudo em dia!</h3>
        <p style={{color: '#666'}}>
            Não há novas produções de <strong>{disciplina}</strong> aguardando revisão no momento.
        </p>
    </div>
);

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '30px 20px' },
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' },
    
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid #E0E0E0', paddingBottom: '20px' },
    lockTag: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#546E7A', textTransform: 'uppercase', marginBottom: '5px', backgroundColor: '#ECEFF1', padding: '4px 8px', borderRadius: '4px' },
    pageTitle: { fontSize: '28px', color: '#1565C0', fontWeight: '800', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '15px', color: '#546E7A', margin: 0 },
    
    counterBadge: { backgroundColor: '#FFF3E0', color: '#E65100', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
    
    // CARD (Corrigido com bordas explícitas)
    card: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E0E0E0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', display: 'flex', transition: 'all 0.2s ease', cursor: 'pointer', overflow: 'hidden' },
    cardHover: { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', borderColor: '#BBDEFB' },
    
    cardContent: { flex: 1, padding: '25px', display: 'flex', flexDirection: 'column' },
    cardTopRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
    subjectBadge: { padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    aiBadge: { backgroundColor: '#F5F7FA', color: '#546E7A', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', border: '1px solid #ECEFF1' },
    metaData: { marginLeft: 'auto', fontSize: '12px', color: '#E65100', display: 'flex', alignItems: 'center', fontWeight: '600' },
    
    cardTitle: { fontSize: '18px', fontWeight: '700', color: '#333', margin: '0 0 12px 0' },
    practicePreview: { backgroundColor: '#FFFFFF', borderLeft: '3px solid #CFD8DC', padding: '5px 15px', marginBottom: '15px', display: 'flex', alignItems: 'flex-start' },
    
    cardFooter: { display: 'flex', alignItems: 'center', marginTop: 'auto', gap: '10px' },
    footerItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#546E7A', fontWeight: '500' },
    separator: { color: '#CFD8DC' },
    levelText: { backgroundColor: '#F5F5F5', color: '#616161', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' },
    
    cardAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', padding: '25px' },
    reviewButton: { backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'background 0.2s', width: '100%', justifyContent: 'center' }
};

export default ListaRevisao;