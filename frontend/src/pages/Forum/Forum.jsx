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

  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [categoria, setCategoria] = useState("Geral")
  const [arquivo, setArquivo] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!buscaBase.trim()) {
      setResultadosBase([])
      return
    }
    setLoadingBusca(true)
    const delayBusca = setTimeout(async () => {
      try {
        const response = await api.get(`api/public/feed/?search=${buscaBase}`)
        setResultadosBase(response.data.results || response.data)
      } catch (error) {
        console.error(error)
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
    if (producaoSelecionada)
      formData.append("producao_base_id", producaoSelecionada.id)

    try {
      await api.post("api/forum/topicos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // --- AVISANDO O RADAR DE NOTIFICAÇÕES (XP INSTANTÂNEO) ---
      window.dispatchEvent(new Event("perfilAtualizado"))

      setShowModal(false)
      setTitulo("")
      setConteudo("")
      setCategoria("Geral")
      setArquivo(null)
      setBuscaBase("")
      setResultadosBase([])
      setProducaoSelecionada(null)
      carregarTopicos()
    } catch (error) {
      Swal.fire("Erro!", "Ocorreu um problema.", "error")
    }
  }

  const calcularTempoAtras = (dataString) => {
    if (!dataString) return ""
    try {
      const [data, hora] = dataString.split(" ")
      const [dia, mes, ano] = data.split("/")
      const [h, m] = hora.split(":")
      const dataObj = new Date(ano, mes - 1, dia, h, m)
      const diffSegundos = Math.floor((new Date() - dataObj) / 1000)
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
      "Dúvida BNCC": { bg: "var(--bg-info)", color: "var(--text-info)" },
      Metodologia: { bg: "var(--bg-warning)", color: "var(--text-warning)" },
      "Uso de IA": { bg: "rgba(168, 85, 247, 0.1)", color: "#C084FC" },
      Sugestão: { bg: "var(--bg-success)", color: "var(--text-success)" },
      Geral: { bg: "var(--bg-alt)", color: "var(--text-secondary)" },
    }
    return styles[cat] || styles["Geral"]
  }

  const topicosFiltrados = topicos.filter(
    (t) =>
      (filtroCategoria === "Todas" || t.categoria === filtroCategoria) &&
      t.titulo.toLowerCase().includes(busca.toLowerCase()),
  )

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
            placeholder="Buscar discussão..."
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
          <p style={{ marginTop: "10px", color: "var(--text-muted)" }}>
            Carregando discussões...
          </p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
      ) : topicosFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <MessagesSquare
            size={48}
            color="var(--border-color)"
            style={{ marginBottom: "15px" }}
          />
          <h3 style={{ margin: "0 0 5px 0", color: "var(--text-secondary)" }}>
            Nenhum tópico encontrado
          </h3>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Tente mudar os filtros ou inicie uma discussão!
          </p>
        </div>
      ) : (
        <div style={styles.topicList}>
          {topicosFiltrados.map((topico) => {
            const catStyle = getCategoriaStyle(topico.categoria)
            return (
              <Link
                to={`/dashboard/forum/${topico.id}`}
                key={topico.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={styles.topicCard}>
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
                      <div style={styles.authorAvatar}>
                        {topico.autor
                          ? topico.autor.charAt(0).toUpperCase()
                          : "P"}
                      </div>
                      <span>
                        Por Prof. <strong>{topico.autor}</strong>{" "}
                        <span style={{ opacity: 0.6, margin: "0 5px" }}>•</span>{" "}
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
                  placeholder="Ex: Como avaliar competências?"
                  style={styles.input}
                />
              </div>

              <div
                style={{
                  ...styles.inputGroup,
                  backgroundColor: "var(--bg-main)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px dashed var(--border-color)",
                }}
              >
                <label
                  style={{
                    ...styles.label,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "var(--text-primary)",
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
                      backgroundColor: "var(--bg-info)",
                      padding: "10px 15px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-info)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--text-info)",
                          fontSize: "14px",
                        }}
                      >
                        {producaoSelecionada.titulo}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-info)" }}
                      >
                        {producaoSelecionada.disciplina}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProducaoSelecionada(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-danger)",
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
                          color: "var(--text-muted)",
                        }}
                      >
                        Buscando...
                      </span>
                    )}
                    {resultadosBase.length > 0 && buscaBase.trim() !== "" && (
                      <div style={styles.autocompleteDropdown}>
                        {resultadosBase.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setProducaoSelecionada(prod)
                              setBuscaBase("")
                              setResultadosBase([])
                            }}
                            style={styles.autocompleteItem}
                          >
                            <div
                              style={{ fontWeight: "500", fontSize: "13px" }}
                            >
                              {prod.titulo}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {prod.disciplina}
                            </div>
                          </div>
                        ))}
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
                  placeholder="Explique sua dúvida..."
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
    color: "var(--text-primary)",
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
    color: "var(--text-muted)",
  },
  iconDropdown: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "12px 15px 12px 42px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "var(--input-text)",
    backgroundColor: "var(--input-bg)",
  },
  selectInput: {
    width: "100%",
    padding: "12px 40px 12px 42px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    appearance: "none",
    backgroundColor: "var(--input-bg)",
    fontSize: "14px",
    color: "var(--input-text)",
    cursor: "pointer",
    outline: "none",
    fontWeight: "500",
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
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "2px dashed var(--border-color)",
  },
  topicList: { display: "flex", flexDirection: "column", gap: "16px" },
  topicCard: {
    border: "1px solid var(--border-color)",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "var(--bg-card)",
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
  },
  tagResolved: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-success)",
    backgroundColor: "var(--bg-success)",
    padding: "4px 10px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  topicTitle: {
    margin: "0",
    color: "var(--text-primary)",
    fontSize: "18px",
    fontWeight: "700",
  },
  topicFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "4px",
    flexWrap: "wrap",
    gap: "10px",
  },
  authorArea: { display: "flex", alignItems: "center", gap: "8px" },
  authorAvatar: {
    width: "26px",
    height: "26px",
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
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
    backgroundColor: "var(--bg-alt)",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "var(--text-secondary)",
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
    backgroundColor: "var(--bg-card)",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "550px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: "24px",
    color: "var(--text-primary)",
    fontSize: "20px",
    fontWeight: "800",
  },
  inputGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "var(--input-text)",
    backgroundColor: "var(--input-bg)",
  },
  fileLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "var(--text-info)",
    fontWeight: "600",
    backgroundColor: "var(--bg-info)",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  fileName: {
    marginLeft: "12px",
    fontSize: "13px",
    color: "var(--text-muted)",
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
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
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
  autocompleteDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    marginTop: "4px",
    zIndex: 10,
    maxHeight: "150px",
    overflowY: "auto",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  autocompleteItem: {
    padding: "10px",
    borderBottom: "1px solid var(--border-color)",
    cursor: "pointer",
    color: "var(--text-primary)",
  },
}
