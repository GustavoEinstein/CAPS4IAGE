import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  School,
  BookOpen,
  Loader2,
} from "lucide-react"

const AprovacaoContas = () => {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

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
          text: "Você não tem privilégios de administrador.",
          confirmButtonColor: "#2563EB",
        })
        navigate("/dashboard")
        return
      }
      carregarUsuarios()
    } catch (error) {
      navigate("/dashboard")
    }
  }

  const carregarUsuarios = async () => {
    try {
      const response = await api.get("api/admin/pending-users/")
      setUsuarios(response.data)
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403)
        Swal.fire("Erro!", "Erro ao carregar lista de aprovação.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleAcao = async (id, nome, acao) => {
    const result = await Swal.fire({
      title: `Confirmar Ação`,
      text: `Marcar a conta de ${nome} como ${acao.toUpperCase()}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: acao === "Aprovado" ? "#10B981" : "#EF4444",
    })
    if (!result.isConfirmed) return
    setProcessingId(id)
    try {
      await api.post(`api/admin/approve-user/${id}/`, { acao: acao })
      setUsuarios(usuarios.filter((u) => u.id !== id))
      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: `Conta de ${nome} foi ${acao.toLowerCase()}.`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire("Erro!", "Falha ao executar ação.", "error")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={32} color="var(--text-primary)" className="spin" />
        <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>
          Verificando credenciais...
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    )

  return (
    <div
      style={{ ...styles.container, padding: isMobile ? "20px 10px" : "30px" }}
    >
      <div
        style={{
          ...styles.header,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: "15px",
        }}
      >
        <div style={styles.titleArea}>
          <ShieldCheck size={28} color="var(--text-info)" />
          <h2 style={styles.title}>Aprovação de Contas</h2>
        </div>
        <div style={styles.badge}>
          {usuarios.length} {usuarios.length === 1 ? "pendente" : "pendentes"}
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div style={styles.emptyState}>
          <Clock
            size={48}
            color="var(--text-muted)"
            style={{ marginBottom: "15px" }}
          />
          <h3 style={styles.emptyTitle}>Tudo limpo por aqui!</h3>
          <p style={styles.emptyText}>
            Não há nenhuma conta aguardando aprovação no momento.
          </p>
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {usuarios.map((u) => (
            <div key={u.id} style={styles.mobileCard}>
              <div style={styles.userName}>
                <User size={16} style={{ marginRight: "6px" }} /> {u.nome}
              </div>
              <div style={styles.userEmail}>
                <Mail size={14} style={{ marginRight: "6px" }} /> {u.email}
              </div>
              <div style={styles.mobileBadgesRow}>
                <span style={styles.infoBadge}>
                  <BookOpen size={14} /> {u.disciplina}
                </span>
                <span style={styles.infoBadge}>
                  <School size={14} /> {u.escola || "Não informada"}
                </span>
              </div>
              <div style={styles.mobileDate}>Criado em: {u.data_cadastro}</div>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => handleAcao(u.id, u.nome, "Aprovado")}
                  disabled={processingId === u.id}
                  style={{
                    ...styles.btnAprovar,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle size={16} /> Aprovar
                </button>
                <button
                  onClick={() => handleAcao(u.id, u.nome, "Rejeitado")}
                  disabled={processingId === u.id}
                  style={{
                    ...styles.btnRejeitar,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <XCircle size={16} /> Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Usuário</th>
                <th style={styles.th}>Área / Disciplina</th>
                <th style={styles.th}>Escola</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={styles.userName}>
                        <User size={14} style={{ marginRight: "6px" }} />{" "}
                        {u.nome}
                      </span>
                      <span style={styles.userEmail}>
                        <Mail size={12} style={{ marginRight: "6px" }} />{" "}
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.infoBadge}>
                      <BookOpen size={14} /> {u.disciplina}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      <School size={16} color="var(--text-muted)" />{" "}
                      {u.escola || "Não informada"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "13px" }}
                    >
                      {u.data_cadastro}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleAcao(u.id, u.nome, "Aprovado")}
                        disabled={processingId === u.id}
                        style={{
                          ...styles.btnAprovar,
                          opacity: processingId === u.id ? 0.6 : 1,
                        }}
                      >
                        <CheckCircle size={16} /> Aprovar
                      </button>
                      <button
                        onClick={() => handleAcao(u.id, u.nome, "Rejeitado")}
                        disabled={processingId === u.id}
                        style={{
                          ...styles.btnRejeitar,
                          opacity: processingId === u.id ? 0.6 : 1,
                        }}
                      >
                        <XCircle size={16} /> Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  titleArea: { display: "flex", alignItems: "center", gap: "12px" },
  title: {
    color: "var(--text-primary)",
    fontSize: "24px",
    fontWeight: "800",
    margin: 0,
  },
  badge: {
    backgroundColor: "var(--bg-warning)",
    color: "var(--text-warning)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    padding: "60px 20px",
    textAlign: "center",
    border: "1px dashed var(--border-color)",
  },
  emptyTitle: {
    color: "var(--text-primary)",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  emptyText: { color: "var(--text-muted)", fontSize: "14px", margin: 0 },

  tableContainer: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHeader: {
    backgroundColor: "var(--bg-main)",
    borderBottom: "1px solid var(--border-color)",
  },
  th: {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    borderBottom: "1px solid var(--border-color)",
    transition: "background-color 0.2s",
  },
  td: { padding: "16px", verticalAlign: "middle" },

  mobileCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  mobileBadgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "12px 0",
  },
  mobileDate: { fontSize: "12px", color: "var(--text-muted)" },

  userName: {
    display: "flex",
    alignItems: "center",
    color: "var(--text-primary)",
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "4px",
  },
  userEmail: {
    display: "flex",
    alignItems: "center",
    color: "var(--text-secondary)",
    fontSize: "13px",
  },
  infoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-secondary)",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
  },

  actionButtons: { display: "flex", gap: "10px" },
  btnAprovar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#10B981",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnRejeitar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#EF4444",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
}

export default AprovacaoContas
