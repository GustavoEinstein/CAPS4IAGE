import React, { useEffect, useState } from "react"
import api from "../services/api"
import { useNavigate, useOutletContext } from "react-router-dom"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"
import { processTranscript } from "../services/aiProcessing"
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Lock,
  BookOpen,
  Wrench,
  Clock,
  Package,
  Lightbulb,
  Target,
  FileText,
  CheckCircle2,
  Layers,
  Plus,
  X,
  Mic,
  Keyboard,
  Sparkles,
  Volume2,
  Trash2,
  Check,
} from "lucide-react"

const CatalogarProducoes = () => {
  const [mode, setMode] = useState("selecao")
  const [voiceDraft, setVoiceDraft] = useState(null)
  const navigate = useNavigate()
  const { isMobile } = useOutletContext() || { isMobile: false }

  if (mode === "selecao")
    return (
      <SelectionScreen
        onSelect={setMode}
        isMobile={isMobile}
        navigate={navigate}
      />
    )
  if (mode === "manual")
    return (
      <ManualFormSplit
        onBack={() => setMode("selecao")}
        navigate={navigate}
        isMobile={isMobile}
        initialData={voiceDraft}
      />
    )
  if (mode === "voz")
    return (
      <VoiceFormV2
        onBack={() => setMode("selecao")}
        onUseDraft={(draft) => {
          setVoiceDraft(draft)
          setMode("manual")
        }}
        isMobile={isMobile}
      />
    )
  return null
}

// --- 1. TELA DE SELEÇÃO ---
const SelectionScreen = ({ onSelect, isMobile, navigate }) => {
  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.containerCenter}>
        <button onClick={() => navigate(-1)} style={styles.backButtonSimple}>
          <ArrowLeft size={20} /> Cancelar
        </button>
        <div style={{ ...styles.headerCenter, marginBottom: "40px" }}>
          <h2 style={styles.titleCenter}>Como você deseja catalogar?</h2>
          <p style={styles.subtitleCenter}>
            Escolha a forma mais confortável para registrar sua atividade.
          </p>
        </div>
        <div
          style={{
            ...styles.selectionGrid,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={styles.selectionCard} onClick={() => onSelect("manual")}>
            <div style={styles.iconCircleBlue}>
              <Keyboard size={32} color="#1565C0" />
            </div>
            <h3 style={styles.cardTitle}>Preenchimento Manual</h3>
            <p style={styles.cardDesc}>
              Preencha o formulário detalhado com duas colunas.
            </p>
            <span style={styles.fakeLink}>Ir para formulário &rarr;</span>
          </div>
          {/** --- CARTÃO DE VOZ Destativado ---
          <div style={styles.selectionCardAi} onClick={() => onSelect("voz")}>
            <div style={styles.iconCirclePurple}>
              <Mic size={32} color="#7B1FA2" />
            </div>
            <h3 style={styles.cardTitle}>Catalogar por Voz</h3>
            <p style={styles.cardDesc}>
              Fale sua prática e preencha o formulário automaticamente para revisar.
            </p>
            <span style={{ ...styles.fakeLink, color: "#7B1FA2" }}>
              Iniciar gravação &rarr;
            </span>
          </div> 
          */}
        </div>
      </div>
    </div>
  )
}

