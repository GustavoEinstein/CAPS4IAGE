import React, { useState, useEffect } from "react"
import api from "../services/api"
import {
  useParams,
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bot,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wrench,
  Lightbulb,
  Target,
  Download,
  FileText,
  User,
  Bookmark,
  ShieldCheck,
  Package,
  Cpu,
  Terminal,
  Star,
  BarChart3,
  ThumbsUp,
  AlertTriangle,
  Link,
  ExternalLink,
} from "lucide-react"

const DetalharProducao = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const location = useLocation()
  const fromHistory = location.state?.fromHistory || false
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleDownload = async () => {
    if (!data || !data.arquivo) return
    try {
      const urlRelativa = data.arquivo.replace(
        "https://teia.cic.unb.br/kipo_playground/",
        "",
      )
      const response = await api.get(urlRelativa, { responseType: "blob" })
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = urlBlob
      link.setAttribute("download", `producao-${data.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error("Erro no download:", error)
    }
  }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`api/production/${id}/`)
        setData(response.data)
      } catch (error) {
        alert("Erro ao carregar a produção.")
        navigate("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetails()
  }, [id, navigate])

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

  const isRejected =
    data.status &&
    (data.status.toLowerCase().includes("rejeitado") ||
      data.status.toLowerCase().includes("correção"))
  const isApproved =
    data.status &&
    (data.status.toLowerCase().includes("aprovado") ||
      data.status.toLowerCase().includes("publicado"))
  const podeVerParecer = data.is_admin || (data.is_revisor && fromHistory)

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div
          style={{ ...styles.grid, flexDirection: isMobile ? "column" : "row" }}
        >
          {isMobile && (
            <div
              style={{
                ...styles.columnSidebar,
                width: "100%",
                position: "relative",
                top: 0,
                marginBottom: "20px",
              }}
            >
              <SidebarContent
                data={data}
                isApproved={isApproved}
                isRejected={isRejected}
                handleDownload={handleDownload}
              />
            </div>
          )}

          <div style={styles.columnContent}>
            <div style={styles.materialCard}>
              <div style={styles.headerSection}>
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
                  <span style={styles.badgeNeutral}>{data.nivel}</span>
                </div>
                <h1 style={styles.title}>{data.titulo}</h1>
                <div style={styles.metaRow}>
                  <div style={styles.iaTag}>
                    <Bot size={14} /> {data.modelo_ia}
                  </div>
                  <span style={styles.dateText}>
                    <Calendar size={14} /> {data.data}
                  </span>
                </div>
              </div>

              {data.producao_base && (
                <div style={styles.derivationBanner}>
                  <Bookmark size={20} color="var(--text-info)" />
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-info)",
                      lineHeight: "1.4",
                    }}
                  >
                    Inspirada em: <br />
                    <strong>
                      <a
                        href={`/dashboard/producao/${data.producao_base.id}`}
                        style={{ color: "var(--text-info)" }}
                      >
                        {data.producao_base.titulo}
                      </a>
                    </strong>
                  </span>
                </div>
              )}

              <div style={styles.techSheet}>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}>
                    <Wrench size={18} color="var(--text-info)" />
                  </div>
                  <div>
                    <span
                      style={{ ...styles.techLabel, color: "var(--text-info)" }}
                    >
                      Metodologia
                    </span>
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
                    <span
                      style={{ ...styles.techLabel, color: "var(--text-info)" }}
                    >
                      Duração
                    </span>
                    <span style={styles.techValue}>{data.duracao || "-"}</span>
                  </div>
                </div>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}>
                    <Package size={18} color="var(--text-info)" />
                  </div>
                  <div>
                    <span
                      style={{ ...styles.techLabel, color: "var(--text-info)" }}
                    >
                      Recursos
                    </span>
                    <span style={styles.techValue}>
                      {Array.isArray(data.recursos)
                        ? data.recursos.join(", ")
                        : typeof data.recursos === "string"
                          ? data.recursos
                              .split(",")
                              .map((r) => r.trim())
                              .join(", ")
                          : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <BookOpen size={18} /> Alinhamento BNCC
                </h3>
                <div style={styles.bnccBox}>
                  <p style={styles.bnccText}>{data.bncc || "Não informado."}</p>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Cpu size={20} /> BNCC Computação
                </h3>
                <div
                  style={{
                    ...styles.bnccBox,
                    backgroundColor: "var(--bg-info)",
                    borderLeft: "4px solid var(--text-info)",
                  }}
                >
                  <p style={{ ...styles.bnccText, color: "var(--text-info)" }}>
                    {data.bncc_computacao || "Nenhuma habilidade registrada."}
                  </p>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Terminal size={20} /> Prompts na IA
                </h3>
                <div style={styles.promptBox}>
                  {data.prompts_ia || "Nenhum prompt registrado."}
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Lightbulb size={20} color="var(--text-warning)" /> Relato de
                  Experiência
                </h3>
                <div style={styles.textBody}>{data.experiencia}</div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Target size={20} color="var(--text-success)" /> Resultados
                </h3>
                <div style={styles.resultsBox}>{data.resultados}</div>
              </div>

              {podeVerParecer && <ParecerTecnico producao={data} />}
            </div>
          </div>

          {!isMobile && (
            <div style={styles.columnSidebar}>
              <SidebarContent
                data={data}
                isApproved={isApproved}
                isRejected={isRejected}
                handleDownload={handleDownload}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const SidebarContent = ({ data, isApproved, isRejected, handleDownload }) => {
  return (
    <div style={styles.sidebarCard}>
      <h3 style={styles.sidebarTitle}>Status do Material</h3>
      {isApproved && (
        <div style={styles.statusBoxApproved}>
          <ShieldCheck
            size={24}
            color="var(--text-success)"
            style={{ flexShrink: 0 }}
          />
          <div>
            <span style={styles.statusTitleApproved}>APROVADO</span>
            <p style={styles.statusDesc}>Validado pela comunidade.</p>
          </div>
        </div>
      )}
      {!isApproved && !isRejected && (
        <div style={styles.statusBoxPending}>
          <Clock
            size={24}
            color="var(--text-warning)"
            style={{ flexShrink: 0 }}
          />
          <div>
            <span style={styles.statusTitlePending}>EM ANÁLISE</span>
          </div>
        </div>
      )}
      <div style={styles.divider}></div>

      <h3 style={styles.sidebarTitle}>Arquivos e Links</h3>

      {data.arquivo && (
        <button onClick={handleDownload} style={styles.downloadBtn}>
          <Download size={18} /> Baixar Roteiro
        </button>
      )}

      {data.link_material && (
        <a
          href={data.link_material}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <button
            style={{
              ...styles.downloadBtn,
              backgroundColor: "#7B1FA2",
              marginTop: data.arquivo ? "10px" : "0",
            }}
          >
            <ExternalLink size={18} /> Acessar Link Externo
          </button>
        </a>
      )}

      {!data.arquivo && !data.link_material && (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Nenhum material anexado.
        </p>
      )}
    </div>
  )
}

const ParecerTecnico = ({ producao }) => {
  if (
    !producao ||
    !producao.avaliacoes_detalhadas ||
    producao.avaliacoes_detalhadas.length === 0
  )
    return null
  const avaliacoes = producao.avaliacoes_detalhadas

  return (
    <div style={styles.ptContainer}>
      <div style={styles.ptMainHeader}>
        <BarChart3 size={24} color="var(--text-info)" />
        <div>
          <h3 style={styles.ptMainTitle}>Histórico de Revisão</h3>
          <p style={styles.ptMainSubtitle}>
            Detalhamento dos avaliadores sobre esta prática.
          </p>
        </div>
      </div>
      <div style={styles.ptCardsWrapper}>
        {avaliacoes.map((aval) => (
          <ReviewCard key={aval.ordem} avaliacao={aval} />
        ))}
        {producao.total_avaliacoes === 1 &&
          (producao.is_dono || producao.is_admin) &&
          !producao.status.toLowerCase().includes("rejeitado") && <GhostCard />}
      </div>
    </div>
  )
}

const ReviewCard = ({ avaliacao }) => {
  const isAprovado = avaliacao.aprovado
  const { notas, pontos_fortes, pontos_melhoria, ordem } = avaliacao
  return (
    <div style={styles.rcCard(isAprovado)}>
      <div style={styles.rcHeader(isAprovado)}>
        <div style={styles.rcHeaderTitle(isAprovado)}>
          {isAprovado ? (
            <CheckCircle2 size={22} />
          ) : (
            <AlertTriangle size={22} />
          )}
          <span>PARECER DO {ordem}º AVALIADOR</span>
        </div>
        <div style={styles.rcBadge(isAprovado)}>
          {isAprovado ? "APROVADO" : "AJUSTES"}
        </div>
      </div>
      <div style={styles.rcContent}>
        <div style={styles.rcGridScores}>
          <ScoreItem label="Pedagógico" valor={notas.coerencia} />
          <ScoreItem label="Prompt" valor={notas.qualidade} />
          <ScoreItem label="Metodologia" valor={notas.metodologia} />
          <ScoreItem label="Avaliação" valor={notas.avaliacao} />
          <ScoreItem label="Inclusão" valor={notas.inclusao} />
          <ScoreItem label="Inovação" valor={notas.inovacao} />
        </div>
        <hr style={styles.rcDivider} />
        <div style={styles.rcFeedbackGrid}>
          {pontos_fortes && (
            <div style={styles.rcFeedbackBoxSuccess}>
              <div style={styles.rcFeedbackLabelSuccess}>
                <ThumbsUp size={16} /> Pontos Fortes
              </div>
              <div style={styles.rcFeedbackTextSuccess}>{pontos_fortes}</div>
            </div>
          )}
          {pontos_melhoria && (
            <div style={styles.rcFeedbackBoxDanger}>
              <div style={styles.rcFeedbackLabelDanger}>
                <AlertTriangle size={16} /> Melhorias
              </div>
              <div style={styles.rcFeedbackTextDanger}>{pontos_melhoria}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const GhostCard = () => (
  <div style={styles.gcCard}>
    <div style={styles.gcHeader}>
      <div style={styles.gcTitle}>
        <Clock size={22} color="var(--text-muted)" />
        <span>AGUARDANDO 2º AVALIADOR</span>
      </div>
    </div>
    <div style={styles.gcContent}>
      <p style={styles.gcText}>
        Aguardando o parecer de mais um colega para finalização.
      </p>
    </div>
  </div>
)

const ScoreItem = ({ label, valor }) => (
  <div style={styles.rcScoreRow}>
    <span style={styles.rcLabel}>{label}</span>
    <div style={styles.rcStarsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          fill={star <= valor ? "var(--text-danger)" : "var(--border-color)"}
          color="transparent"
        />
      ))}
      <span style={styles.rcNumberValue}>{valor}/5</span>
    </div>
  </div>
)

const styles = {
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    paddingTop: "20px",
  },
  container: {
    maxWidth: "1200px",
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
  columnSidebar: { width: "320px", position: "sticky", top: "20px" },
  materialCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    padding: "30px",
    border: "1px solid var(--border-color)",
  },
  headerSection: {
    marginBottom: "20px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "15px",
  },
  badgesRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  badgeNeutral: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 8px 0",
    wordBreak: "break-word",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "5px",
    flexWrap: "wrap",
  },
  iaTag: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "var(--text-secondary)",
    backgroundColor: "var(--bg-alt)",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  dateText: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  derivationBanner: {
    backgroundColor: "var(--bg-info)",
    borderLeft: "4px solid var(--text-info)",
    padding: "12px 15px",
    borderRadius: "6px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  techSheet: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  techItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  iconCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-alt)",
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
  promptBox: {
    backgroundColor: "var(--bg-card)",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid var(--text-info)",
    fontStyle: "italic",
    color: "var(--text-secondary)",
    fontSize: "14px",
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
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid var(--border-success)",
    color: "var(--text-success)",
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
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "800",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "8px",
  },
  statusBoxApproved: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    backgroundColor: "var(--bg-success)",
    borderRadius: "8px",
    border: "1px solid var(--border-success)",
  },
  statusTitleApproved: {
    fontSize: "14px",
    fontWeight: "900",
    color: "var(--text-success)",
  },
  statusBoxPending: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    backgroundColor: "var(--bg-warning)",
    borderRadius: "8px",
    border: "1px solid var(--border-warning)",
  },
  statusTitlePending: {
    fontSize: "14px",
    fontWeight: "900",
    color: "var(--text-warning)",
  },
  statusDesc: { fontSize: "11px", color: "var(--text-secondary)", margin: 0 },
  divider: {
    height: "1px",
    backgroundColor: "var(--border-color)",
    margin: "20px 0",
  },
  downloadBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  ptContainer: {
    marginTop: "40px",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "30px",
  },
  ptMainHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  ptMainTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 4px 0",
  },
  ptMainSubtitle: { fontSize: "14px", color: "var(--text-muted)", margin: 0 },
  ptCardsWrapper: { display: "flex", flexDirection: "column", gap: "20px" },
  rcCard: (aprovado) => ({
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: aprovado
      ? "1px solid var(--border-success)"
      : "1px solid var(--border-danger)",
    overflow: "hidden",
  }),
  rcHeader: (aprovado) => ({
    backgroundColor: aprovado ? "var(--bg-success)" : "var(--bg-danger)",
    padding: "15px 25px",
    borderBottom: aprovado
      ? "1px solid var(--border-success)"
      : "1px solid var(--border-danger)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  }),
  rcHeaderTitle: (aprovado) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
  }),
  rcBadge: (aprovado) => ({
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: aprovado ? "var(--bg-success)" : "var(--bg-danger)",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: `1px solid ${aprovado ? "var(--text-success)" : "var(--text-danger)"}`,
  }),
  rcContent: { padding: "25px" },
  rcGridScores: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px 30px",
  },
  rcScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-alt)",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  rcLabel: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  rcStarsContainer: { display: "flex", alignItems: "center" },
  rcNumberValue: {
    fontSize: "13px",
    fontWeight: "800",
    marginLeft: "8px",
    color: "var(--text-primary)",
  },
  rcDivider: {
    border: "none",
    borderTop: "1px dashed var(--border-color)",
    margin: "25px 0",
  },
  rcFeedbackGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  rcFeedbackBoxSuccess: {
    backgroundColor: "var(--bg-success)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-success)",
  },
  rcFeedbackLabelSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-success)",
    marginBottom: "8px",
  },
  rcFeedbackTextSuccess: {
    fontSize: "14px",
    color: "var(--text-success)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  rcFeedbackBoxDanger: {
    backgroundColor: "var(--bg-danger)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-danger)",
  },
  rcFeedbackLabelDanger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-danger)",
    marginBottom: "8px",
  },
  rcFeedbackTextDanger: {
    fontSize: "14px",
    color: "var(--text-danger)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  gcCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "2px dashed var(--border-color)",
    overflow: "hidden",
    opacity: 0.8,
  },
  gcHeader: {
    backgroundColor: "var(--bg-alt)",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gcTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    color: "var(--text-muted)",
  },
  gcContent: { padding: "25px", textAlign: "center" },
  gcText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
}

export default DetalharProducao
