import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Share2, 
    Shield, 
    Cpu,
    CheckCircle2, 
    Layout,
    Mail,
    ShieldCheck,
    X // Ícone para fechar o modal
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    // --- ESTADOS DOS MODAIS (Termos e Privacidade) ---
    const [activeModal, setActiveModal] = useState(null); // 'terms', 'privacy' ou null

    const openModal = (type) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    return (
        <div style={styles.wrapper}>
            
            {/* --- 1. NAVBAR --- */}
            <nav style={styles.nav}>
                <div style={styles.navContent}>
                    <div style={styles.logoGroup}>
                        <div style={styles.logoIcon}>📘</div>
                        <span style={styles.logoText}>CAPSIAGE</span>
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
                            O CAPSIAGE não é apenas um repositório. É uma comunidade viva onde professores exploram como a Inteligência Artificial pode potencializar a sala de aula, com curadoria humana e rigor acadêmico.
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
                    
                    {/* Visual Embaçado (Duplo Cego) */}
                    <div style={styles.heroVisual}>
                        <div style={styles.blurredCardWrapper}>
                            <div style={styles.blurredBackground}>
                                <div style={styles.fakeLineLg}></div>
                                <div style={styles.fakeLineSm}></div>
                                <div style={styles.fakeGrid}>
                                    <div style={styles.fakeBox}></div>
                                    <div style={styles.fakeBox}></div>
                                </div>
                                <div style={{...styles.fakeLineLg, marginTop: '20px'}}></div>
                                <div style={styles.fakeLineSm}></div>
                            </div>
                            <div style={styles.securityOverlay}>
                                <div style={styles.securityIconCircle}>
                                    <ShieldCheck size={32} color="#1E40AF" />
                                </div>
                                <h3 style={styles.securityTitle}>Revisão Duplo-Cego Ativada</h3>
                                <p style={styles.securityText}>
                                    Aqui, sua produção e sua identidade são <strong>invioláveis</strong>. 
                                    <br/>
                                    O anonimato garante uma avaliação justa, focada puramente no mérito pedagógico.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- 3. PILARES --- */}
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
                            A inserção da Inteligência Artificial na educação ainda é um terreno novo e, por vezes, intimidante. O <strong>CAPSIAGE</strong> nasceu para ser o laboratório seguro onde essa inovação acontece.
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
                            <p style={styles.faqAnswer}>Sim. O CAPSIAGE é uma iniciativa voltada para o fortalecimento da educação pública e privada, sem custo para professores.</p>
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

            {/* --- 6. FOOTER (CORRIGIDO E ORGANIZADO) --- */}
            <footer style={styles.footer}>
                <div style={styles.container}>
                    <div style={styles.footerTop}>
                        
                        {/* Coluna 1: Logo e Descrição */}
                        <div style={{flex: 2, paddingRight: '40px'}}>
                            <span style={styles.footerLogo}>CAPSIAGE</span>
                            <p style={styles.footerDesc}>
                                Conectando inteligência humana e artificial para transformar a educação básica.
                            </p>
                        </div>

                        {/* Coluna 2: Navegação */}
                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>Navegação</h4>
                            <div style={styles.footerLinksStack}>
                                <span onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={styles.linkFooter}>Início</span>
                                <span onClick={() => navigate('/login')} style={styles.linkFooter}>Login</span>
                                <span onClick={() => navigate('/register')} style={styles.linkFooter}>Cadastro</span>
                            </div>
                        </div>

                        {/* Coluna 3: Legal (Abre Modais) */}
                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>Legal</h4>
                            <div style={styles.footerLinksStack}>
                                <button onClick={() => openModal('terms')} style={styles.linkFooterBtn}>Termos de Uso</button>
                                <button onClick={() => openModal('privacy')} style={styles.linkFooterBtn}>Privacidade</button>
                            </div>
                        </div>

                        {/* Coluna 4: Suporte */}
                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>Suporte</h4>
                            <div style={styles.footerLinksStack}>
                                <div style={{display: 'flex', gap: '8px', color: '#94A3B8', fontSize: '14px', alignItems: 'flex-start'}}>
                                    <Mail size={16} style={{marginTop: '3px'}} />
                                    <a 
                                        href="mailto:suporte.ianaeducacaobasica.unb@gmail.com" 
                                        style={styles.emailLink}
                                    >
                                        suporte.ianaeducacaobasica<br/>.unb@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div style={styles.footerBottom}>
                        © 2026 Capsiage Inc. Todos os direitos reservados.
                    </div>
                </div>
            </footer>

            {/* --- MODAIS (TELINHAS) --- */}
            {activeModal && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} style={styles.closeModalBtn}>
                            <X size={24} />
                        </button>
                        
                        {activeModal === 'terms' && (
                            <>
                                <h2 style={styles.modalTitle}>Termos de Uso</h2>
                                <div style={styles.modalBody}>
                                    <p>Bem-vindo ao CAPSIAGE. Ao utilizar nossa plataforma, você concorda com os seguintes termos:</p>
                                    <ul>
                                        <li><strong>Respeito e Colaboração:</strong> A comunidade se baseia no respeito mútuo. Comentários ofensivos nas revisões não serão tolerados.</li>
                                        <li><strong>Conteúdo Original:</strong> Você garante que o material submetido é de sua autoria ou que possui direitos de uso.</li>
                                        <li><strong>Uso Educacional:</strong> Os materiais disponíveis são exclusivamente para fins educacionais e não comerciais.</li>
                                        <li><strong>Revisão Duplo-Cego:</strong> Você aceita que seu material será revisado anonimamente e, se aprovado, publicado na plataforma.</li>
                                    </ul>
                                    <p>O descumprimento destas regras pode levar à suspensão da conta.</p>
                                </div>
                            </>
                        )}

                        {activeModal === 'privacy' && (
                            <>
                                <h2 style={styles.modalTitle}>Política de Privacidade</h2>
                                <div style={styles.modalBody}>
                                    <p>Sua privacidade é fundamental para nós. Veja como tratamos seus dados:</p>
                                    <ul>
                                        <li><strong>Coleta de Dados:</strong> Coletamos apenas nome, e-mail e dados profissionais para funcionamento do sistema.</li>
                                        <li><strong>Anonimato:</strong> No processo de revisão, sua identidade é ocultada para garantir imparcialidade.</li>
                                        <li><strong>Compartilhamento:</strong> Não vendemos nem compartilhamos seus dados com terceiros para fins publicitários.</li>
                                        <li><strong>LGPD:</strong> Você tem o direito de solicitar a exclusão de seus dados a qualquer momento através do nosso suporte.</li>
                                    </ul>
                                </div>
                            </>
                        )}
                        
                        <div style={styles.modalFooter}>
                            <button onClick={closeModal} style={styles.btnPrimaryLarge}>Entendi</button>
                        </div>
                    </div>
                </div>
            )}

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
    blurredCardWrapper: { width: '360px', height: '420px', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' },
    blurredBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', filter: 'blur(8px)', opacity: 0.5 },
    fakeLineLg: { width: '80%', height: '20px', backgroundColor: '#CBD5E1', borderRadius: '4px' },
    fakeLineSm: { width: '50%', height: '20px', backgroundColor: '#E2E8F0', borderRadius: '4px' },
    fakeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
    fakeBox: { height: '120px', backgroundColor: '#F1F5F9', borderRadius: '8px' },
    securityOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '12px', textAlign: 'center', width: '80%', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    securityIconCircle: { width: '60px', height: '60px', backgroundColor: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' },
    securityTitle: { fontSize: '18px', fontWeight: '800', color: '#1E3A8A', marginBottom: '10px' },
    securityText: { fontSize: '14px', color: '#475569', lineHeight: '1.5' },

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

    // --- FOOTER (CORRIGIDO) ---
    footer: { backgroundColor: '#0F172A', padding: '60px 0 30px 0', color: 'white' },
    footerTop: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '40px', 
        borderBottom: '1px solid #334155', 
        paddingBottom: '40px', 
        marginBottom: '30px' 
    },
    footerLogo: { fontSize: '20px', fontWeight: '800', display: 'block', marginBottom: '10px' },
    footerDesc: { color: '#94A3B8', fontSize: '14px', lineHeight: '1.6' },
    footerCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    footerColTitle: { fontSize: '14px', fontWeight: '700', color: 'white', textTransform: 'uppercase', marginBottom: '15px' },
    footerLinksStack: { display: 'flex', flexDirection: 'column', gap: '10px' },
    linkFooter: { color: '#CBD5E1', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none' },
    linkFooterBtn: { background: 'none', border: 'none', color: '#CBD5E1', fontSize: '14px', cursor: 'pointer', textAlign: 'left', padding: 0 },
    emailLink: { color: '#94A3B8', fontSize: '13px', textDecoration: 'none', lineHeight: '1.5', wordBreak: 'break-all' },
    footerBottom: { textAlign: 'center', color: '#64748B', fontSize: '13px' },

    // --- MODAL STYLES ---
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', width: '90%', maxWidth: '600px', padding: '30px', borderRadius: '16px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' },
    closeModalBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' },
    modalTitle: { fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' },
    modalBody: { fontSize: '15px', lineHeight: '1.7', color: '#475569' },
    modalFooter: { marginTop: '30px', textAlign: 'right' }
};

export default LandingPage;