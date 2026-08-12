import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import {
  Trophy,
  Medal,
  Star,
  MessageSquare,
  ShieldCheck,
  Award,
  Loader2,
  ArrowLeft,
  Crown,
} from "lucide-react"

export default function Ranking() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("xp") // 'xp', 'revisores', 'forum'

  const [rankingData, setRankingData] = useState({
    top_xp: [],
    top_revisores: [],
    top_forum: [],
  })

  useEffect(() => {
    carregarRanking()
  }, [])

  const carregarRanking = async () => {
    try {
      const response = await api.get("api/ranking/")
      setRankingData({
        top_xp: response.data.top_xp || [],
        top_revisores: response.data.top_revisores || [],
        top_forum: response.data.top_forum || [],
      })
    } catch (error) {
      console.error("Erro ao carregar ranking", error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentList = () => {
    if (activeTab === "xp") return rankingData.top_xp
    if (activeTab === "revisores") return rankingData.top_revisores
    if (activeTab === "forum") return rankingData.top_forum
    return []
  }

  const currentList = getCurrentList()
  const podium = currentList.slice(0, 3)
  const restOfList = currentList.slice(3)

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="var(--text-warning)" />
        <p style={{ marginTop: "10px", color: "var(--text-muted)" }}>
          Carregando Hall da Fama...
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    )

  return (
    <div
      style={{
        ...styles.wrapper,
        padding: isMobile ? "20px 10px" : "40px 20px",
      }}
    >
      <div style={styles.container}>
        {/* CABEÇALHO */}
        <header style={styles.header}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div style={styles.titleGroup}>
            <div style={styles.iconCircleOrange}>
              <Trophy size={28} color="var(--text-warning)" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.title,
                  fontSize: isMobile ? "24px" : "32px",
                }}
              >
                Hall da Fama T.E.I.A
              </h1>
              <p style={styles.subtitle}>
                Os professores que mais impactam a nossa comunidade educativa.
              </p>
            </div>
          </div>
        </header>

        {/* NAVEGAÇÃO DE ABAS */}
        <div style={styles.tabsContainer}>
          <button
            style={activeTab === "xp" ? styles.tabActive : styles.tabInactive}
            onClick={() => setActiveTab("xp")}
          >
            <Star size={18} /> Mestres em XP
          </button>
          <button
            style={
              activeTab === "revisores" ? styles.tabActive : styles.tabInactive
            }
            onClick={() => setActiveTab("revisores")}
          >
            <ShieldCheck size={18} /> Top Revisores
          </button>
          <button
            style={
              activeTab === "forum" ? styles.tabActive : styles.tabInactive
            }
            onClick={() => setActiveTab("forum")}
          >
            <MessageSquare size={18} /> Vozes do Fórum
          </button>
        </div>

        {/* CONTEÚDO DO RANKING */}
        <div style={styles.rankingContent}>
          {currentList.length === 0 ? (
            <div style={styles.emptyState}>
              <Award
                size={48}
                color="var(--border-color)"
                style={{ marginBottom: "15px" }}
              />
              <h3
                style={{ color: "var(--text-primary)", margin: "0 0 10px 0" }}
              >
                O pódio ainda está vazio!
              </h3>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Nenhuma pontuação registrada nesta categoria até o momento.
              </p>
            </div>
          ) : (
            <>
              {/* PÓDIO (TOP 3) */}
              <div
                style={{
                  ...styles.podiumContainer,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                {/* 2º LUGAR */}
                {podium[1] && (
                  <div
                    style={{
                      ...styles.podiumCard,
                      marginTop: isMobile ? "0" : "30px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.medalCircle,
                        backgroundColor: "#F1F5F9",
                        border: "3px solid #CBD5E1",
                      }}
                    >
                      <Medal size={28} color="#64748B" />
                    </div>
                    <div style={styles.podiumPos}>2º Lugar</div>
                    <h3 style={styles.podiumName}>{podium[1].nome}</h3>
                    <p style={styles.podiumDisc}>{podium[1].disciplina}</p>
                    <div style={styles.podiumScore}>
                      {activeTab === "xp"
                        ? `${podium[1].pontos} XP`
                        : `${podium[1].total} Interações`}
                    </div>
                  </div>
                )}

                {/* 1º LUGAR */}
                {podium[0] && (
                  <div
                    style={{
                      ...styles.podiumCard,
                      transform: isMobile ? "scale(1)" : "scale(1.05)",
                      zIndex: 10,
                      border: "2px solid var(--border-warning)",
                    }}
                  >
                    <div
                      style={{
                        ...styles.medalCircle,
                        backgroundColor: "#FFFBEB",
                        border: "3px solid #FCD34D",
                        width: "70px",
                        height: "70px",
                      }}
                    >
                      <Crown size={36} color="#D97706" />
                    </div>
                    <div style={{ ...styles.podiumPos, color: "#D97706" }}>
                      1º Lugar
                    </div>
                    <h3 style={{ ...styles.podiumName, fontSize: "18px" }}>
                      {podium[0].nome}
                    </h3>
                    <p style={styles.podiumDisc}>{podium[0].disciplina}</p>
                    <div
                      style={{
                        ...styles.podiumScore,
                        backgroundColor: "var(--bg-warning)",
                        color: "var(--text-warning)",
                      }}
                    >
                      {activeTab === "xp"
                        ? `${podium[0].pontos} XP`
                        : `${podium[0].total} Interações`}
                    </div>
                  </div>
                )}

                {/* 3º LUGAR */}
                {podium[2] && (
                  <div
                    style={{
                      ...styles.podiumCard,
                      marginTop: isMobile ? "0" : "40px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.medalCircle,
                        backgroundColor: "#FFF7ED",
                        border: "3px solid #FDBA74",
                      }}
                    >
                      <Medal size={28} color="#B45309" />
                    </div>
                    <div style={styles.podiumPos}>3º Lugar</div>
                    <h3 style={styles.podiumName}>{podium[2].nome}</h3>
                    <p style={styles.podiumDisc}>{podium[2].disciplina}</p>
                    <div style={styles.podiumScore}>
                      {activeTab === "xp"
                        ? `${podium[2].pontos} XP`
                        : `${podium[2].total} Interações`}
                    </div>
                  </div>
                )}
              </div>

              {/* LISTA RESTANTE (4 AO 10) */}
              {restOfList.length > 0 && (
                <div style={styles.listContainer}>
                  {restOfList.map((user, index) => (
                    <div key={user.id} style={styles.listItem}>
                      <div style={styles.listPos}>{index + 4}º</div>
                      <div style={styles.listInfo}>
                        <h4 style={styles.listName}>{user.nome}</h4>
                        <span style={styles.listDisc}>
                          {user.disciplina} • {user.nivel}
                        </span>
                      </div>
                      <div style={styles.listScoreBadge}>
                        {activeTab === "xp"
                          ? `${user.pontos} XP`
                          : `${user.total}Pts`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  container: { maxWidth: "900px", margin: "0 auto" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },

  header: { marginBottom: "40px" },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "var(--text-secondary)",
    marginBottom: "15px",
    fontWeight: "700",
    padding: 0,
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "15px" },
  iconCircleOrange: {
    width: "50px",
    height: "50px",
    backgroundColor: "var(--bg-warning)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { fontWeight: "900", color: "var(--text-primary)", margin: 0 },
  subtitle: { color: "var(--text-muted)", marginTop: "5px", fontSize: "14px" },

  tabsContainer: {
    display: "flex",
    gap: "10px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "20px",
    marginBottom: "30px",
    overflowX: "auto",
  },
  tabActive: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#1565C0",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  tabInactive: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-card)",
    color: "var(--text-secondary)",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },

  rankingContent: { display: "flex", flexDirection: "column", gap: "40px" },
  emptyState: {
    backgroundColor: "var(--bg-card)",
    padding: "60px 20px",
    borderRadius: "16px",
    border: "1px dashed var(--border-color)",
    textAlign: "center",
  },

  // Pódio
  podiumContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "15px",
  },
  podiumCard: {
    flex: 1,
    backgroundColor: "var(--bg-card)",
    padding: "30px 20px",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
  },
  medalCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
    zIndex: 2,
  },
  podiumPos: {
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: "5px",
    letterSpacing: "1px",
  },
  podiumName: {
    margin: "0 0 5px 0",
    color: "var(--text-primary)",
    fontSize: "16px",
    fontWeight: "800",
  },
  podiumDisc: {
    margin: "0 0 15px 0",
    color: "var(--text-secondary)",
    fontSize: "12px",
  },
  podiumScore: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-primary)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "800",
    marginTop: "auto",
  },

  // Lista Restante
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "var(--bg-card)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderRadius: "10px",
    borderBottom: "1px solid var(--bg-main)",
    transition: "background-color 0.2s",
  },
  listPos: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
    flexShrink: 0,
  },
  listInfo: { flex: 1 },
  listName: {
    margin: "0 0 4px 0",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontWeight: "700",
  },
  listDisc: { margin: 0, color: "var(--text-muted)", fontSize: "12px" },
  listScoreBadge: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-primary)",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
  },
}
