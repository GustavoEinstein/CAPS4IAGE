import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Save,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  MessageCircle,
  Camera,
  CheckCircle2,
  Eye,
  Search,
  Tag,
  Filter,
  Check,
  ListChecks,
} from "lucide-react"

const TAGS_DISPONIVEIS = [
  "Dúvida com Login",
  "Criação de Prompts",
  "Problema no Fórum",
  "Apresentação da Plataforma",
  "Feedback Positivo",
  "Erro no Sistema",
  "Engajamento",
]

export default function DiarioOperacoes() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logs, setLogs] = useState([])

  // Lista de usuários para o Autocomplete
  const [usuarios, setUsuarios] = useState([])
  const [buscaUsuario, setBuscaUsuario] = useState("")
  const [mostrarAutocomplete, setMostrarAutocomplete] = useState(false)

  // Filtros da Timeline
  const [buscaTimeline, setBuscaTimeline] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("Todos")

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "Reunião",
    status: "Resolvido",
    docente_id: "",
    contato: "",
    data_evento: new Date().toISOString().split("T")[0],
    descricao: "",
    proximos_passos: "",
    tags: [],
    participantes: 1,
  })

  const [foto, setFoto] = useState(null)

  useEffect(() => {
    verificarAcesso()
  }, [])

  const verificarAcesso = async () => {
    try {
      const perfilRes = await api.get("api/user/me/")
      if (!perfilRes.data.is_superuser) {
        Swal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: "Você não tem permissão de administrador.",
        })
        navigate("/dashboard")
        return
      }

      // Carrega os logs e os usuários cadastrados simultaneamente
      await carregarDiario()
      await carregarUsuarios()
    } catch (error) {
      console.error("Erro na verificação", error)
      navigate("/dashboard")
    }
  }

  const carregarDiario = async () => {
    try {
      const response = await api.get("api/admin/diario/")
      setLogs(response.data)
    } catch (error) {
      console.error("Erro ao carregar diário:", error)
      Swal.fire(
        "Erro de Conexão",
        "Não foi possível carregar os registros.",
        "error",
      )
    } finally {
      setLoading(false)
    }
  }

  const carregarUsuarios = async () => {
    try {
      const response = await api.get("api/admin/users/")
      setUsuarios(response.data)
    } catch (error) {
      console.log("Erro ao carregar usuários para busca", error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleTag = (tag) => {
    const novasTags = formData.tags.includes(tag)
      ? formData.tags.filter((t) => t !== tag)
      : [...formData.tags, tag]
    setFormData({ ...formData, tags: novasTags })
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.titulo || !formData.descricao || !formData.contato) {
      return Swal.fire(
        "Campos Incompletos",
        "Preencha título, contato e descrição.",
        "warning",
      )
    }

    setIsSubmitting(true)
    try {
      const dataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key === "tags") {
          if (formData.tags.length > 0)
            dataToSend.append("tags", formData.tags.join(", "))
        } else {
          dataToSend.append(key, formData[key])
        }
      })

      if (foto) dataToSend.append("foto", foto)

      const response = await api.post("api/admin/diario/", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setLogs([response.data, ...logs])
      Swal.fire({
        icon: "success",
        title: "Registrado!",
        text: "Atividade salva no banco de dados com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      })

      // Reset Form
      setFormData({
        titulo: "",
        tipo: "Reunião",
        status: "Resolvido",
        docente_id: "",
        contato: "",
        data_evento: new Date().toISOString().split("T")[0],
        descricao: "",
        proximos_passos: "",
        tags: [],
        participantes: 1,
      })
      setBuscaUsuario("")
      setFoto(null)
    } catch (error) {
      console.error(error)
      Swal.fire(
        "Erro",
        "Não foi possível salvar o registro no servidor.",
        "error",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Excluir registro?",
      text: "Essa ação apagará os dados permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
    })
    if (!confirm.isConfirmed) return

    try {
      await api.delete(`api/admin/diario/${id}/delete/`)
      setLogs(logs.filter((log) => log.id !== id))
      Swal.fire("Excluído!", "O registro foi removido.", "success")
    } catch (error) {
      console.error(error)
      Swal.fire("Erro", "Não foi possível excluir o registro.", "error")
    }
  }

  // Estilização de Meta Dados (Cor dos Tipos)
  const getTipoMeta = (tipo) => {
    switch (tipo) {
      case "Treinamento":
        return { cor: "#10B981", bg: "#D1FAE5", icone: <BookOpen size={16} /> }
      case "Reunião":
        return { cor: "#2563EB", bg: "#DBEAFE", icone: <Users size={16} /> }
      case "Visita Escolar":
        return { cor: "#8B5CF6", bg: "#EDE9FE", icone: <MapPin size={16} /> }
      case "Suporte":
        return {
          cor: "#F59E0B",
          bg: "#FEF3C7",
          icone: <MessageCircle size={16} />,
        }
      default:
        return { cor: "#64748B", bg: "#F1F5F9", icone: <FileText size={16} /> }
    }
  }

  // Estilização de Meta Dados (Cor dos Status)
  const getStatusMeta = (status) => {
    switch (status) {
      case "Pendente":
        return { cor: "#DC2626", bg: "#FEE2E2", label: "Pendente" }
      case "Em andamento":
        return { cor: "#D97706", bg: "#FEF3C7", label: "Em andamento" }
      default:
        return { cor: "#059669", bg: "#D1FAE5", label: "Resolvido" }
    }
  }

  // Filtragem da Lista para o Autocomplete de Usuários
  const usuariosFiltrados = usuarios
    .filter(
      (u) =>
        u.username.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
        u.email.toLowerCase().includes(buscaUsuario.toLowerCase()),
    )
    .slice(0, 5)

  // Filtragem da Timeline
  const logsFiltrados = logs.filter((log) => {
    const contatoStr = log.contato || ""
    const tituloStr = log.titulo || ""
    const matchBusca =
      tituloStr.toLowerCase().includes(buscaTimeline.toLowerCase()) ||
      contatoStr.toLowerCase().includes(buscaTimeline.toLowerCase())
    const matchStatus = filtroStatus === "Todos" || log.status === filtroStatus
    return matchBusca && matchStatus
  })

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="#CA8A04" />
        <p style={{ marginTop: "10px", color: "#64748B" }}>
          Conectando ao CRM...
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
        input::placeholder, textarea::placeholder { color: #94A3B8 !important; opacity: 1 !important; }
        ::-webkit-input-placeholder { color: #94A3B8 !important; opacity: 1 !important; }
        :-moz-placeholder { color: #94A3B8 !important; opacity: 1 !important; }
        .timeline-line::before { content: ''; position: absolute; top: 15px; bottom: 0; left: 20px; width: 2px; background-color: #E2E8F0; z-index: 1; }
        .autocomplete-item:hover { background-color: #F1F5F9; }
        .tag-chip:hover { border-color: #94A3B8 !important; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={() => navigate("/dashboard/central-admin")}
            style={styles.backButton}
          >
            <ArrowLeft size={16} /> Voltar à Central
          </button>
          <div style={styles.titleGroup}>
            <div style={styles.iconCircleYellow}>
              <FileText size={28} color="#CA8A04" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.pageTitle,
                  fontSize: isMobile ? "22px" : "26px",
                }}
              >
                CRM & Diário de Operações
              </h1>
              <p style={styles.pageSubtitle}>
                Documente treinamentos, suporte e relacionamentos com os
                docentes.
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
          {/* --- COLUNA ESQUERDA: FORMULÁRIO COMPLETO --- */}
          <div style={{ flex: 1, width: "100%" }}>
            <div style={styles.formCard}>
              <h3 style={styles.cardTitle}>
                <Plus size={18} /> Novo Registro de Atendimento
              </h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Linha 1: Título e Status */}
                <div style={styles.row}>
                  <div style={{ ...styles.inputGroup, flex: 2 }}>
                    <label style={styles.label}>Título da Interação</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ex: Oficina sobre Prompts Básicos"
                      required
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="Resolvido">Resolvido ✅</option>
                      <option value="Em andamento">Em andamento ⏳</option>
                      <option value="Pendente">Pendente 🚨</option>
                    </select>
                  </div>
                </div>

                {/* Linha 2: Tipo e Data */}
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo de Evento</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="Reunião">Reunião</option>
                      <option value="Treinamento">Treinamento</option>
                      <option value="Visita Escolar">Visita Escolar</option>
                      <option value="Suporte">Suporte</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Data</label>
                    <input
                      type="date"
                      name="data_evento"
                      value={formData.data_evento}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>
                  {(formData.tipo === "Treinamento" ||
                    formData.tipo === "Visita Escolar") && (
                    <div style={{ ...styles.inputGroup, maxWidth: "100px" }}>
                      <label style={styles.label}>Nº Pessoas</label>
                      <input
                        type="number"
                        name="participantes"
                        min="1"
                        value={formData.participantes}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                  )}
                </div>

                {/* Autocomplete de Usuário / Contato */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Professor(a) ou Contato Livre
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={styles.inputWrapper}>
                      <Search size={16} color="#94A3B8" />
                      <input
                        type="text"
                        value={buscaUsuario}
                        onChange={(e) => {
                          setBuscaUsuario(e.target.value)
                          setFormData({
                            ...formData,
                            contato: e.target.value,
                            docente_id: "",
                          }) // Assume texto livre primeiro
                          setMostrarAutocomplete(true)
                        }}
                        onBlur={() =>
                          setTimeout(() => setMostrarAutocomplete(false), 200)
                        }
                        style={styles.inputNoBorder}
                        placeholder="Busque um usuário ou digite livremente..."
                        required
                      />
                    </div>
                    {mostrarAutocomplete && buscaUsuario && (
                      <div style={styles.autocompleteDropdown}>
                        {usuariosFiltrados.length > 0 ? (
                          usuariosFiltrados.map((u) => (
                            <div
                              key={u.id}
                              className="autocomplete-item"
                              style={styles.autocompleteItem}
                              onClick={() => {
                                setBuscaUsuario(u.username)
                                setFormData({
                                  ...formData,
                                  contato: u.username,
                                  docente_id: u.id,
                                })
                                setMostrarAutocomplete(false)
                              }}
                            >
                              <strong>{u.username}</strong>{" "}
                              <span
                                style={{ color: "#94A3B8", fontSize: "12px" }}
                              >
                                - {u.disciplina}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "10px",
                              fontSize: "13px",
                              color: "#94A3B8",
                            }}
                          >
                            Nenhum usuário encontrado. Será salvo como contato
                            livre.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Seleção de Tags Rápidas */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Tag
                      size={14}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: "4px",
                      }}
                    />{" "}
                    Tags de Categorização
                  </label>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {TAGS_DISPONIVEIS.map((tag) => {
                      const isSelected = formData.tags.includes(tag)
                      return (
                        <div
                          key={tag}
                          className="tag-chip"
                          onClick={() => toggleTag(tag)}
                          style={{
                            ...styles.tagChip,
                            backgroundColor: isSelected ? "#DBEAFE" : "#F8FAFC",
                            borderColor: isSelected ? "#3B82F6" : "#E2E8F0",
                            color: isSelected ? "#1D4ED8" : "#64748B",
                          }}
                        >
                          {isSelected && (
                            <Check size={12} style={{ marginRight: "4px" }} />
                          )}{" "}
                          {tag}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Descrição Principal */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Relato da Interação</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Descreva qual foi a dúvida, o que foi discutido no treinamento ou a dor apontada..."
                    required
                  />
                </div>

                {/* Próximos Passos (Para pendências) */}
                {formData.status !== "Resolvido" && (
                  <div style={styles.inputGroup}>
                    <label style={{ ...styles.label, color: "#D97706" }}>
                      <ListChecks
                        size={14}
                        style={{ display: "inline", marginRight: "4px" }}
                      />{" "}
                      Próximos Passos / Pendências
                    </label>
                    <textarea
                      name="proximos_passos"
                      value={formData.proximos_passos}
                      onChange={handleChange}
                      style={{
                        ...styles.textarea,
                        minHeight: "60px",
                        borderColor: "#FCD34D",
                      }}
                      placeholder="Ex: Ligar na próxima semana para verificar se conseguiu o acesso."
                    />
                  </div>
                )}

                {/* --- CAMPO DE UPLOAD DE FOTO --- */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Foto / Anexo (Opcional)</label>
                  <input
                    type="file"
                    id="foto-diario"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="foto-diario" style={styles.uploadBtn}>
                    {foto ? (
                      <>
                        <CheckCircle2 size={18} color="#10B981" />{" "}
                        <span style={{ color: "#10B981", fontWeight: "bold" }}>
                          {foto.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera size={18} /> Anexar Evidência / Print
                      </>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSubmitting ? "Salvando..." : "Salvar Registro"}
                </button>
              </form>
            </div>
          </div>

          {/* --- COLUNA DIREITA: TIMELINE COM FILTROS --- */}
          <div style={{ flex: 1.2, width: "100%" }}>
            <div style={styles.timelineContainer}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <h3
                  style={{
                    ...styles.cardTitle,
                    borderBottom: "none",
                    margin: 0,
                  }}
                >
                  <Calendar size={18} /> Histórico de Atendimentos
                </h3>
              </div>

              {/* Barra de Busca e Filtro da Timeline */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "25px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    ...styles.inputWrapper,
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Search size={16} color="#94A3B8" />
                  <input
                    type="text"
                    value={buscaTimeline}
                    onChange={(e) => setBuscaTimeline(e.target.value)}
                    placeholder="Buscar assunto ou docente..."
                    style={{ ...styles.inputNoBorder, fontSize: "13px" }}
                  />
                </div>
                <div
                  style={{
                    ...styles.inputWrapper,
                    width: "auto",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Filter size={16} color="#94A3B8" />
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    style={{
                      ...styles.inputNoBorder,
                      width: "auto",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Todos">Todos os Status</option>
                    <option value="Pendente">Pendentes</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Resolvido">Resolvidos</option>
                  </select>
                </div>
              </div>

              {logsFiltrados.length === 0 ? (
                <p style={styles.emptyText}>
                  Nenhum registro encontrado com estes filtros.
                </p>
              ) : (
                <div className="timeline-line" style={styles.timeline}>
                  {logsFiltrados.map((log) => {
                    const meta = getTipoMeta(log.tipo)
                    const statusMeta = getStatusMeta(log.status)
                    const isLongText =
                      log.descricao && log.descricao.length > 120
                    const descResumo = isLongText
                      ? log.descricao.substring(0, 120) + "..."
                      : log.descricao

                    return (
                      <div key={log.id} style={styles.timelineItem}>
                        <div
                          style={{
                            ...styles.timelineIcon,
                            backgroundColor: meta.bg,
                            color: meta.cor,
                          }}
                        >
                          {meta.icone}
                        </div>

                        <div style={styles.timelineContent}>
                          <div style={styles.logHeader}>
                            <div style={{ flex: 1 }}>
                              <div style={styles.logMetaRow}>
                                <span
                                  style={{
                                    ...styles.badge,
                                    backgroundColor: meta.bg,
                                    color: meta.cor,
                                  }}
                                >
                                  {log.tipo}
                                </span>
                                <span
                                  style={{
                                    ...styles.badge,
                                    backgroundColor: statusMeta.bg,
                                    color: statusMeta.cor,
                                  }}
                                >
                                  {statusMeta.label}
                                </span>
                                <span style={styles.logDate}>
                                  {log.data_evento}
                                </span>
                              </div>
                              <h4 style={styles.logTitle}>{log.titulo}</h4>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "15px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={styles.logContact}>
                                  <Users size={12} /> {log.contato}{" "}
                                  {log.docente_id ? "(Cadastrado)" : ""}
                                </div>
                                {log.participantes > 1 && (
                                  <div style={styles.logContact}>
                                    <Users size={12} color="#10B981" />{" "}
                                    {log.participantes} Participantes
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={styles.actionButtons}>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/admin/diario/${log.id}`,
                                    { state: { logData: log } },
                                  )
                                }
                                style={styles.viewBtn}
                                title="Ver Detalhes"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(log.id)}
                                style={styles.deleteBtn}
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <p style={styles.logDesc}>{descResumo}</p>

                          {/* Exibição das Tags */}
                          {log.tags && (
                            <div
                              style={{
                                marginTop: "10px",
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              {log.tags.split(",").map((t, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "10px",
                                    backgroundColor: "#E2E8F0",
                                    color: "#475569",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontWeight: "700",
                                  }}
                                >
                                  #{t.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Exibição dos próximos passos na timeline */}
                          {log.proximos_passos &&
                            log.status !== "Resolvido" && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  backgroundColor: "#FFFBEB",
                                  padding: "10px",
                                  borderRadius: "8px",
                                  borderLeft: "3px solid #F59E0B",
                                  fontSize: "13px",
                                  color: "#92400E",
                                }}
                              >
                                <strong>Próximos Passos:</strong>{" "}
                                {log.proximos_passos}
                              </div>
                            )}

                          {log.foto && (
                            <div
                              style={styles.fotoThumbContainer}
                              onClick={() =>
                                navigate(`/dashboard/admin/diario/${log.id}`, {
                                  state: { logData: log },
                                })
                              }
                            >
                              <div style={styles.fotoOverlay}>
                                <Eye size={24} color="white" />
                                <span
                                  style={{
                                    color: "white",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    marginTop: "4px",
                                  }}
                                >
                                  Ver Anexo
                                </span>
                              </div>
                              <img
                                src={log.foto}
                                alt="Anexo"
                                style={styles.fotoThumbTimeline}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
  iconCircleYellow: {
    width: "50px",
    height: "50px",
    backgroundColor: "#FEF9C3",
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

  splitLayout: { display: "flex", gap: "30px", alignItems: "flex-start" },

  formCard: {
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
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "800",
    color: "#1E293B",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "12px",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px", flexWrap: "wrap" },
  inputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "150px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#475569" },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    height: "42px",
    overflow: "hidden",
  },
  inputNoBorder: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#1E293B",
  },
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
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    outline: "none",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "14px",
    outline: "none",
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    minHeight: "90px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  autocompleteDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    marginTop: "4px",
    zIndex: 10,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  autocompleteItem: {
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#1E293B",
    borderBottom: "1px solid #F1F5F9",
    transition: "background 0.2s",
  },

  tagChip: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1px solid",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
  },

  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    border: "1px dashed #94A3B8",
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    color: "#64748B",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px",
    backgroundColor: "#CA8A04",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },

  timelineContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
    height: "100%",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "40px",
  },
  timeline: { position: "relative", marginTop: "10px" },
  timelineItem: {
    position: "relative",
    paddingLeft: "45px",
    paddingBottom: "30px",
  },
  timelineIcon: {
    position: "absolute",
    left: "4px",
    top: "0",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    border: "4px solid #FFFFFF",
  },
  timelineContent: {
    backgroundColor: "#F8FAFC",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },

  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  logMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  logDate: { fontSize: "12px", color: "#94A3B8", fontWeight: "600" },
  logTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "800",
    color: "#0F172A",
    wordBreak: "break-word",
  },
  logContact: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#64748B",
    fontWeight: "600",
  },
  logDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  actionButtons: { display: "flex", gap: "5px" },
  viewBtn: {
    background: "#E0F2FE",
    border: "none",
    color: "#0284C7",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    transition: "background 0.2s",
  },
  deleteBtn: {
    background: "#FEE2E2",
    border: "none",
    color: "#DC2626",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    transition: "background 0.2s",
  },

  fotoThumbContainer: {
    marginTop: "15px",
    position: "relative",
    display: "inline-block",
    cursor: "pointer",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
  },
  fotoThumbTimeline: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "120px",
    objectFit: "cover",
    opacity: 0.85,
    transition: "opacity 0.2s",
  },
  fotoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    opacity: 0,
    transition: "opacity 0.2s",
    ":hover": { opacity: 1 },
  },
}
