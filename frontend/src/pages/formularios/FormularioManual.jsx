import React, { useEffect, useState } from "react"
import api from "../../services/api"
import { useNavigate, useOutletContext, useLocation } from "react-router-dom"
import Swal from "sweetalert2"
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
  X,
  Bookmark,
  Send,
  Check,
  Link,
  Cpu,
} from "lucide-react"

import bnccMat from "../../data/bncc_mat.json"
import bnccPort from "../../data/bncc_port.json"
import bnccComp from "../../data/bncc_comp.json"

// --- SEPARAÇÃO DAS BASES DE DADOS ---
const BNCC_GERAL = [...bnccMat, ...bnccPort, ...bnccComp]
const BNCC_COMPUTACAO = [...bnccComp]

const FormularioManual = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile } = useOutletContext() || { isMobile: false }

  const storedDisc = localStorage.getItem("user_disciplina") || "Geral"

  // 1. INICIALIZAÇÃO INTELIGENTE DO STATE
  const [formData, setFormData] = useState(() => {
    if (location.state?.baseData) {
      const base = location.state.baseData
      return {
        ...base,
        titulo: `Derivação: ${base.titulo}`,
        disciplina:
          base.disciplina && base.disciplina !== "Outra"
            ? base.disciplina
            : storedDisc,
        producao_base: base.id,
        arquivo: null,
        recursos: Array.isArray(base.recursos)
          ? base.recursos
          : typeof base.recursos === "string"
            ? base.recursos.split(",").map((r) => r.trim())
            : [],
        link_material: base.link_material || "",
      }
    }

    return {
      titulo: "",
      disciplina: storedDisc !== "Outra" ? storedDisc : "Geral",
      nivel: "",
      modelo_ia: "",
      prompts_ia: "",
      categoria: "",
      bncc: "",
      bncc_computacao: "",
      metodologia: "",
      duracao: "",
      recursos: [],
      experiencia: "",
      resultados: "",
      arquivo: null,
      producao_base: "",
      link_material: "",
    }
  })

  const [customResource, setCustomResource] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Controle para exibir o bloco de Computação
  const [mostrarCampoComp, setMostrarCampoComp] = useState(() => {
    return formData.bncc_computacao ? true : false
  })

  // --- ESTADOS DO AUTOCOMPLETE BNCC GERAL ---
  const [bnccBuscaGeral, setBnccBuscaGeral] = useState("")
  const [mostrarOpcoesGeral, setMostrarOpcoesGeral] = useState(false)

  const bnccFiltradasGeral = BNCC_GERAL.filter(
    (item) =>
      item.id.toLowerCase().includes(bnccBuscaGeral.toLowerCase()) ||
      item.texto.toLowerCase().includes(bnccBuscaGeral.toLowerCase()),
  ).slice(0, 5)

  const adicionarBnccGeral = (item) => {
    const novaCompetencia = `${item.id}: ${item.texto}`
    const textoAtual = formData.bncc ? `\n${formData.bncc}` : ""
    setFormData((prev) => ({ ...prev, bncc: novaCompetencia + textoAtual }))
    setBnccBuscaGeral("")
    setMostrarOpcoesGeral(false)
  }

  // --- ESTADOS DO AUTOCOMPLETE BNCC COMPUTAÇÃO ---
  const [bnccBuscaComp, setBnccBuscaComp] = useState("")
  const [mostrarOpcoesComp, setMostrarOpcoesComp] = useState(false)

  const bnccFiltradasComp = BNCC_COMPUTACAO.filter(
    (item) =>
      item.id.toLowerCase().includes(bnccBuscaComp.toLowerCase()) ||
      item.texto.toLowerCase().includes(bnccBuscaComp.toLowerCase()),
  ).slice(0, 5)

  const adicionarBnccComp = (item) => {
    const novaCompetencia = `${item.id}: ${item.texto}`
    const textoAtual = formData.bncc_computacao
      ? `\n${formData.bncc_computacao}`
      : ""
    setFormData((prev) => ({
      ...prev,
      bncc_computacao: novaCompetencia + textoAtual,
    }))
    setBnccBuscaComp("")
    setMostrarOpcoesComp(false)
  }

  // Função para alternar o checkbox de interdisciplinaridade
  const handleToggleComp = () => {
    const newValue = !mostrarCampoComp
    setMostrarCampoComp(newValue)
    if (!newValue) {
      setFormData((prev) => ({ ...prev, bncc_computacao: "" }))
    }
  }

  // 2. RECUPERADOR DE RASCUNHO (Auto-Save)
  useEffect(() => {
    if (!location.state?.baseData) {
      const savedDraft = localStorage.getItem("producao_autosave_draft")
      if (savedDraft) {
        Swal.fire({
          title: "Rascunho Encontrado!",
          text: "Deseja restaurar os dados não salvos da última vez?",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
          confirmButtonColor: "#1565C0",
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const draftData = JSON.parse(savedDraft)
              setFormData((prev) => ({
                ...prev,
                ...draftData,
                arquivo: null,
              }))
              if (draftData.bncc_computacao) setMostrarCampoComp(true)
            } catch (e) {}
          } else {
            localStorage.removeItem("producao_autosave_draft")
          }
        })
      }
    }
  }, [location.state])

  // 3. GATILHO DE SALVAMENTO AUTOMÁTICO LOCAL
  useEffect(() => {
    const { arquivo, ...dataToSave } = formData
    if (dataToSave.titulo || dataToSave.experiencia || dataToSave.bncc) {
      localStorage.setItem(
        "producao_autosave_draft",
        JSON.stringify(dataToSave),
      )
    }
  }, [formData])

  const RECURSOS_COMUNS = [
    "Projetor",
    "Internet / Wi-Fi",
    "Celulares (BYOD)",
    "Laboratório de Informática",
    "Tablets",
    "Quadro Branco",
    "IA Generativa",
    "Jogos",
    "Livro Didático",
  ]

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFileChange = (e) =>
    setFormData((prev) => ({ ...prev, arquivo: e.target.files[0] }))

  const toggleRecurso = (recurso) => {
    setFormData((prev) => {
      const currentRecursos = prev.recursos || []
      const exists = currentRecursos.includes(recurso)
      return exists
        ? { ...prev, recursos: currentRecursos.filter((r) => r !== recurso) }
        : { ...prev, recursos: [...currentRecursos, recurso] }
    })
  }

  const addCustomResource = (e) => {
    if ((e.key === "Enter" || e.type === "click") && customResource.trim()) {
      e.preventDefault()
      const val = customResource.trim()
      const currentRecursos = formData.recursos || []
      if (!currentRecursos.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          recursos: [...currentRecursos, val],
        }))
      }
      setCustomResource("")
    }
  }

  const handleSubmit = async (isDraft) => {
    if (
      !isDraft &&
      (!formData.titulo ||
        !formData.nivel ||
        !formData.categoria ||
        !formData.experiencia)
    ) {
      Swal.fire(
        "Campos Incompletos",
        "Preencha Título, Nível, Categoria e Relato para enviar.",
        "warning",
      )
      return
    }
    setIsSubmitting(true)
    try {
      const url = "api/production/create/"
      const dataToSend = new FormData()
      dataToSend.append("is_draft", isDraft)

      Object.keys(formData).forEach((key) => {
        if (key === "recursos") {
          const recArray = formData.recursos || []
          if (recArray.length > 0) {
            dataToSend.append("recursos", recArray.join(", "))
          }
        } else if (key === "arquivo" && formData.arquivo)
          dataToSend.append("arquivo", formData.arquivo)
        else if (key === "nivel")
          dataToSend.append("nivel_ensino", formData.nivel)
        else if (formData[key] !== null && formData[key] !== "")
          dataToSend.append(key, formData[key])
      })

      await api.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      localStorage.removeItem("producao_autosave_draft")

      Swal.fire({
        icon: "success",
        title: isDraft ? "Rascunho Salvo!" : "Prática Enviada!",
        confirmButtonColor: "#1565C0",
      })
      navigate("/dashboard/minhas-producoes")
    } catch (error) {
      console.error(error)
      Swal.fire(
        "Erro",
        "Ocorreu um problema ao salvar. Verifique se os dados estão corretos.",
        "error",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.fullPageWrapper}>
      <style>{`
        input::placeholder, textarea::placeholder {
          color: var(--text-muted) !important;
          opacity: 1 !important;
        }
        ::-webkit-input-placeholder { color: var(--text-muted) !important; opacity: 1 !important; }
        :-moz-placeholder { color: var(--text-muted) !important; opacity: 1 !important; }
        .toggle-box:hover {
            background-color: var(--bg-main) !important;
            border-color: var(--border-hover) !important;
        }
        .autocomplete-item:hover {
            background-color: var(--bg-main) !important;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.topBar}>
          <button
            onClick={() => navigate("/dashboard/catalogar")}
            style={styles.backButton}
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <div style={{ textAlign: isMobile ? "left" : "right" }}>
            <h1 style={styles.pageTitle}>Detalhes da Prática</h1>
          </div>
        </div>

        <div style={styles.mainCard}>
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
              {formData.producao_base && (
                <div
                  style={{
                    backgroundColor: "var(--bg-success)",
                    border: "1px solid var(--border-success)",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    fontSize: "12px",
                    color: "var(--text-success)",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Bookmark size={14} style={{ marginRight: "5px" }} /> Herdando
                  dados de prática existente
                </div>
              )}
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
                  placeholder="Ex: Dilemas Éticos com IA"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Disciplina</label>
                <div style={styles.lockedInputWrapper}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
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
                  <Layers size={14} /> Categoria
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Selecione a categoria</option>
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
                  placeholder="Ex: ChatGPT-4, Gemini, Claude..."
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Prompts Utilizados</label>
                <textarea
                  name="prompts_ia"
                  value={formData.prompts_ia}
                  onChange={handleChange}
                  style={{ ...styles.textarea, minHeight: "80px" }}
                  placeholder="Ex: 'Atue como um professor do ensino médio e crie uma lista de exercícios sobre...'"
                />
              </div>

              <div style={styles.uploadSection}>
                <label style={styles.label}>
                  <UploadCloud size={16} /> Anexar Material
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
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div style={{ ...styles.inputGroup, marginTop: "15px" }}>
                <label style={styles.label}>
                  <Link size={14} /> Link Externo (Opcional)
                </label>
                <input
                  type="url"
                  name="link_material"
                  value={formData.link_material}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Ex: https://youtu.be/..."
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Caso o material seja muito pesado (ex: vídeos {">"} 50MB),
                  cole o link do YouTube ou Drive aqui.
                </span>
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

              {/* BNCC GERAL (Matemática e Português) */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>BNCC / Objetivos</label>
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="🔍 Busque por código ou palavra-chave..."
                    value={bnccBuscaGeral}
                    onChange={(e) => {
                      setBnccBuscaGeral(e.target.value)
                      setMostrarOpcoesGeral(true)
                    }}
                    onFocus={() => setMostrarOpcoesGeral(true)}
                    onBlur={() =>
                      setTimeout(() => setMostrarOpcoesGeral(false), 200)
                    }
                    style={styles.input}
                  />
                  {mostrarOpcoesGeral && bnccBuscaGeral && (
                    <div style={styles.autocompleteDropdown}>
                      {bnccFiltradasGeral.length > 0 ? (
                        bnccFiltradasGeral.map((item) => (
                          <div
                            key={item.id}
                            className="autocomplete-item"
                            style={styles.autocompleteItem}
                            onClick={() => adicionarBnccGeral(item)}
                          >
                            <strong style={{ color: "#1565C0" }}>
                              {item.id}
                            </strong>{" "}
                            - {item.texto}
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "12px",
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                        >
                          Nenhuma encontrada.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <textarea
                  name="bncc"
                  value={formData.bncc}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="3"
                  placeholder="Cite os códigos e objetivos de aprendizagem da BNCC relacionados..."
                />
              </div>

              {/* --- TOGGLE INTERDISCIPLINAR DE COMPUTAÇÃO --- */}
              <div
                className="toggle-box"
                onClick={handleToggleComp}
                style={styles.compToggleContainer}
              >
                <input
                  type="checkbox"
                  checked={mostrarCampoComp}
                  readOnly
                  style={styles.compCheckbox}
                />
                <span style={styles.compToggleLabel}>
                  Esta prática possui interdisciplinaridade com Computação?
                </span>
              </div>

              {mostrarCampoComp && (
                <div style={styles.compBox}>
                  <h4
                    style={{
                      margin: "0 0 15px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--text-info)",
                      fontSize: "14px",
                      fontWeight: "800",
                    }}
                  >
                    <Cpu size={16} /> Eixo BNCC Computação
                  </h4>
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="🔍 Busque por eixo ou habilidade de computação..."
                      value={bnccBuscaComp}
                      onChange={(e) => {
                        setBnccBuscaComp(e.target.value)
                        setMostrarOpcoesComp(true)
                      }}
                      onFocus={() => setMostrarOpcoesComp(true)}
                      onBlur={() =>
                        setTimeout(() => setMostrarOpcoesComp(false), 200)
                      }
                      style={{
                        ...styles.input,
                        borderColor: "var(--border-info)",
                      }}
                    />
                    {mostrarOpcoesComp && bnccBuscaComp && (
                      <div style={styles.autocompleteDropdown}>
                        {bnccFiltradasComp.length > 0 ? (
                          bnccFiltradasComp.map((item) => (
                            <div
                              key={item.id}
                              className="autocomplete-item"
                              style={styles.autocompleteItem}
                              onClick={() => adicionarBnccComp(item)}
                            >
                              <strong style={{ color: "var(--text-info)" }}>
                                {item.id}
                              </strong>{" "}
                              - {item.texto}
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "12px",
                              color: "var(--text-muted)",
                              fontSize: "13px",
                              textAlign: "center",
                            }}
                          >
                            Nenhuma encontrada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <textarea
                    name="bncc_computacao"
                    value={formData.bncc_computacao}
                    onChange={handleChange}
                    style={{
                      ...styles.textarea,
                      borderColor: "var(--border-info)",
                    }}
                    rows="2"
                    placeholder="As habilidades de computação selecionadas aparecerão aqui..."
                  />
                </div>
              )}
              {/* --- FIM DO BLOCO DE COMPUTAÇÃO --- */}

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
                    placeholder="Ex: Sala Invertida, PBL..."
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
                    placeholder="Ex: 50 min, 2 aulas..."
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Package size={14} /> Recursos Didáticos
                </label>
                <div style={styles.resourcesGrid}>
                  {RECURSOS_COMUNS.map((res) => {
                    const isSelected = (formData.recursos || []).includes(res)
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
                        {res}{" "}
                        {isSelected && (
                          <Check size={14} style={{ marginLeft: "4px" }} />
                        )}
                      </button>
                    )
                  })}
                </div>
                <div style={styles.addResourceRow}>
                  <input
                    type="text"
                    placeholder="Outro recurso (Enter)..."
                    value={customResource}
                    onChange={(e) => setCustomResource(e.target.value)}
                    onKeyDown={addCustomResource}
                    style={{ ...styles.input, flex: 1 }}
                  />
                </div>
                {(formData.recursos || []).some(
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
                    {(formData.recursos || [])
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
                  placeholder="Descreva como foi a aplicação em sala de aula, o engajamento dos alunos e os desafios encontrados..."
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
                  placeholder="Quais foram as evidências de aprendizagem? O que os alunos produziram ou demonstraram?"
                />
              </div>

              <div style={styles.formFooter}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(true)}
                  style={styles.draftButton}
                >
                  <Save size={18} /> Salvar como Rascunho
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(false)}
                  style={styles.submitButton}
                >
                  <Send size={18} />{" "}
                  {isSubmitting ? "Enviando..." : "Enviar Prática"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
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
  mainCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid var(--border-color)",
  },
  splitLayout: { display: "flex", gap: "40px" },
  verticalDivider: {
    width: "1px",
    backgroundColor: "var(--border-color)",
    alignSelf: "stretch",
  },
  leftCol: { display: "flex", flexDirection: "column" },
  rightCol: { display: "flex", flexDirection: "column" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-primary)",
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
    color: "var(--text-secondary)",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    color: "var(--input-text)",
    outline: "none",
    backgroundColor: "var(--input-bg)",
    boxSizing: "border-box",
    height: "45px",
  },
  textarea: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "14px",
    color: "var(--input-text)",
    outline: "none",
    backgroundColor: "var(--input-bg)",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.5",
  },
  compToggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 18px",
    backgroundColor: "var(--bg-main)",
    border: "1px dashed var(--border-color)",
    borderRadius: "10px",
    marginBottom: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  compToggleLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
    cursor: "pointer",
  },
  compBox: {
    backgroundColor: "var(--bg-info)",
    border: "1px solid var(--border-info)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  lockedInputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--bg-alt)",
    border: "1px solid var(--border-color)",
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
    color: "var(--text-muted)",
    outline: "none",
    cursor: "not-allowed",
  },
  resourcesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
  },
  resourceChip: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-card)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
  },
  resourceChipActive: {
    backgroundColor: "var(--bg-info)",
    color: "var(--text-info)",
    borderColor: "var(--text-info)",
    fontWeight: "600",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  addResourceRow: { display: "flex", gap: "8px", marginTop: "5px" },
  customChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "var(--bg-warning)",
    color: "var(--text-warning)",
    border: "1px solid var(--border-warning)",
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
    color: "var(--text-warning)",
  },
  uploadSection: { marginTop: "auto", paddingTop: "10px" },
  uploadContainer: {
    border: "2px dashed var(--border-info)",
    borderRadius: "12px",
    backgroundColor: "var(--bg-info)",
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
    backgroundColor: "var(--bg-card)",
    padding: "10px",
    borderRadius: "50%",
    marginBottom: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  uploadTextMain: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-info)",
  },
  fileSelected: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
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
    color: "var(--text-secondary)",
    fontWeight: "600",
    fontSize: "15px",
  },
  pageTitle: {
    fontSize: "24px",
    color: "var(--text-primary)",
    fontWeight: "800",
    margin: "0 0 4px 0",
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
  },
  formFooter: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    flexWrap: "wrap",
  },
  draftButton: {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background 0.2s",
  },
  submitButton: {
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 30px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(21, 101, 192, 0.25)",
    transition: "transform 0.2s",
  },
  autocompleteDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    marginTop: "4px",
    zIndex: 10,
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    maxHeight: "250px",
    overflowY: "auto",
  },
  autocompleteItem: {
    padding: "12px 15px",
    borderBottom: "1px solid var(--border-color)",
    cursor: "pointer",
    fontSize: "13px",
    color: "var(--text-primary)",
    transition: "background 0.2s",
  },
}

export default FormularioManual
