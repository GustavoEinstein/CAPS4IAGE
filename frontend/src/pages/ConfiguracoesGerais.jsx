import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"
import {
  ArrowLeft,
  Database,
  TrendingUp,
  School,
  BookOpen,
  Save,
  Plus,
  Trash2,
  Loader2,
  Settings,
} from "lucide-react"

export default function ConfiguracoesGerais() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [loading, setLoading] = useState(true)
  const [savingXp, setSavingXp] = useState(false)

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
      if (error.response?.status === 403) {
        navigate("/dashboard")
      }
      console.error("Erro ao carregar configurações", error)
    } finally {
      setLoading(false)
    }
  }

  // --- FUNÇÕES DE XP ---
  const handleXpChange = (e) => {
    setXpConfig({ ...xpConfig, [e.target.name]: parseInt(e.target.value) || 0 })
  }

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

  // --- FUNÇÕES DE ESCOLAS E DISCIPLINAS ---
  const adicionarItem = async (tipo, nome, setInputFunc) => {
    if (!nome.trim()) return
    try {
      await api.post("api/admin/configuracoes/", {
        acao: `adicionar_${tipo}`,
        nome: nome,
      })
      setInputFunc("")
      carregarConfiguracoes() // Recarrega as listas
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
        <p style={{ marginTop: "10px", color: "#64748B" }}>
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
      <div style={styles.container}>
        {/* --- HEADER --- */}
        <div style={styles.header}>
          <button
            onClick={() => navigate("/dashboard/central-admin")}
            style={styles.backButton}
          >
            <ArrowLeft size={16} /> Voltar à Central
          </button>
          <div style={styles.titleGroup}>
            <div style={styles.iconCirclePurple}>
              <Database size={28} color="#7B1FA2" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.pageTitle,
                  fontSize: isMobile ? "22px" : "26px",
                }}
              >
                Configurações Gerais
              </h1>
              <p style={styles.pageSubtitle}>
                Ajuste a economia do jogo e categorias base do sistema.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.splitLayout,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* --- COLUNA ESQUERDA: ECONOMIA DE XP --- */}
          <div style={{ flex: 1, width: "100%" }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <TrendingUp size={18} color="#1565C0" /> Economia de XP
                (Gamificação)
              </h3>
              <p style={styles.cardDesc}>
                Determine quantos pontos cada ação gera para os professores.
              </p>

              <form onSubmit={salvarXp} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    XP por Revisão (Avaliar um colega)
                  </label>
                  <input
                    type="number"
                    name="xp_revisao"
                    value={xpConfig.xp_revisao}
                    onChange={handleXpChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>XP por Produção Aprovada</label>
                  <input
                    type="number"
                    name="xp_aprovacao"
                    value={xpConfig.xp_aprovacao}
                    onChange={handleXpChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Novo Tópico no Fórum</label>
                    <input
                      type="number"
                      name="xp_topico"
                      value={xpConfig.xp_topico}
                      onChange={handleXpChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Comentário no Fórum</label>
                    <input
                      type="number"
                      name="xp_comentario"
                      value={xpConfig.xp_comentario}
                      onChange={handleXpChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingXp}
                  style={styles.submitBtn}
                >
                  {savingXp ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar Regras de XP
                </button>
              </form>
            </div>
          </div>

          {/* --- COLUNA DIREITA: CATEGORIAS (ESCOLAS E DISCIPLINAS) --- */}
          <div
            style={{
              flex: 1.2,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* ESCOLAS */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <School size={18} color="#059669" /> Escolas / Instituições
                Cadastradas
              </h3>

              <div style={styles.addBar}>
                <input
                  type="text"
                  placeholder="Adicionar nova escola..."
                  value={novaEscola}
                  onChange={(e) => setNovaEscola(e.target.value)}
                  style={styles.inputInline}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    adicionarItem("escola", novaEscola, setNovaEscola)
                  }
                />
                <button
                  onClick={() =>
                    adicionarItem("escola", novaEscola, setNovaEscola)
                  }
                  style={styles.btnAdd}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div style={styles.listContainer}>
                {escolas.map((e) => (
                  <div key={e.id} style={styles.listItem}>
                    <span>{e.nome}</span>
                    <button
                      onClick={() => removerItem("escola", e.id)}
                      style={styles.btnDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {escolas.length === 0 && (
                  <p style={styles.emptyText}>Nenhuma escola cadastrada.</p>
                )}
              </div>
            </div>

            {/* DISCIPLINAS */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <BookOpen size={18} color="#EA580C" /> Disciplinas / Áreas
              </h3>

              <div style={styles.addBar}>
                <input
                  type="text"
                  placeholder="Adicionar nova disciplina..."
                  value={novaDisciplina}
                  onChange={(e) => setNovaDisciplina(e.target.value)}
                  style={styles.inputInline}
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
                  <Plus size={18} />
                </button>
              </div>

              <div style={styles.listContainer}>
                {disciplinas.map((d) => (
                  <div key={d.id} style={styles.listItem}>
                    <span>{d.nome}</span>
                    <button
                      onClick={() => removerItem("disciplina", d.id)}
                      style={styles.btnDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {disciplinas.length === 0 && (
                  <p style={styles.emptyText}>Nenhuma disciplina cadastrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    backgroundColor: "#F1F5F9",
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
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "700",
    padding: 0,
    marginBottom: "15px",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "15px" },
  iconCirclePurple: {
    width: "50px",
    height: "50px",
    backgroundColor: "#F3E8FF",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: { margin: 0, fontWeight: "900", color: "#0F172A" },
  pageSubtitle: {
    margin: 0,
    color: "#64748B",
    marginTop: "5px",
    fontSize: "14px",
  },

  splitLayout: { display: "flex", gap: "25px", alignItems: "flex-start" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "800",
    color: "#1E293B",
  },
  cardDesc: { margin: "0 0 20px 0", fontSize: "13px", color: "#64748B" },

  form: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px", flexWrap: "wrap" },
  inputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "120px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    outline: "none",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
  },

  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.2s",
    width: "100%",
  },

  addBar: { display: "flex", gap: "10px", marginBottom: "15px" },
  inputInline: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    outline: "none",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },
  btnAdd: {
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  listContainer: {
    maxHeight: "250px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#334155",
    fontWeight: "500",
  },
  btnDelete: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    transition: "color 0.2s",
    ":hover": { color: "#DC2626" },
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: "13px",
    textAlign: "center",
    padding: "10px",
  },
}
