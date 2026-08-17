import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  Trophy,
  LogOut,
  Bell,
  Star,
  ArrowUpCircle,
  Medal,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import api from "../services/api"
import ThemeToggle from "./ThemeToggle"
import Swal from "sweetalert2" // <-- IMPORTANTE PARA OS POP-UPS!

function Header({ onToggleMenu, showMenuButton }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const pageTitles = {
    "/dashboard": "Visão Geral",
    "/dashboard/catalogar": "Catalogar Prática",
    "/dashboard/minhas-producoes": "Minhas Produções",
    "/dashboard/revisao": "Revisão (Duplo Cego)",
    "/dashboard/comunidade": "Comunidade",
    "/dashboard/ajuda": "Ajuda e Suporte",
    "/dashboard/forum": "Fórum de Rascunhos",
    "/dashboard/admin": "Painel do Administrador",
    "/dashboard/central-admin": "Central Administrativa",
    "/dashboard/ranking": "Hall da Fama",
    "/dashboard/aprovacoes": "Aprovação de Contas",
    "/perfil": "Meu Perfil",
  }

  const currentTitle = pageTitles[location.pathname] || "Página do Sistema"

  const [userPontos, setUserPontos] = useState(
    localStorage.getItem("user_pontos") || "0",
  )
  const [userNivel, setUserNivel] = useState(
    localStorage.getItem("user_nivel") || "Prof. Conectado(a)",
  )
  const [userAvatar, setUserAvatar] = useState(
    localStorage.getItem("user_avatar"),
  )

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter((n) => !n.lida).length

  const isInitialMount = useRef(true)
  const knownNotifIds = useRef(new Set())

  // --- O "RADAR" DE NOTIFICAÇÕES E XP ---
  useEffect(() => {
    let isMounted = true

    const buscarDadosEnotificacoes = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return

        const [resPerfil, resNotif] = await Promise.all([
          api.get("api/user/me/"),
          api.get("api/notificacoes/"),
        ])

        if (!isMounted) return

        // Atualiza os pontos no topo da tela silenciosamente
        const data = resPerfil.data
        localStorage.setItem("user_pontos", data.pontos)
        localStorage.setItem("user_nivel", data.nivel)
        setUserPontos(data.pontos)
        setUserNivel(data.nivel)

        // Atualiza Notificações e dispara o "Pop-up de Videogame"
        const fetchedNotifs = resNotif.data
        setNotifications(fetchedNotifs)

        if (isInitialMount.current) {
          fetchedNotifs.forEach((n) => knownNotifIds.current.add(n.id))
          isInitialMount.current = false
        } else {
          fetchedNotifs.forEach((n) => {
            // Se tem notificação nova que ele ainda não viu, pula na tela!
            if (!n.lida && !knownNotifIds.current.has(n.id)) {
              knownNotifIds.current.add(n.id)
              dispararToastNotificacao(n)
            }
          })
        }
      } catch (e) {
        console.error("Erro no Radar de XP", e)
      }
    }

    buscarDadosEnotificacoes()

    // Escuta quando as telas de baixo (Revisão, Fórum) avisam que a ação foi feita
    const atualizarHeader = () => {
      buscarDadosEnotificacoes()
    }
    window.addEventListener("perfilAtualizado", atualizarHeader)

    // Checa de fininho a cada 30 segundos se alguém revisou as práticas dele
    const interval = setInterval(buscarDadosEnotificacoes, 30000)

    return () => {
      isMounted = false
      window.removeEventListener("perfilAtualizado", atualizarHeader)
      clearInterval(interval)
    }
  }, [])

  // --- FUNÇÃO VISUAL DO POP-UP (TOAST) ---
  const dispararToastNotificacao = (n) => {
    let iconHtml = "🔔"
    let borderColor = "var(--border-color)"

    if (n.tipo === "XP") {
      iconHtml = "⭐"
      borderColor = "#F59E0B"
    }
    if (n.tipo === "NIVEL") {
      iconHtml = "🚀"
      borderColor = "#10B981"
    }
    if (n.tipo === "MEDALHA") {
      iconHtml = "🏅"
      borderColor = "#8B5CF6"
    }

    Swal.fire({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      background: "var(--bg-card)",
      color: "var(--text-primary)",
      html: `
              <div style="display: flex; align-items: center; gap: 15px; text-align: left;">
                  <div style="font-size: 28px;">${iconHtml}</div>
                  <div>
                      <strong style="display: block; font-size: 15px; margin-bottom: 2px;">${n.titulo}</strong>
                      <span style="font-size: 13px; color: var(--text-secondary);">${n.mensagem}</span>
                  </div>
              </div>
          `,
      didOpen: (toast) => {
        toast.style.borderLeft = `5px solid ${borderColor}`
        toast.addEventListener("mouseenter", Swal.stopTimer)
        toast.addEventListener("mouseleave", Swal.resumeTimer)
      },
    })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = (e) => {
    e.stopPropagation()
    localStorage.clear()
    navigate("/")
  }

  const handleToggleNotifications = async () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.post("api/notificacoes/ler/")
        setNotifications(notifications.map((n) => ({ ...n, lida: true })))
      } catch (e) {
        console.error("Falha ao marcar como lida")
      }
    }
  }

  const fullUserName = localStorage.getItem("user_name") || ""
  const getFirstName = (fullName) => {
    if (!fullName) return ""
    const first = fullName.split(" ")[0]
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
  }

  const displayName = getFirstName(fullUserName)
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : "P"

  const getNotifIcon = (tipo) => {
    switch (tipo) {
      case "XP":
        return <Star size={16} color="#F59E0B" />
      case "NIVEL":
        return <ArrowUpCircle size={16} color="#10B981" />
      case "MEDALHA":
        return <Medal size={16} color="#8B5CF6" />
      case "AVALIACAO":
        return <CheckCircle2 size={16} color="#2563EB" />
      default:
        return <AlertCircle size={16} color="var(--text-muted)" />
    }
  }

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {showMenuButton && (
          <button onClick={onToggleMenu} style={styles.menuButton}>
            <Menu size={24} color="var(--text-info)" />
          </button>
        )}
        <div style={styles.breadcrumb}>
          {!showMenuButton && (
            <span style={{ color: "var(--text-muted)", marginRight: "8px" }}>
              Dashboard /
            </span>
          )}
          <span style={{ color: "var(--text-info)" }}>{currentTitle}</span>
        </div>
      </div>

      <div style={styles.userArea}>
        <div style={{ display: showMenuButton ? "none" : "block" }}>
          <ThemeToggle />
        </div>

        <div style={styles.notifContainer} ref={dropdownRef}>
          <button onClick={handleToggleNotifications} style={styles.bellButton}>
            <Bell size={20} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={styles.badgeCount}>{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={styles.dropHeader}>Notificações</div>
              <div style={styles.dropList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotif}>
                    Você não tem novas notificações.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        ...styles.notifItem,
                        backgroundColor: n.lida
                          ? "var(--bg-card)"
                          : "var(--bg-alt)",
                      }}
                    >
                      <div style={styles.notifIconBox}>
                        {getNotifIcon(n.tipo)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.notifTitle}>{n.titulo}</div>
                        <div style={styles.notifMessage}>{n.mensagem}</div>
                        <div style={styles.notifDate}>{n.data}</div>
                      </div>
                      {!n.lida && <div style={styles.unreadDot}></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          style={styles.profile}
          onClick={() => navigate("/perfil")}
          title="Ir para meu perfil"
        >
          <div
            style={{
              ...styles.userInfo,
              display: showMenuButton ? "none" : "flex",
            }}
          >
            <div style={styles.nameRow}>
              <span style={styles.userName}>Prof. {displayName}</span>
              <span style={styles.separator}>|</span>
              <span onClick={handleLogout} style={styles.logoutLink}>
                Sair <LogOut size={12} style={{ marginLeft: "4px" }} />
              </span>
            </div>
            <div style={styles.xpBadgeHeader}>
              <Trophy size={11} color="#B45309" />
              <span>
                {userNivel}{" "}
                <span style={{ opacity: 0.6, margin: "0 2px" }}>•</span>{" "}
                {userPontos} XP
              </span>
            </div>
          </div>

          <div style={styles.avatar}>
            {userAvatar && userAvatar !== "null" ? (
              <img src={userAvatar} alt="Perfil" style={styles.avatarImg} />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    height: "70px",
    backgroundColor: "var(--bg-card)",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 900,
    width: "100%",
    boxSizing: "border-box",
    flexShrink: 0,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  leftSection: { display: "flex", alignItems: "center", gap: "15px" },
  menuButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  breadcrumb: {
    fontSize: "15px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  userArea: { display: "flex", alignItems: "center", gap: "20px" },
  notifContainer: { position: "relative" },
  bellButton: {
    background: "var(--bg-alt)",
    border: "1px solid var(--border-color)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s",
  },
  badgeCount: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#EF4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid var(--bg-card)",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: "-50px",
    width: "320px",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    overflow: "hidden",
    zIndex: 1000,
  },
  dropHeader: {
    padding: "15px",
    fontWeight: "800",
    borderBottom: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    backgroundColor: "var(--bg-main)",
  },
  dropList: { maxHeight: "350px", overflowY: "auto" },
  emptyNotif: {
    padding: "30px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  notifItem: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    borderBottom: "1px solid var(--border-color)",
    transition: "background-color 0.2s",
    alignItems: "center",
  },
  notifIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  notifMessage: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
    marginBottom: "6px",
  },
  notifDate: { fontSize: "10px", color: "var(--text-muted)" },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#3B82F6",
    flexShrink: 0,
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "pointer",
    paddingLeft: "10px",
    borderLeft: "1px solid var(--border-color)",
  },
  userInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "5px",
  },
  nameRow: { display: "flex", alignItems: "center", gap: "8px" },
  userName: {
    fontSize: "14px",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  separator: { color: "var(--border-color)", fontSize: "12px" },
  logoutLink: {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  xpBadgeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#FFFBEB",
    color: "#B45309",
    border: "1px solid #FDE68A",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    backgroundColor: "var(--text-info)",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "18px",
    overflow: "hidden",
    border: "3px solid var(--bg-main)",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
}

export default Header
