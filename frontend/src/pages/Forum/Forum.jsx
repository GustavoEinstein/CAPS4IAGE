import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import Swal from "sweetalert2"
import {
  MessageSquare,
  PlusCircle,
  Paperclip,
  CheckCircle,
  Filter,
  Search,
  ChevronDown,
  Loader2,
  MessagesSquare,
  Link2,
  X,
} from "lucide-react"

export default function Forum() {
  const [topicos, setTopicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Estados de Filtro e Busca
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")
  const [busca, setBusca] = useState("")
  const categoriasDisponiveis = [
    "Todas",
    "Dúvida BNCC",
    "Metodologia",
    "Uso de IA",
    "Sugestão",
    "Geral",
  ]

  // Estados do Formulário
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [categoria, setCategoria] = useState("Geral")
  const [arquivo, setArquivo] = useState(null)

  // --- NOVOS ESTADOS PARA A BUSCA DE PRODUÇÃO BASE ---
  const [buscaBase, setBuscaBase] = useState("")
  const [resultadosBase, setResultadosBase] = useState([])
  const [loadingBusca, setLoadingBusca] = useState(false)
  const [producaoSelecionada, setProducaoSelecionada] = useState(null)

  useEffect(() => {
    carregarTopicos()
  }, [])

  const carregarTopicos = async () => {
    try {
      const response = await api.get("/api/forum/topicos/")
      setTopicos(response.data)
    } catch (error) {
      console.error("Erro ao buscar tópicos", error)
      Swal.fire(
        "Ops!",
        "Não foi possível carregar as discussões. Tente novamente.",
        "error",
      )
    } finally {
      setLoading(false)
    }
  }

  // --- NOVA LÓGICA DE BUSCA (DEBOUNCE) ---
  useEffect(() => {
    if (!buscaBase.trim()) {
      setResultadosBase([])
      return
    }

    setLoadingBusca(true)
    const delayBusca = setTimeout(async () => {
      try {
        const url = `api/public/feed/?search=${buscaBase}`
        const response = await api.get(url)
        setResultadosBase(response.data.results || response.data)
      } catch (error) {
        console.error("Erro na busca automática", error)
      } finally {
        setLoadingBusca(false)
      }
    }, 500)

    return () => clearTimeout(delayBusca)
  }, [buscaBase])

  const handleCriarTopico = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("titulo", titulo)
    formData.append("conteudo", conteudo)
    formData.append("categoria", categoria)
    if (arquivo) formData.append("arquivo", arquivo)

    // Adiciona o ID da produção base se houver
    if (producaoSelecionada) {
      formData.append("producao_base_id", producaoSelecionada.id)
    }

    try {
      await api.post("api/forum/topicos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setShowModal(false)

      // Limpa os estados do formulário
      setTitulo("")
      setConteudo("")
      setCategoria("Geral")
      setArquivo(null)
      setBuscaBase("")
      setResultadosBase([])
      setProducaoSelecionada(null)

      try {
        const perfilRes = await api.get("api/user/me/")
        localStorage.setItem("user_pontos", perfilRes.data.pontos)
        localStorage.setItem("user_nivel", perfilRes.data.nivel)
        window.dispatchEvent(new Event("perfilAtualizado"))
      } catch (err) {
        console.log("Erro ao atualizar pontos no header", err)
      }

      // --- LÓGICA DO ALERTA (PRIMEIRA VEZ VS PRÓXIMAS) ---
      const jaCriou = localStorage.getItem("primeiro_topico_criado")

      if (!jaCriou) {
        Swal.fire({
          icon: "success",
          title: "Primeira Discussão!",
          text: "Seu tópico foi publicado. Você ganhou +5 XP por começar a participar da comunidade!",
          timer: 4000,
          showConfirmButton: false,
        })
        localStorage.setItem("primeiro_topico_criado", "true")
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
        Toast.fire({
          icon: "success",
          title: "Tópico publicado com sucesso!",
        })
      }

      carregarTopicos()
    } catch (error) {
      Swal.fire("Erro!", "Ocorreu um problema ao publicar seu tópico.", "error")
    }
  }

  const calcularTempoAtras = (dataString) => {
    if (!dataString) return ""
    try {
      const [data, hora] = dataString.split(" ")
      const [dia, mes, ano] = data.split("/")
      const [h, m] = hora.split(":")
      const dataObj = new Date(ano, mes - 1, dia, h, m)
      const agora = new Date()
      const diffSegundos = Math.floor((agora - dataObj) / 1000)

      if (diffSegundos < 60) return "agora mesmo"
      if (diffSegundos < 3600) return `há ${Math.floor(diffSegundos / 60)} min`
      if (diffSegundos < 86400) return `há ${Math.floor(diffSegundos / 3600)}h`
      if (diffSegundos < 604800)
        return `há ${Math.floor(diffSegundos / 86400)} dias`
      return dataString
    } catch (e) {
      return dataString
    }
  }

  const getCategoriaStyle = (cat) => {
    const styles = {
      "Dúvida BNCC": { bg: "#DBEAFE", color: "#1E40AF" },
      Metodologia: { bg: "#FEF3C7", color: "#B45309" },
      "Uso de IA": { bg: "#F3E8FF", color: "#6B21A8" },
      Sugestão: { bg: "#DCFCE7", color: "#047857" },
      Geral: { bg: "#F1F5F9", color: "#475569" },
    }
    return styles[cat] || styles["Geral"]
  }

  const topicosFiltrados = topicos.filter((t) => {
    const matchCategoria =
      filtroCategoria === "Todas" || t.categoria === filtroCategoria
    const matchBusca = t.titulo.toLowerCase().includes(busca.toLowerCase())
    return matchCategoria && matchBusca
  })

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h2 style={styles.pageTitle}>Fórum de Rascunhos e Dúvidas</h2>
        <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
          <PlusCircle size={18} /> Novo Tópico
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.iconInside} />
          <input
            type="text"
            placeholder="Buscar discussão pelo título..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.selectWrapper}>
          <Filter size={18} style={styles.iconInside} />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={styles.selectInput}
          >
            {categoriasDisponiveis.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "Todas" ? "Todas as Categorias" : cat}
              </option>
            ))}
          </select>
          <ChevronDown size={18} style={styles.iconDropdown} />
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <Loader2 size={32} color="#2563EB" className="spin" />
          <p style={{ marginTop: "10px", color: "#64748B" }}>
            Carregando discussões...
          </p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      ) : topicosFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <MessagesSquare
            size={48}
            color="#CBD5E1"
            style={{ marginBottom: "15px" }}
          />
          <h3 style={{ margin: "0 0 5px 0", color: "#475569" }}>
            Nenhum tópico encontrado
          </h3>
          <p style={{ color: "#94A3B8", margin: 0 }}>
            Tente mudar os filtros ou seja o primeiro a iniciar esta discussão!
          </p>
        </div>
      ) : (
        <div style={styles.topicList}>
          {topicosFiltrados.map((topico) => {
            const catStyle = getCategoriaStyle(topico.categoria)
            const initial = topico.autor
              ? topico.autor.charAt(0).toUpperCase()
              : "P"

            return (
              <Link
                to={`/dashboard/forum/${topico.id}`}
                key={topico.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={styles.topicCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#93C5FD"
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={styles.topicHeader}>
                    <span
                      style={{
                        ...styles.tag,
                        backgroundColor: catStyle.bg,
                        color: catStyle.color,
                      }}
                    >
                      {topico.categoria}
                    </span>
                    {topico.resolvido && (
                      <span style={styles.tagResolved}>
                        <CheckCircle size={14} /> Resolvido
                      </span>
                    )}
                  </div>

                  <h3 style={styles.topicTitle}>{topico.titulo}</h3>

                  <div style={styles.topicFooter}>
                    <div style={styles.authorArea}>
                      <div style={styles.authorAvatar}>{initial}</div>
                      <span>
                        Por Prof. <strong>{topico.autor}</strong>
                        {topico.disciplina_autor &&
                        topico.disciplina_autor !== "undefined"
                          ? ` (${topico.disciplina_autor})`
                          : ""}
                        <span style={{ opacity: 0.6, margin: "0 5px" }}>•</span>
                        {calcularTempoAtras(topico.data)}
                      </span>
                    </div>
                    <span style={styles.commentsBadge}>
                      <MessageSquare size={16} /> {topico.total_comentarios}{" "}
                      Respostas
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Criar Nova Discussão</h3>
            <form onSubmit={handleCriarTopico}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={styles.input}
                >
                  {categoriasDisponiveis
                    .filter((c) => c !== "Todas")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Ex: Como avaliar competências socioemocionais?"
                  style={styles.input}
                />
              </div>

              {/* --- NOVA SEÇÃO: VINCULAR PRÁTICA --- */}
              <div
                style={{
                  ...styles.inputGroup,
                  backgroundColor: "#F8FAFC",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <label
                  style={{
                    ...styles.label,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#0F172A",
                  }}
                >
                  <Link2 size={16} color="#3B82F6" /> Vincular Prática Base
                  (Opcional)
                </label>

                {producaoSelecionada ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#EFF6FF",
                      padding: "10px 15px",
                      borderRadius: "6px",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#1E3A8A",
                          fontSize: "14px",
                        }}
                      >
                        {producaoSelecionada.titulo}
                      </div>
                      <div style={{ fontSize: "12px", color: "#3B82F6" }}>
                        {producaoSelecionada.disciplina}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProducaoSelecionada(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Busque por título ou disciplina para vincular..."
                      value={buscaBase}
                      onChange={(e) => setBuscaBase(e.target.value)}
                      style={{ ...styles.input, marginBottom: 0 }}
                    />
                    {loadingBusca && (
                      <span
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "12px",
                          fontSize: "12px",
                          color: "#64748B",
                        }}
                      >
                        Buscando...
                      </span>
                    )}

                    {/* Dropdown de Resultados */}
                    {resultadosBase.length > 0 && buscaBase.trim() !== "" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "6px",
                          marginTop: "4px",
                          zIndex: 10,
                          maxHeight: "150px",
                          overflowY: "auto",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {resultadosBase.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setProducaoSelecionada(prod)
                              setBuscaBase("")
                              setResultadosBase([])
                            }}
                            style={{
                              padding: "10px",
                              borderBottom: "1px solid #F1F5F9",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F8FAFC")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor = "white")
                            }
                          >
                            <div
                              style={{
                                fontWeight: "500",
                                fontSize: "13px",
                                color: "#1E293B",
                              }}
                            >
                              {prod.titulo}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>
                              {prod.disciplina}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {resultadosBase.length === 0 &&
                      !loadingBusca &&
                      buscaBase.trim() !== "" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "6px",
                            marginTop: "4px",
                            zIndex: 10,
                            padding: "10px",
                            fontSize: "12px",
                            color: "#64748B",
                            textAlign: "center",
                          }}
                        >
                          Nenhuma prática encontrada.
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Sua dúvida ou contexto</label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  required
                  rows="5"
                  placeholder="Explique sua dúvida, compartilhe uma ideia ou peça ajuda aos colegas..."
                  style={{ ...styles.input, resize: "vertical" }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.fileLabel}>
                  <Paperclip size={18} /> Anexar Rascunho (Opcional)
                  <input
                    type="file"
                    onChange={(e) => setArquivo(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
                {arquivo && <span style={styles.fileName}>{arquivo.name}</span>}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.btnCancel}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnSubmit}>
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: "30px 20px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  headerArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  pageTitle: {
    color: "#0F172A",
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
  },
  btnCreate: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "background-color 0.2s",
  },

  toolbar: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  searchWrapper: { flex: 1, position: "relative", minWidth: "250px" },
  selectWrapper: { position: "relative", minWidth: "220px" },
  iconInside: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94A3B8",
  },
  iconDropdown: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94A3B8",
    pointerEvents: "none",
  },

  // --- CORREÇÃO APLICADA: backgroundColor: '#FFFFFF' FIXO ---
  searchInput: {
    width: "100%",
    padding: "12px 15px 12px 42px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "#334155",
    backgroundColor: "#FFFFFF",
    transition: "border-color 0.2s",
  },
  selectInput: {
    width: "100%",
    padding: "12px 40px 12px 42px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    appearance: "none",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    color: "#334155",
    cursor: "pointer",
    outline: "none",
    fontWeight: "500",
    transition: "border-color 0.2s",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#F8FAFC",
    borderRadius: "12px",
    border: "2px dashed #E2E8F0",
  },

  topicList: { display: "flex", flexDirection: "column", gap: "16px" },
  topicCard: {
    border: "1px solid #E2E8F0",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    cursor: "pointer",
  },
  topicHeader: { display: "flex", gap: "10px", alignItems: "center" },
  tag: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tagResolved: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#D1FAE5",
    padding: "4px 10px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  topicTitle: {
    margin: "0",
    color: "#0F172A",
    fontSize: "18px",
    fontWeight: "700",
  },
  topicFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "#64748B",
    marginTop: "4px",
    flexWrap: "wrap",
    gap: "10px",
  },
  authorArea: { display: "flex", alignItems: "center", gap: "8px" },
  authorAvatar: {
    width: "26px",
    height: "26px",
    backgroundColor: "#E2E8F0",
    color: "#475569",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "12px",
  },
  commentsBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "600",
    backgroundColor: "#F1F5F9",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "#475569",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "550px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "24px",
    color: "#0F172A",
    fontSize: "20px",
    fontWeight: "800",
  },
  inputGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },

  fileLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#2563EB",
    fontWeight: "600",
    backgroundColor: "#EFF6FF",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  fileName: {
    marginLeft: "12px",
    fontSize: "13px",
    color: "#64748B",
    fontWeight: "500",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
  },
  btnCancel: {
    padding: "12px 20px",
    backgroundColor: "#F1F5F9",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  btnSubmit: {
    padding: "12px 24px",
    backgroundColor: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
}
