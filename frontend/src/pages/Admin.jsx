import React, { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import api from "../services/api"
import Swal from "sweetalert2"

// --- BIBLIOTECAS DE RELATÓRIO ---
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import {
  Users,
  FileText,
  MessageSquare,
  Trash2,
  ShieldAlert,
  Eye,
  Search,
  Loader2,
  FileSpreadsheet,
  Download, // IMPORTANTE: Ícone de Download
} from "lucide-react"

export default function Admin() {
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("usuarios")
  const [busca, setBusca] = useState("")

  const [usuarios, setUsuarios] = useState([])
  const [producoes, setProducoes] = useState([])
  const [topicos, setTopicos] = useState([])
  const [estatisticas, setEstatisticas] = useState({
    users: 0,
    prods: 0,
    forum: 0,
  })

  useEffect(() => {
    verificarPermissaoECarregar()
  }, [])

  const verificarPermissaoECarregar = async () => {
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

      await buscarDados("usuarios")
      await buscarDados("producoes")
      await buscarDados("topicos")

      setLoading(false)
    } catch (error) {
      console.error("Erro na verificação de admin", error)
      navigate("/dashboard")
    }
  }

  const buscarDados = async (tipo) => {
    try {
      let endpoint = ""
      if (tipo === "usuarios") endpoint = "api/admin/users/"
      else if (tipo === "producoes") endpoint = "api/admin/productions/"
      else if (tipo === "topicos") endpoint = "api/admin/forum/"

      const res = await api.get(endpoint)

      if (tipo === "usuarios") {
        setUsuarios(res.data)
        setEstatisticas((prev) => ({ ...prev, users: res.data.length }))
      } else if (tipo === "producoes") {
        setProducoes(res.data)
        setEstatisticas((prev) => ({ ...prev, prods: res.data.length }))
      } else if (tipo === "topicos") {
        setTopicos(res.data)
        setEstatisticas((prev) => ({ ...prev, forum: res.data.length }))
      }
    } catch (e) {
      console.error(`Erro ao buscar dados da aba ${tipo}:`, e)
    }
  }

  // --- NOVA FUNÇÃO DE DOWNLOAD DE ARQUIVO ---
  const handleDownload = async (arquivoUrl, id) => {
    if (!arquivoUrl) return
    try {
      const urlRelativa = arquivoUrl.replace(
        "https://teia.cic.unb.br/kipo_playground/",
        "",
      )
      const response = await api.get(urlRelativa, { responseType: "blob" })
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = urlBlob
      link.setAttribute("download", `producao-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error("Erro no download:", error)
      Swal.fire("Erro", "Não foi possível baixar o arquivo.", "error")
    }
  }

  const exportarExcel = () => {
    let dados = []
    let nomeArquivo = `relatorio_${activeTab}_teia.xlsx`

    if (activeTab === "usuarios") {
      dados = usuariosFiltrados.map((u) => ({
        ID: u.id,
        Nome: u.username,
        "E-mail": u.email,
        Disciplina: u.disciplina,
        Perfil: u.is_superuser ? "Administrador" : "Docente",
      }))
    } else if (activeTab === "producoes") {
      dados = producoesFiltradas.map((p) => ({
        ID: p.id,
        Título: p.titulo,
        Autor: p.autor,
        Status: p.status,
        Data: p.data,
      }))
    } else {
      dados = topicosFiltrados.map((t) => ({
        ID: t.id,
        Título: t.titulo,
        Autor: t.autor,
        Categoria: t.categoria,
      }))
    }

    if (dados.length === 0)
      return Swal.fire("Aviso", "Não há dados para exportar.", "info")
    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório")
    XLSX.writeFile(workbook, nomeArquivo)
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    const azulTeia = [21, 101, 192]

    doc.setFontSize(22)
    doc.setTextColor(azulTeia[0], azulTeia[1], azulTeia[2])
    doc.text("T.E.I.A", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Relatório Administrativo - Inteligência Pedagógica", 14, 27)
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 32)

    let head = []
    let body = []

    if (activeTab === "usuarios") {
      head = [["ID", "Nome", "E-mail", "Disciplina", "Papel"]]
      body = usuariosFiltrados.map((u) => [
        u.id,
        u.username,
        u.email,
        u.disciplina,
        u.is_superuser ? "Admin" : "Docente",
      ])
    } else if (activeTab === "producoes") {
      head = [["ID", "Título", "Autor", "Status", "Data"]]
      body = producoesFiltradas.map((p) => [
        p.id,
        p.titulo,
        p.autor,
        p.status,
        p.data,
      ])
    } else {
      head = [["ID", "Título", "Autor", "Categoria"]]
      body = topicosFiltrados.map((t) => [t.id, t.titulo, t.autor, t.categoria])
    }

    if (body.length === 0)
      return Swal.fire("Aviso", "Não há dados para exportar.", "info")

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      headStyles: { fillColor: azulTeia },
      theme: "grid",
      styles: { fontSize: 9 },
    })
    doc.save(`Relatorio_TEIA_${activeTab}.pdf`)
  }

  const handleDeletar = async (tipo, id, nome) => {
    const result = await Swal.fire({
      title: "Excluir registro?",
      text: `Deseja realmente apagar ${nome}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
    })

    if (result.isConfirmed) {
      try {
        const endpoint =
          tipo === "usuario"
            ? `api/admin/users/${id}/delete/`
            : tipo === "producao"
              ? `api/admin/productions/${id}/delete/`
              : `api/admin/forum/${id}/delete/`
        await api.delete(endpoint)
        Swal.fire("Excluído!", "", "success")
        buscarDados(activeTab === "topicos" ? "forum" : activeTab)
      } catch (error) {
        Swal.fire("Erro", "Falha ao deletar.", "error")
      }
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.username?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase()),
  )
  const producoesFiltradas = producoes.filter((p) =>
    p.titulo?.toLowerCase().includes(busca.toLowerCase()),
  )
  const topicosFiltrados = topicos.filter((t) =>
    t.titulo?.toLowerCase().includes(busca.toLowerCase()),
  )

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="spin" size={32} color="#1565C0" />
        <p style={{ marginTop: "10px" }}>Carregando Painel...</p>
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
        <div
          style={{
            ...styles.header,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={styles.titleGroup}>
            <div style={styles.iconCircleRed}>
              <ShieldAlert size={28} color="#DC2626" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.pageTitle,
                  fontSize: isMobile ? "22px" : "26px",
                }}
              >
                Painel do Administrador
              </h1>
              <p style={styles.pageSubtitle}>
                Gestão de dados e auditoria do sistema.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div
            style={{
              ...styles.statCard,
              borderLeft:
                activeTab === "usuarios"
                  ? "4px solid #2563EB"
                  : "1px solid #E2E8F0",
            }}
            onClick={() => {
              setActiveTab("usuarios")
              setBusca("")
            }}
          >
            <Users size={24} color="#2563EB" />
            <div>
              <p style={styles.statLabel}>Usuários</p>
              <h3 style={styles.statNumber}>{estatisticas.users}</h3>
            </div>
          </div>
          <div
            style={{
              ...styles.statCard,
              borderLeft:
                activeTab === "producoes"
                  ? "4px solid #10B981"
                  : "1px solid #E2E8F0",
            }}
            onClick={() => {
              setActiveTab("producoes")
              setBusca("")
            }}
          >
            <FileText size={24} color="#10B981" />
            <div>
              <p style={styles.statLabel}>Produções</p>
              <h3 style={styles.statNumber}>{estatisticas.prods}</h3>
            </div>
          </div>
          <div
            style={{
              ...styles.statCard,
              borderLeft:
                activeTab === "topicos"
                  ? "4px solid #8B5CF6"
                  : "1px solid #E2E8F0",
            }}
            onClick={() => {
              setActiveTab("topicos")
              setBusca("")
            }}
          >
            <MessageSquare size={24} color="#8B5CF6" />
            <div>
              <p style={styles.statLabel}>Tópicos</p>
              <h3 style={styles.statNumber}>{estatisticas.forum}</h3>
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div
            style={{
              ...styles.toolbar,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
            }}
          >
            <div
              style={{
                ...styles.tabs,
                overflowX: isMobile ? "auto" : "visible",
              }}
            >
              <button
                style={
                  activeTab === "usuarios"
                    ? styles.tabActive
                    : styles.tabInactive
                }
                onClick={() => {
                  setActiveTab("usuarios")
                  setBusca("")
                }}
              >
                Usuários
              </button>
              <button
                style={
                  activeTab === "producoes"
                    ? styles.tabActive
                    : styles.tabInactive
                }
                onClick={() => {
                  setActiveTab("producoes")
                  setBusca("")
                }}
              >
                Produções
              </button>
              <button
                style={
                  activeTab === "topicos"
                    ? styles.tabActive
                    : styles.tabInactive
                }
                onClick={() => {
                  setActiveTab("topicos")
                  setBusca("")
                }}
              >
                Fórum
              </button>
            </div>

            <div
              style={{
                ...styles.actionsGroup,
                flexDirection: isMobile ? "column" : "row",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <div
                style={{
                  ...styles.searchBox,
                  width: isMobile ? "100%" : "auto",
                  boxSizing: "border-box",
                }}
              >
                <Search size={16} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  style={{ ...styles.searchInput, width: "100%" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <button
                  onClick={exportarExcel}
                  style={{
                    ...styles.btnExport,
                    backgroundColor: "#10B981",
                    flex: isMobile ? 1 : "none",
                    justifyContent: "center",
                  }}
                >
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button
                  onClick={exportarPDF}
                  style={{
                    ...styles.btnExport,
                    backgroundColor: "#DC2626",
                    flex: isMobile ? 1 : "none",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={16} /> PDF
                </button>
              </div>
            </div>
          </div>

          <div style={styles.tableContainer}>
            {isMobile ? (
              // --- VISÃO MOBILE (CARDS) ---
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {activeTab === "usuarios" &&
                  usuariosFiltrados.map((u) => (
                    <div key={u.id} style={styles.mobileCard}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginBottom: "5px",
                        }}
                      >
                        ID: #{u.id}
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#0F172A",
                        }}
                      >
                        {u.username}
                      </div>
                      <div
                        style={{
                          color: "#64748B",
                          fontSize: "13px",
                          marginBottom: "10px",
                        }}
                      >
                        {u.email}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: u.is_superuser ? "#1565C0" : "#475569",
                          }}
                        >
                          {u.is_superuser ? "Admin" : "Docente"}
                        </span>
                        <button
                          onClick={() =>
                            handleDeletar("usuario", u.id, u.username)
                          }
                          style={styles.btnDelete}
                          disabled={u.is_superuser}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                {activeTab === "producoes" &&
                  producoesFiltradas.map((p) => (
                    <div key={p.id} style={styles.mobileCard}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginBottom: "5px",
                        }}
                      >
                        ID: #{p.id}
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "#0F172A",
                          marginBottom: "5px",
                        }}
                      >
                        {p.titulo}
                      </div>
                      <div
                        style={{
                          color: "#64748B",
                          fontSize: "13px",
                          marginBottom: "10px",
                        }}
                      >
                        Autor: {p.autor} • {p.status}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() =>
                            navigate(`/dashboard/producao/${p.id}`)
                          }
                          style={{
                            ...styles.btnView,
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Eye size={16} /> Ver
                        </button>

                        {/* O BOTÃO DE DOWNLOAD AQUI NO MOBILE */}
                        {p.arquivo && (
                          <button
                            onClick={() => handleDownload(p.arquivo, p.id)}
                            style={{
                              ...styles.btnDownload,
                              flex: 1,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Download size={16} /> Baixar
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDeletar("producao", p.id, p.titulo)
                          }
                          style={{
                            ...styles.btnDelete,
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                {activeTab === "topicos" &&
                  topicosFiltrados.map((t) => (
                    <div key={t.id} style={styles.mobileCard}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginBottom: "5px",
                        }}
                      >
                        ID: #{t.id}
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "#0F172A",
                          marginBottom: "5px",
                        }}
                      >
                        {t.titulo}
                      </div>
                      <div
                        style={{
                          color: "#64748B",
                          fontSize: "13px",
                          marginBottom: "10px",
                        }}
                      >
                        {t.categoria}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => navigate(`/dashboard/forum/${t.id}`)}
                          style={{
                            ...styles.btnView,
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Eye size={16} /> Ver
                        </button>
                        <button
                          onClick={() =>
                            handleDeletar("topico", t.id, t.titulo)
                          }
                          style={{
                            ...styles.btnDelete,
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // --- VISÃO DESKTOP (TABELA) ---
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>
                      {activeTab === "usuarios" ? "Nome" : "Título"}
                    </th>
                    <th style={styles.th}>
                      {activeTab === "usuarios" ? "E-mail" : "Autor"}
                    </th>
                    <th style={styles.th}>
                      {activeTab === "topicos" ? "Categoria" : "Status"}
                    </th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "usuarios" &&
                    usuariosFiltrados.map((u) => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>#{u.id}</td>
                        <td style={styles.td}>
                          <strong>{u.username}</strong>
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          {u.is_superuser ? "Administrador" : "Docente"}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() =>
                              handleDeletar("usuario", u.id, u.username)
                            }
                            style={styles.btnDelete}
                            disabled={u.is_superuser}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "producoes" &&
                    producoesFiltradas.map((p) => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>#{p.id}</td>
                        <td style={styles.td}>
                          <strong>{p.titulo}</strong>
                        </td>
                        <td style={styles.td}>{p.autor}</td>
                        <td style={styles.td}>{p.status}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={() =>
                                navigate(`/dashboard/producao/${p.id}`)
                              }
                              style={styles.btnView}
                              title="Ver Detalhes"
                            >
                              <Eye size={16} />
                            </button>

                            {/* O BOTÃO DE DOWNLOAD AQUI NO DESKTOP */}
                            {p.arquivo && (
                              <button
                                onClick={() => handleDownload(p.arquivo, p.id)}
                                style={styles.btnDownload}
                                title="Baixar Arquivo"
                              >
                                <Download size={16} />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleDeletar("producao", p.id, p.titulo)
                              }
                              style={styles.btnDelete}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "topicos" &&
                    topicosFiltrados.map((t) => (
                      <tr key={t.id} style={styles.tr}>
                        <td style={styles.td}>#{t.id}</td>
                        <td style={styles.td}>
                          <strong>{t.titulo}</strong>
                        </td>
                        <td style={styles.td}>{t.autor}</td>
                        <td style={styles.td}>{t.categoria}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={() =>
                                navigate(`/dashboard/forum/${t.id}`)
                              }
                              style={styles.btnView}
                              title="Ver Tópico"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletar("topico", t.id, t.titulo)
                              }
                              style={styles.btnDelete}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {activeTab === "usuarios" && usuariosFiltrados.length === 0 && (
              <p style={styles.emptyText}>Nenhum usuário encontrado.</p>
            )}
            {activeTab === "producoes" && producoesFiltradas.length === 0 && (
              <p style={styles.emptyText}>Nenhuma produção encontrada.</p>
            )}
            {activeTab === "topicos" && topicosFiltrados.length === 0 && (
              <p style={styles.emptyText}>Nenhum tópico encontrado.</p>
            )}
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
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "15px" },
  iconCircleRed: {
    width: "50px",
    height: "50px",
    backgroundColor: "#FEE2E2",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: { margin: 0, fontWeight: "900", color: "#0F172A" },
  pageSubtitle: { margin: 0, color: "#64748B", fontSize: "14px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  statLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontWeight: "bold",
  },
  statNumber: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "900",
    color: "#0F172A",
  },

  mainContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 20px",
    backgroundColor: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
  },
  tabs: { display: "flex", gap: "5px" },
  tabActive: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563EB",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabInactive: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#64748B",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  actionsGroup: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#FFFFFF",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#1E293B",
    backgroundColor: "transparent",
  },
  btnExport: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },

  tableContainer: { padding: "20px", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #E2E8F0",
    color: "#64748B",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  tr: { backgroundColor: "#FFFFFF" },
  td: {
    padding: "12px",
    borderBottom: "1px solid #E2E8F0",
    fontSize: "14px",
    color: "#334155",
  },

  mobileCard: {
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "15px",
  },

  btnDelete: {
    padding: "8px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  btnView: {
    padding: "8px",
    backgroundColor: "#E0F2FE",
    color: "#0284C7",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  btnDownload: {
    padding: "8px",
    backgroundColor: "#DCFCE7",
    color: "#166534",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
    color: "#546E7A",
  },
  emptyText: {
    textAlign: "center",
    padding: "40px",
    color: "#94A3B8",
    fontSize: "15px",
  },
}
