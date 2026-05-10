import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FilePlus2,
  FolderOpen,
  Scale,
  Globe,
  LifeBuoy,
  BookOpenCheck,
  MessageSquare, 
  Settings,
  Trophy, 
  ClipboardList, // <--- NOVO ÍCONE ADICIONADO AQUI
  X,
} from "lucide-react"

// --- ÍCONE PERSONALIZADO: TEIA DE ARANHA ---
const SpiderWebIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5" 
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20" /> 
    <path d="M2 12h20" /> 
    <path d="M4.93 4.93l14.14 14.14" /> 
    <path d="M19.07 4.93L4.93 19.07" /> 
    <path d="M12 7 L15.53 8.47 L17 12 L15.53 15.53 L12 17 L8.47 15.53 L7 12 L8.47 8.47 Z" />
    <path d="M12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 Z" />
  </svg>
)

function Sidebar({ isOpen, isMobile, onClose }) {
  // VERIFICA SE O USUÁRIO LOGADO É SUPERADMIN
  const isSuperUser = localStorage.getItem("is_superuser") === "true";

  const getLinkStyle = ({ isActive }) => ({
    ...styles.link,
    ...(isActive ? styles.linkActive : {}),
  })

  return (
    <aside
      style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        position: "fixed", 
        boxShadow: isOpen ? "4px 0 10px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {/* Logo Area */}
      <div style={styles.logoContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={styles.logoCircle}>
            <span>
              <SpiderWebIcon size={32} color="#1565C0" />
            </span>
          </div>
          <div>
            <h1 style={styles.logoTitle}>T.E.I.A</h1>
          </div>
        </div>

        {/* Botão de Fechar (Só aparece no Mobile) */}
        {isMobile && (
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} color="#546E7A" />
          </button>
        )}
      </div>

      <nav style={styles.nav}>
        <p style={styles.sectionLabel}>MENU PRINCIPAL</p>
        <ul style={styles.ul}>
          <li>
            <NavLink
              to="/dashboard"
              end
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <LayoutDashboard size={20} style={styles.icon} />
              Início
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/catalogar"
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <FilePlus2 size={20} style={styles.icon} />
              Catalogar Produção
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/minhas-producoes"
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <FolderOpen size={20} style={styles.icon} />
              Minhas Produções
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/revisao"
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <Scale size={20} style={styles.icon} />
              Revisão (Duplo Cego)
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/dashboard/forum"
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <MessageSquare size={20} style={styles.icon} />
              Fórum de Rascunhos
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/ranking"
              style={getLinkStyle}
              onClick={isMobile ? onClose : undefined}
            >
              <Trophy size={20} style={styles.icon} />
              Hall da Fama
            </NavLink>
          </li>
        </ul>

        {/* --- ÁREA EXCLUSIVA PARA O SUPERADMIN --- */}
        {isSuperUser && (
          <>
            <p style={styles.sectionLabel}>ADMINISTRAÇÃO</p>
            <ul style={styles.ul}>
              <li>
                <NavLink
                  to="/dashboard/central-admin"
                  style={getLinkStyle}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Settings size={20} style={styles.icon} />
                  Central do Admin
                </NavLink>
              </li>
            </ul>
          </>
        )}

        <div style={{ marginTop: "auto" }}>
          <ul style={styles.ul}>
            {/* --- NOVO: BOTÃO DE AVALIAR O SISTEMA --- */}
            <li>
              <a
                href="https://forms.gle/hTbpQGN9zHkFXEHk6"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
                onClick={isMobile ? onClose : undefined}
              >
                <ClipboardList size={20} style={styles.icon} />
                Avaliar o Sistema
              </a>
            </li>
            
            <li>
              <NavLink
                to="/dashboard/ajuda"
                style={getLinkStyle}
                onClick={isMobile ? onClose : undefined}
              >
                <LifeBuoy size={20} style={styles.icon} />
                Ajuda e Suporte
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <div style={styles.footer}>
        <div style={styles.proCard}>
          <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>T.E.I.A</p>
          <p style={{ margin: 0, fontSize: "11px", opacity: 0.85 }}>
            Tecendo Educação com IA
          </p>
        </div>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: { width: "260px", height: "100vh", backgroundColor: "#FFFFFF", borderRight: "1px solid #E0E0E0", display: "flex", flexDirection: "column", top: 0, left: 0, zIndex: 1000, transition: "transform 0.3s ease-in-out" },
  logoContainer: { padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F5F5F5" },
  logoCircle: { width: "40px", height: "40px", backgroundColor: "#E3F2FD", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" },
  logoTitle: { fontSize: "18px", fontWeight: "800", color: "#1565C0", margin: 0, lineHeight: 1.1 },
  closeButton: { background: "none", border: "none", cursor: "pointer", padding: "5px" },
  nav: { padding: "20px", flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  ul: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: "#90A4AE", letterSpacing: "0.8px", margin: "15px 0 10px 12px", textTransform: "uppercase" },
  link: { display: "flex", alignItems: "center", padding: "12px 14px", textDecoration: "none", color: "#546E7A", fontSize: "14px", fontWeight: "500", borderRadius: "10px", transition: "all 0.2s ease", border: "1px solid transparent" },
  linkActive: { backgroundColor: "#E3F2FD", color: "#1565C0", fontWeight: "600", border: "1px solid #BBDEFB" },
  icon: { marginRight: "12px" },
  footer: { padding: "20px", borderTop: "1px solid #F5F5F5" },
  proCard: { background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)", borderRadius: "10px", padding: "16px", color: "white", fontSize: "14px", textAlign: "center" },
}

export default Sidebar