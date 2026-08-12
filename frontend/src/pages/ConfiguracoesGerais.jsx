import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"
import {
  TrendingUp,
  School,
  BookOpen,
  Save,
  Plus,
  Loader2,
  Settings,
  FileCheck,
  ChevronRight,
  Trophy,
  X,
} from "lucide-react"

export default function ConfiguracoesGerais() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const [loading, setLoading] = useState(true)
  const [savingXp, setSavingXp] = useState(false)
  const [activeTab, setActiveTab] = useState("economia")

  const [xpConfig, setXpConfig] = useState({
    xp_revisao: 15,
    xp_aprovacao: 50,
    xp_topico: 5,
    xp_comentario: 5,
  })
  const [escolas, setEscolas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [novaEscola, setNovaEscola] = useState("")
  const [novaDisciplina, setNovaDisciplina] = useState("")

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      const response = await api.get("api/admin/configuracoes/")
      setXpConfig(response.data.xp)
      setEscolas(response.data.escolas)
      setDisciplinas(response.data.disciplinas)
    } catch (error) {
      if (error.response?.status === 403) navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleXpChange = (e) =>
    setXpConfig({ ...xpConfig, [e.target.name]: parseInt(e.target.value) || 0 })

  const salvarXp = async (e) => {
    e.preventDefault()
    setSavingXp(true)
    try {
      await api.post("api/admin/configuracoes/", {
        acao: "atualizar_xp",
        ...xpConfig,
      })
      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Economia de XP atualizada.",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire("Erro", "Não foi possível salvar.", "error")
    } finally {
      setSavingXp(false)
    }
  }

  const adicionarItem = async (tipo, nome, setInputFunc) => {
    if (!nome.trim()) return
    try {
      await api.post("api/admin/configuracoes/", {
        acao: `adicionar_${tipo}`,
        nome: nome,
      })
      setInputFunc("")
      carregarConfiguracoes()
    } catch (error) {
      Swal.fire("Erro", `Não foi possível adicionar a ${tipo}.`, "error")
    }
  }

  const removerItem = async (tipo, id) => {
    try {
      await api.post("api/admin/configuracoes/", {
        acao: `remover_${tipo}`,
        id: id,
      })
      carregarConfiguracoes()
    } catch (error) {
      Swal.fire("Erro", `Não foi possível remover.`, "error")
    }
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="#7B1FA2" />
        <p style={{ marginTop: "10px", color: "var(--text-muted)" }}>
          Carregando arquitetura do sistema...
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
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.iconCirclePurple}>
              <Settings size={28} color="#7B1FA2" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.pageTitle,
                  fontSize: isMobile ? "24px" : "28px",
                }}
              >
                Configurações do Sistema
              </h1>
              <p style={styles.pageSubtitle}>
                Ajuste a economia do jogo e os dados base da plataforma.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.layoutWithTabs,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <aside
            style={{
              ...styles.tabSidebar,
              width: isMobile ? "100%" : "250px",
              marginBottom: isMobile ? "20px" : "0",
            }}
          >
            <nav style={styles.tabNav}>
              <button
                style={
                  activeTab === "economia" ? styles.tabBtnActive : styles.tabBtn
                }
                onClick={() => setActiveTab("economia")}
              >
                <TrendingUp size={18} /> Economia de XP{" "}
                {activeTab === "economia" && (
                  <ChevronRight size={16} style={styles.chevron} />
                )}
              </button>
              <button
                style={
                  activeTab === "escolas" ? styles.tabBtnActive : styles.tabBtn
                }
                onClick={() => setActiveTab("escolas")}
              >
                <School size={18} /> Escolas{" "}
                {activeTab === "escolas" && (
                  <ChevronRight size={16} style={styles.chevron} />
                )}
              </button>
              <button
                style={
                  activeTab === "disciplinas"
                    ? styles.tabBtnActive
                    : styles.tabBtn
                }
                onClick={() => setActiveTab("disciplinas")}
              >
                <BookOpen size={18} /> Disciplinas{" "}
                {activeTab === "disciplinas" && (
                  <ChevronRight size={16} style={styles.chevron} />
                )}
              </button>
            </nav>
          </aside>

          <main style={styles.mainContent}>
            {activeTab === "economia" && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderIcon}>
                    <TrendingUp size={24} color="#1565C0" />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Pesos de Gamificação</h2>
                    <p style={styles.cardDesc}>
                      Determine quantos pontos de experiência (XP) cada ação
                      gera para os professores.
                    </p>
                  </div>
                </div>

                <form onSubmit={salvarXp} style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FileCheck size={16} color="var(--text-muted)" /> Revisar
                      a prática de um colega
                    </label>
                    <div style={styles.inputWithAddon}>
                      <input
                        type="number"
                        name="xp_revisao"
                        value={xpConfig.xp_revisao}
                        onChange={handleXpChange}
                        style={styles.inputBorderless}
                      />
                      <span style={styles.addonText}>XP</span>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Trophy size={16} color="var(--text-muted)" /> Ter uma
                      produção Aprovada
                    </label>
                    <div style={styles.inputWithAddon}>
                      <input
                        type="number"
                        name="xp_aprovacao"
                        value={xpConfig.xp_aprovacao}
                        onChange={handleXpChange}
                        style={styles.inputBorderless}
                      />
                      <span style={styles.addonText}>XP</span>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <MessageSquare size={16} color="var(--text-muted)" />{" "}
                      Criar um novo Tópico no Fórum
                    </label>
                    <div style={styles.inputWithAddon}>
                      <input
                        type="number"
                        name="xp_topico"
                        value={xpConfig.xp_topico}
                        onChange={handleXpChange}
                        style={styles.inputBorderless}
                      />
                      <span style={styles.addonText}>XP</span>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <MessageSquare size={16} color="var(--text-muted)" />{" "}
                      Responder/Comentar no Fórum
                    </label>
                    <div style={styles.inputWithAddon}>
                      <input
                        type="number"
                        name="xp_comentario"
                        value={xpConfig.xp_comentario}
                        onChange={handleXpChange}
                        style={styles.inputBorderless}
                      />
                      <span style={styles.addonText}>XP</span>
                    </div>
                  </div>
                  <div style={styles.submitRow}>
                    <button
                      type="submit"
                      disabled={savingXp}
                      style={styles.submitBtn}
                    >
                      {savingXp ? (
                        <Loader2 size={18} className="spin" />
                      ) : (
                        <Save size={18} />
                      )}{" "}
                      Salvar Regras de XP
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "escolas" && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div
                    style={{
                      ...styles.cardHeaderIcon,
                      backgroundColor: "var(--bg-success)",
                    }}
                  >
                    <School size={24} color="var(--text-success)" />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Instituições de Ensino</h2>
                    <p style={styles.cardDesc}>
                      Estas opções aparecerão para os usuários no momento de
                      criar uma conta.
                    </p>
                  </div>
                </div>

                <div style={styles.addBarContainer}>
                  <input
                    type="text"
                    placeholder="Digite o nome de uma nova escola..."
                    value={novaEscola}
                    onChange={(e) => setNovaEscola(e.target.value)}
                    style={styles.inputSearch}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      adicionarItem("escola", novaEscola, setNovaEscola)
                    }
                  />
                  <button
                    onClick={() =>
                      adicionarItem("escola", novaEscola, setNovaEscola)
                    }
                    style={{ ...styles.btnAdd, backgroundColor: "#059669" }}
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                </div>

                <div style={styles.tagsGrid}>
                  {escolas.map((e) => (
                    <div key={e.id} style={styles.tagItem}>
                      <span style={styles.tagText}>{e.nome}</span>
                      <button
                        onClick={() => removerItem("escola", e.id)}
                        style={styles.tagDeleteBtn}
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {escolas.length === 0 && (
                    <p style={styles.emptyText}>Nenhuma escola cadastrada.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "disciplinas" && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div
                    style={{
                      ...styles.cardHeaderIcon,
                      backgroundColor: "var(--bg-warning)",
                    }}
                  >
                    <BookOpen size={24} color="var(--text-warning)" />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Disciplinas e Áreas</h2>
                    <p style={styles.cardDesc}>
                      Cadastre novas áreas de atuação para categorizar os
                      professores.
                    </p>
                  </div>
                </div>

                <div style={styles.addBarContainer}>
                  <input
                    type="text"
                    placeholder="Digite o nome de uma nova disciplina..."
                    value={novaDisciplina}
                    onChange={(e) => setNovaDisciplina(e.target.value)}
                    style={styles.inputSearch}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      adicionarItem(
                        "disciplina",
                        novaDisciplina,
                        setNovaDisciplina,
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      adicionarItem(
                        "disciplina",
                        novaDisciplina,
                        setNovaDisciplina,
                      )
                    }
                    style={{ ...styles.btnAdd, backgroundColor: "#EA580C" }}
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                </div>

                <div style={styles.tagsGrid}>
                  {disciplinas.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        ...styles.tagItem,
                        border: "1px solid var(--border-warning)",
                        backgroundColor: "var(--bg-warning)",
                      }}
                    >
                      <span
                        style={{
                          ...styles.tagText,
                          color: "var(--text-warning)",
                        }}
                      >
                        {d.nome}
                      </span>
                      <button
                        onClick={() => removerItem("disciplina", d.id)}
                        style={{
                          ...styles.tagDeleteBtn,
                          color: "var(--text-warning)",
                        }}
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {disciplinas.length === 0 && (
                    <p style={styles.emptyText}>
                      Nenhuma disciplina cadastrada.
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1000px", margin: "0 auto" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },
  header: {
    marginBottom: "30px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "20px",
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
    padding: 0,
    marginBottom: "20px",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "15px" },
  iconCirclePurple: {
    width: "55px",
    height: "55px",
    backgroundColor: "rgba(123, 31, 162, 0.1)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: {
    margin: 0,
    fontWeight: "900",
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    margin: 0,
    color: "var(--text-muted)",
    marginTop: "4px",
    fontSize: "15px",
  },
  layoutWithTabs: { display: "flex", gap: "30px", alignItems: "flex-start" },
  tabSidebar: { display: "flex", flexDirection: "column" },
  tabNav: { display: "flex", flexDirection: "column", gap: "8px" },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "14px 18px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "14px 18px",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text-primary)",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
  },
  chevron: { marginLeft: "auto", color: "var(--text-muted)" },
  mainContent: { flex: 1, width: "100%" },
  card: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)",
    border: "1px solid var(--border-color)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },
  cardHeaderIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "var(--bg-info)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  cardDesc: {
    margin: 0,
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-secondary)",
  },
  inputWithAddon: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    backgroundColor: "var(--input-bg)",
    overflow: "hidden",
    height: "45px",
  },
  inputBorderless: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "10px 15px",
    fontSize: "16px",
    color: "var(--input-text)",
    fontWeight: "700",
  },
  addonText: {
    padding: "0 15px",
    color: "var(--text-muted)",
    fontWeight: "800",
    backgroundColor: "var(--bg-alt)",
    height: "100%",
    display: "flex",
    alignItems: "center",
    borderLeft: "1px solid var(--border-color)",
  },
  submitRow: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  addBarContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    backgroundColor: "var(--bg-alt)",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  inputSearch: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "15px",
    outline: "none",
    color: "var(--input-text)",
    backgroundColor: "var(--input-bg)",
  },
  btnAdd: {
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "700",
    cursor: "pointer",
  },
  tagsGrid: { display: "flex", flexWrap: "wrap", gap: "10px" },
  tagItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px 8px 16px",
    backgroundColor: "var(--bg-alt)",
    border: "1px solid var(--border-color)",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "600",
  },
  tagText: { color: "var(--text-primary)" },
  tagDeleteBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-danger)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "all 0.2s",
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
