import React, { useState, useEffect } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Save,
  Trash2,
  Loader2,
  Users,
  Tag,
  ListChecks,
  MapPin,
  MessageCircle,
  BookOpen,
  FileText,
  Send,
  Paperclip,
} from "lucide-react"

export default function DiarioDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [notas, setNotas] = useState([])
  const [novaNota, setNovaNota] = useState("")
  const [novoStatus, setNovoStatus] = useState("")

  useEffect(() => {
    carregarDetalhes()
  }, [id])

  const carregarDetalhes = async () => {
    try {
      const response = await api.get(`api/admin/diario/${id}/notas/`)
      setTicket(response.data.diario)
      setNotas(response.data.notas)
      setNovoStatus(response.data.diario.status)
    } catch (error) {
      Swal.fire(
        "Erro",
        "Não foi possível carregar os detalhes do registro.",
        "error",
      )
      navigate("/dashboard/admin/diario")
    } finally {
      setLoading(false)
    }
  }

  const handleAtualizarTicket = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post(`api/admin/diario/${id}/notas/`, {
        texto: novaNota,
        status: novoStatus,
      })
      setNovaNota("")
      carregarDetalhes()
      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      }).fire({ icon: "success", title: "Atendimento atualizado!" })
    } catch (error) {
      Swal.fire("Erro", "Falha ao adicionar evolução ao chamado.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Excluir permanentemente?",
      text: "Isso apagará o registro e todo o histórico de anotações.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
    })
    if (confirm.isConfirmed) {
      try {
        await api.delete(`api/admin/diario/${id}/delete/`)
        Swal.fire("Excluído!", "O registro foi removido.", "success")
        navigate("/dashboard/admin/diario")
      } catch (error) {
        Swal.fire("Erro", "Não foi possível excluir o registro.", "error")
      }
    }
  }

  const getTipoMeta = (tipo) => {
    switch (tipo) {
      case "Treinamento":
        return {
          bg: "var(--bg-success)",
          cor: "var(--text-success)",
          icone: <BookOpen size={16} />,
        }
      case "Reunião":
        return {
          bg: "var(--bg-info)",
          cor: "var(--text-info)",
          icone: <Users size={16} />,
        }
      case "Visita Escolar":
        return {
          bg: "rgba(139, 92, 246, 0.1)",
          cor: "#A78BFA",
          icone: <MapPin size={16} />,
        }
      case "Suporte":
        return {
          bg: "var(--bg-warning)",
          cor: "var(--text-warning)",
          icone: <MessageCircle size={16} />,
        }
      default:
        return {
          bg: "var(--bg-alt)",
          cor: "var(--text-secondary)",
          icone: <FileText size={16} />,
        }
    }
  }

  if (loading || !ticket)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="#CA8A04" />
        <p style={{ marginTop: "10px", color: "var(--text-muted)" }}>
          Carregando histórico do atendimento...
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    )

  const meta = getTipoMeta(ticket.tipo)

  return (
    <div
      style={{
        ...styles.wrapper,
        padding: isMobile ? "20px 10px" : "40px 20px",
      }}
    >
      <div style={styles.container}>
        <button
          onClick={() => navigate("/dashboard/admin/diario")}
          style={styles.backButton}
        >
          <ArrowLeft size={16} /> Voltar para o Diário
        </button>

        <div style={styles.headerCard}>
          <div style={styles.headerTags}>
            <span
              style={{
                ...styles.badge,
                backgroundColor: meta.bg,
                color: meta.cor,
              }}
            >
              {meta.icone} {ticket.tipo}
            </span>
            <span style={styles.dateTag}>
              <Clock size={14} /> {ticket.data_evento}
            </span>
            <span
              style={{
                ...styles.badge,
                backgroundColor:
                  ticket.status === "Resolvido"
                    ? "var(--bg-success)"
                    : ticket.status === "Pendente"
                      ? "var(--bg-danger)"
                      : "var(--bg-warning)",
                color:
                  ticket.status === "Resolvido"
                    ? "var(--text-success)"
                    : ticket.status === "Pendente"
                      ? "var(--text-danger)"
                      : "var(--text-warning)",
              }}
            >
              {ticket.status}
            </span>
          </div>
          <h1 style={styles.title}>{ticket.titulo}</h1>
          <p style={styles.contactInfo}>
            <Users size={16} /> Com quem: <strong>{ticket.contato}</strong>
          </p>
        </div>

        <div
          style={{
            ...styles.splitLayout,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={styles.mainCol}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                <FileText size={18} /> Relato Original
              </h3>
              <div style={styles.descBox}>{ticket.descricao}</div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                <MessageCircle size={18} /> Evolução do Atendimento (
                {notas.length})
              </h3>
              <div style={styles.threadContainer}>
                {notas.map((nota) => (
                  <div key={nota.id} style={styles.noteCard}>
                    <div style={styles.noteHeader}>
                      <div style={styles.avatar}>
                        {nota.autor.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={styles.noteAuthor}>{nota.autor}</div>
                        <div style={styles.noteTime}>{nota.criado_em}</div>
                      </div>
                    </div>
                    <div style={styles.noteBody}>{nota.texto}</div>
                  </div>
                ))}
                {notas.length === 0 && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      textAlign: "center",
                      margin: "20px 0",
                    }}
                  >
                    Nenhuma evolução registrada neste atendimento ainda.
                  </p>
                )}
              </div>

              <div style={styles.replyBox}>
                <form onSubmit={handleAtualizarTicket}>
                  <textarea
                    value={novaNota}
                    onChange={(e) => setNovaNota(e.target.value)}
                    style={styles.replyTextarea}
                    placeholder="Adicionar anotação, evolução ou resolução do caso..."
                  />
                  <div style={styles.replyFooter}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Alterar Status:
                      </span>
                      <select
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Resolvido">Resolvido</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (!novaNota.trim() && novoStatus === ticket.status)
                      }
                      style={styles.sendBtn}
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <Send size={16} />
                      )}{" "}
                      Atualizar Atendimento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div style={styles.sideCol}>
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Propriedades</h3>
              <div style={styles.propertyGroup}>
                <div style={styles.propertyLabel}>
                  <Users size={14} /> Participantes
                </div>
                <div style={styles.propertyValue}>
                  {ticket.participantes}{" "}
                  {ticket.participantes > 1 ? "pessoas" : "pessoa"}
                </div>
              </div>
              {ticket.tags && (
                <div style={styles.propertyGroup}>
                  <div style={styles.propertyLabel}>
                    <Tag size={14} /> Tags de Categoria
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      marginTop: "5px",
                    }}
                  >
                    {ticket.tags.split(",").map((t, i) => (
                      <span key={i} style={styles.tagChip}>
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {ticket.proximos_passos && (
                <div style={styles.propertyGroup}>
                  <div
                    style={{
                      ...styles.propertyLabel,
                      color: "var(--text-warning)",
                    }}
                  >
                    <ListChecks size={14} /> Próximos Passos
                  </div>
                  <div
                    style={{
                      ...styles.propertyValue,
                      backgroundColor: "var(--bg-warning)",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-warning)",
                    }}
                  >
                    {ticket.proximos_passos}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Evidência Fotográfica</h3>
              {ticket.foto ? (
                <div style={styles.fotoContainer}>
                  <img
                    src={ticket.foto}
                    alt="Evidência"
                    style={styles.fotoImg}
                  />
                  <a
                    href={ticket.foto}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.downloadLink}
                  >
                    Abrir imagem original
                  </a>
                </div>
              ) : (
                <div style={styles.emptyFoto}>
                  <Paperclip
                    size={24}
                    color="var(--text-muted)"
                    style={{ marginBottom: "10px" }}
                  />
                  Nenhum registro fotográfico anexado.
                </div>
              )}
            </div>

            <div style={styles.sideCard}>
              <h3 style={{ ...styles.sideTitle, color: "var(--text-danger)" }}>
                Gerenciamento
              </h3>
              <button onClick={handleDelete} style={styles.btnDeleteGlobal}>
                <Trash2 size={16} /> Excluir permanentemente
              </button>
            </div>
          </div>
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
  container: { maxWidth: "1100px", margin: "0 auto" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
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
  headerCard: {
    backgroundColor: "var(--bg-card)",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
    marginBottom: "20px",
  },
  headerTags: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dateTag: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--text-muted)",
    fontSize: "13px",
    fontWeight: "600",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "28px",
    fontWeight: "900",
    color: "var(--text-primary)",
  },
  contactInfo: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--text-secondary)",
    fontSize: "15px",
  },
  splitLayout: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  mainCol: {
    flex: 2,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sideCol: {
    flex: 1,
    minWidth: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "var(--bg-card)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--text-primary)",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--border-color)",
  },
  descBox: {
    backgroundColor: "var(--bg-main)",
    padding: "20px",
    borderRadius: "10px",
    color: "var(--text-secondary)",
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  threadContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  noteCard: {
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "15px",
    backgroundColor: "var(--bg-card)",
  },
  noteHeader: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    backgroundColor: "rgba(202, 138, 4, 0.2)",
    color: "#CA8A04",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  noteAuthor: {
    fontWeight: "700",
    color: "var(--text-primary)",
    fontSize: "14px",
  },
  noteTime: { color: "var(--text-muted)", fontSize: "12px" },
  noteBody: {
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    paddingLeft: "42px",
  },
  replyBox: {
    borderTop: "2px dashed var(--border-color)",
    paddingTop: "20px",
    marginTop: "10px",
  },
  replyTextarea: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    color: "var(--input-text)",
    backgroundColor: "var(--input-bg)",
    outline: "none",
    resize: "vertical",
    minHeight: "100px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    marginBottom: "15px",
  },
  replyFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  statusSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    color: "var(--input-text)",
    backgroundColor: "var(--input-bg)",
    cursor: "pointer",
  },
  sendBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1565C0",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  sideCard: {
    backgroundColor: "var(--bg-card)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  },
  sideTitle: {
    margin: "0 0 15px 0",
    fontSize: "15px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  propertyGroup: { marginBottom: "15px" },
  propertyLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    marginBottom: "5px",
  },
  propertyValue: {
    fontSize: "14px",
    color: "var(--text-primary)",
    fontWeight: "500",
    whiteSpace: "pre-wrap",
  },
  tagChip: {
    backgroundColor: "var(--bg-main)",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  fotoContainer: {
    overflow: "hidden",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  fotoImg: { width: "100%", height: "auto", display: "block" },
  downloadLink: {
    display: "block",
    textAlign: "center",
    backgroundColor: "var(--bg-main)",
    padding: "10px",
    color: "var(--text-info)",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    borderTop: "1px solid var(--border-color)",
  },
  emptyFoto: {
    backgroundColor: "var(--bg-main)",
    padding: "30px",
    borderRadius: "8px",
    border: "1px dashed var(--border-color)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
    textAlign: "center",
  },
  btnDeleteGlobal: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "var(--bg-danger)",
    color: "var(--text-danger)",
    border: "1px solid var(--border-danger)",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.2s",
  },
}
