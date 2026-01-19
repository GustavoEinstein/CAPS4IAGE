import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    Search, 
    Bookmark, 
    Bot, 
    CheckCircle2, 
    BookOpen, 
    Tag 
} from 'lucide-react';

// --- DADOS MOCK ---
const DADOS_MOCK = [
    {
        id: 1, 
        titulo: "Explorando Frações com Minecraft", 
        disciplina: "Matematica", 
        nivel: "Fundamental1", 
        modelo_ia: "ChatGPT-4",
        categoria: "Prompt Didático", 
        favorito: true,
        resumo: "Um prompt para gerar desafios matemáticos baseados no jogo Minecraft, incentivando a lógica espacial e o engajamento dos alunos.", 
        likes: 34
    },
    {
        id: 2, 
        titulo: "Simulação: Entrevista com Dom Pedro II", 
        disciplina: "Historia", 
        nivel: "Medio", 
        modelo_ia: "Claude 3", 
        categoria: "Roleplay / Simulação", 
        favorito: false,
        resumo: "Prompt para criar um persona histórica fiel para os alunos entrevistarem e entenderem o contexto imperial do Brasil.", 
        likes: 128
    },
    {
        id: 3, 
        titulo: "Gerador de Quiz sobre Biomas", 
        disciplina: "Geografia", 
        nivel: "Fundamental2", 
        modelo_ia: "Gemini", 
        categoria: "Gerador de Avaliação", 
        favorito: false,
        resumo: "Criação automática de questões de múltipla escolha com gabarito comentado e adaptado ao nível da turma.", 
        likes: 56
    },
    {
        id: 4, 
        titulo: "Revisão de Texto: Estilo Jornalístico", 
        disciplina: "Portugues", 
        nivel: "Medio", 
        modelo_ia: "ChatGPT-3.5", 
        categoria: "Assistente de Correção", 
        favorito: true,
        resumo: "Usando a IA para apontar vícios de linguagem em redações de alunos e sugerir melhorias coesas sem reescrever pelo aluno.", 
        likes: 12
    },
    {
        id: 5, 
        titulo: "Plano de Aula: Ciclo da Água", 
        disciplina: "Ciencias", 
        nivel: "Fundamental1", 
        modelo_ia: "Copilot", 
        categoria: "Plano de Aula Completo", 
        favorito: false,
        resumo: "Roteiro para uma aula prática usando materiais caseiros e explicação da IA para tirar dúvidas comuns das crianças.", 
        likes: 45
    },
    {
        id: 6, 
        titulo: "Debate Ético: IA na Sociedade", 
        disciplina: "Filosofia", 
        nivel: "Superior", 
        modelo_ia: "Llama", 
        categoria: "Roteiro de Debate", 
        favorito: false,
        resumo: "Estrutura de debate onde a IA atua como mediadora imparcial levantando pontos de vista opostos para estimular o pensamento crítico.", 
        likes: 89
    }
];

