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
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react"

export default function DiarioOperacoes() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logs, setLogs] = useState([])

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "Reunião", // Opções: Reunião, Treinamento, Visita Escolar, Suporte, Outros
    contato: "", // Ex: "Professores do CEMI", "Diretoria", etc.
    data_evento: new Date().toISOString().split("T")[0],
    descricao: "",
  })

  // --- NOVO ESTADO PARA A FOTO ---
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
      carregarDiario()
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
      // Fallback (Dados Mockados) caso a API ainda não exista no Django
      if (error.response?.status === 404 || error.code === "ERR_NETWORK") {
        setLogs([
          {
            id: 1,
            titulo: "Treinamento Inicial",
            tipo: "Treinamento",
            contato: "Professores CEMI",
            data_evento: "2026-06-20",
            descricao: "Apresentação do fluxo de Revisão Duplo-Cego.",
            foto: null,
          },
          {
            id: 2,
            titulo: "Reunião de Alinhamento",
            tipo: "Reunião",
            contato: "Coordenação",
            data_evento: "2026-06-15",
            descricao: "Definição das rubricas de avaliação de História.",
            foto: null,
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        "Preencha todos os campos do registro.",
        "warning",
      )
    }

    setIsSubmitting(true)
    try {
      // --- USANDO FORMDATA PARA PERMITIR ENVIO DE FOTO ---
      const dataToSend = new FormData()
      Object.keys(formData).forEach((key) =>
        dataToSend.append(key, formData[key]),
      )
      if (foto) {
        dataToSend.append("foto", foto)
      }

      // Faz o POST para o Django
      const response = await api.post("api/admin/diario/", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setLogs([response.data, ...logs]) // Adiciona o novo no topo

      Swal.fire({
        icon: "success",
        title: "Registrado!",
        text: "Atividade salva no Diário de Operações.",
        timer: 2000,
        showConfirmButton: false,
      })

      // Limpa o formulário
      setFormData({ ...formData, titulo: "", contato: "", descricao: "" })
      setFoto(null)
    } catch (error) {
      // Tratamento caso a API não exista ainda (Modo de Teste Local)
      if (error.response?.status === 404 || error.code === "ERR_NETWORK") {
        const fotoUrlTemporaria = foto ? URL.createObjectURL(foto) : null
        const novoLog = { ...formData, id: Date.now(), foto: fotoUrlTemporaria }
        setLogs([novoLog, ...logs])

        setFormData({ ...formData, titulo: "", contato: "", descricao: "" })
        setFoto(null)

        Swal.fire({
          icon: "success",
          title: "Salvo Localmente!",
          text: "A API não foi encontrada, mas salvamos no navegador para teste.",
          timer: 2500,
        })
      } else {
        Swal.fire("Erro", "Não foi possível salvar o registro.", "error")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Excluir registro?",
      text: "Essa ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
    })
    if (!confirm.isConfirmed) return

    try {
      await api.delete(`api/admin/diario/${id}/delete/`)
      setLogs(logs.filter((log) => log.id !== id))
      Swal.fire("Excluído!", "", "success")
    } catch (error) {
      // Mock de exclusão para testes
      setLogs(logs.filter((log) => log.id !== id))
    }
  }

  // Função para definir a cor e o ícone baseado no tipo de evento
  const getTipoMeta = (tipo) => {
    switch (tipo) {
      case "Treinamento":
        return { cor: "#10B981", bg: "#D1FAE5", icone: <BookOpen size={16} /> } // Verde
      case "Reunião":
        return { cor: "#2563EB", bg: "#DBEAFE", icone: <Users size={16} /> } // Azul
      case "Visita Escolar":
        return { cor: "#8B5CF6", bg: "#EDE9FE", icone: <MapPin size={16} /> } // Roxo
      case "Suporte":
        return {
          cor: "#F59E0B",
          bg: "#FEF3C7",
          icone: <MessageCircle size={16} />,
        } // Laranja
      default:
        return { cor: "#64748B", bg: "#F1F5F9", icone: <FileText size={16} /> } // Cinza
    }
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="#CA8A04" />
        <p style={{ marginTop: "10px", color: "#64748B" }}>
          Abrindo Diário de Operações...
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
      {/* CORREÇÃO DOS PLACEHOLDERS GLOBAIS E DA LINHA DA TIMELINE */}
      <style>{`
                input::placeholder, textarea::placeholder {
                    color: #94A3B8 !important;
                    opacity: 1 !important;
                }
                ::-webkit-input-placeholder { color: #94A3B8 !important; opacity: 1 !important; }
                :-moz-placeholder { color: #94A3B8 !important; opacity: 1 !important; }
                
                /* Eixo central da linha do tempo */
                .timeline-line::before {
                    content: '';
                    position: absolute;
                    top: 15px;
                    bottom: 0;
                    left: 20px; /* Alinhado com o centro do ícone de 32px (left 4px + 16px) */
                    width: 2px;
                    background-color: #E2E8F0;
                    z-index: 1;
                }
            `}</style>

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
                Diário de Operações
              </h1>
              <p style={styles.pageSubtitle}>
                Documente reuniões, treinamentos e relacionamentos.
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
          {/* --- COLUNA ESQUERDA: FORMULÁRIO --- */}
          <div style={{ flex: 1, width: "100%" }}>
            <div style={styles.formCard}>
              <h3 style={styles.cardTitle}>
                <Plus size={18} /> Novo Registro
              </h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Título da Atividade</label>
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
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Com quem? (Escola/Professores)
                  </label>
                  <div style={styles.inputWrapper}>
                    <Users size={16} color="#94A3B8" />
                    <input
                      type="text"
                      name="contato"
                      value={formData.contato}
                      onChange={handleChange}
                      style={styles.inputNoBorder}
                      placeholder="Ex: Coordenação do CEMI"
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Descrição / Ata da Reunião</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="O que foi discutido? Quais foram os resultados?"
                    required
                  />
                </div>

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
                        <CheckCircle2 size={18} color="#10B981" />
                        <span style={{ color: "#10B981", fontWeight: "bold" }}>
                          {foto.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera size={18} />
                        Anexar Imagem
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

          {/* --- COLUNA DIREITA: TIMELINE --- */}
          <div style={{ flex: 1.2, width: "100%" }}>
            <div style={styles.timelineContainer}>
              <h3 style={styles.cardTitle}>
                <Calendar size={18} /> Histórico do Projeto
              </h3>

              {logs.length === 0 ? (
                <p style={styles.emptyText}>
                  Nenhum registro encontrado. Comece a documentar ao lado!
                </p>
              ) : (
                <div className="timeline-line" style={styles.timeline}>
                  {logs.map((log) => {
                    const meta = getTipoMeta(log.tipo)
                    return (
                      <div key={log.id} style={styles.timelineItem}>
                        {/* Ponto / Ícone da Linha do Tempo */}
                        <div
                          style={{
                            ...styles.timelineIcon,
                            backgroundColor: meta.bg,
                            color: meta.cor,
                          }}
                        >
                          {meta.icone}
                        </div>

                        {/* Conteúdo do Log */}
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
                                <span style={styles.logDate}>
                                  {log.data_evento}
                                </span>
                              </div>
                              <h4 style={styles.logTitle}>{log.titulo}</h4>
                              <div style={styles.logContact}>
                                <Users size={12} /> {log.contato}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(log.id)}
                              style={styles.deleteBtn}
                              title="Excluir Registro"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <p style={styles.logDesc}>{log.descricao}</p>

                          {/* EXIBIÇÃO DA FOTO NA TIMELINE SE EXISTIR */}
                          {log.foto && (
                            <div style={styles.fotoContainer}>
                              <a
                                href={log.foto}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={log.foto}
                                  alt="Anexo da Reunião"
                                  style={styles.fotoThumb}
                                />
                              </a>
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

  // --- ESTILOS DO FORMULÁRIO (FUNDOS CORRIGIDOS) ---
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

  // Garantindo backgroundColor branco e color escura para não bugar o CSS
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
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  // Botão de Arquivo
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

  // --- ESTILOS DA TIMELINE ---
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
  timeline: { position: "relative", marginTop: "20px" },
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
    gap: "10px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
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
    fontSize: "13px",
    color: "#64748B",
    fontWeight: "500",
  },
  logDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  fotoContainer: { marginTop: "15px", display: "flex" },
  fotoThumb: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    objectFit: "cover",
  },

  deleteBtn: {
    background: "none",
    border: "none",
    color: "#CBD5E1",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    transition: "color 0.2s",
  },
}
