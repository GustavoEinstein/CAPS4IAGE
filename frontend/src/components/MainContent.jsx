import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useOutletContext, useNavigate } from "react-router-dom"
import {
  Search,
  Bot,
  CheckCircle2,
  BookOpen,
  Tag,
  User,
  Link as LinkIcon,
} from "lucide-react"

const MainContent = () => {
  const { isMobile } = useOutletContext() || { isMobile: false }
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [producoes, setProducoes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
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

      <div
        style={{
          ...styles.contentArea,
          padding: isMobile ? "0 15px 40px 15px" : "0 30px 60px 30px",
        }}
      >
        <div
          style={{ ...styles.mainCard, padding: isMobile ? "20px" : "30px" }}
        >
          <div style={styles.sectionHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen size={22} color="var(--text-info)" />
              <h2
                style={{
                  ...styles.sectionTitle,
                  fontSize: isMobile ? "18px" : "22px",
                }}
              >
                Acervo da Comunidade
              </h2>
            </div>
            <span style={styles.badgeCount}>{filteredProducoes.length}</span>
          </div>

          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
                color: "var(--text-muted)",
              }}
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
                    color: "var(--text-muted)",
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

const Card = ({ data, isMobile, navigate }) => {
  const [isHovered, setIsHovered] = useState(false)
  const handleCardClick = () => navigate(`/dashboard/producao/${data.id}`)

  // Verifica se a prática atual foi marcada como anônima ou não
  const isAnonymous = data.autor === "Professor(a) Anônimo(a)"

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
        <span style={styles.subjectBadge}>{data.disciplina}</span>
        <div style={styles.aiBadge}>
          <Bot size={14} style={{ marginRight: "4px" }} /> {data.modelo_ia}
        </div>
      </div>

      <div style={styles.cardBody}>
        <h3
          style={{
            ...styles.cardTitle,
            fontSize: isMobile ? "16px" : "17px",
            wordBreak: "break-word",
          }}
        >
          {data.titulo}
        </h3>

        {/* --- NOVO: EXIBIÇÃO DE AUTOR --- */}
        <div
          style={{
            ...styles.authorText,
            color: isAnonymous
              ? "var(--text-warning)"
              : "var(--text-secondary)",
          }}
        >
          <User size={12} style={{ marginRight: "4px" }} />
          {data.autor}
        </div>

        {/* --- NOVO: TAG DE RELEITURA DE COLEGA --- */}
        {data.producao_base && (
          <div style={styles.releituraTag}>
            <LinkIcon size={12} style={{ marginRight: "4px" }} />
            Releitura
          </div>
        )}

        <p style={styles.cardSummary}>{data.resumo}</p>
      </div>
      <div style={styles.cardFooter}>
        <div style={styles.categoryInfo}>
          <Tag
            size={16}
            color="var(--text-muted)"
            style={{ marginRight: "6px" }}
          />
          <span style={styles.categoryName}>{data.categoria || "Geral"}</span>
        </div>
        <div style={styles.verifiedBadge}>
          <CheckCircle2 size={18} color="var(--text-success)" />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },
  heroSection: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)", // Atualizado para os tons institucionais
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.15)",
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
    backgroundColor: "var(--bg-card)",
    borderRadius: "50px",
    border: "1px solid var(--border-color)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    outline: "none",
    color: "var(--input-text)",
    boxSizing: "border-box",
    fontWeight: "500",
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-info)",
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
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--border-color)",
    boxSizing: "border-box",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "15px",
  },
  sectionTitle: { color: "var(--text-primary)", margin: 0, fontWeight: "800" },
  badgeCount: {
    backgroundColor: "var(--bg-info)",
    color: "var(--text-info)",
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
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
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
    border: "1px solid var(--text-info)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    alignItems: "center",
  },
  subjectBadge: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-primary)",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  aiBadge: {
    backgroundColor: "var(--bg-main)",
    color: "var(--text-muted)",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
  },
  cardBody: { flex: 1, marginBottom: "16px" },
  cardTitle: {
    color: "var(--text-primary)",
    margin: "0 0 6px 0",
    lineHeight: "1.4",
    fontWeight: "700",
  },
  authorText: {
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  releituraTag: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "var(--bg-info)",
    color: "var(--text-info)",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    marginBottom: "12px",
    border: "1px dashed var(--text-info)",
  },
  cardSummary: {
    fontSize: "13px",
    color: "var(--text-secondary)",
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
    borderTop: "1px solid var(--border-color)",
  },
  categoryInfo: {
    display: "flex",
    alignItems: "center",
    color: "var(--text-secondary)",
  },
  categoryName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  verifiedBadge: { display: "flex", alignItems: "center" },
}

export default MainContent