const Inicio = () => {
    const { isMobile } = useOutletContext() || { isMobile: false }; 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [producoes, setProducoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducoes(DADOS_MOCK);
            setIsLoading(false);
        }, 600);
    }, []);

    const filteredProducoes = producoes.filter(item => 
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={{
                ...styles.heroSection,
                padding: isMobile ? '25px 20px 30px 20px' : '30px 20px 40px 20px',
                borderRadius: isMobile ? '0 0 16px 16px' : '0 0 20px 20px',
                textAlign: isMobile ? 'left' : 'center',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '20px'
            }}>
                <div style={{...styles.heroContent, textAlign: isMobile ? 'left' : 'center'}}>
                    <h1 style={{
                        ...styles.heroTitle,
                        fontSize: isMobile ? '22px' : '26px', 
                        marginBottom: '6px'
                    }}>
                        {isMobile ? "Olá, Professor(a)!" : "O que vamos ensinar hoje?"}
                    </h1>
                    
                    <p style={{
                        ...styles.heroSubtitle,
                        fontSize: isMobile ? '13px' : '15px',
                        marginBottom: '20px', 
                        display: 'block'
                    }}>
                        Explore produções validadas pela comunidade.
                    </p>
                    
                    <div style={styles.searchWrapper}>
                        <input 
                            type="text" 
                            placeholder={isMobile ? "Buscar atividade..." : "Pesquise por disciplina, tema ou IA..."} 
                            style={{
                                ...styles.searchInput,
                                padding: '12px 45px 12px 20px', 
                                fontSize: '15px',
                                height: 'auto'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search 
                            size={19} 
                            style={{
                                ...styles.searchIcon,
                                right: isMobile ? '15px' : '20px'
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* --- CONTEÚDO --- */}
            <div style={{
                ...styles.contentArea,
                padding: isMobile ? '0 15px 40px 15px' : '0 30px 60px 30px',
                marginTop: '0' 
            }}>
                
                <div style={{
                    ...styles.mainCard,
                    padding: isMobile ? '20px' : '30px'
                }}>
                    
                    <div style={styles.sectionHeader}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <BookOpen size={isMobile ? 22 : 24} color="#1565C0" />
                            <h2 style={{
                                ...styles.sectionTitle,
                                fontSize: isMobile ? '18px' : '22px'
                            }}>
                                Destaques
                            </h2>
                        </div>
                        <span style={styles.badgeCount}>{filteredProducoes.length}</span>
                    </div>

                    {isLoading ? (
                        <div style={{textAlign: 'center', padding: '50px', color: '#90A4AE'}}>
                            Carregando...
                        </div>
                    ) : (
                        <div style={{
                            ...styles.grid,
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))'
                        }}>
                            {filteredProducoes.map((item) => (
                                <Card key={item.id} data={item} isMobile={isMobile} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE CARD ---
const Card = ({ data, isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(data.favorito);

    const toggleFavorite = (e) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    const getTheme = (disciplina) => {
        const themes = {
            Matematica: { bg: '#FCE4EC', text: '#C2185B' },
            Historia:   { bg: '#F3E5F5', text: '#7B1FA2' },
            Geografia:  { bg: '#FFF3E0', text: '#E65100' },
            Ciencias:   { bg: '#E8F5E9', text: '#2E7D32' },
            Portugues:  { bg: '#E3F2FD', text: '#1565C0' },
            Filosofia:  { bg: '#ECEFF1', text: '#455A64' },
            Default:    { bg: '#F5F5F5', text: '#616161' }
        };
        return themes[disciplina] || themes.Default;
    };

    const theme = getTheme(data.disciplina);

    return (
        <div 
            style={{
                ...styles.card,
                ...(isHovered && !isMobile ? styles.cardHover : {}),
                padding: isMobile ? '16px' : '20px'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.cardHeader}>
                <span style={{
                    ...styles.subjectBadge,
                    backgroundColor: theme.bg,
                    color: theme.text
                }}>
                    {data.disciplina}
                </span>
                <div style={styles.aiBadge}>
                    <Bot size={14} style={{marginRight: '4px'}} />
                    {data.modelo_ia}
                </div>
            </div>
            
            <div style={styles.cardBody}>
                <h3 style={{...styles.cardTitle, fontSize: isMobile ? '16px' : '17px'}}>
                    {data.titulo}
                </h3>
                <p style={styles.cardSummary}>{data.resumo}</p>
            </div>
            
            <div style={styles.cardFooter}>
                <div style={styles.categoryInfo}>
                    <Tag size={16} color="#546E7A" style={{marginRight: '6px'}} />
                    <span style={styles.categoryName}>{data.categoria}</span>
                </div>
                
                <div style={styles.footerRightSide}>
                    <button onClick={toggleFavorite} style={styles.favoriteButton}>
                        <Bookmark 
                            size={20} 
                            color={isFavorited ? "#1565C0" : "#B0BEC5"} 
                            fill={isFavorited ? "#1565C0" : "none"} 
                        />
                    </button>
                    <div style={styles.verifiedBadge}>
                        <CheckCircle2 size={18} color="#4CAF50" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
    },
    heroSection: {
        background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(21, 101, 192, 0.15)' 
    },
    heroContent: {
        maxWidth: '700px',
        width: '100%',
        alignSelf: 'center'
    },
    heroTitle: { fontWeight: '800', letterSpacing: '-0.5px', margin: 0 },
    heroSubtitle: { opacity: 0.9, fontWeight: '400', margin: 0 },
    
    searchWrapper: { position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' },
    searchInput: {
        width: '100%', backgroundColor: '#FFFFFF', borderRadius: '50px',
        border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', outline: 'none', 
        color: '#333333', boxSizing: 'border-box', fontWeight: '500'
    },
    searchIcon: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: '#1565C0' },
    
    contentArea: { 
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
    },

    mainCard: {
        width: '100%',
        maxWidth: '1700px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E0E0E0',
        boxSizing: 'border-box'
    },

    sectionHeader: { 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', borderBottom: '1px solid #F0F2F5', paddingBottom: '15px'
    },
    sectionTitle: { color: '#1565C0', margin: 0, fontWeight: '800' },
    badgeCount: { 
        backgroundColor: '#E3F2FD', color: '#1565C0', padding: '4px 12px', 
        borderRadius: '20px', fontSize: '12px', fontWeight: '700' 
    },
    
    grid: {
        display: 'grid',
        gap: '20px',
        border: 'none',
        backgroundColor: 'transparent'
    },
    
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px', 
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        boxSizing: 'border-box'
    },
    cardHover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
        border: '1px solid #42A5F5'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' },
    subjectBadge: { padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    aiBadge: { backgroundColor: '#F5F7FA', color: '#546E7A', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', border: '1px solid #ECEFF1' },
    cardBody: { flex: 1, marginBottom: '16px' },
    cardTitle: { color: '#101828', margin: '0 0 6px 0', lineHeight: '1.4', fontWeight: '700' },
    cardSummary: { fontSize: '13px', color: '#667085', lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F2F4F7' },
    categoryInfo: { display: 'flex', alignItems: 'center', color: '#546E7A' },
    categoryName: { fontSize: '12px', fontWeight: '600', color: '#344054' },
    footerRightSide: { display: 'flex', alignItems: 'center', gap: '10px' },
    favoriteButton: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    verifiedBadge: { display: 'flex', alignItems: 'center', cursor: 'help' }
};

export default Inicio;