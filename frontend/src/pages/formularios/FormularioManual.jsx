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
  Monitor,
} from "lucide-react"

import bnccMat from "../../data/bncc_mat.json"
import bnccPort from "../../data/bncc_port.json"
import bnccComp from "../../data/bncc_comp.json"

const BNCC_DADOS = [...bnccMat, ...bnccPort, ...bnccComp]

const FormularioManual = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile } = useOutletContext() || { isMobile: false }

  const storedDisc = localStorage.getItem("user_disciplina") || "Geral"
  // Verifica se o professor é estritamente de computação
  const isProfessorComputacao = storedDisc === "Computação"

  // Estado para controlar se um professor de outra área quer adicionar BNCC de computação
  const [temInterdisciplinaridade, setTemInterdisciplinaridade] =
    useState(false)

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
  const [bnccBusca, setBnccBusca] = useState("")
  const [mostrarOpcoesBncc, setMostrarOpcoesBncc] = useState(false)

  const bnccFiltradas = BNCC_DADOS.filter(
    (item) =>
      item.id.toLowerCase().includes(bnccBusca.toLowerCase()) ||
      item.texto.toLowerCase().includes(bnccBusca.toLowerCase()),
  ).slice(0, 5)

  const adicionarBncc = (item) => {
    const novaCompetencia = `${item.id}: ${item.texto}`
    const textoAtual = formData.bncc ? `\n${formData.bncc}` : ""
    setFormData((prev) => ({ ...prev, bncc: novaCompetencia + textoAtual }))
    setBnccBusca("")
    setMostrarOpcoesBncc(false)
  }

  useEffect(() => {
    // Se for uma derivação e já tiver BNCC de computação, ativa o box automaticamente
    if (formData.bncc_computacao && !isProfessorComputacao) {
      setTemInterdisciplinaridade(true)
    }

    if (!location.state?.baseData) {
      const savedDraft = localStorage.getItem("producao_autosave_draft")
      if (savedDraft) {
        Swal.fire({
          title: "Rascunho Encontrado!",
          text: "Deseja restaurar os dados?",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Sim",
          confirmButtonColor: "#1565C0",
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const parsed = JSON.parse(savedDraft)
              setFormData((prev) => ({ ...prev, ...parsed, arquivo: null }))
              if (parsed.bncc_computacao && !isProfessorComputacao)
                setTemInterdisciplinaridade(true)
            } catch (e) {}
          } else {
            localStorage.removeItem("producao_autosave_draft")
          }
        })
      }
    }
  }, [location.state])

  useEffect(() => {
    const { arquivo, ...dataToSave } = formData
    if (dataToSave.titulo || dataToSave.experiencia) {
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
      if (!formData.recursos.includes(val)) {
        setFormData((prev) => ({ ...prev, recursos: [...prev.recursos, val] }))
      }
      setCustomResource("")
    }
  }

  const handleSubmit = async (isDraft) => {
    // LÓGICA DE VALIDAÇÃO CONDICIONAL
    const camposFaltando = []
    if (!formData.titulo) camposFaltando.push("Título")
    if (!formData.nivel) camposFaltando.push("Nível")
    if (!formData.categoria) camposFaltando.push("Categoria")
    if (!formData.experiencia) camposFaltando.push("Relato")

    if (isProfessorComputacao) {
      if (!formData.bncc_computacao) camposFaltando.push("BNCC Computação")
    } else {
      if (!formData.bncc) camposFaltando.push("BNCC / Objetivos")
      if (temInterdisciplinaridade && !formData.bncc_computacao)
        camposFaltando.push("BNCC Computação")
    }

    if (!isDraft && camposFaltando.length > 0) {
      Swal.fire(
        "Campos Incompletos",
        `Os seguintes campos são obrigatórios: ${camposFaltando.join(", ")}`,
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
        if (key === "recursos")
          formData.recursos.forEach((r) => dataToSend.append("recursos", r))
        else if (key === "arquivo" && formData.arquivo)
          dataToSend.append("arquivo", formData.arquivo)
        else if (key === "nivel")
          dataToSend.append("nivel_ensino", formData.nivel)
        // Se não tem interdisciplinaridade e não é prof de computação, envia BNCC de computação vazio
        else if (
          key === "bncc_computacao" &&
          !isProfessorComputacao &&
          !temInterdisciplinaridade
        )
          dataToSend.append(key, "")
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
      Swal.fire("Erro", "Ocorreu um problema ao salvar.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.fullPageWrapper}>
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
            {/* ESQUERDA - Ficha Técnica */}
            <div
              style={{ ...styles.leftCol, width: isMobile ? "100%" : "35%" }}
            >
              {formData.producao_base && (
                <div
                  style={{
                    backgroundColor: "#E8F5E9",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    fontSize: "12px",
                    color: "#2E7D32",
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
                  placeholder="Ex: ChatGPT-4, Gemini..."
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Prompts Utilizados</label>
                <textarea
                  name="prompts_ia"
                  value={formData.prompts_ia}
                  onChange={handleChange}
                  style={{ ...styles.textarea, minHeight: "80px" }}
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
                  placeholder="Google Drive, YouTube..."
                />
              </div>
            </div>

            {!isMobile && <div style={styles.verticalDivider}></div>}

            {/* DIREITA - Detalhamento Pedagógico */}
            <div
              style={{ ...styles.rightCol, width: isMobile ? "100%" : "65%" }}
            >
              <h3 style={styles.sectionTitle}>
                <BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico
              </h3>

              {/* LÓGICA CONDICIONAL DE CAMPOS BNCC */}
              {!isProfessorComputacao ? (
                <>
                  {/* CAMPO BNCC GERAL PARA OUTRAS DISCIPLINAS */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      BNCC / Objetivos de Aprendizagem
                    </label>
                    <div style={{ position: "relative", marginBottom: "10px" }}>
                      <input
                        type="text"
                        placeholder="🔍 Busque por código ou palavra-chave..."
                        value={bnccBusca}
                        onChange={(e) => {
                          setBnccBusca(e.target.value)
                          setMostrarOpcoesBncc(true)
                        }}
                        onFocus={() => setMostrarOpcoesBncc(true)}
                        onBlur={() =>
                          setTimeout(() => setMostrarOpcoesBncc(false), 200)
                        }
                        style={styles.input}
                      />
                      {mostrarOpcoesBncc && bnccBusca && (
                        <div style={styles.autocompleteDropdown}>
                          {bnccFiltradas.length > 0 ? (
                            bnccFiltradas.map((item) => (
                              <div
                                key={item.id}
                                style={styles.autocompleteItem}
                                onClick={() => adicionarBncc(item)}
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
                                color: "#78909C",
                                fontSize: "13px",
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
                    />
                  </div>

                  {/* BOX DE INTERDISCIPLINARIDADE */}
                  <div style={styles.interdisciplinaryBox}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "10px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#37474F",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={temInterdisciplinaridade}
                        onChange={(e) =>
                          setTemInterdisciplinaridade(e.target.checked)
                        }
                        style={{ width: "18px", height: "18px" }}
                      />
                      Esta prática possui interdisciplinaridade com Computação?
                    </label>
                  </div>

                  {/* CAMPO BNCC COMPUTAÇÃO (APARECE APENAS SE CHECKED) */}
                  {temInterdisciplinaridade && (
                    <div
                      style={{
                        ...styles.inputGroup,
                        backgroundColor: "#F1F8E9",
                        padding: "15px",
                        borderRadius: "10px",
                        border: "1px solid #C8E6C9",
                      }}
                    >
                      <label style={{ ...styles.label, color: "#2E7D32" }}>
                        <Monitor size={14} /> BNCC Computação
                      </label>
                      <textarea
                        name="bncc_computacao"
                        value={formData.bncc_computacao}
                        onChange={handleChange}
                        style={styles.textarea}
                        rows="2"
                        placeholder="Descreva as habilidades de computação..."
                      />
                    </div>
                  )}
                </>
              ) : (
                /* SE FOR PROFESSOR DE COMPUTAÇÃO: MOSTRA APENAS O CAMPO DE COMPUTAÇÃO */
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Monitor size={16} /> BNCC Computação (Sua Disciplina)
                  </label>
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="🔍 Busque por código de computação..."
                      value={bnccBusca}
                      onChange={(e) => {
                        setBnccBusca(e.target.value)
                        setMostrarOpcoesBncc(true)
                      }}
                      style={styles.input}
                    />
                    {mostrarOpcoesBncc && bnccBusca && (
                      <div style={styles.autocompleteDropdown}>
                        {bnccFiltradas.length > 0 ? (
                          bnccFiltradas.map((item) => (
                            <div
                              key={item.id}
                              style={styles.autocompleteItem}
                              onClick={() => adicionarBncc(item)}
                            >
                              <strong style={{ color: "#1565C0" }}>
                                {item.id}
                              </strong>{" "}
                              - {item.texto}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "12px", color: "#78909C" }}>
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
                    style={styles.textarea}
                    rows="4"
                    placeholder="Cite as habilidades de computação da BNCC..."
                  />
                </div>
              )}

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
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Package size={14} /> Recursos Didáticos
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
                    placeholder="Outro recurso..."
                    value={customResource}
                    onChange={(e) => setCustomResource(e.target.value)}
                    onKeyDown={addCustomResource}
                    style={{ ...styles.input, flex: 1 }}
                  />
                </div>
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
                />
              </div>

              <div style={styles.formFooter}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(true)}
                  style={styles.draftButton}
                >
                  <Save size={18} /> Salvar Rascunho
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
  // ... (mantenha os estilos anteriores)
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
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    border: "1px solid #E0E0E0",
  },
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
    height: "45px",
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
  resourcesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
  },
  resourceChip: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #CFD8DC",
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
    borderColor: "#1565C0",
    fontWeight: "600",
    boxShadow: "0 2px 5px rgba(21, 101, 192, 0.1)",
  },
  addResourceRow: { display: "flex", gap: "8px", marginTop: "5px" },
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
  pageTitle: {
    fontSize: "24px",
    color: "#1565C0",
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
    backgroundColor: "white",
    color: "#1565C0",
    border: "1px solid #1565C0",
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
    backgroundColor: "white",
    border: "1px solid #CFD8DC",
    borderRadius: "8px",
    marginTop: "4px",
    zIndex: 10,
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    maxHeight: "250px",
    overflowY: "auto",
  },
  autocompleteItem: {
    padding: "12px 15px",
    borderBottom: "1px solid #F0F0F0",
    cursor: "pointer",
    fontSize: "13px",
    color: "#37474F",
    transition: "background 0.2s",
  },
  interdisciplinaryBox: {
    padding: "15px",
    backgroundColor: "#F5F7F9",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px dashed #CFD8DC",
  },
}

export default FormularioManual
