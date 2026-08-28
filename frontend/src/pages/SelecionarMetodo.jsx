import React from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { ArrowLeft, Keyboard, Bookmark } from "lucide-react"

const SelecionarMetodo = () => {
  const navigate = useNavigate()
  const { isMobile } = useOutletContext() || { isMobile: false }

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.containerCenter}>
        <button onClick={() => navigate(-1)} style={styles.backButtonSimple}>
          <ArrowLeft size={20} /> Cancelar
        </button>
        <div style={{ ...styles.headerCenter, marginBottom: "40px" }}>
          <h2 style={styles.titleCenter}>Como você deseja catalogar?</h2>
          <p style={styles.subtitleCenter}>
            Escolha a forma mais confortável para registrar sua atividade.
          </p>
        </div>
        <div
          style={{
            ...styles.selectionGrid,
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
          }}
        >
          <div
            style={styles.selectionCard}
            onClick={() => navigate("/dashboard/catalogar/manual")}
          >
            <div style={styles.iconCircleBlue}>
              <Keyboard size={32} color="var(--text-info)" />
            </div>
            <h3 style={styles.cardTitle}>Começar do Zero</h3>
            <p style={styles.cardDesc}>
              Preencha o formulário detalhado manualmente.
            </p>
            <span style={styles.fakeLink}>Ir para formulário &rarr;</span>
          </div>

          <div
            style={{
              ...styles.selectionCard,
              border: "2px solid var(--border-success)",
              backgroundColor: "var(--bg-success)",
            }}
            onClick={() => navigate("/dashboard/catalogar/base")}
          >
            <div
              style={{
                ...styles.iconCircleBlue,
                backgroundColor: "var(--bg-card)",
              }}
            >
              <Bookmark size={32} color="var(--text-success)" />
            </div>
            <h3 style={{ ...styles.cardTitle, color: "var(--text-success)" }}>
              Fazer uma Releitura
            </h3>
            <p style={{ ...styles.cardDesc, color: "var(--text-success)" }}>
              Construa uma nova experiência herdando dados de um colega.
            </p>
            <span style={{ ...styles.fakeLink, color: "var(--text-success)" }}>
              Buscar práticas &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "20px",
  },
  containerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "40px",
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  backButtonSimple: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  headerCenter: { textAlign: "center", maxWidth: "600px" },
  titleCenter: {
    fontSize: "32px",
    color: "var(--text-primary)",
    margin: "0 0 10px 0",
    fontWeight: "800",
  },
  subtitleCenter: { fontSize: "18px", color: "var(--text-muted)", margin: 0 },
  selectionGrid: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    width: "100%",
  },
  selectionCard: {
    flex: 1,
    backgroundColor: "var(--bg-card)",
    padding: "40px 30px",
    borderRadius: "20px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minWidth: "280px",
  },
  iconCircleBlue: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-info)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "15px",
  },
  cardDesc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "25px",
    flex: 1,
  },
  fakeLink: { fontSize: "14px", fontWeight: "700", color: "var(--text-info)" },
}

export default SelecionarMetodo
