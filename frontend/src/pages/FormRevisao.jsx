import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useOutletContext, useParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import {
  Star,
  CheckCircle2,
  Bot,
  Download,
  ArrowLeft,
  Clock,
  Wrench,
  BookOpen,
  Target,
  Lightbulb,
  ThumbsUp,
  ShieldAlert,
  FileText,
  User,
  AlertTriangle,
  Lock,
  PenTool,
  Eye,
  Cpu,
  Terminal,
  Link,
  ExternalLink,
  Package,
} from "lucide-react"

const Revisao = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useOutletContext()
  const isMobile = context ? context.isMobile : false

  const [producaoEmRevisao, setProducaoEmRevisao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [avaliacao, setAvaliacao] = useState({
    notaCoerencia: 0,
    notaQualidade: 0,
    notaMetodologia: 0,
    notaAvaliacao: 0,
    notaInclusao: 0,
    notaInovacao: 0,
    pontosFortes: "",
    pontosMelhoria: "",
  })

  const scores = [
    avaliacao.notaCoerencia,
    avaliacao.notaQualidade,
    avaliacao.notaMetodologia,
    avaliacao.notaAvaliacao,
    avaliacao.notaInclusao,
    avaliacao.notaInovacao,
  ]
  const isFormComplete = scores.every((s) => s > 0)
  const hasCriticalFail = scores.some((s) => s > 0 && s <= 2)

  const handleDownload = async () => {
    if (!producaoEmRevisao || !producaoEmRevisao.arquivo) return
    try {
      const urlRelativa = producaoEmRevisao.arquivo.replace(
        "https://teia.cic.unb.br/kipo_playground/",
        "",
      )
      const response = await api.get(urlRelativa, { responseType: "blob" })
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = urlBlob
      link.setAttribute("download", `producao-${producaoEmRevisao.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error("Erro no download:", error)
    }
  }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`api/production/${id}/`)
        setProducaoEmRevisao(response.data)
      } catch (error) {
        Swal.fire("Erro", "Não foi possível carregar os detalhes.", "error")
        navigate("/dashboard/revisao")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id, navigate])

  const handleScoreChange = (campo, valor) =>
    setAvaliacao((prev) => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (veredito) => {
    if (!isFormComplete) return
    if (veredito === false && !avaliacao.pontosMelhoria.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Para rejeitar a prática, é OBRIGATÓRIO preencher as Sugestões de Melhoria para orientar o colega.",
        confirmButtonColor: "#F57C00",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(`api/production/${id}/review/`, {
        aprovado: veredito,
        pontos_fortes: avaliacao.pontosFortes,
        pontos_melhoria: avaliacao.pontosMelhoria,
        nota_coerencia: avaliacao.notaCoerencia,
        nota_qualidade: avaliacao.notaQualidade,
        nota_metodologia: avaliacao.notaMetodologia,
        nota_avaliacao: avaliacao.notaAvaliacao,
        nota_inclusao: avaliacao.notaInclusao,
        nota_inovacao: avaliacao.notaInovacao,
      })

      // --- AVISANDO O RADAR DE NOTIFICAÇÕES (XP INSTANTÂNEO) ---
      window.dispatchEvent(new Event("perfilAtualizado"))

      if (veredito) {
        const currentApprovals = producaoEmRevisao.total_aprovacoes || 0
        if (currentApprovals === 0) {
          Swal.fire({
            icon: "info",
            title: "Avaliação Registrada! (1/2)",
            html: "Sua aprovação foi salva com sucesso!<br><br>Como o sistema exige a revisão em <b>duplo-cego</b>, outro colega precisará aprovar para publicação.",
            confirmButtonColor: "#1565C0",
            confirmButtonText: "Continuar revisando",
          }).then(() => navigate("/dashboard/revisao"))
        } else {
          Swal.fire({
            icon: "success",
            title: "Prática Publicada! (2/2)",
            html: "Excelente! Você foi o <b>segundo revisor</b> a aprovar este material.<br><br>A prática acaba de ser <b>publicada no Fórum Público</b>!",
            confirmButtonColor: "#2E7D32",
            confirmButtonText: "Que legal!",
          }).then(() => navigate("/dashboard/revisao"))
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Devolvido para Correção",
          text: "A prática foi devolvida ao autor com as suas sugestões de melhoria.",
          confirmButtonColor: "#C62828",
        }).then(() => navigate("/dashboard/revisao"))
      }
    } catch (error) {
      Swal.fire("Erro", "Ocorreu um problema ao salvar sua revisão.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading)
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Carregando...
      </div>
    )
  if (!producaoEmRevisao) return null

  const CriteriaCard = ({ label, description, fieldName, value }) => (
    <div style={styles.criteriaCard}>
      <div style={styles.criteriaHeader}>
        <span style={styles.criteriaTitle}>{label}</span>
        <span
          style={{
            ...styles.scoreBadge,
            color:
              value > 0
                ? value <= 2
                  ? "var(--text-danger)"
                  : "var(--text-success)"
                : "var(--text-muted)",
          }}
        >
          {value > 0 ? value : "-"}
        </span>
      </div>
      <p style={styles.criteriaDesc}>{description}</p>
      <div style={styles.starsWrapper}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleScoreChange(fieldName, star)}
            type="button"
            style={styles.starBtn}
          >
            <Star
              size={24}
              fill={star <= value ? "#FFC107" : "var(--bg-main)"}
              color={star <= value ? "#FFB300" : "var(--border-color)"}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button
            onClick={() => navigate("/dashboard/revisao")}
            style={styles.backButton}
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <div style={{ textAlign: "right" }}>
            <h1 style={styles.pageTitle}>Sala de Revisão</h1>
            <p style={styles.pageSubtitle}>
              Analise o conteúdo abaixo e preencha a avaliação no final.
            </p>
          </div>
        </div>

        <div style={styles.materialCard}>
          <div style={styles.materialHeader}>
            <div style={styles.badgesRow}>
              <span style={styles.badgeDisc}>
                {producaoEmRevisao.disciplina}
              </span>
              <span style={styles.badgeLevel}>{producaoEmRevisao.nivel}</span>
            </div>
            <h2 style={styles.materialTitle}>{producaoEmRevisao.titulo}</h2>
            <div style={styles.metaInfo}>
              <span style={styles.metaItem}>
                <Bot size={14} /> {producaoEmRevisao.modelo_ia}
              </span>
              <span style={styles.metaItem}>
                <User size={14} /> Autor Anônimo
              </span>
            </div>
          </div>

          <div style={styles.techSheet}>
            <div style={styles.techItem}>
              <Wrench size={16} color="var(--text-primary)" />
              <div style={{ width: "100%" }}>
                <span style={styles.techLabel}>Metodologia</span>
                <span style={styles.techValue}>
                  {producaoEmRevisao.metodologia}
                </span>
              </div>
            </div>
            <div style={styles.techItem}>
              <Clock size={16} color="var(--text-primary)" />
              <div style={{ width: "100%" }}>
                <span style={styles.techLabel}>Duração</span>
                <span style={styles.techValue}>
                  {producaoEmRevisao.duracao}
                </span>
              </div>
            </div>
            <div style={styles.techItem}>
              <Package size={16} color="var(--text-primary)" />
              <div style={{ width: "100%" }}>
                <span style={styles.techLabel}>Recursos</span>
                <span style={styles.techValue}>
                  {Array.isArray(producaoEmRevisao.recursos)
                    ? producaoEmRevisao.recursos.join(", ")
                    : typeof producaoEmRevisao.recursos === "string"
                      ? producaoEmRevisao.recursos
                          .split(",")
                          .map((r) => r.trim())
                          .join(", ")
                      : "-"}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <BookOpen size={18} /> Alinhamento BNCC
            </h3>
            <div style={styles.bnccBox}>
              <p style={styles.bnccText}>
                {producaoEmRevisao.bncc || "Não informado."}
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Cpu size={18} /> BNCC Computação
            </h3>
            <div
              style={{
                ...styles.bnccBox,
                backgroundColor: "var(--bg-info)",
                borderLeftColor: "var(--text-info)",
              }}
            >
              <p style={{ ...styles.bnccText, color: "var(--text-info)" }}>
                {producaoEmRevisao.bncc_computacao || "Não informado."}
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Terminal size={18} /> Prompts Utilizados
            </h3>
            <div style={styles.promptBox}>
              {producaoEmRevisao.prompts_ia || "Nenhum prompt registrado."}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Lightbulb size={18} /> Relato de Experiência
            </h3>
            <p style={styles.textBody}>{producaoEmRevisao.experiencia}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Target size={18} /> Resultados
            </h3>
            <div style={styles.resultsBox}>
              {producaoEmRevisao.resultados || "Sem resultados."}
            </div>
          </div>

          {/* O COMPONENTE COM A TRAVA ABSOLUTA E DUPLA DE PRIVACIDADE */}
          {<ParecerTecnico producao={producaoEmRevisao} />}
        </div>

        <div style={styles.stepSeparator}>
          <div style={styles.stepLine}></div>
          <div style={styles.stepLabel}>
            <PenTool size={16} /> Área de Avaliação
          </div>
          <div style={styles.stepLine}></div>
        </div>

        <div style={styles.reviewSection}>
          <h3 style={styles.reviewTitle}>Sua Avaliação</h3>

          <div style={styles.criteriaGrid}>
            <CriteriaCard
              label="Coerência Pedagógica"
              description="Objetivos claros e alinhados?"
              fieldName="notaCoerencia"
              value={avaliacao.notaCoerencia}
            />
            <CriteriaCard
              label="Qualidade do Prompt"
              description="Uso intencional da IA?"
              fieldName="notaQualidade"
              value={avaliacao.notaQualidade}
            />
            <CriteriaCard
              label="Metodologia Ativa"
              description="Aluno protagonista?"
              fieldName="notaMetodologia"
              value={avaliacao.notaMetodologia}
            />
            <CriteriaCard
              label="Avaliação"
              description="Critérios de verificação?"
              fieldName="notaAvaliacao"
              value={avaliacao.notaAvaliacao}
            />
            <CriteriaCard
              label="Inclusão e Acessibilidade"
              description="Acessível a todos?"
              fieldName="notaInclusao"
              value={avaliacao.notaInclusao}
            />
            <CriteriaCard
              label="Inovação e Criatividade"
              description="Ideias originais?"
              fieldName="notaInovacao"
              value={avaliacao.notaInovacao}
            />
          </div>

          <div style={styles.feedbackGrid}>
            <div style={styles.feedbackBoxSuccess}>
              <label style={styles.feedbackLabelSuccess}>
                <ThumbsUp size={14} /> Pontos Fortes
              </label>
              <textarea
                style={styles.textareaWhite}
                placeholder="O que se destacou positivamente?"
                value={avaliacao.pontosFortes}
                onChange={(e) =>
                  setAvaliacao({ ...avaliacao, pontosFortes: e.target.value })
                }
              />
            </div>
            <div style={styles.feedbackBoxDanger}>
              <label style={styles.feedbackLabelDanger}>
                <AlertTriangle size={14} /> Sugestões de Melhoria
              </label>
              <textarea
                style={styles.textareaWhite}
                placeholder="O que precisa ser ajustado?"
                value={avaliacao.pontosMelhoria}
                onChange={(e) =>
                  setAvaliacao({ ...avaliacao, pontosMelhoria: e.target.value })
                }
              />
            </div>
          </div>

          <div style={styles.actionButtonsRow}>
            {!isFormComplete ? (
              <button disabled style={styles.btnDisabled}>
                <Lock size={16} /> Preencha todos os critérios acima para
                liberar a decisão
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  style={
                    hasCriticalFail
                      ? styles.btnRejectPrimary
                      : styles.btnRejectSecondary
                  }
                >
                  <ShieldAlert size={18} /> Rejeitar
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting || hasCriticalFail}
                  style={
                    !hasCriticalFail
                      ? styles.btnApprovePrimary
                      : styles.btnApproveSecondary
                  }
                >
                  <CheckCircle2 size={18} /> Aprovar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ParecerTecnico = ({ producao }) => {
  if (
    !producao ||
    !producao.avaliacoes_detalhadas ||
    producao.avaliacoes_detalhadas.length === 0
  ) {
    return null
  }

  const avaliacoes = producao.avaliacoes_detalhadas

  return (
    <div style={styles.ptContainer}>
      <div style={styles.ptMainHeader}>
        <BarChart3 size={24} color="#1565C0" />
        <div>
          <h3 style={styles.ptMainTitle}>Histórico de Revisão</h3>
          <p style={styles.ptMainSubtitle}>
            Detalhamento dos avaliadores sobre esta prática.
          </p>
        </div>
      </div>
      <div style={styles.ptCardsWrapper}>
        {avaliacoes.map((aval) => (
          <ReviewCard key={aval.ordem} avaliacao={aval} />
        ))}

        {producao.total_avaliacoes === 1 &&
          (producao.is_dono || producao.is_admin) &&
          !producao.status.toLowerCase().includes("rejeitado") && <GhostCard />}
      </div>
    </div>
  )
}

const ReviewCard = ({ avaliacao }) => {
  const isAprovado = avaliacao.aprovado
  const { notas, pontos_fortes, pontos_melhoria, ordem } = avaliacao
  return (
    <div style={styles.rcCard(isAprovado)}>
      <div style={styles.rcHeader(isAprovado)}>
        <div style={styles.rcHeaderTitle(isAprovado)}>
          {isAprovado ? (
            <CheckCircle2 size={22} />
          ) : (
            <AlertTriangle size={22} />
          )}
          <span>PARECER DO {ordem}º AVALIADOR</span>
        </div>
        <div style={styles.rcBadge(isAprovado)}>
          {isAprovado ? "APROVADO" : "AJUSTES"}
        </div>
      </div>
      <div style={styles.rcContent}>
        <div style={styles.rcGridScores}>
          <ScoreItem label="Pedagógico" valor={notas.coerencia} />
          <ScoreItem label="Prompt" valor={notas.qualidade} />
          <ScoreItem label="Metodologia" valor={notas.metodologia} />
          <ScoreItem label="Avaliação" valor={notas.avaliacao} />
          <ScoreItem label="Inclusão" valor={notas.inclusao} />
          <ScoreItem label="Inovação" valor={notas.inovacao} />
        </div>
        <hr style={styles.rcDivider} />
        <div style={styles.rcFeedbackGrid}>
          {pontos_fortes && (
            <div style={styles.rcFeedbackBoxSuccess}>
              <div style={styles.rcFeedbackLabelSuccess}>
                <ThumbsUp size={16} /> Pontos Fortes
              </div>
              <div style={styles.rcFeedbackTextSuccess}>{pontos_fortes}</div>
            </div>
          )}
          {pontos_melhoria && (
            <div style={styles.rcFeedbackBoxDanger}>
              <div style={styles.rcFeedbackLabelDanger}>
                <AlertTriangle size={16} /> Melhorias
              </div>
              <div style={styles.rcFeedbackTextDanger}>{pontos_melhoria}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const GhostCard = () => (
  <div style={styles.gcCard}>
    <div style={styles.gcHeader}>
      <div style={styles.gcTitle}>
        <Clock size={22} color="#90A4AE" />
        <span>AGUARDANDO 2º AVALIADOR</span>
      </div>
    </div>
    <div style={styles.gcContent}>
      <p style={styles.gcText}>
        Aguardando o parecer de mais um colega para finalização.
      </p>
    </div>
  </div>
)

const ScoreItem = ({ label, valor }) => (
  <div style={styles.rcScoreRow}>
    <span style={styles.rcLabel}>{label}</span>
    <div style={styles.rcStarsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          fill={star <= valor ? "#EF5350" : "#E0E0E0"}
          color="transparent"
        />
      ))}
      <span style={styles.rcNumberValue}>{valor}/5</span>
    </div>
  </div>
)

const styles = {
  fullPageWrapper: {
    backgroundColor: "var(--bg-main)",
    minHeight: "100vh",
    padding: "20px",
  },
  container: { maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-secondary)",
    fontWeight: "700",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
  },
  pageSubtitle: { fontSize: "14px", color: "var(--text-muted)", margin: 0 },
  materialCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid var(--border-color)",
    marginBottom: "30px",
  },
  materialHeader: {
    marginBottom: "25px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "20px",
  },
  badgesRow: { display: "flex", gap: "10px", marginBottom: "12px" },
  badgeDisc: {
    backgroundColor: "var(--bg-info)",
    color: "var(--text-info)",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
  },
  badgeLevel: {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-secondary)",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },
  materialTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 10px 0",
    wordBreak: "break-word",
  },
  metaInfo: {
    display: "flex",
    gap: "15px",
    color: "var(--text-muted)",
    fontSize: "13px",
  },
  metaItem: { display: "flex", alignItems: "center", gap: "5px" },
  techSheet: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
    padding: "15px",
    backgroundColor: "var(--bg-alt)",
    borderRadius: "10px",
  },
  techItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
  techLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    fontWeight: "800",
  },
  techValue: {
    fontSize: "14px",
    color: "var(--text-primary)",
    fontWeight: "600",
    wordBreak: "break-word",
  },
  section: { marginBottom: "30px" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  bnccBox: {
    backgroundColor: "var(--bg-warning)",
    borderLeft: "4px solid var(--border-warning)",
    padding: "15px",
    borderRadius: "6px",
    wordBreak: "break-word",
  },
  bnccText: {
    margin: 0,
    fontSize: "15px",
    color: "var(--text-primary)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  textBody: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "var(--text-secondary)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  promptBox: {
    backgroundColor: "var(--bg-main)",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid var(--border-info)",
    fontStyle: "italic",
    wordBreak: "break-word",
    color: "var(--text-secondary)",
    fontSize: "15px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
  },
  resultsBox: {
    backgroundColor: "var(--bg-success)",
    border: "1px solid var(--border-success)",
    padding: "15px",
    borderRadius: "8px",
    fontStyle: "italic",
    wordBreak: "break-word",
    color: "var(--text-success)",
    fontSize: "15px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
  },

  stepSeparator: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
    opacity: 0.8,
  },
  stepLine: { flex: 1, height: "1px", backgroundColor: "var(--border-color)" },
  stepLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  reviewSection: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid var(--border-color)",
  },
  reviewTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "20px",
  },

  criteriaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  criteriaCard: {
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "15px",
    backgroundColor: "var(--bg-alt)",
  },
  criteriaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  criteriaTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  criteriaDesc: {
    fontSize: "11px",
    color: "var(--text-muted)",
    margin: "0 0 10px 0",
    minHeight: "32px",
  },
  starsWrapper: {
    display: "flex",
    justifyContent: "center",
    gap: "4px",
    marginTop: "auto",
  },
  starBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    transition: "transform 0.1s",
  },
  scoreBadge: {
    fontSize: "14px",
    fontWeight: "800",
    minWidth: "20px",
    textAlign: "center",
  },

  feedbackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  feedbackBoxSuccess: {
    backgroundColor: "var(--bg-success)",
    border: "1px solid var(--border-success)",
    borderRadius: "10px",
    padding: "15px",
  },
  feedbackLabelSuccess: {
    color: "var(--text-success)",
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  feedbackBoxDanger: {
    backgroundColor: "var(--bg-danger)",
    border: "1px solid var(--border-danger)",
    borderRadius: "10px",
    padding: "15px",
  },
  feedbackLabelDanger: {
    color: "var(--text-danger)",
    fontSize: "12px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },

  textareaWhite: {
    width: "100%",
    padding: "12px",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    backgroundColor: "var(--input-bg)",
    color: "var(--input-text)",
  },

  actionButtonsRow: {
    display: "flex",
    gap: "15px",
    paddingTop: "20px",
    borderTop: "1px solid var(--border-color)",
  },
  btnDisabled: {
    width: "100%",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-alt)",
    color: "var(--text-muted)",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  btnApprovePrimary: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
  },
  btnApproveSecondary: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid var(--border-success)",
    backgroundColor: "var(--bg-success)",
    color: "var(--text-success)",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    opacity: 0.6,
  },
  btnRejectPrimary: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#C62828",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(198, 40, 40, 0.3)",
  },
  btnRejectSecondary: {
    flex: 1,
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid var(--border-danger)",
    backgroundColor: "var(--bg-danger)",
    color: "var(--text-danger)",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    opacity: 0.6,
  },

  // Parecer Técnico Area
  ptContainer: {
    marginTop: "40px",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "30px",
  },
  ptMainHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  ptMainTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 4px 0",
  },
  ptMainSubtitle: { fontSize: "14px", color: "var(--text-muted)", margin: 0 },
  ptCardsWrapper: { display: "flex", flexDirection: "column", gap: "20px" },
  rcCard: (aprovado) => ({
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: aprovado
      ? "1px solid var(--border-success)"
      : "1px solid var(--border-danger)",
    overflow: "hidden",
  }),
  rcHeader: (aprovado) => ({
    backgroundColor: aprovado ? "var(--bg-success)" : "var(--bg-danger)",
    padding: "15px 25px",
    borderBottom: aprovado
      ? "1px solid var(--border-success)"
      : "1px solid var(--border-danger)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  }),
  rcHeaderTitle: (aprovado) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
  }),
  rcBadge: (aprovado) => ({
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: aprovado ? "var(--bg-success)" : "var(--bg-danger)",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: `1px solid ${aprovado ? "var(--text-success)" : "var(--text-danger)"}`,
  }),
  rcContent: { padding: "25px" },
  rcGridScores: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px 30px",
  },
  rcScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-alt)",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  rcLabel: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  rcStarsContainer: { display: "flex", alignItems: "center" },
  rcNumberValue: {
    fontSize: "13px",
    fontWeight: "800",
    marginLeft: "8px",
    color: "var(--text-primary)",
  },
  rcDivider: {
    border: "none",
    borderTop: "1px dashed var(--border-color)",
    margin: "25px 0",
  },
  rcFeedbackGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  rcFeedbackBoxSuccess: {
    backgroundColor: "var(--bg-success)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-success)",
  },
  rcFeedbackLabelSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-success)",
    marginBottom: "8px",
  },
  rcFeedbackTextSuccess: {
    fontSize: "14px",
    color: "var(--text-success)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  rcFeedbackBoxDanger: {
    backgroundColor: "var(--bg-danger)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-danger)",
  },
  rcFeedbackLabelDanger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-danger)",
    marginBottom: "8px",
  },
  rcFeedbackTextDanger: {
    fontSize: "14px",
    color: "var(--text-danger)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  gcCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "2px dashed var(--border-color)",
    overflow: "hidden",
    opacity: 0.8,
  },
  gcHeader: {
    backgroundColor: "var(--bg-alt)",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gcTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    color: "var(--text-muted)",
  },
  gcContent: { padding: "25px", textAlign: "center" },
  gcText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
}

export default Revisao
