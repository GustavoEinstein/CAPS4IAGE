import React from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  ShieldAlert,
  UserCheck,
  Settings,
  ChevronRight,
  Database,
  Trophy,
} from "lucide-react"

export default function CentralAdmin() {
  const navigate = useNavigate()

  // --- DETECÇÃO DE MOBILE ---
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  return (
    <div
      style={{
        ...styles.wrapper,
        padding: isMobile ? "20px 15px" : "40px 20px",
      }}
    >
      <div style={styles.container}>
        <div
          style={{ ...styles.header, marginBottom: isMobile ? "25px" : "40px" }}
        >
          <div
            style={{
              ...styles.titleGroup,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <div style={styles.iconCircleBlue}>
              <Settings size={28} color="#1565C0" />
            </div>
            <div>
              <h1
                style={{
                  ...styles.pageTitle,
                  fontSize: isMobile ? "22px" : "26px",
                }}
              >
                Central de Administração
              </h1>
              <p style={styles.pageSubtitle}>
                Selecione a ferramenta de gestão que deseja acessar.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Card: Aprovação de Contas */}
          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/aprovacoes")}
          >
            <div style={{ ...styles.cardIcon, backgroundColor: "#E8F5E9" }}>
              <UserCheck size={32} color="#2E7D32" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Aprovação de Contas
              </h3>
              <p style={styles.cardDesc}>
                Analise e aprove novos professores que solicitaram acesso ao
                sistema T.E.I.A.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* Card: Gestão de Gamificação e Hall da Fama */}
          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/admin/gamificacao")}
          >
            <div style={{ ...styles.cardIcon, backgroundColor: "#FFF7ED" }}>
              <Trophy size={32} color="#EA580C" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Gamificação e Hall da Fama
              </h3>
              <p style={styles.cardDesc}>
                Gerencie conquistas, atribua XP manual, crie badges e monitore o
                ranking global.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* Card: Auditoria e Gestão de Dados */}
          <div style={styles.card} onClick={() => navigate("/dashboard/admin")}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#FEE2E2" }}>
              <ShieldAlert size={32} color="#DC2626" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Auditoria e Gestão de Dados
              </h3>
              <p style={styles.cardDesc}>
                Exclua usuários, monitore produções didáticas, exporte
                relatórios e gerencie o fórum.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* Card: Configurações do Sistema */}
          <div
            style={styles.card}
            onClick={() => alert("Módulo em desenvolvimento!")}
          >
            <div style={{ ...styles.cardIcon, backgroundColor: "#F3E5F5" }}>
              <Database size={32} color="#7B1FA2" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Configurações do Sistema
              </h3>
              <p style={styles.cardDesc}>
                Ajuste os pesos da IA, categorias de disciplinas e parâmetros
                globais do sistema.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
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
  container: { maxWidth: "900px", margin: "0 auto" },
  header: {},
  titleGroup: { display: "flex", gap: "15px" },
  iconCircleBlue: {
    width: "50px",
    height: "50px",
    backgroundColor: "#E3F2FD",
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

  grid: { display: "flex", flexDirection: "column", gap: "15px" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cardIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: { margin: "0 0 6px 0", fontWeight: "800", color: "#1E293B" },
  cardDesc: {
    margin: 0,
    fontSize: "13px",
    color: "#64748B",
    lineHeight: "1.5",
  },
  arrow: { flexShrink: 0 },
}
