import React, { useState, useEffect } from "react"
import api from "../services/api" // <--- USANDO API REAL
import { useOutletContext, useNavigate } from "react-router-dom"
import { Search, Bot, CheckCircle2, BookOpen, Tag } from "lucide-react"

const MainContent = () => {
  const { isMobile } = useOutletContext() || { isMobile: false }
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [producoes, setProducoes] = useState([]) // Começa vazio, sem Mocks
  const [isLoading, setIsLoading] = useState(true)

  // --- INFO DO USUÁRIO ---
  const [headerInfo, setHeaderInfo] = useState({
    firstName: "",
    disciplina: "",
  })

  const updateHeaderInfo = () => {
    const storedName = localStorage.getItem("user_name") || ""
    const storedDisc = localStorage.getItem("user_disciplina") || ""
    let formattedName = "Visitante"
    if (storedName) {
      const first = storedName.split(" ")[0]
      formattedName =
        first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
    }
    setHeaderInfo({
      firstName: formattedName,
      disciplina: storedDisc === "Outra" ? "" : storedDisc,
    })
  }

  // --- BUSCA DADOS REAIS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Chama a rota pública de destaques
        const response = await api.get("api/public/feed/")
        setProducoes(response.data)
      } catch (error) {
        console.error("Erro ao carregar feed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    updateHeaderInfo()
  }, [])

  const filteredProducoes = producoes.filter(
    (item) =>
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.disciplina.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <div
        style={{
          ...styles.heroSection,
          padding: isMobile ? "30px 20px" : "40px 30px",
          borderRadius: isMobile ? "0 0 16px 16px" : "0 0 20px 20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ ...styles.heroContent, textAlign: "center" }}>
          <h1
            style={{
              ...styles.heroTitle,
              fontSize: isMobile ? "24px" : "32px",
              marginBottom: "10px",
            }}
          >
            Olá, Professor(a) {headerInfo.firstName}!
          </h1>
          <p
            style={{
              ...styles.heroSubtitle,
              fontSize: isMobile ? "14px" : "16px",
              marginBottom: "30px",
              opacity: 0.9,
            }}
          >
            {headerInfo.disciplina
              ? `Pronto para inovar nas aulas de ${headerInfo.disciplina}?`
              : "Explore produções validadas pela comunidade."}
          </p>

          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Pesquise por disciplina, tema ou IA..."
              style={{
                ...styles.searchInput,
                padding: "14px 50px 14px 20px",
                fontSize: "15px",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} style={{ ...styles.searchIcon, right: "20px" }} />
          </div>
        </div>
      </div>

      {/* LISTA DE CARDS */}
      <div
        style={{
          ...styles.contentArea,
          padding: isMobile ? "0 15px 40px 15px" : "0 30px 60px 30px",
        }}
      >
        <div
          style={{
            ...styles.mainCard,
            padding: isMobile ? "20px" : "30px",
          }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen size={22} color="#1565C0" />
              <h2
                style={{
                  ...styles.sectionTitle,
                  fontSize: isMobile ? "18px" : "22px",
                }}
              >
                Central da Comunidade
              </h2>
            </div>
            <span style={styles.badgeCount}>{filteredProducoes.length}</span>
          </div>

          {isLoading ? (
            <div
              style={{ textAlign: "center", padding: "50px", color: "#90A4AE" }}
            >
              Carregando materiais...
            </div>
          ) : (
            <div
              style={{
                ...styles.grid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {filteredProducoes.length > 0 ? (
                filteredProducoes.map((item) => (
                  <Card
                    key={item.id}
                    data={item}
                    isMobile={isMobile}
                    navigate={navigate}
                  />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    color: "#999",
                    padding: "20px",
                  }}
                >
                  Nenhuma produção encontrada.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- CARD COMPONENTE ---
const Card = ({ data, isMobile, navigate }) => {
  const [isHovered, setIsHovered] = useState(false)

  // NAVEGAÇÃO CORRETA PELO ID
  const handleCardClick = () => {
    navigate(`/dashboard/producao/${data.id}`)
  }

  const getTheme = (disciplina) => {
    const themes = {
      Matemática: { bg: "#FCE4EC", text: "#C2185B" },
      História: { bg: "#F3E5F5", text: "#7B1FA2" },
      Geografia: { bg: "#FFF3E0", text: "#E65100" },
      Ciências: { bg: "#E8F5E9", text: "#2e677d" },
      Química: { bg: "#E8F5E9", text: "#7d4b2e" },
      Biologia: { bg: "#E8F5E9", text: "#2ca832" },
      Pedagogia: { bg: "#E8F5E9", text: "#7d2e3f" },
      Português: { bg: "#E3F2FD", text: "#1565C0" },
      Filosofia: { bg: "#ECEFF1", text: "#455A64" },
      Sociologia: { bg: "#F5F5F5", text: "#635e92" },
      Física: { bg: "#F5F5F5", text: "#d82fa0" },
      Outra: { bg: "#F5F5F5", text: "#616161" },
      Default: { bg: "#F5F5F5", text: "#616161" },
    }
    const key =
      Object.keys(themes).find((k) => disciplina?.includes(k)) || "Default"
    return themes[key]
  }
  const theme = getTheme(data.disciplina)

  return (
    <div
      onClick={handleCardClick}
      style={{
        ...styles.card,
        ...(isHovered && !isMobile ? styles.cardHover : {}),
        padding: isMobile ? "16px" : "20px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.subjectBadge,
            backgroundColor: theme.bg,
            color: theme.text,
          }}
        >
          {data.disciplina}
        </span>
        <div style={styles.aiBadge}>
          <Bot size={14} style={{ marginRight: "4px" }} />
          {data.modelo_ia}
        </div>
      </div>

      <div style={styles.cardBody}>
        {/* Correção de Texto Longo */}
        <h3
          style={{
            ...styles.cardTitle,
            fontSize: isMobile ? "16px" : "17px",
            wordBreak: "break-word",
          }}
        >
          {data.titulo}
        </h3>
        <p style={styles.cardSummary}>{data.resumo}</p>
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.categoryInfo}>
          <Tag size={16} color="#546E7A" style={{ marginRight: "6px" }} />
          <span style={styles.categoryName}>{data.categoria || "Geral"}</span>
        </div>
        <div style={styles.verifiedBadge}>
          <CheckCircle2 size={18} color="#4CAF50" />
        </div>
      </div>
    </div>
  )
}

// --- ESTILOS ---
const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },
  heroSection: {
    background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(21, 101, 192, 0.15)",
  },
  heroContent: { maxWidth: "700px", width: "100%", margin: "0 auto" },
  heroTitle: { fontWeight: "800", letterSpacing: "-0.5px", margin: 0 },
  heroSubtitle: { fontWeight: "400", margin: 0 },
  searchWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: "50px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    outline: "none",
    color: "#333333",
    boxSizing: "border-box",
    fontWeight: "500",
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#1565C0",
  },
  contentArea: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
  },
  mainCard: {
    width: "100%",
    maxWidth: "1700px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E0E0E0",
    boxSizing: "border-box",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    borderBottom: "1px solid #F0F2F5",
    paddingBottom: "15px",
  },
  sectionTitle: { color: "#1565C0", margin: 0, fontWeight: "800" },
  badgeCount: {
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  grid: {
    display: "grid",
    gap: "20px",
    border: "none",
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E0E0E0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    cursor: "pointer",
    height: "100%",
    boxSizing: "border-box",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
    border: "1px solid #42A5F5",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    alignItems: "center",
  },
  subjectBadge: {
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  aiBadge: {
    backgroundColor: "#F5F7FA",
    color: "#546E7A",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    border: "1px solid #ECEFF1",
  },
  cardBody: { flex: 1, marginBottom: "16px" },

  // CORREÇÃO DE TEXTO LONGO NO DASHBOARD TAMBÉM
  cardTitle: {
    color: "#101828",
    margin: "0 0 6px 0",
    lineHeight: "1.4",
    fontWeight: "700",
    wordBreak: "break-word",
  },

  cardSummary: {
    fontSize: "13px",
    color: "#667085",
    lineHeight: "1.6",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "14px",
    borderTop: "1px solid #F2F4F7",
  },
  categoryInfo: { display: "flex", alignItems: "center", color: "#546E7A" },
  categoryName: { fontSize: "12px", fontWeight: "600", color: "#344054" },
  verifiedBadge: { display: "flex", alignItems: "center" },
}

export default MainContent
