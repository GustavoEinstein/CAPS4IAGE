import React, { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  ShieldAlert,
  UserCheck,
  Settings,
  ChevronRight,
  Database,
  Trophy,
  ExternalLink,
  Book,
  FileText,
  Sun,
  Moon,
} from "lucide-react"

export default function CentralAdmin() {
  const navigate = useNavigate()

  // --- DETECÇÃO DE MOBILE ---
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  // --- ESTADO DO MODO ESCURO (Visual por enquanto) ---
  const [isDarkMode, setIsDarkMode] = useState(false)

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
            <div style={{ flex: 1 }}>
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

            {/* --- BOTÃO DE MODO ESCURO (Preparado para o futuro) --- */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={styles.themeToggleBtn}
              title="Alternar Modo Escuro"
            >
              {isDarkMode ? (
                <Moon size={20} color="#6366F1" />
              ) : (
                <Sun size={20} color="#F59E0B" />
              )}
              {!isMobile && (
                <span style={styles.themeToggleText}>
                  {isDarkMode ? "Modo Escuro" : "Modo Claro"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Transformado em Grid (2 colunas no PC, 1 coluna no Mobile) */}
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          }}
        >
          {/* 1. Aprovação de Contas */}
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
                Analise e aprove novos professores que solicitaram acesso.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* 2. Gamificação e Hall da Fama */}
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
                Gamificação e Hall
              </h3>
              <p style={styles.cardDesc}>
                Gerencie conquistas, atribua XP manual e crie badges.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* 3. Auditoria e Gestão de Dados */}
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
                Auditoria de Dados
              </h3>
              <p style={styles.cardDesc}>
                Exclua usuários, exporte relatórios e gerencie o fórum.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* 4. NOVO: Diário de Bordo / Operacional */}
          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/admin/diario")}
          >
            <div style={{ ...styles.cardIcon, backgroundColor: "#FEF9C3" }}>
              <FileText size={32} color="#CA8A04" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Diário de Operações
              </h3>
              <p style={styles.cardDesc}>
                Registre reuniões, visitas às escolas e treinamentos.
              </p>
            </div>
            <ChevronRight size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* 5. NOVO: Documentação Técnica (Link Externo) */}
          <div
            style={styles.card}
            onClick={() =>
              window.open(
                "https://docs.google.com/document/d/SEU_LINK_AQUI",
                "_blank",
              )
            }
          >
            <div style={{ ...styles.cardIcon, backgroundColor: "#F3E8FF" }}>
              <Book size={32} color="#7E22CE" />
            </div>
            <div style={styles.cardContent}>
              <h3
                style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Documentação Técnica
              </h3>
              <p style={styles.cardDesc}>
                Requisitos funcionais, regras de negócio e arquitetura.
              </p>
            </div>
            <ExternalLink size={20} color="#90A4AE" style={styles.arrow} />
          </div>

          {/* 6. Configurações do Sistema */}
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
                Configurações Gerais
              </h3>
              <p style={styles.cardDesc}>
                Ajuste parâmetros globais e pesos da IA do sistema.
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
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: {},
  titleGroup: { display: "flex", gap: "15px", width: "100%" },
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

  // --- ESTILO DO BOTÃO DE TEMA ---
  themeToggleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    alignSelf: "center",
  },
  themeToggleText: { fontSize: "14px", fontWeight: "600", color: "#475569" },

  // --- MUDANÇA PARA GRID ---
  grid: { display: "grid", gap: "20px" },

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
