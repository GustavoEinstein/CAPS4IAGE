import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  Clock,
  Bot,
  ArrowRight,
  Tag,
  BookOpen,
  Lock,
  AlertCircle,
} from "lucide-react"

const RevisaoDuploCego = () => {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [producoes, setProducoes] = useState([])
  const [loading, setLoading] = useState(true)
  const userDisciplina = localStorage.getItem("user_disciplina") || "Geral"

  useEffect(() => {
    fetchReviewQueue()
  }, [])

  const fetchReviewQueue = async () => {
    try {
      const response = await api.get("api/production/review-list/")
      setProducoes(response.data)
    } catch (error) {
      console.error("Erro ao buscar fila de revisão:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          color: "var(--text-muted)",
        }}
      >
        Carregando fila de validação...
      </div>
    )

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.lockTag}>
              <Lock size={12} /> Área Restrita
            </div>
            <h1 style={styles.pageTitle}>Fila de Validação</h1>
            <p style={styles.pageSubtitle}>
              Exibindo produções de{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {userDisciplina}
              </strong>{" "}
              aguardando sua análise.
            </p>
          </div>
          <div style={styles.counterBadge}>
            <Clock size={16} color="var(--text-warning)" />
            <span>{producoes.length} Pendentes</span>
          </div>
        </div>

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
  )
}

const ReviewCard = ({ data, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        flexDirection: isMobile ? "column" : "row",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.cardContent}>
        <div style={styles.cardTopRow}>
          <span style={styles.subjectBadge}>{data.disciplina}</span>
          <div style={styles.aiBadge}>
            <Bot size={14} style={{ marginRight: "4px" }} />
            {data.modelo_ia || "IA"}
          </div>
          <div style={styles.metaData}>
            <Clock size={14} style={{ marginRight: "4px" }} />
            {data.data}
          </div>
        </div>

        <h3 style={styles.cardTitle}>{data.titulo}</h3>

        <div style={styles.practicePreview}>
          <BookOpen
            size={14}
            color="var(--text-secondary)"
            style={{ minWidth: "14px", marginTop: "3px" }}
          />
          <span
            style={{
              marginLeft: "8px",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Clique para ler os detalhes da prática e o relato de experiência...
          </span>
        </div>

        <div style={styles.cardFooter}>
          <div style={styles.footerItem}>
            <Tag size={14} color="var(--text-muted)" />
            <span>{data.categoria || "Atividade Prática"}</span>
          </div>
          <span style={styles.separator}>•</span>
          <div style={styles.footerItem}>
            <span style={styles.levelText}>{data.nivel || "Geral"}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          ...styles.cardAction,
          borderLeft: isMobile ? "none" : "1px solid var(--border-color)",
          borderTop: isMobile ? "1px solid var(--border-color)" : "none",
          paddingTop: isMobile ? "15px" : "25px",
          paddingLeft: isMobile ? "25px" : "25px",
          width: isMobile ? "100%" : "200px",
        }}
      >
        <button style={styles.reviewButton}>
          Revisar Prática
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

const EmptyState = ({ disciplina }) => (
  <div
    style={{
      textAlign: "center",
      padding: "60px",
      backgroundColor: "var(--bg-card)",
      borderRadius: "16px",
      border: "1px dashed var(--border-color)",
    }}
  >
    <div
      style={{
        marginBottom: "15px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "15px",
          background: "var(--bg-success)",
          borderRadius: "50%",
        }}
      >
        <AlertCircle size={30} color="var(--text-success)" />
      </div>
    </div>
    <h3 style={{ color: "var(--text-primary)", margin: "0 0 10px 0" }}>
      Tudo em dia!
    </h3>
    <p style={{ color: "var(--text-muted)" }}>
      Não há novas produções de <strong>{disciplina}</strong> aguardando revisão
      no momento.
    </p>
  </div>
)

const styles = {
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "30px 20px",
  },
  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  lockTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    marginBottom: "5px",
    backgroundColor: "var(--bg-alt)",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  pageTitle: {
    fontSize: "28px",
    color: "var(--text-primary)",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  pageSubtitle: { fontSize: "15px", color: "var(--text-muted)", margin: 0 },
  counterBadge: {
    backgroundColor: "var(--bg-warning)",
    color: "var(--text-warning)",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "20px" },

  card: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
    display: "flex",
    transition: "all 0.2s ease",
    cursor: "pointer",
    overflow: "hidden",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    borderColor: "var(--text-info)",
  },
  cardContent: {
    flex: 1,
    padding: "25px",
    display: "flex",
    flexDirection: "column",
  },
  cardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  subjectBadge: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-primary)",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  aiBadge: {
    backgroundColor: "var(--bg-main)",
    color: "var(--text-muted)",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
  },
  metaData: {
    marginLeft: "auto",
    fontSize: "12px",
    color: "var(--text-warning)",
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0 0 12px 0",
  },
  practicePreview: {
    backgroundColor: "var(--bg-card)",
    borderLeft: "3px solid var(--border-color)",
    padding: "5px 15px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "flex-start",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
    gap: "10px",
  },
  footerItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "500",
  },
  separator: { color: "var(--border-color)" },
  levelText: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
  cardAction: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-main)",
    padding: "25px",
    boxSizing: "border-box",
  },
  reviewButton: {
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    transition: "background 0.2s",
    width: "100%",
    justifyContent: "center",
  },
}

export default RevisaoDuploCego
