import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Usando a configuração central (Recomendado)
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Clock, 
    Bot, 
    ArrowRight, 
    Tag, 
    BookOpen, 
    Lock,
    AlertCircle
} from 'lucide-react';

const RevisaoDuploCego = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const isMobile = context ? context.isMobile : false;

    // --- ESTADOS (Sua Lógica) ---
    const [producoes, setProducoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pega a disciplina do usuário localmente para exibir no título
    const userDisciplina = localStorage.getItem('user_disciplina') || 'Geral';

    // --- BUSCA DE DADOS (Sua Lógica) ---
    useEffect(() => {
        fetchReviewQueue();
    }, []);

    const fetchReviewQueue = async () => {
        try {
            // A instância 'api' já injeta o token automaticamente
            const response = await api.get('api/production/review-list/');
            setProducoes(response.data);
        } catch (error) {
            console.error("Erro ao buscar fila de revisão:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{textAlign: 'center', padding: '100px', color: '#90A4AE'}}>
            Carregando fila de validação...
        </div>
    );

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* --- CABEÇALHO (Visual Novo) --- */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.lockTag}>
                            <Lock size={12} /> Área Restrita
                        </div>
                        <h1 style={styles.pageTitle}>Fila de Validação</h1>
                        <p style={styles.pageSubtitle}>
                            Exibindo produções de <strong style={{color: '#1565C0'}}>{userDisciplina}</strong> aguardando sua análise.
                        </p>
                    </div>
                    
                    {/* Badge de Contador */}
                    <div style={styles.counterBadge}>
                        <Clock size={16} color="#E65100" />
                        <span>{producoes.length} Pendentes</span>
                    </div>
                </div>

                {/* --- LISTA DE CARDS --- */}
                <div style={styles.listContainer}>
                    {producoes.length > 0 ? (
                        producoes.map((item) => (
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

// --- COMPONENTE CARD (Design Novo + Dados do Backend) ---
const ReviewCard = ({ data, onClick, isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Tema visual do card
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
                    {/* Badge da Disciplina */}
                    <span style={{...styles.subjectBadge, backgroundColor: theme.bg, color: theme.text}}>
                        {data.disciplina}
                    </span>
                    
                    {/* Badge da IA */}
                    <div style={styles.aiBadge}>
                        <Bot size={14} style={{marginRight: '4px'}} />
                        {data.modelo_ia || "IA"}
                    </div>
                    
                    {/* Data */}
                    <div style={styles.metaData}>
                        <Clock size={14} style={{marginRight: '4px'}} />
                        {data.data} {/* Data formatada vinda da API */}
                    </div>
                </div>

                <h3 style={styles.cardTitle}>{data.titulo}</h3>

                {/* Prévia (Se o backend mandar resumo futuramente, coloque aqui) */}
                <div style={styles.practicePreview}>
                    <BookOpen size={14} color="#546E7A" style={{minWidth: '14px', marginTop: '3px'}} />
                    <span style={{marginLeft: '8px', color: '#546E7A', fontSize: '13px'}}>
                        Clique para ler os detalhes da prática e o relato de experiência...
                    </span>
                </div>

                <div style={styles.cardFooter}>
                    {/* Categoria (Se o backend mandar, use data.categoria) */}
                    <div style={styles.footerItem}>
                        <Tag size={14} color="#90A4AE" />
                        <span>{data.categoria || "Atividade Prática"}</span>
                    </div>
                    <span style={styles.separator}>•</span>
                    <div style={styles.footerItem}>
                        <span style={styles.levelText}>{data.nivel || "Geral"}</span>
                    </div>
                </div>
            </div>

            {/* Ação (Botão Direito) */}
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

// --- ESTADO VAZIO ---
const EmptyState = ({ disciplina }) => (
    <div style={{textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #DDD'}}>
        <div style={{marginBottom: '15px', color: '#4CAF50', display:'flex', justifyContent:'center'}}>
            <div style={{padding: '15px', background: '#E8F5E9', borderRadius: '50%'}}>
                <AlertCircle size={30} color="#2E7D32"/>
            </div>
        </div>
        <h3 style={{color: '#333', margin: '0 0 10px 0'}}>Tudo em dia!</h3>
        <p style={{color: '#666'}}>
            Não há novas produções de <strong>{disciplina}</strong> aguardando revisão no momento.
        </p>
    </div>
);

// --- ESTILOS DO GITHUB (Exatamente como pediu) ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '30px 20px' },
    container: { width: '100%', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' },
    
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid #E0E0E0', paddingBottom: '20px' },
    lockTag: { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#546E7A', textTransform: 'uppercase', marginBottom: '5px', backgroundColor: '#ECEFF1', padding: '4px 8px', borderRadius: '4px' },
    pageTitle: { fontSize: '28px', color: '#1565C0', fontWeight: '800', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '15px', color: '#546E7A', margin: 0 },
    
    counterBadge: { backgroundColor: '#FFF3E0', color: '#E65100', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
    
    // CARD
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

export default RevisaoDuploCego;