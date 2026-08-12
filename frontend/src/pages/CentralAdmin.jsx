import React from "react"
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
} from "lucide-react"

export default function CentralAdmin() {
  const navigate = useNavigate()
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
              <Settings size={28} color="var(--text-info)" />
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
          </div>
        </div>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          }}
        >
          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/aprovacoes")}
          >
            <div
              style={{
                ...styles.cardIcon,
                backgroundColor: "var(--bg-success)",
              }}
            >
              <UserCheck size={32} color="var(--text-success)" />
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
            <ChevronRight
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
          </div>

          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/admin/gamificacao")}
          >
            <div
              style={{
                ...styles.cardIcon,
                backgroundColor: "var(--bg-warning)",
              }}
            >
              <Trophy size={32} color="var(--text-warning)" />
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
            <ChevronRight
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
          </div>

          <div style={styles.card} onClick={() => navigate("/dashboard/admin")}>
            <div
              style={{
                ...styles.cardIcon,
                backgroundColor: "var(--bg-danger)",
              }}
            >
              <ShieldAlert size={32} color="var(--text-danger)" />
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
            <ChevronRight
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
          </div>

          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/admin/diario")}
          >
            <div
              style={{
                ...styles.cardIcon,
                backgroundColor: "var(--bg-warning)",
              }}
            >
              <FileText size={32} color="var(--text-warning)" />
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
            <ChevronRight
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
          </div>

          <div
            style={styles.card}
            onClick={() =>
              window.open(
                "https://docs.google.com/document/d/SEU_LINK_AQUI",
                "_blank",
              )
            }
          >
            <div
              style={{ ...styles.cardIcon, backgroundColor: "var(--bg-info)" }}
            >
              <Book size={32} color="var(--text-info)" />
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
            <ExternalLink
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
          </div>

          <div
            style={styles.card}
            onClick={() => navigate("/dashboard/admin/configuracoes")}
          >
            <div
              style={{ ...styles.cardIcon, backgroundColor: "var(--bg-info)" }}
            >
              <Database size={32} color="var(--text-info)" />
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
            <ChevronRight
              size={20}
              color="var(--text-muted)"
              style={styles.arrow}
            />
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
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: {},
  titleGroup: { display: "flex", gap: "15px", width: "100%" },
  iconCircleBlue: {
    width: "50px",
    height: "50px",
    backgroundColor: "var(--bg-info)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: { margin: 0, fontWeight: "900", color: "var(--text-primary)" },
  pageSubtitle: {
    margin: 0,
    color: "var(--text-muted)",
    marginTop: "5px",
    fontSize: "14px",
  },
  grid: { display: "grid", gap: "20px" },
  card: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    border: "1px solid var(--border-color)",
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
  cardTitle: {
    margin: "0 0 6px 0",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  cardDesc: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
  },
  arrow: { flexShrink: 0 },
}
