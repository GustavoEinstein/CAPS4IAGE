import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
    Search, 
    Bookmark, 
    Bot, 
    CheckCircle2, 
    ChevronLeft, 
    ChevronRight, 
    Users, 
    Trophy, 
    Layers,
    Filter
} from 'lucide-react';

// --- DADOS MOCK (Ricos em texto para testar a busca) ---
const DADOS_MOCK = [
    { 
        id: "filosofia-01", 
        titulo: "Dilemas Éticos com IA na Sala de Aula", 
        disciplina: "Filosofia", 
        nivel: "Ensino Médio", 
        modelo_ia: "Claude 3", 
        categoria: "Estudo de Caso", 
        favorito: true, 
        resumo: "Uma simulação onde a IA atua como um 'Gerador de Dilemas Morais' personalizados. Os alunos debateram situações envolvendo carros autônomos e triagem médica.", 
        likes: 142 
    },
    { 
        id: "matematica-10", 
        titulo: "Frações no Minecraft: Construção Guiada", 
        disciplina: "Matematica", 
        nivel: "Fundamental 1", 
        modelo_ia: "ChatGPT-4o", 
        categoria: "Simulação / Roleplay", 
        favorito: false, 
        resumo: "Utilização do jogo Minecraft para ensinar frações equivalentes. A IA atuou como 'Mestre do Jogo' gerando missões de construção progressivas para a turma.", 
        likes: 98 
    },
    { 
        id: "historia-02", 
        titulo: "Entrevista Viva: Dom Pedro II", 
        disciplina: "Historia", 
        nivel: "Ensino Médio", 
        modelo_ia: "ChatGPT-4", 
        categoria: "Simulação / Roleplay", 
        favorito: false, 
        resumo: "Transformamos a IA na persona do Imperador. Os alunos atuaram como jornalistas republicanos de 1889, questionando as motivações para o fim da escravidão.", 
        likes: 128 
    },
    { 
        id: "ciencias-03", 
        titulo: "Ciclo da Água: Roteiro Experimental", 
        disciplina: "Ciencias", 
        nivel: "Fundamental 1", 
        modelo_ia: "Copilot", 
        categoria: "Plano de Aula", 
        favorito: true, 
        resumo: "A IA gerou um roteiro seguro para simular chuva em potes de vidro. O diferencial foi a explicação simplificada gerada para cada etapa do fenômeno.", 
        likes: 56 
    },
    { 
        id: "geografia-04", 
        titulo: "Geopolítica: O Jogo das Nações", 
        disciplina: "Geografia", 
        nivel: "Ensino Médio", 
        modelo_ia: "Gemini 1.5", 
        categoria: "Simulação / Roleplay", 
        favorito: false, 
        resumo: "Simulação da ONU. A IA forneceu 'fichas secretas' com objetivos ocultos de cada país para os grupos negociarem acordos climáticos.", 
        likes: 112 
    },
    { 
        id: "bio-06", 
        titulo: "Detetive Genético: Quem é o Pai?", 
        disciplina: "Biologia", 
        nivel: "Ensino Médio", 
        modelo_ia: "Claude 3", 
        categoria: "Quiz / Questões", 
        favorito: true, 
        resumo: "A IA gerou 5 cenários de testes de DNA com alelos complexos (estilo questão de vestibular). Os alunos tiveram que deduzir a paternidade.", 
        likes: 78 
    },
    {
        id: "port-07",
        titulo: "Feedback de Redação Automático",
        disciplina: "Portugues",
        nivel: "Ensino Médio",
        modelo_ia: "ChatGPT-4", 
        categoria: "Feedback para Aluno", 
        favorito: false,
        resumo: "Prompt estruturado para que a IA atue como corretora do ENEM, pontuando as 5 competências e sugerindo melhorias sem reescrever o texto.",
        likes: 210
    },
    {
        id: "fisica-08",
        titulo: "Lançamento de Projéteis com Python",
        disciplina: "Fisica",
        nivel: "Ensino Médio",
        modelo_ia: "Claude 3.5 Sonnet",
        categoria: "Código / Programação",
        favorito: false,
        resumo: "A IA gerou o código Python para simular lançamentos oblíquos. Os alunos alteravam variáveis (gravidade, ângulo) para ver o resultado gráfico.",
        likes: 85
    }
];

