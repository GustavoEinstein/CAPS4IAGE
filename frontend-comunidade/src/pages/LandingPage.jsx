import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Zap, 
    Network,
    Share2, 
    Shield, 
    Cpu,
    CheckCircle2, // <--- ADICIONADO AQUI
    Layout
} from 'lucide-react';

// --- ÍCONE PERSONALIZADO: TEIA DE ARANHA ---
const SpiderWebIcon = ({ size = 24, color = "currentColor" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="1.5" // Linhas ligeiramente mais finas para elegância
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Eixos Radiais (A estrutura da rede) */}
        <path d="M12 2v20" /> {/* Vertical */}
        <path d="M2 12h20" /> {/* Horizontal */}
        <path d="M4.93 4.93l14.14 14.14" /> {/* Diagonal 1 */}
        <path d="M19.07 4.93L4.93 19.07" /> {/* Diagonal 2 */}
        
        {/* Conexões Internas (Octógono Menor) */}
        <path d="M12 7 L15.53 8.47 L17 12 L15.53 15.53 L12 17 L8.47 15.53 L7 12 L8.47 8.47 Z" />
        
        {/* Conexões Externas (Octógono Maior) */}
        <path d="M12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 Z" />
    </svg>
);
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.wrapper}>
            
            {/* --- 1. NAVBAR PROFISSIONAL --- */}
            <nav style={styles.nav}>
                <div style={styles.navContent}>
                    <div style={styles.logoGroup}>
                                            <div style={styles.logoCircle}>
                        <span><SpiderWebIcon size={32} color="#1565C0" /></span>
                    </div>
                        <span style={styles.logoText}>TEIA</span>
                    </div>
                    <div style={styles.navActions}>
                        <button onClick={() => navigate('/login')} style={styles.navLink}>
                            Entrar
                        </button>
                        <button onClick={() => navigate('/register')} style={styles.navButtonPrimary}>
                            Criar conta gratuita
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- 2. HERO SECTION --- */}
            <header style={styles.hero}>
                <div style={styles.heroContainer}>
                    <div style={styles.heroContent}>
                        <div style={styles.badge}>
                            <span style={styles.badgeDot}></span>
                            Versão Beta Disponível
                        </div>
                        <h1 style={styles.heroTitle}>
                            A ponte entre a <br/>
                            <span style={styles.textHighlight}>docência e a IA.</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            O TEIA não é apenas um repositório. É uma comunidade viva onde professores exploram como a Inteligência Artificial pode potencializar a sala de aula, com curadoria humana e rigor acadêmico.
                        </p>
                        <div style={styles.heroButtons}>
                            <button onClick={() => navigate('/register')} style={styles.btnPrimaryLarge}>
                                Juntar-se à Comunidade <ArrowRight size={20} />
                            </button>
                            <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} style={styles.btnSecondaryLarge}>
                                Entender a Proposta
                            </button>
                        </div>
                    </div>
                    
                    {/* Visual Abstrato (Simulando Dashboard) */}
                    <div style={styles.heroVisual}>
                        <div style={styles.mockupCard}>
                            <div style={styles.mockupHeader}>
                                <div style={styles.mockupDotRed}></div>
                                <div style={styles.mockupDotYellow}></div>
                                <div style={styles.mockupDotGreen}></div>
                            </div>
                            <div style={styles.mockupBody}>
                                <div style={styles.skeletonLineLg}></div>
                                <div style={styles.skeletonLineSm}></div>
                                <div style={styles.skeletonGrid}>
                                    <div style={styles.skeletonBox}></div>
                                    <div style={styles.skeletonBox}></div>
                                </div>
                            </div>
                            <div style={styles.floatingBadge}>
                                <Shield size={16} color="#1565C0" />
                                <span>Revisão Duplo-Cego Ativa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- 3. PILARES DO PROJETO --- */}
            <section style={styles.pillarsSection}>
                <div style={styles.container}>
                    <p style={styles.sectionLabel}>NOSSOS PILARES</p>
                    <div style={styles.pillarsGrid}>
                        <div style={styles.pillarCard}>
                            <div style={styles.pillarIcon}><Share2 size={24} color="#0F172A"/></div>
                            <h3>Colaboração Real</h3>
                            <p>Transforme o conhecimento individual em inteligência coletiva. Acesse um ecossistema de práticas pedagógicas validadas e escale o impacto das suas aulas.</p>
                        </div>
                        <div style={styles.pillarCard}>
                            <div style={styles.pillarIcon}><Shield size={24} color="#0F172A"/></div>
                            <h3>Validação por Pares</h3>
                            <p>O sistema "Duplo-Cego" garante que o foco seja a qualidade pedagógica, livre de vieses pessoais.</p>
                        </div>
                        <div style={styles.pillarCard}>
                            <div style={styles.pillarIcon}><Cpu size={24} color="#0F172A"/></div>
                            <h3>IA como Ferramenta</h3>
                            <p>Não substituímos o professor. Usamos a tecnologia para eliminar burocracia e ampliar a criatividade.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. SOBRE A COMUNIDADE --- */}
            <section style={styles.aboutSection}>
                <div style={styles.aboutContainer}>
                    <div style={styles.aboutText}>
                        <h2 style={styles.sectionTitle}>Mais que software. <br/>Uma rede de inteligência.</h2>
                        <p style={styles.paragraph}>
                            A inserção da Inteligência Artificial na educação ainda é um terreno novo e, por vezes, intimidante. O <strong>TEIA</strong> nasceu para ser o laboratório seguro onde essa inovação acontece.
                        </p>
                        <p style={styles.paragraph}>
                            Ao catalogar suas produções, você não está apenas guardando arquivos. Você está treinando uma base de conhecimento coletiva, ajudando outros docentes a entenderem <em>quais prompts funcionam</em>, <em>quais IAs são melhores para cada disciplina</em> e como alinhar tudo isso à <strong>BNCC</strong>.
                        </p>
                        <div style={styles.featureList}>
                            <div style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#1565C0" />
                                <span>Curadoria pedagógica descentralizada</span>
                            </div>
                            <div style={styles.featureItem}>
                                <CheckCircle2 size={20} color="#1565C0" />
                                <span>Foco em aplicação prática em sala de aula</span>
                            </div>
                        </div>
                    </div>
                    <div style={styles.aboutVisual}>
                        {/* Grade decorativa */}
                        <div style={styles.gridDecoration}>
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} style={{
                                    ...styles.gridSquare, 
                                    opacity: Math.random() > 0.5 ? 1 : 0.3,
                                    backgroundColor: Math.random() > 0.7 ? '#1565C0' : '#E2E8F0'
                                }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. FAQ --- */}
            <section style={styles.faqSection}>
                <div style={styles.container}>
                    <div style={styles.faqHeader}>
                        <h2 style={styles.sectionTitle}>Perguntas Frequentes</h2>
                        <p style={styles.sectionSubtitle}>Entenda como participar.</p>
                    </div>
                    
                    <div style={styles.faqGrid}>
                        <div style={styles.faqCard}>
                            <h4 style={styles.faqQuestion}>O sistema é gratuito?</h4>
                            <p style={styles.faqAnswer}>Sim. O TEIA é uma iniciativa voltada para o fortalecimento da educação pública e privada, sem custo para professores.</p>
                        </div>
                        <div style={styles.faqCard}>
                            <h4 style={styles.faqQuestion}>Quem pode revisar as atividades?</h4>
                            <p style={styles.faqAnswer}>Apenas professores da mesma área de conhecimento. Um professor de Matemática só revisa produções de Matemática, garantindo a tecnicidade da avaliação.</p>
                        </div>
                        <div style={styles.faqCard}>
                            <h4 style={styles.faqQuestion}>Preciso ser expert em IA?</h4>
                            <p style={styles.faqAnswer}>Não. A plataforma foi desenhada justamente para quem está começando. Nossas ferramentas auxiliam na formatação e estruturação.</p>
                        </div>
                        <div style={styles.faqCard}>
                            <h4 style={styles.faqQuestion}>Meus dados estão seguros?</h4>
                            <p style={styles.faqAnswer}>Sim. Utilizamos criptografia padrão e respeitamos a LGPD. Seus planos de aula só se tornam públicos após sua aprovação final.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. FOOTER --- */}
            <footer style={styles.footer}>
                <div style={styles.container}>
                    <div style={styles.footerTop}>
                        <div>
                            <span style={styles.footerLogo}>TEIA</span>
                            <p style={styles.footerDesc}>Conectando inteligência humana e artificial.</p>
                        </div>
                        <div style={styles.footerLinks}>
                            <span style={styles.linkFooter}>Termos de Uso</span>
                            <span style={styles.linkFooter}>Privacidade</span>
                            <span style={styles.linkFooter}>Contato</span>
                        </div>
                    </div>
                    <div style={styles.footerBottom}>
                        © 2026 TEIA Inc. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    
    // RESET & BASE
    wrapper: { 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
        backgroundColor: '#FFFFFF', 
        minHeight: '100vh', 
        color: '#0F172A',
        overflowX: 'hidden'
    },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' },

    // NAV
    nav: { position: 'fixed', top: 0, width: '100%', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 },
    navContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', maxWidth: '1100px', margin: '0 auto', padding: '0 20px' },
    logoGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoIcon: { fontSize: '20px' },
    logoText: { fontWeight: '800', fontSize: '18px', color: '#1E293B', letterSpacing: '-0.5px' },
    navActions: { display: 'flex', gap: '15px', alignItems: 'center' },
    navLink: { background: 'none', border: 'none', color: '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
    navButtonPrimary: { backgroundColor: '#0F172A', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },

    // HERO
    hero: { padding: '160px 0 100px 0', borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' },
    heroContainer: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' },
    heroContent: { flex: 1, minWidth: '300px' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px' },
    badgeDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1E40AF' },
    heroTitle: { fontSize: '52px', lineHeight: '1.1', fontWeight: '800', color: '#0F172A', marginBottom: '24px', letterSpacing: '-1.5px' },
    textHighlight: { color: '#2563EB' },
    heroSubtitle: { fontSize: '18px', lineHeight: '1.6', color: '#475569', marginBottom: '32px', maxWidth: '500px' },
    heroButtons: { display: 'flex', gap: '15px' },
    btnPrimaryLarge: { padding: '14px 28px', backgroundColor: '#2563EB', color: 'white', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' },
    btnSecondaryLarge: { padding: '14px 28px', backgroundColor: 'white', color: '#334155', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },

    // HERO VISUAL
    heroVisual: { flex: 1, display: 'flex', justifyContent: 'center' },
    mockupCard: { width: '340px', height: '400px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative', padding: '20px' },
    mockupHeader: { display: 'flex', gap: '6px', marginBottom: '30px' },
    mockupDotRed: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' },
    mockupDotYellow: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' },
    mockupDotGreen: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' },
    mockupBody: { display: 'flex', flexDirection: 'column', gap: '15px' },
    skeletonLineLg: { width: '80%', height: '20px', backgroundColor: '#F1F5F9', borderRadius: '4px' },
    skeletonLineSm: { width: '50%', height: '20px', backgroundColor: '#F1F5F9', borderRadius: '4px' },
    skeletonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
    skeletonBox: { height: '120px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' },
    floatingBadge: { position: 'absolute', bottom: '30px', right: '-30px', backgroundColor: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: '#1E293B', border: '1px solid #F1F5F9' },

    // PILLARS
    pillarsSection: { padding: '80px 0', borderBottom: '1px solid #F1F5F9' },
    sectionLabel: { fontSize: '12px', fontWeight: '700', color: '#64748B', letterSpacing: '1px', marginBottom: '40px', display: 'block' },
    pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' },
    pillarCard: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    pillarIcon: { width: '48px', height: '48px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
    
    // ABOUT
    aboutSection: { padding: '100px 0', backgroundColor: 'white' },
    aboutContainer: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '80px', alignItems: 'center', flexWrap: 'wrap' },
    aboutText: { flex: 1, minWidth: '300px' },
    sectionTitle: { fontSize: '36px', fontWeight: '800', color: '#0F172A', marginBottom: '24px', lineHeight: '1.2' },
    paragraph: { fontSize: '16px', lineHeight: '1.7', color: '#475569', marginBottom: '20px' },
    featureList: { marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '500', color: '#334155' },
    aboutVisual: { flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' },
    gridDecoration: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', width: '240px' },
    gridSquare: { width: '100%', paddingTop: '100%', borderRadius: '6px' },

    // FAQ
    faqSection: { padding: '80px 0', backgroundColor: '#F8FAFC' },
    faqHeader: { marginBottom: '50px', textAlign: 'center' },
    sectionSubtitle: { fontSize: '18px', color: '#64748B' },
    faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
    faqCard: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' },
    faqQuestion: { fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', marginTop: 0 },
    faqAnswer: { fontSize: '15px', lineHeight: '1.6', color: '#334155', margin: 0 },

    // FOOTER
    footer: { backgroundColor: '#0F172A', padding: '60px 0 30px 0', color: 'white' },
    footerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '40px', marginBottom: '30px', flexWrap: 'wrap', gap: '30px' },
    footerLogo: { fontSize: '20px', fontWeight: '800', display: 'block', marginBottom: '10px' },
    footerDesc: { color: '#94A3B8', fontSize: '14px' },
    footerLinks: { display: 'flex', gap: '20px' },
    linkFooter: { color: '#CBD5E1', fontSize: '14px', cursor: 'pointer' },
    footerBottom: { textAlign: 'center', color: '#64748B', fontSize: '13px' }
};


export default LandingPage;