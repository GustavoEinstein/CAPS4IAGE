import React, { useState, useEffect } from "react"
import {
  ArrowLeft,
  Trophy,
  History,
  Plus,
  TrendingUp,
  Award,
  User,
  Trash2,
  ShieldCheck,
  Loader2,
  Star,
  Zap,
  Crown,
  Flame,
  Target,
  Book,
  Lightbulb,
  Medal,
  ThumbsUp,
  Heart,
  Rocket,
  Shield,
} from "lucide-react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"

const ICONS_DISPONIVEIS = [
  "award",
  "star",
  "zap",
  "crown",
  "flame",
  "target",
  "book",
  "lightbulb",
  "medal",
  "thumbsup",
  "heart",
  "rocket",
  "shield",
  "trophy",
]

const getIcon = (name, size = 18, color = "var(--text-warning)") => {
  switch (name) {
    case "star":
      return <Star size={size} color={color} style={{ flexShrink: 0 }} />
    case "zap":
      return <Zap size={size} color={color} style={{ flexShrink: 0 }} />
    case "crown":
      return <Crown size={size} color={color} style={{ flexShrink: 0 }} />
    case "flame":
      return <Flame size={size} color={color} style={{ flexShrink: 0 }} />
    case "target":
      return <Target size={size} color={color} style={{ flexShrink: 0 }} />
    case "book":
      return <Book size={size} color={color} style={{ flexShrink: 0 }} />
    case "lightbulb":
      return <Lightbulb size={size} color={color} style={{ flexShrink: 0 }} />
    case "medal":
      return <Medal size={size} color={color} style={{ flexShrink: 0 }} />
    case "thumbsup":
      return <ThumbsUp size={size} color={color} style={{ flexShrink: 0 }} />
    case "heart":
      return <Heart size={size} color={color} style={{ flexShrink: 0 }} />
    case "rocket":
      return <Rocket size={size} color={color} style={{ flexShrink: 0 }} />
    case "shield":
      return <Shield size={size} color={color} style={{ flexShrink: 0 }} />
    case "trophy":
      return <Trophy size={size} color={color} style={{ flexShrink: 0 }} />
    case "award":
    default:
      return <Award size={size} color={color} style={{ flexShrink: 0 }} />
  }
}

