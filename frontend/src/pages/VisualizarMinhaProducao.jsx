import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bot,
  BookOpen,
  CheckCircle2,
  XCircle,
  Wrench,
  Lightbulb,
  Target,
  Download,
  FileText,
  User,
  Package,
  Star,
  MapPin,
  File,
  ExternalLink,
  Bookmark,
  ShieldAlert,
  BarChart3,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react"

const VisualizarMinhaProducao = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`api/production/${id}/`)
        setData(response.data)
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetails()
  }, [id])

  if (loading)
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Carregando detalhes...
      </div>
    )
  if (!data) return null

  const statusLower = data.status ? data.status.toLowerCase() : ""
  const isApproved =
    statusLower.includes("aprovado") ||
    statusLower.includes("publicado") ||
    statusLower.includes("concluído")
  const isRejected =
    statusLower.includes("rejeitado") || statusLower.includes("correção")
  const isPending = !isApproved && !isRejected

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div
          style={{ ...styles.grid, flexDirection: isMobile ? "column" : "row" }}
        >
          <div style={styles.columnContent}>
            <div style={styles.materialCard}>
              <div style={styles.headerSection}>
                <div>
                  <div style={styles.badgesRow}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: "var(--bg-info)",
                        color: "var(--text-info)",
                      }}
                    >
                      {data.disciplina}
                    </span>
                    <span style={styles.badgeNeutral}>
                      {data.nivel_ensino || data.nivel}
                    </span>
                  </div>
                  <h1 style={styles.title}>{data.titulo}</h1>
                </div>
                <div style={styles.metaRow}>
                  <div style={styles.iaTag}>
                    <Bot size={14} />{" "}
                    {data.modelo_ia || "Nenhum modelo informado"}
                  </div>
                  <span style={styles.dateText}>
                    <User size={14} /> Autor: {data.autor || "Você"}
                  </span>
                </div>
              </div>

              <div style={styles.techSheet}>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}>
                    <Wrench size={18} color="var(--text-info)" />
                  </div>
                  <div>
                    <span style={styles.techLabel}>Metodologia</span>
                    <span style={styles.techValue}>
                      {data.metodologia || "-"}
                    </span>
                  </div>
                </div>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}>
                    <Clock size={18} color="var(--text-info)" />
                  </div>
                  <div>
                    <span style={styles.techLabel}>Duração</span>
                    <span style={styles.techValue}>{data.duracao || "-"}</span>
                  </div>
                </div>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}>
                    <Package size={18} color="var(--text-info)" />
                  </div>
                  <div>
                    <span style={styles.techLabel}>Recursos</span>
                    <span style={styles.techValue}>
                      {Array.isArray(data.recursos)
                        ? data.recursos.join(", ")
                        : data.recursos || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <BookOpen size={18} /> Intencionalidade (BNCC)
                </h3>
                <div style={styles.bnccBox}>
                  <p style={styles.bnccText}>{data.bncc || "Não informado."}</p>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Lightbulb size={18} /> Relato de Experiência
                </h3>
                <p style={styles.textBody}>
                  {data.experiencia || data.relato || "Não informado."}
                </p>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Target size={18} /> Resultados
                </h3>
                <div style={styles.resultsBox}>
                  {data.resultados || "Sem resultados registrados."}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.columnSidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Status da Avaliação</h3>
              {isPending && (
                <div style={styles.statusBoxPending}>
                  <span style={styles.statusTitlePending}>
                    AGUARDANDO VALIDAÇÃO
                  </span>
                  <p style={styles.statusDesc}>
                    Sua prática está na fila e será avaliada por colegas.
                  </p>
                </div>
              )}
              {isApproved && (
                <div style={styles.statusBoxApproved}>
                  <span style={styles.statusTitleApproved}>PUBLICADA!</span>
                  <p style={styles.statusDesc}>
                    Prática validada e disponível na comunidade.
                  </p>
                </div>
              )}
              {isRejected && (
                <div style={styles.statusBoxRejected}>
                  <span style={styles.statusTitleRejected}>
                    AJUSTES NECESSÁRIOS
                  </span>
                  <p style={styles.statusDesc}>
                    Sua prática precisa de correções antes de ser publicada.
                  </p>
                </div>
              )}
            </div>
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
    paddingTop: "20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 20px 40px 20px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "var(--text-secondary)",
    fontWeight: "700",
    marginBottom: "15px",
  },

  grid: { display: "flex", gap: "20px", alignItems: "flex-start" },
  columnContent: { flex: 1, minWidth: "0" },
  columnSidebar: {
    width: "300px",
    minWidth: "300px",
    position: "sticky",
    top: "20px",
  },

  materialCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    padding: "35px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid var(--border-color)",
  },

  headerSection: { marginBottom: "25px" },
  badgesRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  badgeNeutral: {
    backgroundColor: "var(--bg-main)",
    color: "var(--text-secondary)",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: "1.2",
    wordBreak: "break-word",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "12px",
  },
  iaTag: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "var(--text-secondary)",
    backgroundColor: "var(--bg-main)",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: "600",
  },
  dateText: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "var(--text-muted)",
  },

  techSheet: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
    padding: "15px",
    backgroundColor: "var(--bg-main)",
    borderRadius: "8px",
  },
  techItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  iconCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  techLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: "800",
    color: "var(--text-muted)",
    marginBottom: "2px",
  },
  techValue: {
    fontSize: "13px",
    color: "var(--text-primary)",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  section: { marginBottom: "30px" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  bnccBox: {
    backgroundColor: "var(--bg-warning)",
    borderLeft: "4px solid var(--border-warning)",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "30px",
  },
  bnccText: {
    margin: 0,
    fontSize: "15px",
    color: "var(--text-primary)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  textBody: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap",
  },
  resultsBox: {
    backgroundColor: "var(--bg-success)",
    border: "1px solid var(--border-success)",
    padding: "15px",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontStyle: "italic",
    whiteSpace: "pre-wrap",
  },

  sidebarCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "20px",
  },
  sidebarTitle: {
    margin: "0 0 15px 0",
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "800",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "8px",
  },

  statusBoxApproved: {
    padding: "15px",
    backgroundColor: "var(--bg-success)",
    borderRadius: "8px",
    border: "1px solid var(--border-success)",
  },
  statusTitleApproved: {
    display: "block",
    fontSize: "14px",
    fontWeight: "900",
    color: "var(--text-success)",
  },
  statusBoxPending: {
    padding: "15px",
    backgroundColor: "var(--bg-warning)",
    borderRadius: "8px",
    border: "1px solid var(--border-warning)",
  },
  statusTitlePending: {
    display: "block",
    fontSize: "14px",
    fontWeight: "900",
    color: "var(--text-warning)",
  },
  statusBoxRejected: {
    padding: "15px",
    backgroundColor: "var(--bg-danger)",
    borderRadius: "8px",
    border: "1px solid var(--border-danger)",
  },
  statusTitleRejected: {
    fontSize: "13px",
    fontWeight: "900",
    color: "var(--text-danger)",
  },
  statusDesc: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: "5px 0 0 0",
    lineHeight: "1.4",
  },
}

export default VisualizarMinhaProducao
