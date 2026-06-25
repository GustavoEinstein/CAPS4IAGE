import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Share2,
  Shield,
  Cpu,
  CheckCircle2,
  Mail,
  ShieldCheck,
  X,
  MessageCircle, // Ícone importado para o WhatsApp
} from "lucide-react"

// --- ÍCONE PERSONALIZADO: TEIA DE ARANHA ---
const SpiderWebIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M4.93 4.93l14.14 14.14" />
    <path d="M19.07 4.93L4.93 19.07" />
    <path d="M12 7 L15.53 8.47 L17 12 L15.53 15.53 L12 17 L8.47 15.53 L7 12 L8.47 8.47 Z" />
    <path d="M12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 Z" />
  </svg>
)

const LandingPage = () => {
  const navigate = useNavigate()

  // --- ESTADOS DOS MODAIS ---
  const [activeModal, setActiveModal] = useState(null) // 'terms', 'privacy' ou null
  const [showContactModal, setShowContactModal] = useState(false) // NOVO: Controle do modal de contato

  // --- ESTADO DO FAQ ---
  const [faqAberto, setFaqAberto] = useState(null)

  const openModal = (type) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)
  const toggleFaq = (index) => setFaqAberto(faqAberto === index ? null : index)

  const faqItems = [
    {
      q: "O sistema é gratuito?",
      a: "Sim. O T.E.I.A é uma iniciativa voltada para o fortalecimento da educação pública e privada, sem custo para professores cadastrados.",
    },
    {
      q: "Quem pode revisar as atividades?",
      a: "Apenas professores da mesma área de conhecimento. Um professor de Matemática só revisa produções de Matemática, garantindo a tecnicidade e a qualidade pedagógica da avaliação.",
    },
    {
      q: "Preciso ser expert em IA para participar?",
      a: "Não. A plataforma foi desenhada justamente para quem está começando. Nossas ferramentas e a própria comunidade auxiliam na formatação, estruturação e melhores práticas de uso da IA.",
    },
    {
      q: "Meus dados e rascunhos estão seguros?",
      a: "Sim. Utilizamos criptografia padrão de mercado e respeitamos integralmente a LGPD. Seus rascunhos e planos de aula só se tornam públicos após passarem pela curadoria e receberem sua aprovação final.",
    },
  ]

  return (
    <div style={styles.wrapper}>
      {/* INJEÇÃO DE CSS PARA ANIMAÇÕES E HOVERS */}
      <style>{`
        @keyframes float {
            0% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-15px); }
            100% { transform: translate(-50%, -50%) translateY(0px); }
        }
        .anim-float {
            animation: float 5s ease-in-out infinite;
        }
        @keyframes pulse-live {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .dot-live {
            animation: pulse-live 2s infinite;
        }
        .btn-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4) !important;
            filter: brightness(1.1);
        }
        .nav-btn-hover:hover {
            background-color: #1e293b !important;
            transform: scale(1.05);
        }
        .faq-card:hover {
            border-color: #2563EB !important;
            background-color: #F8FAFC !important;
        }
        .pillar-card {
            transition: all 0.3s ease;
            padding: 30px;
            border-radius: 16px;
            border: 1px solid transparent;
        }
        .pillar-card:hover {
            transform: translateY(-8px);
            background-color: #FFFFFF;
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
            border-color: #E2E8F0;
        }
        .footer-link {
            transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .footer-link:hover {
            color: #60A5FA !important;
            padding-left: 4px;
        }
        /* Efeito Hover do Card de Contato */
        .contact-card { transition: transform 0.2s, box-shadow 0.2s; }
        .contact-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      `}</style>

      {/* --- 1. NAVBAR --- */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logoGroup}>
            <div style={styles.logoCircle}>
              <SpiderWebIcon size={32} color="#1565C0" />
            </div>
            <span style={styles.logoText}>T.E.I.A</span>
          </div>
          <div style={styles.navActions}>
            <button onClick={() => navigate("/login")} style={styles.navLink}>
              Entrar
            </button>
            <button
              onClick={() => navigate("/register")}
              className="nav-btn-hover"
              style={{ ...styles.navButtonPrimary, transition: "all 0.2s" }}
            >
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
              <span className="dot-live" style={styles.badgeDot}></span>
              REDE DOCENTE ATIVA
            </div>

            <h1 style={styles.heroTitle}>
              A ponte entre a <br />
              <span style={styles.textHighlight}>docência e a IA.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              O T.E.I.A não é apenas um repositório. É uma comunidade viva onde
              professores exploram como a Inteligência Artificial pode
              potencializar a sala de aula, com curadoria humana e rigor
              acadêmico.
            </p>
            <div style={styles.heroButtons}>
              <button
                onClick={() => navigate("/register")}
                className="btn-hover"
                style={{ ...styles.btnPrimaryLarge, transition: "all 0.2s" }}
              >
                Juntar-se à Comunidade <ArrowRight size={20} />
              </button>
              <button
                onClick={() =>
                  window.scrollTo({ top: 900, behavior: "smooth" })
                }
                style={styles.btnSecondaryLarge}
              >
                Entender a Proposta
              </button>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.blurredCardWrapper}>
              <div style={styles.blurredBackground}>
                <div style={styles.fakeLineLg}></div>
                <div style={styles.fakeLineSm}></div>
                <div style={styles.fakeGrid}>
                  <div style={styles.fakeBox}></div>
                  <div style={styles.fakeBox}></div>
                </div>
                <div style={{ ...styles.fakeLineLg, marginTop: "20px" }}></div>
                <div style={styles.fakeLineSm}></div>
              </div>
              <div className="anim-float" style={styles.securityOverlay}>
                <div style={styles.securityIconCircle}>
                  <ShieldCheck size={32} color="#1E40AF" />
                </div>
                <h3 style={styles.securityTitle}>Revisão Duplo-Cego Ativada</h3>
                <p style={styles.securityText}>
                  Aqui, sua produção e sua identidade são{" "}
                  <strong>invioláveis</strong>.
                  <br />O anonimato garante uma avaliação justa, focada
                  puramente no mérito pedagógico.
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
            <div className="pillar-card" style={styles.pillarCard}>
              <div style={styles.pillarIcon}>
                <Share2 size={24} color="#0F172A" />
              </div>
              <h3 style={styles.pillarTitle}>Colaboração Real</h3>
              <p style={styles.pillarText}>
                Transforme o conhecimento individual em inteligência coletiva.
                Acesse um ecossistema de práticas pedagógicas validadas e escale
                o impacto das suas aulas.
              </p>
            </div>
            <div className="pillar-card" style={styles.pillarCard}>
              <div style={styles.pillarIcon}>
                <Shield size={24} color="#0F172A" />
              </div>
              <h3 style={styles.pillarTitle}>Validação por Pares</h3>
              <p style={styles.pillarText}>
                O sistema "Duplo-Cego" garante que o foco seja a qualidade
                pedagógica, livre de vieses pessoais e focada no aprendizado.
              </p>
            </div>
            <div className="pillar-card" style={styles.pillarCard}>
              <div style={styles.pillarIcon}>
                <Cpu size={24} color="#0F172A" />
              </div>
              <h3 style={styles.pillarTitle}>IA como Ferramenta</h3>
              <p style={styles.pillarText}>
                Não substituímos o professor. Usamos a tecnologia para eliminar
                burocracia e ampliar a criatividade docente no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. SOBRE A COMUNIDADE --- */}
      <section style={styles.aboutSection}>
        <div style={styles.aboutContainer}>
          <div style={styles.aboutText}>
            <h2 style={styles.sectionTitle}>
              Mais que software. <br />
              Uma rede de inteligência.
            </h2>
            <p style={styles.paragraph}>
              A inserção da Inteligência Artificial na educação ainda é um
              terreno novo. O <strong>T.E.I.A</strong> nasceu para ser o
              laboratório seguro onde essa inovação acontece através da troca
              entre pares.
            </p>
            <p style={styles.paragraph}>
              Ao catalogar suas produções, você ajuda outros docentes a
              entenderem
              <em> quais prompts funcionam</em> e como alinhar a tecnologia à{" "}
              <strong>BNCC</strong>.
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
                <div
                  key={i}
                  style={{
                    ...styles.gridSquare,
                    opacity: Math.random() > 0.5 ? 1 : 0.3,
                    backgroundColor:
                      Math.random() > 0.7 ? "#1565C0" : "#E2E8F0",
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FAQ (INTERATIVO) --- */}
      <section style={styles.faqSection}>
        <div style={styles.container}>
          <div style={styles.faqHeader}>
            <h2 style={styles.sectionTitle}>Perguntas Frequentes</h2>
            <p style={styles.sectionSubtitle}>
              Entenda como participar da rede.
            </p>
          </div>

          <div style={styles.faqListWrapper}>
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="faq-card"
                style={{
                  ...styles.faqCard,
                  border:
                    faqAberto === index
                      ? "1px solid #2563EB"
                      : "1px solid #E2E8F0",
                }}
                onClick={() => toggleFaq(index)}
              >
                <div style={styles.faqQuestionRow}>
                  <h4 style={styles.faqQuestion}>{item.q}</h4>
                  <span
                    style={{
                      color: "#64748B",
                      transform:
                        faqAberto === index ? "rotate(45deg)" : "rotate(0)",
                      transition: "0.3s",
                      fontSize: "24px",
                    }}
                  >
                    +
                  </span>
                </div>
                {faqAberto === index && (
                  <p style={styles.faqAnswerAnim}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerTop}>
            <div style={styles.footerBrandCol}>
              <div style={styles.footerLogoWrapper}>
                <SpiderWebIcon size={28} color="#60A5FA" />
                <span style={styles.footerLogoText}>T.E.I.A</span>
              </div>
              <p style={styles.footerDesc}>
                Tecendo a Educação com IA. <br />
                Conectando a sabedoria docente à inteligência artificial para
                construir o futuro do ensino no Brasil.
              </p>
            </div>

            <div style={styles.footerLinksWrapper}>
              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Navegação</h4>
                <div style={styles.footerLinksStack}>
                  <span
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="footer-link"
                    style={styles.linkFooter}
                  >
                    Início
                  </span>
                  <span
                    onClick={() => navigate("/login")}
                    className="footer-link"
                    style={styles.linkFooter}
                  >
                    Acessar Conta
                  </span>
                  <span
                    onClick={() => navigate("/register")}
                    className="footer-link"
                    style={styles.linkFooter}
                  >
                    Cadastre-se
                  </span>
                </div>
              </div>

              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Legal</h4>
                <div style={styles.footerLinksStack}>
                  <button
                    onClick={() => openModal("terms")}
                    className="footer-link"
                    style={styles.linkFooterBtn}
                  >
                    Termos de Uso
                  </button>
                  <button
                    onClick={() => openModal("privacy")}
                    className="footer-link"
                    style={styles.linkFooterBtn}
                  >
                    Privacidade
                  </button>
                </div>
              </div>

              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Suporte</h4>
                <div style={styles.footerLinksStack}>
                  <div style={styles.supportRow}>
                    <Mail size={18} color="#94A3B8" />
                    {/* Alterado para abrir o Modal de Contato */}
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="footer-link"
                      style={styles.linkFooterBtn}
                    >
                      Fale com a equipe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p>
              © {new Date().getFullYear()} Projeto T.E.I.A (Universidade de
              Brasília). Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* --- MODAIS DE TERMOS E PRIVACIDADE --- */}
      {activeModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} style={styles.closeModalBtn}>
              <X size={24} />
            </button>
            <h2 style={styles.modalTitle}>
              {activeModal === "terms"
                ? "Termos de Uso"
                : "Política de Privacidade"}
            </h2>

            <div style={styles.modalBody}>
              {activeModal === "terms" ? (
                <>
                  <p style={{ marginBottom: "15px" }}>
                    Ao acessar e utilizar a plataforma T.E.I.A, você concorda
                    expressamente com as seguintes diretrizes e
                    responsabilidades:
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <li>
                      <strong>1. Responsabilidade sobre o Conteúdo:</strong> O
                      usuário é o único responsável legal e pedagógico pelo
                      material submetido. É estritamente proibido enviar
                      conteúdos ilegais, discriminatórios, ofensivos ou que
                      violem direitos autorais de terceiros.
                    </li>
                    <li>
                      <strong>2. Geração por Inteligência Artificial:</strong> O
                      T.E.I.A integra ferramentas de IA como suporte criativo. A
                      IA pode apresentar "alucinações" ou imprecisões. A
                      revisão, validação factual e adequação à BNCC são
                      obrigações exclusivas do professor titular.
                    </li>
                    <li>
                      <strong>3. Propriedade Intelectual e Colaboração:</strong>{" "}
                      Ao submeter e ter sua produção aprovada, você concorda em
                      disponibilizá-la sob licença colaborativa para a
                      comunidade do T.E.I.A, permitindo que outros docentes
                      acessem e adaptem seu material para fins educacionais (não
                      comerciais).
                    </li>
                    <li>
                      <strong>4. Integridade da Revisão Duplo-Cego:</strong> O
                      usuário se compromete a não inserir dados de identificação
                      pessoal no corpo do material submetido. Qualquer tentativa
                      deliberada de fraudar, manipular notas ou quebrar o
                      anonimato da avaliação resultará no banimento permanente
                      da plataforma.
                    </li>
                    <li>
                      <strong>5. Moderação e Banimento:</strong> A administração
                      do T.E.I.A reserva-se o direito de excluir conteúdos,
                      suspender ou cancelar contas que violem estes termos, sem
                      aviso flow prévio.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: "15px" }}>
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD -
                    Lei nº 13.709/2018), detalhamos o tratamento de suas
                    informações:
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <li>
                      <strong>1. Coleta Mínima Necessária:</strong> Coletamos
                      apenas os dados estritamente necessários para o
                      funcionamento da plataforma e autenticação: Nome, E-mail,
                      Instituição de Ensino e Área de Atuação/Disciplina.
                    </li>
                    <li>
                      <strong>2. Proteção do Anonimato (Duplo-Cego):</strong>{" "}
                      Seus dados de identificação são rigorosamente separados do
                      seu conteúdo durante a fila de revisão. Revisores não têm
                      acesso à sua identidade, e você não tem acesso à
                      identidade de quem avalia.
                    </li>
                    <li>
                      <strong>3. Compartilhamento de Dados:</strong> O T.E.I.A
                      não comercializa, aluga ou cede seus dados pessoais a
                      terceiros sob nenhuma hipótese. Os dados são mantidos em
                      servidores seguros e utilizados exclusivamente para
                      métricas internas do sistema educacional.
                    </li>
                    <li>
                      <strong>4. Tecnologias Essenciais e de Segurança:</strong>{" "}
                      Empregamos recursos técnicos estritamente necessários
                      operando em segundo plano para manter a sua conexão ativa
                      e proteger o seu acesso enquanto navega. O sistema é
                      totalmente livre de rastreadores comportamentais ou
                      publicidade de terceiros.
                    </li>
                    <li>
                      <strong>5. Direito de Exclusão (Esquecimento):</strong> O
                      usuário pode solicitar a exclusão de sua conta a qualquer
                      momento. Caso existam produções aprovadas e publicadas na
                      comunidade, o autor poderá optar por excluí-las ou
                      mantê-las sob autoria "Anônima" para não prejudicar a rede
                      de ensino.
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.btnPrimaryLarge}>
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOVO MODAL DE CONTATO --- */}
      {showContactModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{ ...styles.modalContent, maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContactModal(false)}
              style={styles.closeModalBtn}
            >
              <X size={24} />
            </button>

            <h2 style={styles.modalTitle}>Como podemos ajudar?</h2>
            <p style={{ ...styles.modalBody, marginBottom: "25px" }}>
              Escolha o canal mais adequado para a sua necessidade.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Opção 1: WhatsApp */}
              <div
                className="contact-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "20px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderLeft: "4px solid #25D366",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(
                    "https://chat.whatsapp.com/EEcyH5dEb4l0WKziyBVSqU",
                    "_blank",
                  )
                }
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: "#E8F5E9",
                    color: "#2E7D32",
                  }}
                >
                  <MessageCircle size={24} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1E293B",
                    }}
                  >
                    Suporte Rápido
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#64748B",
                      lineHeight: "1.4",
                    }}
                  >
                    Dúvidas pontuais ou bugs. Atendimento via grupo oficial de
                    WhatsApp.
                  </p>
                </div>
              </div>

              {/* Opção 2: E-mail */}
              <div
                className="contact-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "20px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderLeft: "4px solid #1565C0",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  (window.location.href =
                    "mailto:suporte.ianaeducacaobasica.unb@gmail.com?subject=Suporte T.E.I.A")
                }
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: "#E3F2FD",
                    color: "#1565C0",
                  }}
                >
                  <Mail size={24} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1E293B",
                    }}
                  >
                    Canal Oficial
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#64748B",
                      lineHeight: "1.4",
                    }}
                  >
                    Para documentações, sugestões longas ou parcerias
                    institucionais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    fontFamily: "Inter, -apple-system, sans-serif",
    backgroundColor: "#FFFFFF",
    minHeight: "100vh",
    color: "#0F172A",
  },
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "0 20px",
    width: "100%",
    boxSizing: "border-box",
  },
  nav: {
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E2E8F0",
    zIndex: 50,
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "75px",
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "0 20px",
  },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoText: {
    fontWeight: "900",
    fontSize: "22px",
    color: "#0F172A",
    letterSpacing: "-0.5px",
  },
  navActions: { display: "flex", gap: "20px", alignItems: "center" },
  navLink: {
    background: "none",
    border: "none",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "color 0.2s",
  },
  navButtonPrimary: {
    backgroundColor: "#0F172A",
    color: "white",
    padding: "10px 22px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },

  hero: {
    padding: "160px 0 100px 0",
    background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
    borderBottom: "1px solid #E2E8F0",
  },
  heroContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: "60px",
    flexWrap: "wrap",
  },
  heroContent: { flex: 1.2, minWidth: "320px" },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 18px",
    backgroundColor: "#FFFFFF",
    color: "#1E3A8A",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "24px",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.12)",
    border: "1px solid #E2E8F0",
    letterSpacing: "0.5px",
  },
  badgeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
  },

  heroTitle: {
    fontSize: "56px",
    lineHeight: "1.1",
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: "24px",
    letterSpacing: "-1.5px",
  },
  textHighlight: { color: "#2563EB" },
  heroSubtitle: {
    fontSize: "19px",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "32px",
    maxWidth: "550px",
  },
  heroButtons: { display: "flex", gap: "15px", flexWrap: "wrap" },
  btnPrimaryLarge: {
    padding: "16px 32px",
    backgroundColor: "#2563EB",
    color: "white",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  btnSecondaryLarge: {
    padding: "16px 32px",
    backgroundColor: "white",
    color: "#334155",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  heroVisual: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    position: "relative",
    minHeight: "420px",
  },
  blurredCardWrapper: {
    width: "380px",
    height: "420px",
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  blurredBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    filter: "blur(6px)",
    opacity: 0.4,
  },
  fakeLineLg: {
    width: "85%",
    height: "22px",
    backgroundColor: "#CBD5E1",
    borderRadius: "4px",
  },
  fakeLineSm: {
    width: "55%",
    height: "22px",
    backgroundColor: "#E2E8F0",
    borderRadius: "4px",
  },
  fakeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  fakeBox: {
    height: "130px",
    backgroundColor: "#F1F5F9",
    borderRadius: "10px",
  },
  securityOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "35px",
    borderRadius: "16px",
    textAlign: "center",
    width: "85%",
    border: "1px solid #E2E8F0",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  securityIconCircle: {
    width: "70px",
    height: "70px",
    backgroundColor: "#EFF6FF",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  },
  securityTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: "12px",
  },
  securityText: { fontSize: "14px", color: "#475569", lineHeight: "1.6" },

  pillarsSection: { padding: "100px 0", borderBottom: "1px solid #F1F5F9" },
  sectionLabel: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: "1.5px",
    marginBottom: "50px",
    textAlign: "center",
  },
  pillarsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  pillarCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  pillarIcon: {
    width: "64px",
    height: "64px",
    backgroundColor: "#F8FAFC",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    border: "1px solid #E2E8F0",
  },
  pillarTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: "12px",
  },
  pillarText: { fontSize: "15px", lineHeight: "1.6", color: "#475569" },

  aboutSection: { padding: "120px 0", backgroundColor: "white" },
  aboutContainer: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    gap: "80px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  aboutText: { flex: 1.2, minWidth: "320px" },
  sectionTitle: {
    fontSize: "40px",
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: "28px",
    lineHeight: "1.1",
    letterSpacing: "-0.5px",
  },
  paragraph: {
    fontSize: "17px",
    lineHeight: "1.7",
    color: "#475569",
    marginBottom: "24px",
  },
  featureList: {
    marginTop: "35px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1E293B",
  },
  aboutVisual: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    justifyContent: "center",
  },
  gridDecoration: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    width: "280px",
  },
  gridSquare: { width: "100%", paddingTop: "100%", borderRadius: "8px" },

  faqSection: { padding: "100px 0", backgroundColor: "#F8FAFC" },
  faqHeader: { marginBottom: "60px", textAlign: "center" },
  sectionSubtitle: { fontSize: "19px", color: "#64748B", marginTop: "8px" },
  faqListWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "850px",
    margin: "0 auto",
  },
  faqCard: {
    backgroundColor: "white",
    padding: "24px 30px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
  },
  faqQuestionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
  },
  faqAnswerAnim: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#475569",
    marginTop: "20px",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "20px",
  },

  footer: {
    backgroundColor: "#0B1120",
    padding: "80px 0 30px 0",
    color: "white",
    borderTop: "4px solid #1D4ED8",
  },
  footerTop: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "50px",
    borderBottom: "1px solid #1E293B",
    paddingBottom: "50px",
    marginBottom: "30px",
  },
  footerBrandCol: { flex: "1 1 300px", maxWidth: "400px" },
  footerLogoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  footerLogoText: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#60A5FA",
    letterSpacing: "-0.5px",
  },
  footerDesc: { color: "#94A3B8", fontSize: "15px", lineHeight: "1.7" },
  footerLinksWrapper: {
    flex: "2 1 500px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "40px",
  },
  footerCol: { display: "flex", flexDirection: "column", minWidth: "120px" },
  footerColTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "white",
    textTransform: "uppercase",
    marginBottom: "24px",
    letterSpacing: "1px",
  },
  footerLinksStack: { display: "flex", flexDirection: "column", gap: "16px" },
  linkFooter: {
    color: "#94A3B8",
    fontSize: "15px",
    cursor: "pointer",
    textDecoration: "none",
  },
  linkFooterBtn: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "left",
    padding: 0,
  },
  supportRow: {
    display: "flex",
    gap: "10px",
    color: "#94A3B8",
    fontSize: "15px",
    alignItems: "center",
  },
  emailLink: { color: "#94A3B8", fontSize: "15px", textDecoration: "none" },
  footerBottom: {
    textAlign: "center",
    color: "#64748B",
    fontSize: "14px",
    paddingTop: "10px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(8px)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    maxWidth: "650px",
    padding: "40px",
    borderRadius: "20px",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  closeModalBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#F1F5F9",
    borderRadius: "50%",
    padding: "8px",
    border: "none",
    cursor: "pointer",
    color: "#64748B",
    display: "flex",
    transition: "background 0.2s",
  },
  modalTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: "25px",
    letterSpacing: "-0.5px",
  },
  modalBody: { fontSize: "16px", lineHeight: "1.8", color: "#475569" },
  modalFooter: {
    marginTop: "35px",
    textAlign: "right",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "25px",
  },
}

export default LandingPage