export default function GamificacaoAdmin() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const [dados, setDados] = useState({
    conquistas_disponiveis: [],
    auditoria_xp: [],
  })
  const [usuarios, setUsuarios] = useState([])
  const [novaConquista, setNovaConquista] = useState({
    nome: "",
    descricao: "",
    xp_bonus: 50,
    icone: "award",
  })
  const [atribuicao, setAtribuicao] = useState({
    usuario_id: "",
    conquista_id: "",
  })

  useEffect(() => {
    fetchDados()
    fetchUsuarios()
  }, [])

  const fetchDados = async () => {
    try {
      const response = await api.get("api/admin/gamificacao/")
      setDados(response.data)
    } catch (err) {
      console.error("Erro", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("api/admin/users/")
      setUsuarios(response.data.filter((u) => !u.is_superuser))
    } catch (err) {
      console.error("Erro", err)
    }
  }

  const handleCreateBadge = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post("api/admin/gamificacao/", novaConquista)
      Swal.fire({
        icon: "success",
        title: "Badge Criada!",
        timer: 1500,
        showConfirmButton: false,
      })
      fetchDados()
      setNovaConquista({
        nome: "",
        descricao: "",
        xp_bonus: 50,
        icone: "award",
      })
    } catch (err) {
      Swal.fire("Erro", "Erro ao criar badge.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAtribuirBadge = async (e) => {
    e.preventDefault()
    if (!atribuicao.usuario_id || !atribuicao.conquista_id)
      return Swal.fire("Atenção", "Selecione usuário e medalha.", "warning")
    setIsAssigning(true)
    try {
      await api.post("api/admin/gamificacao/atribuir/", atribuicao)
      Swal.fire({
        icon: "success",
        title: "Atribuída!",
        text: "Concedido ao professor.",
        timer: 2000,
        showConfirmButton: false,
      })
      fetchDados()
      setAtribuicao({ usuario_id: "", conquista_id: "" })
    } catch (err) {
      Swal.fire("Ops!", err.response?.data?.erro || "Erro", "error")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteBadge = async (id) => {
    const confirm = await Swal.fire({
      title: "Deletar Badge?",
      text: "Isso removerá a medalha do sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
    })
    if (!confirm.isConfirmed) return
    try {
      await api.delete(`api/admin/gamificacao/${id}/delete/`)
      fetchDados()
    } catch (err) {
      Swal.fire("Erro", "Erro ao excluir.", "error")
    }
  }

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
      <style>{`
        input::placeholder, textarea::placeholder { color: var(--text-muted) !important; opacity: 1 !important; }
        ::-webkit-input-placeholder { color: var(--text-muted) !important; opacity: 1 !important; }
        :-moz-placeholder { color: var(--text-muted) !important; opacity: 1 !important; }
      `}</style>

      <div style={styles.container}>
        <header style={styles.header}>
          <button
            onClick={() => navigate("/dashboard/central-admin")}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} /> Voltar à Central
          </button>
          <div style={styles.titleGroup}>
            <div style={styles.iconCircleOrange}>
              <Trophy size={28} color="var(--text-warning)" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.title,
                  fontSize: isMobile ? "22px" : "28px",
                }}
              >
                Gestão do Hall da Fama
              </h1>
              <p style={styles.subtitle}>
                Gerencie a economia de XP e distribua medalhas.
              </p>
            </div>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <StatCard
            icon={<Trophy color="var(--text-warning)" />}
            label="Total de Badges"
            value={dados.conquistas_disponiveis.length}
          />
          <StatCard
            icon={<TrendingUp color="var(--text-success)" />}
            label="Movimentações de XP"
            value={dados.auditoria_xp.length}
          />
        </div>

        <div
          style={{
            ...styles.mainGrid,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={styles.columnLeft}>
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <ShieldCheck size={20} color="var(--text-warning)" />
                <h2 style={styles.sectionTitle}>Conceder Medalha e XP</h2>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  marginBottom: "15px",
                }}
              >
                Reconheça professores manualmente concedendo uma badge
                específica e seu respectivo bônus de XP.
              </p>

              <form onSubmit={handleAtribuirBadge} style={styles.formRow}>
                <div style={styles.inputGroupFlex}>
                  <label style={styles.label}>Professor</label>
                  <select
                    style={styles.select}
                    value={atribuicao.usuario_id}
                    onChange={(e) =>
                      setAtribuicao({
                        ...atribuicao,
                        usuario_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Selecione o professor...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.disciplina})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroupFlex}>
                  <label style={styles.label}>Medalha</label>
                  <select
                    style={styles.select}
                    value={atribuicao.conquista_id}
                    onChange={(e) =>
                      setAtribuicao({
                        ...atribuicao,
                        conquista_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Selecione a medalha...</option>
                    {dados.conquistas_disponiveis.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (+{c.xp_bonus} XP)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isAssigning}
                  style={{
                    ...styles.submitBtn,
                    backgroundColor: "#EA580C",
                    alignSelf: "flex-end",
                    height: "42px",
                    padding: "0 20px",
                  }}
                >
                  {isAssigning ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Award size={16} />
                  )}{" "}
                  Atribuir
                </button>
              </form>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <History size={20} color="var(--text-info)" />
                <h2 style={styles.sectionTitle}>Auditoria de XP</h2>
              </div>

              <div style={styles.tableContainer}>
                {isMobile ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {dados.auditoria_xp.map((log, i) => (
                      <div key={i} style={styles.mobileLogCard}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={styles.userName}>
                            <User size={14} /> {log.usuario}
                          </span>
                          <span
                            style={{
                              color: "var(--text-success)",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            +{log.quantidade} XP
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {log.descricao}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {log.data}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Professor</th>
                        <th style={styles.th}>Ação</th>
                        <th style={styles.th}>Valor</th>
                        <th style={styles.th}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.auditoria_xp.map((log, i) => (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={styles.userName}>
                              <User size={14} /> {log.usuario}
                            </span>
                          </td>
                          <td style={styles.td}>{log.descricao}</td>
                          <td
                            style={{
                              ...styles.td,
                              color: "var(--text-success)",
                              fontWeight: "bold",
                            }}
                          >
                            +{log.quantidade}
                          </td>
                          <td style={styles.td}>{log.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>

          <aside style={styles.sidebar}>
            <div style={styles.formCard}>
              <div style={styles.sectionHeader}>
                <Plus size={20} color="var(--text-info)" />
                <h2 style={styles.sectionTitle}>Nova Badge</h2>
              </div>
              <form onSubmit={handleCreateBadge} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome da Medalha</label>
                  <input
                    style={styles.input}
                    placeholder="Ex: Curador Mestre"
                    value={novaConquista.nome}
                    onChange={(e) =>
                      setNovaConquista({
                        ...novaConquista,
                        nome: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Descrição</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Para o que serve essa medalha?"
                    value={novaConquista.descricao}
                    onChange={(e) =>
                      setNovaConquista({
                        ...novaConquista,
                        descricao: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Escolha o Ícone</label>
                  <div style={styles.iconSelectorGrid}>
                    {ICONS_DISPONIVEIS.map((iconName) => {
                      const isSelected = novaConquista.icone === iconName
                      return (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() =>
                            setNovaConquista({
                              ...novaConquista,
                              icone: iconName,
                            })
                          }
                          title={iconName}
                          style={{
                            ...styles.iconSelectBtn,
                            backgroundColor: isSelected
                              ? "var(--bg-warning)"
                              : "var(--bg-card)",
                            borderColor: isSelected
                              ? "var(--text-warning)"
                              : "var(--border-color)",
                          }}
                        >
                          {getIcon(
                            iconName,
                            20,
                            isSelected
                              ? "var(--text-warning)"
                              : "var(--text-muted)",
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>XP Bônus (Recompensa)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={novaConquista.xp_bonus}
                    onChange={(e) =>
                      setNovaConquista({
                        ...novaConquista,
                        xp_bonus: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  Criar Badge
                </button>
              </form>
            </div>

            <div style={styles.listCard}>
              <h3 style={styles.miniTitle}>Badges Ativas</h3>
              {dados.conquistas_disponiveis.map((c) => (
                <div key={c.id} style={styles.badgeItem}>
                  {getIcon(c.icone, 22, "var(--text-warning)")}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      overflow: "hidden",
                      marginLeft: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {c.nome}
                    </span>
                    <small
                      style={{ color: "var(--text-muted)", fontWeight: "600" }}
                    >
                      +{c.xp_bonus} XP
                    </small>
                  </div>
                  <button
                    onClick={() => handleDeleteBadge(c.id)}
                    style={styles.deleteBtn}
                    title="Excluir Medalha"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {dados.conquistas_disponiveis.length === 0 && (
                <p style={styles.emptyText}>Nenhuma badge criada ainda.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div>
      <p style={styles.statLabel}>{label}</p>
      <h3 style={styles.statValue}>{value}</h3>
    </div>
  </div>
)

const styles = {
  wrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },
  header: { marginBottom: "30px" },
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "var(--bg-card)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "var(--bg-alt)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  statValue: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  mainGrid: { display: "flex", gap: "30px", alignItems: "flex-start" },
  columnLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    minWidth: 0,
  },
  section: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "20px",
    padding: "25px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
  },
  formRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    backgroundColor: "var(--bg-main)",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  inputGroupFlex: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
    minWidth: "150px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--input-bg)",
    color: "var(--input-text)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  tableContainer: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    padding: "12px",
    borderBottom: "2px solid var(--bg-main)",
    color: "var(--text-muted)",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid var(--bg-main)",
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  tr: { transition: "background 0.2s" },
  userName: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  mobileLogCard: {
    backgroundColor: "var(--bg-main)",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    maxWidth: "350px",
  },
  formCard: {
    backgroundColor: "var(--bg-card)",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--input-bg)",
    color: "var(--input-text)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--input-bg)",
    color: "var(--input-text)",
    fontSize: "14px",
    outline: "none",
    minHeight: "80px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  iconSelectorGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px",
    backgroundColor: "var(--bg-main)",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  iconSelectBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1565C0",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "filter 0.2s",
    marginTop: "10px",
    boxSizing: "border-box",
  },
  listCard: {
    backgroundColor: "var(--bg-main)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
  },
  miniTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "var(--text-secondary)",
    marginBottom: "15px",
    marginTop: 0,
    textTransform: "uppercase",
  },
  badgeItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  deleteBtn: {
    background: "var(--bg-danger)",
    border: "1px solid var(--border-danger)",
    color: "var(--text-danger)",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "14px",
    width: "100%",
    padding: "20px",
    textAlign: "center",
    border: "1px dashed var(--border-color)",
    borderRadius: "12px",
  },
}
