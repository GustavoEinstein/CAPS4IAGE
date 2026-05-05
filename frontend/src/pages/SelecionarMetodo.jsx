import React from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { ArrowLeft, Keyboard, Bookmark, Mic } from "lucide-react"

const SelecionarMetodo = () => {
  const navigate = useNavigate()
  const { isMobile } = useOutletContext() || { isMobile: false }

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.containerCenter}>
        <button onClick={() => navigate(-1)} style={styles.backButtonSimple}>
          <ArrowLeft size={20} /> Cancelar
        </button>
        <div style={{ ...styles.headerCenter, marginBottom: "40px" }}>
          <h2 style={styles.titleCenter}>Como você deseja catalogar?</h2>
          <p style={styles.subtitleCenter}>Escolha a forma mais confortável para registrar sua atividade.</p>
        </div>
        <div style={{ ...styles.selectionGrid, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
          
          <div style={styles.selectionCard} onClick={() => navigate("/dashboard/catalogar/manual")}>
            <div style={styles.iconCircleBlue}>
              <Keyboard size={32} color="#1565C0" />
            </div>
            <h3 style={styles.cardTitle}>Começar do Zero</h3>
            <p style={styles.cardDesc}>Preencha o formulário detalhado manualmente.</p>
            <span style={styles.fakeLink}>Ir para formulário &rarr;</span>
          </div>

          <div style={{...styles.selectionCard, border: "2px solid #E8F5E9"}} onClick={() => navigate("/dashboard/catalogar/base")}>
            <div style={{...styles.iconCircleBlue, backgroundColor: "#E8F5E9"}}>
              <Bookmark size={32} color="#2E7D32" />
            </div>
            <h3 style={styles.cardTitle}>Basear em Colega</h3>
            <p style={styles.cardDesc}>Use uma prática validada como ponto de partida.</p>
            <span style={{...styles.fakeLink, color: "#2E7D32"}}>Buscar práticas &rarr;</span>
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  fullPageWrapper: { backgroundColor: "#F8F9FA", minHeight: "100vh", width: "100%", boxSizing: "border-box", padding: "20px" },
  container: { maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
  containerCenter: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", width: "100%", maxWidth: "1000px", margin: "0 auto" },
  mainCard: { backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #E0E0E0" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #E0E0E0", width: "100%", boxSizing: "border-box" },
  headerCenter: { textAlign: "center", maxWidth: "600px" },
  titleCenter: { fontSize: "32px", color: "#1565C0", margin: "0 0 10px 0", fontWeight: "800" },
  subtitleCenter: { fontSize: "18px", color: "#546E7A", margin: 0 },
  selectionGrid: { display: "flex", gap: "30px", justifyContent: "center", width: "100%" },
  selectionCard: { flex: 1, backgroundColor: "white", padding: "40px 30px", borderRadius: "20px", border: "1px solid #E0E0E0", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: "280px" },
  iconCircleBlue: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  iconCirclePurple: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" },
  cardTitle: { fontSize: "20px", fontWeight: "700", color: "#333", marginBottom: "15px" },
  cardDesc: { fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "25px", flex: 1 },
  fakeLink: { fontSize: "14px", fontWeight: "700", color: "#1565C0" },
  splitLayout: { display: "flex", gap: "40px" },
  verticalDivider: { width: "1px", backgroundColor: "#F0F0F0", alignSelf: "stretch" },
  leftCol: { display: "flex", flexDirection: "column" },
  rightCol: { display: "flex", flexDirection: "column" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#37474F", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", letterSpacing: "0.5px" },
  inputGroup: { marginBottom: "20px", display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", fontWeight: "600", color: "#455A64", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" },
  input: { width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #CFD8DC", fontSize: "14px", color: "#37474F", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box", height: "45px" },
  textarea: { width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #CFD8DC", fontSize: "14px", color: "#37474F", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" },
  lockedInputWrapper: { display: "flex", alignItems: "center", backgroundColor: "#FAFAFA", border: "1px solid #E0E0E0", borderRadius: "8px", overflow: "hidden", height: "45px" },
  lockedInput: { flex: 1, border: "none", backgroundColor: "transparent", padding: "12px 15px", fontSize: "14px", fontWeight: "600", color: "#78909C", outline: "none", cursor: "not-allowed" },
  resourcesGrid: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" },
  resourceChip: { padding: "8px 14px", borderRadius: "20px", border: "1px solid #CFD8DC", backgroundColor: "#FFFFFF", color: "#546E7A", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center" },
  resourceChipActive: { backgroundColor: "#E3F2FD", color: "#1565C0", borderColor: "#1565C0", fontWeight: "600", boxShadow: "0 2px 5px rgba(21, 101, 192, 0.1)" },
  addResourceRow: { display: "flex", gap: "8px", marginTop: "5px" },
  addButton: { backgroundColor: "#F5F5F5", border: "1px solid #CFD8DC", borderRadius: "8px", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#546E7A", transition: "background 0.2s" },
  customChip: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", backgroundColor: "#FFF3E0", color: "#E65100", border: "1px solid #FFE0B2", fontSize: "12px", fontWeight: "600" },
  removeChipBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#E65100" },
  uploadSection: { marginTop: "auto", paddingTop: "10px" },
  uploadContainer: { border: "2px dashed #BBDEFB", borderRadius: "12px", backgroundColor: "#F8FBFF", textAlign: "center", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "120px" },
  uploadLabel: { cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" },
  uploadIconCircle: { backgroundColor: "white", padding: "10px", borderRadius: "50%", marginBottom: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  uploadTextMain: { fontSize: "13px", fontWeight: "700", color: "#1565C0" },
  fileSelected: { display: "flex", flexDirection: "column", alignItems: "center" },
  fileName: { fontSize: "13px", fontWeight: "600", color: "#333", marginTop: "5px" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap-reverse", gap: "20px" },
  backButton: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#546E7A", fontWeight: "600", fontSize: "15px" },
  backButtonSimple: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#546E7A", fontWeight: "600", fontSize: "15px", marginBottom: "20px", alignSelf: "flex-start" },
  pageTitle: { fontSize: "24px", color: "#1565C0", fontWeight: "800", margin: "0 0 4px 0" },
  pageSubtitle: { fontSize: "14px", color: "#546E7A", margin: 0 },
  gridThree: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "20px" },
  
  formFooter: { marginTop: "40px", display: "flex", justifyContent: "flex-end", gap: "15px", flexWrap: "wrap" },
  draftButton: { backgroundColor: "white", color: "#1565C0", border: "1px solid #1565C0", borderRadius: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" },
  submitButton: { backgroundColor: "#1565C0", color: "white", border: "none", borderRadius: "8px", padding: "12px 30px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(21, 101, 192, 0.25)", transition: "transform 0.2s" },

  voiceContainer: { display: "flex", flexDirection: "column", alignItems: "center" },
  voiceHeader: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" },
  micWrapper: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginBottom: "30px" },
  micButton: { width: "100px", height: "100px", borderRadius: "50%", border: "4px solid", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  micStatus: { fontWeight: "600", color: "#555" },
  transcriptionBox: { width: "100%", maxWidth: "600px", height: "150px", backgroundColor: "#F9FAFB", border: "1px dashed #CCC", borderRadius: "12px", padding: "20px", overflowY: "auto", marginBottom: "30px" },
  errorBox: { width: "100%", maxWidth: "700px", backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", borderRadius: "10px", padding: "10px 12px", margin: "8px 0 16px", fontSize: "14px" },
  warningBox: { width: "100%", maxWidth: "700px", backgroundColor: "#FFF8E1", border: "1px solid #FFE082", color: "#8D6E00", borderRadius: "10px", padding: "10px 12px", margin: "8px 0 8px", fontSize: "14px" },
  reviewBox: { width: "100%", maxWidth: "700px", backgroundColor: "#F4F9FF", border: "1px solid #D6E8FF", borderRadius: "12px", padding: "16px", marginBottom: "18px" },
  reviewLine: { margin: "4px 0", color: "#455A64", fontSize: "14px" },
  talkingPoints: { width: "100%", maxWidth: "700px", backgroundColor: "#F8EAF6", border: "1px solid #E1BEE7", borderRadius: "12px", padding: "16px", margin: "10px auto 24px" },
  talkingList: { margin: "8px 0 0", paddingLeft: "18px", color: "#4A148C", lineHeight: 1.6, fontSize: "14px" },
  footerActions: { display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "20px", borderTop: "1px solid #EEE", paddingTop: "20px", width: "100%" },
  buttonCancel: { padding: "12px 24px", backgroundColor: "transparent", color: "#546E7A", border: "1px solid #CFD8DC", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "15px" },
  button: { padding: "12px 24px", backgroundColor: "#1565C0", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", fontSize: "15px" },
  clearButton: { padding: "10px 20px", backgroundColor: "transparent", color: "#D32F2F", border: "1px solid #FFCDD2", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center" }
}

export default SelecionarMetodo