import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  HelpCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ShieldCheck,
  FileText,
  ArrowLeft,
  X,
  MessageCircle,
  Mail,
  Users,
} from "lucide-react"

const Ajuda = () => {
  const navigate = useNavigate()
  const [faqAtivo, setFaqAtivo] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)

  const toggleFaq = (index) => setFaqAtivo(faqAtivo === index ? null : index)

  const faqs = [
    {
      pergunta: 'Como funciona o processo de "Revisão por Pares"?',
      resposta:
        "Após enviar sua produção, ela entra em uma fila anônima. Um outro professor da sua mesma área avaliará seu material seguindo uma Rúbrica de 6 Eixos.",
    },
    {
      pergunta: "Por que não consigo revisar atividades de outras disciplinas?",
      resposta:
        "Para garantir a qualidade técnica e pedagógica, o sistema restringe a revisão à sua área de especialidade.",
    },
    {
      pergunta: "O que acontece se minha produção for rejeitada?",
      resposta:
        'Você receberá um feedback detalhado com "Pontos Fortes" e "Sugestões de Melhoria" e você podera reenviar o material ajustado.',
    },
    {
      pergunta: "Quais dados devo preencher ao catalogar?",
      resposta:
        "Além do básico, pedimos detalhamento sobre: Alinhamento com a BNCC, Metodologia usada, Relato de Experiência e Resultados Observados.",
    },
    {
      pergunta: "Quem pode ver meus materiais aprovados?",
      resposta:
        'Uma vez aprovado, seu material ganha o selo "Revisado por Pares" e fica visível na vitrine da página inicial.',
    },
  ]

  return (
    <div style={styles.fullPageWrapper}>
      <style>{`
        .tutorial-btn { transition: all 0.2s; }
        .tutorial-btn:hover { background-color: #1565C0 !important; color: white !important; border-color: #1565C0 !important; }
        .faq-row { transition: background-color 0.2s; }
        .faq-row:hover { background-color: var(--bg-alt); }
        .contact-card { transition: transform 0.2s, box-shadow 0.2s; }
        .contact-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ArrowLeft size={20} /> Voltar
          </button>
          <div>
            <h1 style={styles.pageTitle}>Central de Ajuda</h1>
            <p style={styles.pageSubtitle}>
              Tire suas dúvidas sobre o funcionamento da plataforma.
            </p>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>
          <PlayCircle size={22} color="var(--text-info)" /> Primeiros Passos
        </h3>

        <div style={styles.tutorialsGrid}>
          <div style={styles.tutorialCard}>
            <div style={styles.iconBox}>
              <FileText size={24} color="var(--text-info)" />
            </div>
            <h4 style={styles.cardTitle}>Guia de Catalogação</h4>
            <p style={styles.cardText}>
              Aprenda a preencher os campos pedagógicos (BNCC, Metodologia).
            </p>
            <button className="tutorial-btn" style={styles.videoButton}>
              Assistir Tutorial
            </button>
          </div>
          <div style={styles.tutorialCard}>
            <div style={styles.iconBox}>
              <ShieldCheck size={24} color="var(--text-success)" />
            </div>
            <h4 style={styles.cardTitle}>Como Revisar um Par</h4>
            <p style={styles.cardText}>
              Entenda como aplicar a Rúbrica de 6 Eixos para avaliar colegas.
            </p>
            <button className="tutorial-btn" style={styles.videoButton}>
              Assistir Tutorial
            </button>
          </div>
          <div style={styles.tutorialCard}>
            <div style={styles.iconBox}>
              <BookOpen size={24} color="var(--text-warning)" />
            </div>
            <h4 style={styles.cardTitle}>Usando Materiais em Sala</h4>
            <p style={styles.cardText}>
              Dicas de como adaptar os roteiros da plataforma para a sua
              realidade.
            </p>
            <button className="tutorial-btn" style={styles.videoButton}>
              Assistir Tutorial
            </button>
          </div>
        </div>

        <h3 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
          <HelpCircle size={22} color="var(--text-info)" /> Perguntas Frequentes
        </h3>

        <div style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem}>
              <button
                className="faq-row"
                style={{
                  ...styles.faqQuestion,
                  color:
                    faqAtivo === index
                      ? "var(--text-info)"
                      : "var(--text-primary)",
                }}
                onClick={() => toggleFaq(index)}
              >
                {faq.pergunta}
                {faqAtivo === index ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {faqAtivo === index && (
                <div style={styles.faqAnswer}>{faq.resposta}</div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.supportFooter}>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Ainda com dúvidas ou encontrou algum problema no sistema?
          </p>
          <button
            onClick={() => setShowContactModal(true)}
            style={styles.contactLink}
          >
            Fale com a nossa equipe
          </button>
        </div>
      </div>

      {showContactModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowContactModal(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowContactModal(false)}
              style={styles.closeModalBtn}
            >
              <X size={24} />
            </button>
            <h2 style={styles.modalTitle}>Como podemos ajudar?</h2>
            <p style={styles.modalSubtitle}>
              Escolha o canal mais adequado para a sua necessidade.
            </p>

            <div style={styles.contactOptionsGrid}>
              <div
                className="contact-card"
                style={{
                  ...styles.contactCardBox,
                  borderLeftColor: "var(--text-success)",
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
                    ...styles.contactIconCircle,
                    backgroundColor: "var(--bg-success)",
                    color: "var(--text-success)",
                  }}
                >
                  <MessageCircle size={24} />
                </div>
                <div style={styles.contactCardTexts}>
                  <h4 style={styles.contactCardTitle}>Suporte Rápido</h4>
                  <p style={styles.contactCardDesc}>
                    Dúvidas pontuais ou bugs. Atendimento via grupo oficial de
                    WhatsApp.
                  </p>
                </div>
              </div>

              <div
                className="contact-card"
                style={{
                  ...styles.contactCardBox,
                  borderLeftColor: "var(--text-info)",
                }}
                onClick={() =>
                  (window.location.href =
                    "mailto:suporte.ianaeducacaobasica.unb@gmail.com?subject=Suporte T.E.I.A")
                }
              >
                <div
                  style={{
                    ...styles.contactIconCircle,
                    backgroundColor: "var(--bg-info)",
                    color: "var(--text-info)",
                  }}
                >
                  <Mail size={24} />
                </div>
                <div style={styles.contactCardTexts}>
                  <h4 style={styles.contactCardTitle}>Canal Oficial</h4>
                  <p style={styles.contactCardDesc}>
                    Para documentações, sugestões longas ou exclusão de conta.
                  </p>
                </div>
              </div>

              <div
                className="contact-card"
                style={{
                  ...styles.contactCardBox,
                  borderLeftColor: "var(--text-warning)",
                }}
                onClick={() => {
                  setShowContactModal(false)
                  navigate("/dashboard/forum")
                }}
              >
                <div
                  style={{
                    ...styles.contactIconCircle,
                    backgroundColor: "var(--bg-warning)",
                    color: "var(--text-warning)",
                  }}
                >
                  <Users size={24} />
                </div>
                <div style={styles.contactCardTexts}>
                  <h4 style={styles.contactCardTitle}>Fórum T.E.I.A</h4>
                  <p style={styles.contactCardDesc}>
                    Abra uma discussão no fórum para debater com outros
                    professores.
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
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "30px 20px",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    fontSize: "15px",
    alignSelf: "flex-start",
    padding: 0,
  },
  pageTitle: {
    fontSize: "28px",
    color: "var(--text-primary)",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  pageSubtitle: { fontSize: "16px", color: "var(--text-muted)", margin: 0 },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  tutorialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  tutorialCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    border: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  iconBox: {
    backgroundColor: "var(--bg-alt)",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  cardText: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    flex: 1,
  },
  videoButton: {
    backgroundColor: "var(--bg-main)",
    color: "var(--text-info)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    padding: "10px 16px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    width: "100%",
  },
  faqContainer: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    border: "1px solid var(--border-color)",
    overflow: "hidden",
  },
  faqItem: { borderBottom: "1px solid var(--border-color)" },
  faqQuestion: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 25px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    textAlign: "left",
    transition: "background 0.2s",
  },
  faqAnswer: {
    padding: "0 25px 25px 25px",
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  supportFooter: {
    marginTop: "40px",
    textAlign: "center",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "30px",
    paddingBottom: "20px",
  },
  contactLink: {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 20px",
    backgroundColor: "#1565C0",
    color: "white",
    borderRadius: "8px",
    fontWeight: "700",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 6px rgba(21, 101, 192, 0.2)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    backgroundColor: "var(--bg-card)",
    width: "90%",
    maxWidth: "550px",
    padding: "35px",
    borderRadius: "16px",
    position: "relative",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid var(--border-color)",
  },
  closeModalBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "var(--bg-main)",
    border: "none",
    cursor: "pointer",
    color: "var(--text-secondary)",
    padding: "5px",
    borderRadius: "50%",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  modalSubtitle: {
    fontSize: "15px",
    color: "var(--text-muted)",
    marginBottom: "25px",
  },
  contactOptionsGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  contactCardBox: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderLeftWidth: "4px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  contactIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactCardTexts: { display: "flex", flexDirection: "column", gap: "4px" },
  contactCardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  contactCardDesc: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
  },
}

export default Ajuda