const Inicio = () => {
    const { isMobile } = useOutletContext() || { isMobile: false }; 
    const [searchTerm, setSearchTerm] = useState('');
    const [producoes, setProducoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; 

    useEffect(() => {
        setTimeout(() => {
            setProducoes(DADOS_MOCK);
            setIsLoading(false);
        }, 600);
    }, []);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    // --- LÓGICA DE BUSCA APRIMORADA (Universal) ---
    const filteredProducoes = producoes.filter(item => {
        if (!searchTerm) return true; // Se não tem busca, mostra tudo

        const term = searchTerm.toLowerCase().trim();
        
        // Função auxiliar para verificar se uma string contém o termo
        const matches = (text) => text && text.toLowerCase().includes(term);

        return (
            matches(item.titulo) ||
            matches(item.disciplina) ||
            matches(item.categoria) ||
            matches(item.modelo_ia) ||
            matches(item.nivel) ||
            matches(item.resumo)
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredProducoes.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducoes.length / itemsPerPage);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* HERO SECTION */}
                <div style={{
                    ...styles.heroSection,
                    padding: isMobile ? '25px 20px 30px 20px' : '30px 20px 40px 20px',
                    borderRadius: isMobile ? '0 0 16px 16px' : '0 0 20px 20px',
                    textAlign: isMobile ? 'left' : 'center',
                    alignItems: isMobile ? 'flex-start' : 'center',
                }}>
                    <div style={{...styles.heroContent, textAlign: isMobile ? 'left' : 'center'}}>
                        <h1 style={{...styles.heroTitle, fontSize: isMobile ? '22px' : '28px', marginBottom: '8px'}}>
                            {isMobile ? "Olá, Ricardo!" : "Olá, Professor Ricardo!"}
                        </h1>
                        <p style={{...styles.heroSubtitle, fontSize: isMobile ? '13px' : '15px', marginBottom: '25px', display: 'block'}}>
                            Explore as melhores práticas pedagógicas validadas pela nossa rede.
                        </p>
                        
                        <div style={styles.searchWrapper}>
                            <input 
                                type="text" 
                                placeholder={isMobile ? "Buscar prática..." : "Pesquise por título, disciplina, IA ou palavra-chave..."} 
                                style={{...styles.searchInput, padding: '14px 45px 14px 20px', fontSize: '15px', height: 'auto'}}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={20} style={{...styles.searchIcon, right: isMobile ? '15px' : '20px'}} />
                        </div>
                    </div>
                </div>

                {/* CONTEÚDO */}
                <div style={{
                    ...styles.contentArea,
                    padding: isMobile ? '0 0 40px 0' : '0 10px 60px 10px',
                }}>
                    <div style={{...styles.mainCard, padding: isMobile ? '20px' : '40px'}}>
                        
                        <div style={styles.sectionHeader}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <Trophy size={isMobile ? 22 : 24} color="#F9A825" />
                                <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '18px' : '22px'}}>
                                    {searchTerm ? "Resultados da Busca" : "Destaques da Semana"}
                                </h2>
                            </div>
                            <span style={styles.badgeCount}>{filteredProducoes.length}</span>
                        </div>

                        {isLoading ? (
                            <div style={{textAlign: 'center', padding: '50px', color: '#90A4AE'}}>
                                Carregando biblioteca...
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    ...styles.grid,
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'
                                }}>
                                    {currentItems.map((item) => (
                                        <Card key={item.id} data={item} isMobile={isMobile} />
                                    ))}
                                </div>

                                {filteredProducoes.length === 0 && (
                                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#90A4AE'}}>
                                        <Filter size={48} style={{opacity: 0.2, marginBottom: '10px'}}/>
                                        <p>Nenhuma prática encontrada para "<strong>{searchTerm}</strong>".</p>
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            style={styles.clearSearchBtn}
                                        >
                                            Limpar filtro
                                        </button>
                                    </div>
                                )}

                                {filteredProducoes.length > itemsPerPage && (
                                    <div style={styles.paginationContainer}>
                                        <button onClick={prevPage} disabled={currentPage === 1} style={{...styles.pageButton, opacity: currentPage === 1 ? 0.5 : 1}}>
                                            <ChevronLeft size={20} /> Anterior
                                        </button>
                                        <span style={styles.pageInfo}>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
                                        <button onClick={nextPage} disabled={currentPage === totalPages} style={{...styles.pageButton, opacity: currentPage === totalPages ? 0.5 : 1}}>
                                            Próxima <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE CARD (Visual Clean) ---
const Card = ({ data, isMobile }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(data.favorito);

    const toggleFavorite = (e) => { e.stopPropagation(); setIsFavorited(!isFavorited); };

    const getTheme = (disciplina) => {
        const themes = {
            Matematica: { bg: '#FCE4EC', text: '#C2185B' },
            Historia:   { bg: '#F3E5F5', text: '#7B1FA2' },
            Geografia:  { bg: '#FFF3E0', text: '#E65100' },
            Ciencias:   { bg: '#E8F5E9', text: '#2E7D32' },
            Biologia:   { bg: '#E8F5E9', text: '#2E7D32' },
            Fisica:     { bg: '#E8EAF6', text: '#3F51B5' },
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
                padding: isMobile ? '16px' : '22px'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/dashboard/producao/${data.id}`)}
        >
            <div style={styles.cardHeader}>
                <div style={{display:'flex', gap: '8px', flexWrap: 'wrap'}}>
                    <span style={{...styles.subjectBadge, backgroundColor: theme.bg, color: theme.text}}>
                        {data.disciplina}
                    </span>
                    <span style={styles.levelBadge}>{data.nivel}</span>
                </div>
                
                <div style={styles.aiBadge}>
                    <Bot size={14} style={{marginRight: '4px'}} />
                    {data.modelo_ia}
                </div>
            </div>
            
            <div style={styles.cardBody}>
                <h3 style={{...styles.cardTitle, fontSize: isMobile ? '16px' : '18px'}}>
                    {data.titulo}
                </h3>
                
                <div style={styles.practicePreview}>
                    <p style={styles.cardSummary}>{data.resumo}</p>
                </div>
            </div>
            
            <div style={styles.cardFooter}>
                <div style={styles.categoryInfo}>
                    <Layers size={16} color="#78909C" style={{marginRight: '6px'}} />
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
                    <div style={styles.verifiedBadge} title="Validado por Pares">
                        <CheckCircle2 size={18} color="#4CAF50" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS CLEAN ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box' },
    container: { width: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
    
    heroSection: { background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 2px 10px rgba(21, 101, 192, 0.15)', marginBottom: '20px' },
    heroContent: { maxWidth: '700px', width: '100%', alignSelf: 'center' },
    heroTitle: { fontWeight: '800', letterSpacing: '-0.5px', margin: 0 },
    heroSubtitle: { opacity: 0.9, fontWeight: '400', margin: 0 },
    
    searchWrapper: { position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' },
    searchInput: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: '50px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', outline: 'none', color: '#333333', boxSizing: 'border-box', fontWeight: '500' },
    searchIcon: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: '#1565C0' },
    
    contentArea: { width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', position: 'relative' },
    mainCard: { width: '100%', maxWidth: '1400px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', border: '1px solid #E0E0E0', boxSizing: 'border-box' },

    sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #F0F2F5', paddingBottom: '15px' },
    sectionTitle: { color: '#1565C0', margin: 0, fontWeight: '800' },
    badgeCount: { backgroundColor: '#E3F2FD', color: '#1565C0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
    
    grid: { display: 'grid', gap: '25px', border: 'none', backgroundColor: 'transparent' },
    paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '20px', paddingBottom: '10px' },
    pageButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '1px solid #CFD8DC', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', color: '#546E7A', fontWeight: '600', transition: 'all 0.2s' },
    pageInfo: { fontSize: '14px', color: '#37474F' },
    clearSearchBtn: { marginTop: '10px', color: '#1565C0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' },

    card: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', cursor: 'pointer', height: '100%', boxSizing: 'border-box' },
    cardHover: { transform: 'translateY(-5px)', boxShadow: '0 12px 20px rgba(0,0,0,0.1)', borderColor: '#42A5F5' },
    
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'flex-start' },
    subjectBadge: { padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    levelBadge: { backgroundColor: '#F5F5F5', color: '#616161', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '600' },
    aiBadge: { backgroundColor: '#F5F7FA', color: '#546E7A', padding: '5px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', border: '1px solid #ECEFF1' },
    
    cardBody: { flex: 1, marginBottom: '16px' },
    cardTitle: { color: '#263238', margin: '0 0 10px 0', lineHeight: '1.4', fontWeight: '700' },
    
    practicePreview: { borderLeft: '3px solid #E0E0E0', paddingLeft: '12px' },
    cardSummary: { fontSize: '14px', color: '#546E7A', lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F2F4F7' },
    categoryInfo: { display: 'flex', alignItems: 'center', color: '#78909C' },
    categoryName: { fontSize: '12px', fontWeight: '600', color: '#546E7A' },
    footerRightSide: { display: 'flex', alignItems: 'center', gap: '10px' },
    favoriteButton: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    verifiedBadge: { display: 'flex', alignItems: 'center', cursor: 'help' }
};

export default Inicio;