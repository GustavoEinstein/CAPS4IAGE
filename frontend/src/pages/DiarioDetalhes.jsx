import React, { useEffect, useState } from "react"
import {
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom"
import api from "../services/api"
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  MapPin,
  MessageCircle,
  BookOpen,
  Camera,
  Download,
  Trash2,
} from "lucide-react"
import Swal from "sweetalert2"

export default function DiarioDetalhes() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  // Recebemos o log pelo state da navegação para não precisar fazer outro request no backend
  const [log, setLog] = useState(location.state?.logData || null)
  const [loading, setLoading] = useState(!log)

  useEffect(() => {
    // Se o usuário der F5 na página (perde o state), a gente busca da API
    if (!log) {
      buscarLogNaApi()
    }
  }, [])

  const buscarLogNaApi = async () => {
    try {
      const response = await api.get("api/admin/diario/")
      // Procura o ID específico na lista
      const registro = response.data.find((item) => item.id.toString() === id)
      if (registro) {
        setLog(registro)
      } else {
        Swal.fire("Não encontrado", "Este registro não existe mais.", "error")
        navigate("/dashboard/admin/diario")
      }
    } catch (error) {
      navigate("/dashboard/admin/diario")
    } finally {
      setLoading(false)
    }
  }

  const getTipoMeta = (tipo) => {
    switch (tipo) {
      case "Treinamento":
        return { cor: "#10B981", bg: "#D1FAE5", icone: <BookOpen size={18} /> }
      case "Reunião":
        return { cor: "#2563EB", bg: "#DBEAFE", icone: <Users size={18} /> }
      case "Visita Escolar":
        return { cor: "#8B5CF6", bg: "#EDE9FE", icone: <MapPin size={18} /> }
      case "Suporte":
        return {
          cor: "#F59E0B",
          bg: "#FEF3C7",
          icone: <MessageCircle size={18} />,
        }
      default:
        return { cor: "#64748B", bg: "#F1F5F9", icone: <FileText size={18} /> }
    }
  }

  if (loading) return <div style={styles.loading}>Carregando documento...</div>
  if (!log) return null

  const meta = getTipoMeta(log.tipo)

  return (
    <div
      style={{
        ...styles.wrapper,
        padding: isMobile ? "20px 10px" : "40px 20px",
      }}
    >
      <div style={styles.container}>
        {/* BOTÃO DE VOLTAR */}
        <button
          onClick={() => navigate("/dashboard/admin/diario")}
          style={styles.backButton}
        >
          <ArrowLeft size={16} /> Voltar para o Diário
        </button>

        <div
          style={{
            ...styles.splitLayout,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* CONTEÚDO PRINCIPAL (ESQUERDA) */}
          <div style={{ flex: 1.5, width: "100%" }}>
            <div style={styles.documentCard}>
              {/* CABEÇALHO DO DOCUMENTO */}
              <div style={styles.docHeader}>
                <div style={styles.badgeRow}>
                  <div
                    style={{
                      ...styles.badge,
                      backgroundColor: meta.bg,
                      color: meta.cor,
                    }}
                  >
                    {meta.icone} {log.tipo}
                  </div>
                  <span style={styles.dateText}>
                    <Calendar size={14} /> {log.data_evento}
                  </span>
                </div>

                <h1 style={styles.docTitle}>{log.titulo}</h1>

                <div style={styles.contactBadge}>
                  <Users size={16} color="#1565C0" />
                  <strong>Com quem:</strong> {log.contato}
                </div>
              </div>

              {/* CORPO DO DOCUMENTO */}
              <div style={styles.docBody}>
                <h3 style={styles.sectionTitle}>
                  <FileText size={18} color="#475569" /> Relato da Operação
                </h3>
                <div style={styles.textContent}>{log.descricao}</div>
              </div>
            </div>
          </div>

          {/* SIDEBAR (DIREITA) */}
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* ANEXO / FOTO */}
            {log.foto ? (
              <div style={styles.sideCard}>
                <h3 style={styles.sideCardTitle}>
                  <Camera size={18} /> Anexo Visual
                </h3>
                <a
                  href={log.foto}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.imageLink}
                >
                  <img
                    src={log.foto}
                    alt="Anexo do evento"
                    style={styles.imagePreview}
                  />
                  <div style={styles.imageOverlay}>
                    <span>Clique para ampliar</span>
                  </div>
                </a>
                <a
                  href={log.foto}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <button style={styles.downloadBtn}>
                    <Download size={16} /> Baixar Imagem Original
                  </button>
                </a>
              </div>
            ) : (
              <div style={styles.sideCardEmpty}>
                <Camera
                  size={32}
                  color="#CBD5E1"
                  style={{ marginBottom: "10px" }}
                />
                <p style={{ margin: 0, color: "#94A3B8", fontSize: "14px" }}>
                  Nenhum registro fotográfico anexado a este evento.
                </p>
              </div>
            )}

            {/* AÇÕES */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideCardTitle}>Gerenciamento</h3>
              <button
                style={styles.deleteBtn}
                onClick={() => {
                  Swal.fire({
                    title: "Deseja excluir?",
                    text: "Essa ação apagará este registro do banco de dados.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DC2626",
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      await api.delete(`api/admin/diario/${log.id}/delete/`)
                      Swal.fire("Excluído!", "", "success")
                      navigate("/dashboard/admin/diario")
                    }
                  })
                }}
              >
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
    backgroundColor: "#F1F5F9",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  container: { maxWidth: "1000px", margin: "0 auto" },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    color: "#64748B",
  },

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
    marginBottom: "25px",
  },

  splitLayout: { display: "flex", gap: "25px", alignItems: "flex-start" },

  // DOCUMENTO PRINCIPAL
  documentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
  },
  docHeader: {
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "25px",
    marginBottom: "25px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dateText: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#64748B",
    fontSize: "14px",
    fontWeight: "600",
  },
  docTitle: {
    margin: "0 0 20px 0",
    fontSize: "32px",
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  contactBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F8FAFC",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    color: "#334155",
  },

  docBody: {},
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "15px",
  },
  textContent: {
    fontSize: "16px",
    color: "#334155",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    backgroundColor: "#F8FAFC",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
  },

  // SIDEBAR DIREITA
  sideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
  },
  sideCardEmpty: {
    backgroundColor: "#F8FAFC",
    borderRadius: "16px",
    padding: "30px",
    border: "1px dashed #CBD5E1",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sideCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 20px 0",
    fontSize: "15px",
    fontWeight: "800",
    color: "#1E293B",
  },

  imageLink: {
    display: "block",
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "15px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
  },
  imagePreview: {
    width: "100%",
    display: "block",
    objectFit: "cover",
    maxHeight: "300px",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    color: "white",
    padding: "10px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  downloadBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#F1F5F9",
    color: "#475569",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  deleteBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    border: "1px solid #FECACA",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
}