// --- 2. FORMULÁRIO MANUAL (CORRIGIDO) ---
const ManualFormSplit = ({ onBack, navigate, isMobile, initialData }) => {
  const storedDisc = localStorage.getItem("user_disciplina") || "Geral"
  const getInitialFormData = () => ({
    titulo: "",
    disciplina: storedDisc !== "Outra" ? storedDisc : "Geral",
    nivel: "",
    modelo_ia: "",
    categoria: "",
    bncc: "",
    metodologia: "",
    duracao: "",
    recursos: [],
    experiencia: "",
    resultados: "",
    arquivo: null,
  })

  const [formData, setFormData] = useState(getInitialFormData)
  const [customResource, setCustomResource] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!initialData) return
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      disciplina:
        initialData.disciplina && initialData.disciplina !== "Outra"
          ? initialData.disciplina
          : prev.disciplina,
      recursos: Array.isArray(initialData.recursos)
        ? initialData.recursos
        : prev.recursos,
      arquivo: null,
    }))
  }, [initialData])

  const RECURSOS_COMUNS = [
    "Projetor / Datashow",
    "Internet / Wi-Fi",
    "Celulares (BYOD)",
    "Laboratório de Informática",
    "Tablets",
    "Quadro Branco",
    "IA Generativa",
    "Jogos",
    "Livro Didático",
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, arquivo: e.target.files[0] }))
  }

  const toggleRecurso = (recurso) => {
    setFormData((prev) => {
      const exists = prev.recursos.includes(recurso)
      return exists
        ? { ...prev, recursos: prev.recursos.filter((r) => r !== recurso) }
        : { ...prev, recursos: [...prev.recursos, recurso] }
    })
  }

  const addCustomResource = (e) => {
    if ((e.key === "Enter" || e.type === "click") && customResource.trim()) {
      e.preventDefault()
      const val = customResource.trim()
      if (RECURSOS_COMUNS.includes(val) && !formData.recursos.includes(val)) {
        setFormData((prev) => ({ ...prev, recursos: [...prev.recursos, val] }))
      } else if (!formData.recursos.includes(val)) {
        setFormData((prev) => ({ ...prev, recursos: [...prev.recursos, val] }))
      }
      setCustomResource("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = "api/production/create/"
      const dataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key === "recursos")
          formData.recursos.forEach((r) => dataToSend.append("recursos", r))
        else if (key === "arquivo" && formData.arquivo)
          dataToSend.append("arquivo", formData.arquivo)
        else if (key === "nivel")
          dataToSend.append("nivel_ensino", formData.nivel)
        else dataToSend.append(key, formData[key])
      })
      await api.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert("Prática enviada com sucesso!")
      navigate("/dashboard/minhas-producoes")
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button onClick={onBack} style={styles.backButton}>
            <ArrowLeft size={20} /> Voltar
          </button>
          <div style={{ textAlign: isMobile ? "left" : "right" }}>
            <h1 style={styles.pageTitle}>Detalhes da Prática</h1>
            <p style={styles.pageSubtitle}>
              Revise os dados da sua catalogação.
            </p>
          </div>
        </div>

        <div style={styles.mainCard}>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                ...styles.splitLayout,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              {/* ESQUERDA */}
              <div
                style={{ ...styles.leftCol, width: isMobile ? "100%" : "35%" }}
              >
                <h3 style={styles.sectionTitle}>
                  <FileText size={20} color="#1565C0" /> Ficha Técnica
                </h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    placeholder="Ex: Dilemas Éticos"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Disciplina</label>
                  <div style={styles.lockedInputWrapper}>
                    <Lock
                      size={16}
                      color="#78909C"
                      style={{ marginLeft: "12px" }}
                    />
                    <input
                      type="text"
                      value={formData.disciplina}
                      readOnly
                      style={styles.lockedInput}
                    />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nível</label>
                  <select
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Fundamental 1">Fundamental 1</option>
                    <option value="Fundamental 2">Fundamental 2</option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Ensino Superior">Ensino Superior</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Layers size={14} /> Conteúdo Gerado
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">O que a IA ajudou a criar?</option>
                    <optgroup label="Planejamento">
                      <option value="Plano de Aula">
                        Plano de Aula / Roteiro
                      </option>
                      <option value="Sequência Didática">
                        Sequência Didática
                      </option>
                      <option value="Rubrica de Avaliação">
                        Rubrica de Avaliação
                      </option>
                    </optgroup>
                    <optgroup label="Recursos Didáticos">
                      <option value="Texto de Apoio">
                        Texto de Apoio / Artigo
                      </option>
                      <option value="Slide / Apresentação">
                        Slide / Apresentação
                      </option>
                      <option value="Lista de Exercícios">
                        Lista de Exercícios
                      </option>
                      <option value="Quiz / Questões">
                        Quiz / Banco de Questões
                      </option>
                      <option value="Imagens / Vídeos">Imagens / Vídeos</option>
                    </optgroup>
                    <optgroup label="Atividades Práticas">
                      <option value="Estudo de Caso">Estudo de Caso</option>
                      <option value="Simulação / Roleplay">
                        Simulação / Roleplay
                      </option>
                      <option value="Prompt para Alunos">
                        Prompt para Alunos
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Modelo de IA</label>
                  <input
                    type="text"
                    name="modelo_ia"
                    value={formData.modelo_ia}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    placeholder="Ex: ChatGPT-4"
                  />
                </div>
                <div style={styles.uploadSection}>
                  <label style={styles.label}>
                    <UploadCloud size={16} /> Anexar
                  </label>
                  <div style={styles.uploadContainer}>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="file-upload" style={styles.uploadLabel}>
                      {formData.arquivo ? (
                        <div style={styles.fileSelected}>
                          <CheckCircle2 size={28} color="#4CAF50" />
                          <span style={styles.fileName}>
                            {formData.arquivo.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div style={styles.uploadIconCircle}>
                            <UploadCloud size={20} color="#1565C0" />
                          </div>
                          <span style={styles.uploadTextMain}>
                            Carregar Arquivo
                          </span>
                          <p
                            style={{
                              fontSize: "11px",
                              color: "#78909C",
                              marginTop: "8px",
                              lineHeight: "1.4",
                            }}
                          >
                            <strong>Formatos aceitos:</strong> PDF, Word,
                            PowerPoint, Excel, Imagens e TXT.
                            <br />
                            <strong>Tamanho máximo:</strong> 60MB.
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {!isMobile && <div style={styles.verticalDivider}></div>}

              {/* DIREITA */}
              <div
                style={{ ...styles.rightCol, width: isMobile ? "100%" : "65%" }}
              >
                <h3 style={styles.sectionTitle}>
                  <BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico
                </h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>BNCC / Objetivos</label>
                  <textarea
                    name="bncc"
                    value={formData.bncc}
                    onChange={handleChange}
                    style={styles.textarea}
                    rows="2"
                    required
                    placeholder="Cite os códigos e objetivos..."
                  />
                </div>
                <div style={styles.gridThree}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Wrench size={14} /> Metodologia
                    </label>
                    <input
                      type="text"
                      name="metodologia"
                      value={formData.metodologia}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ex: Sala Invertida"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Clock size={14} /> Duração
                    </label>
                    <input
                      type="text"
                      name="duracao"
                      value={formData.duracao}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ex: 50 min"
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Package size={14} /> Recursos (Clique para selecionar)
                  </label>

                  <div style={styles.resourcesGrid}>
                    {RECURSOS_COMUNS.map((res) => {
                      const isSelected = formData.recursos.includes(res)
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => toggleRecurso(res)}
                          style={{
                            ...styles.resourceChip,
                            ...(isSelected ? styles.resourceChipActive : {}),
                          }}
                        >
                          {res}
                          {isSelected && (
                            <Check size={14} style={{ marginLeft: "4px" }} />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* --- INPUT E BOTÃO CORRIGIDOS --- */}
                  <div style={styles.addResourceRow}>
                    <input
                      type="text"
                      placeholder="Outro recurso (Digite e pressione Enter)..."
                      value={customResource}
                      onChange={(e) => setCustomResource(e.target.value)}
                      onKeyDown={addCustomResource}
                      // Agora usa styles.input para ser IDÊNTICO aos outros
                      style={{ ...styles.input, flex: 1 }}
                    />
                  </div>

                  {formData.recursos.some(
                    (r) => !RECURSOS_COMUNS.includes(r),
                  ) && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {formData.recursos
                        .filter((r) => !RECURSOS_COMUNS.includes(r))
                        .map((res, i) => (
                          <span key={i} style={styles.customChip}>
                            {res}{" "}
                            <button
                              type="button"
                              onClick={() => toggleRecurso(res)}
                              style={styles.removeChipBtn}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Lightbulb size={14} /> Relato da Experiência
                  </label>
                  <textarea
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    style={{ ...styles.textarea, minHeight: "100px" }}
                    required
                    placeholder="Descreva como foi a aplicação em sala..."
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Target size={14} /> Resultados
                  </label>
                  <textarea
                    name="resultados"
                    value={formData.resultados}
                    onChange={handleChange}
                    style={styles.textarea}
                    rows="2"
                    required
                    placeholder="Quais foram as evidências de aprendizagem?"
                  />
                </div>
                <div style={styles.formFooter}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={styles.submitButton}
                  >
                    <Save size={18} />{" "}
                    {isSubmitting
                      ? "Enviando..."
                      : "Enviar Prática para Revisão"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// --- 3. TELA DE VOZ ---
const VoiceFormV2 = ({ onBack, onUseDraft }) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    browserWarning,
    toggleListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: "pt-BR",
    continuous: true,
    interimResults: true,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const [aiError, setAiError] = useState("")

  const processWithAI = async () => {
    const full = `${transcript} ${interimTranscript}`.trim()
    if (!full) {
      setAiError("Grave algo antes de processar.")
      return
    }

    setAiError("")
    setIsProcessing(true)
    try {
      const storedDisc = localStorage.getItem("user_disciplina") || "Geral"
      const processed = await processTranscript(full, {
        disciplina: storedDisc !== "Outra" ? storedDisc : "Geral",
      })
      setProcessedData(processed)
    } catch (e) {
      setAiError(e.message || "Falha ao processar transcricao.")
    } finally {
      setIsProcessing(false)
    }
  }

  const fullTranscript = `${transcript}${interimTranscript}`

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} /> Voltar para seleção
        </button>
        <div style={styles.voiceContainer}>
          <div style={styles.voiceHeader}>
            <div style={styles.iconCirclePurple}>
              <Sparkles size={24} color="#7B1FA2" />
            </div>
            <h2
              style={{
                ...styles.titleCenter,
                fontSize: "24px",
                color: "#4A148C",
              }}
            >
              Entrevista com a IA
            </h2>
          </div>
          <p
            style={{
              ...styles.subtitleCenter,
              maxWidth: "600px",
              margin: "0 auto 20px auto",
            }}
          >
            Clique no microfone e descreva sua pratica. Depois processe e
            aplique no formulario manual.
          </p>

          <div style={styles.talkingPoints}>
            <p style={{ margin: 0, color: "#7B1FA2", fontWeight: "700" }}>
              Dicas para melhorar o reconhecimento de voz:
            </p>
            <ul style={styles.talkingList}>
              <li>Fale pausado e em frases curtas.</li>
              <li>
                Dite siglas por extenso: "I A" e tambem "inteligencia
                artificial".
              </li>
              <li>
                Fale os campos em ordem: titulo, nivel, categoria, metodologia,
                resultados.
              </li>
              <li>
                Repita termos-chave importantes (ex.: BNCC, ChatGPT, rubrica)
                duas vezes.
              </li>
              <li>Se errar uma frase, pare e repita do inicio da frase.</li>
            </ul>
          </div>

          {!isSupported && (
            <div style={styles.errorBox}>
              Seu navegador nao suporta reconhecimento de voz. Use Chrome, Edge
              ou Safari.
            </div>
          )}

          {!!browserWarning && (
            <div style={styles.warningBox}>{browserWarning}</div>
          )}

          {(error || aiError) && (
            <div style={styles.errorBox}>{error || aiError}</div>
          )}

          <div style={styles.micWrapper}>
            <button
              onClick={toggleListening}
              disabled={!isSupported || isProcessing}
              style={{
                ...styles.micButton,
                backgroundColor: isListening ? "#FFEBEE" : "#F3E5F5",
                borderColor: isListening ? "#EF5350" : "#E1BEE7",
                transform: isListening ? "scale(1.1)" : "scale(1)",
                opacity: !isSupported || isProcessing ? 0.5 : 1,
              }}
            >
              <Mic size={48} color={isListening ? "#D32F2F" : "#7B1FA2"} />
            </button>
            <p style={styles.micStatus}>
              {isListening ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Volume2 size={18} /> Gravando... (toque para parar)
                </span>
              ) : (
                "Toque para falar"
              )}
            </p>
          </div>
          <div style={styles.transcriptionBox}>
            {fullTranscript ? (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {transcript}
                {interimTranscript && (
                  <span style={{ color: "#999", fontStyle: "italic" }}>
                    {interimTranscript}
                  </span>
                )}
              </p>
            ) : (
              <p style={{ color: "#999" }}>Sua transcrição aparecerá aqui...</p>
            )}
          </div>

          {!!transcript && !isListening && (
            <button onClick={resetTranscript} style={styles.clearButton}>
              <Trash2 size={16} style={{ marginRight: "6px" }} /> Limpar
              transcricao
            </button>
          )}

          {processedData && (
            <div style={styles.reviewBox}>
              <h4 style={{ margin: "0 0 10px", color: "#37474F" }}>
                Dados extraidos
              </h4>
              <p style={styles.reviewLine}>
                <strong>Titulo:</strong> {processedData.titulo}
              </p>
              <p style={styles.reviewLine}>
                <strong>Nivel:</strong> {processedData.nivel || "-"}
              </p>
              <p style={styles.reviewLine}>
                <strong>Categoria:</strong> {processedData.categoria || "-"}
              </p>
              <p style={styles.reviewLine}>
                <strong>Metodologia:</strong> {processedData.metodologia || "-"}
              </p>
              <p style={styles.reviewLine}>
                <strong>Modelo IA:</strong> {processedData.modelo_ia || "-"}
              </p>
              <button
                style={{
                  ...styles.button,
                  backgroundColor: "#2E7D32",
                  marginTop: "12px",
                }}
                onClick={() => onUseDraft(processedData)}
              >
                <Check size={18} style={{ marginRight: "8px" }} />
                Aplicar no formulario
              </button>
            </div>
          )}

          <div style={styles.footerActions}>
            <button style={styles.buttonCancel} onClick={onBack}>
              Cancelar
            </button>
            <button
              style={{
                ...styles.button,
                backgroundColor: "#7B1FA2",
                opacity: !transcript || isListening || isProcessing ? 0.5 : 1,
              }}
              onClick={processWithAI}
              disabled={!transcript || isListening || isProcessing}
            >
              <Sparkles size={18} style={{ marginRight: "8px" }} />
              {isProcessing ? "Processando..." : "Processar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- ESTILOS ATUALIZADOS ---
const styles = {
  fullPageWrapper: {
    backgroundColor: "#F8F9FA",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "20px",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  containerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "40px",
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid #E0E0E0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #E0E0E0",
    width: "100%",
    boxSizing: "border-box",
  },

  headerCenter: { textAlign: "center", maxWidth: "600px" },
  titleCenter: {
    fontSize: "32px",
    color: "#1565C0",
    margin: "0 0 10px 0",
    fontWeight: "800",
  },
  subtitleCenter: { fontSize: "18px", color: "#546E7A", margin: 0 },
  selectionGrid: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    width: "100%",
  },
  selectionCard: {
    flex: 1,
    backgroundColor: "white",
    padding: "40px 30px",
    borderRadius: "20px",
    border: "1px solid #E0E0E0",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minWidth: "280px",
  },
  selectionCardAi: {
    flex: 1,
    backgroundColor: "#F3E5F5",
    padding: "40px 30px",
    borderRadius: "20px",
    border: "1px solid #E1BEE7",
    boxShadow: "0 4px 15px rgba(123, 31, 162, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minWidth: "280px",
    position: "relative",
  },
  iconCircleBlue: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#E3F2FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  iconCirclePurple: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "15px",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    marginBottom: "25px",
    flex: 1,
  },
  fakeLink: { fontSize: "14px", fontWeight: "700", color: "#1565C0" },

  splitLayout: { display: "flex", gap: "40px" },
  verticalDivider: {
    width: "1px",
    backgroundColor: "#F0F0F0",
    alignSelf: "stretch",
  },
  leftCol: { display: "flex", flexDirection: "column" },
  rightCol: { display: "flex", flexDirection: "column" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#37474F",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  inputGroup: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#455A64",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  // --- ESTILO DOS INPUTS (Aplicado agora no campo de recurso também) ---
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    fontSize: "14px",
    color: "#37474F",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    height: "45px", // Altura fixa para garantir alinhamento
  },

  textarea: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #CFD8DC",
    fontSize: "14px",
    color: "#37474F",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.5",
  },
  lockedInputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    overflow: "hidden",
    height: "45px",
  },
  lockedInput: {
    flex: 1,
    border: "none",
    backgroundColor: "transparent",
    padding: "12px 15px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#78909C",
    outline: "none",
    cursor: "not-allowed",
  },

  // --- ESTILO DE CHIPS (RECURSOS) CORRIGIDO ---
  resourcesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
  },

  resourceChip: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #CFD8DC", // Borda fixa para não sumir
    backgroundColor: "#FFFFFF",
    color: "#546E7A",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
  },

  resourceChipActive: {
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
    borderColor: "#1565C0", // Muda apenas a cor da borda
    fontWeight: "600",
    boxShadow: "0 2px 5px rgba(21, 101, 192, 0.1)",
  },

  // --- BOTÃO DE ADICIONAR CORRIGIDO ---
  addResourceRow: { display: "flex", gap: "8px", marginTop: "5px" },

  addButton: {
    backgroundColor: "#F5F5F5",
    border: "1px solid #CFD8DC",
    borderRadius: "8px",
    width: "45px", // Largura combinando com altura do input
    height: "45px", // Altura combinando com input
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#546E7A",
    transition: "background 0.2s",
  },

  customChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#FFF3E0",
    color: "#E65100",
    border: "1px solid #FFE0B2",
    fontSize: "12px",
    fontWeight: "600",
  },
  removeChipBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    color: "#E65100",
  },

  uploadSection: { marginTop: "auto", paddingTop: "10px" },
  uploadContainer: {
    border: "2px dashed #BBDEFB",
    borderRadius: "12px",
    backgroundColor: "#F8FBFF",
    textAlign: "center",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "120px",
  },
  uploadLabel: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  uploadIconCircle: {
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "50%",
    marginBottom: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  uploadTextMain: { fontSize: "13px", fontWeight: "700", color: "#1565C0" },
  fileSelected: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    marginTop: "5px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap-reverse",
    gap: "20px",
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#546E7A",
    fontWeight: "600",
    fontSize: "15px",
  },
  backButtonSimple: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#546E7A",
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  pageTitle: {
    fontSize: "24px",
    color: "#1565C0",
    fontWeight: "800",
    margin: "0 0 4px 0",
  },
  pageSubtitle: { fontSize: "14px", color: "#546E7A", margin: 0 },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
  },
  formFooter: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
  },
  submitButton: {
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 40px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(21, 101, 192, 0.25)",
    transition: "transform 0.2s",
  },

  voiceContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  voiceHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  micWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },
  micButton: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "4px solid",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  micStatus: { fontWeight: "600", color: "#555" },
  transcriptionBox: {
    width: "100%",
    maxWidth: "600px",
    height: "150px",
    backgroundColor: "#F9FAFB",
    border: "1px dashed #CCC",
    borderRadius: "12px",
    padding: "20px",
    overflowY: "auto",
    marginBottom: "30px",
  },
  errorBox: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#FFEBEE",
    border: "1px solid #FFCDD2",
    color: "#C62828",
    borderRadius: "10px",
    padding: "10px 12px",
    margin: "8px 0 16px",
    fontSize: "14px",
  },
  warningBox: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#FFF8E1",
    border: "1px solid #FFE082",
    color: "#8D6E00",
    borderRadius: "10px",
    padding: "10px 12px",
    margin: "8px 0 8px",
    fontSize: "14px",
  },
  reviewBox: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#F4F9FF",
    border: "1px solid #D6E8FF",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "18px",
  },
  reviewLine: {
    margin: "4px 0",
    color: "#455A64",
    fontSize: "14px",
  },
  talkingPoints: {
    width: "100%",
    maxWidth: "700px",
    backgroundColor: "#F8EAF6",
    border: "1px solid #E1BEE7",
    borderRadius: "12px",
    padding: "16px",
    margin: "10px auto 24px",
  },
  talkingList: {
    margin: "8px 0 0",
    paddingLeft: "18px",
    color: "#4A148C",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  footerActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "20px",
    borderTop: "1px solid #EEE",
    paddingTop: "20px",
    width: "100%",
  },
  buttonCancel: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#546E7A",
    border: "1px solid #CFD8DC",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "15px",
  },
  clearButton: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#D32F2F",
    border: "1px solid #FFCDD2",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
}

export default CatalogarProducoes
