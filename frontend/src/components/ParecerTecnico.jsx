import React from "react"
import {
  Star,
  BarChart3,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ThumbsUp,
  AlertTriangle,
  User,
} from "lucide-react"

const ParecerTecnico = ({ producao }) => {
  if (
    !producao ||
    (!producao.revisao_realizada &&
      (!producao.avaliacoes_detalhadas ||
        producao.avaliacoes_detalhadas.length === 0))
  )
    return null

  const avaliacoes = producao.avaliacoes_detalhadas || []

  return (
    <div style={styles.container}>
      <div style={styles.mainHeader}>
        <BarChart3 size={24} color="var(--text-info)" />
        <div>
          <h3 style={styles.mainTitle}>Histórico de Revisão</h3>
          <p style={styles.mainSubtitle}>
            Veja o detalhamento do que os avaliadores acharam da sua prática.
          </p>
        </div>
      </div>

      <div style={styles.cardsWrapper}>
        {avaliacoes.map((aval) => (
          <ReviewCard key={aval.ordem} avaliacao={aval} />
        ))}

        {avaliacoes.length === 1 &&
          !producao.status.toLowerCase().includes("rejeitado") && <GhostCard />}
      </div>
    </div>
  )
}

const ReviewCard = ({ avaliacao }) => {
  const isAprovado = avaliacao.aprovado
  const { notas, pontos_fortes, pontos_melhoria, ordem } = avaliacao

  return (
    <div style={styles.card(isAprovado)}>
      <div style={styles.header(isAprovado)}>
        <div style={styles.headerTitle(isAprovado)}>
          {isAprovado ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
          <span>PARECER DO {ordem}º AVALIADOR</span>
        </div>
        <div style={styles.badge(isAprovado)}>
          {isAprovado ? "APROVADO" : "AJUSTES NECESSÁRIOS"}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.sectionTitle}>
          <BarChart3 size={16} color="var(--text-muted)" /> Notas Atribuídas
        </div>
        <div style={styles.gridScores}>
          <ScoreItem label="Coerência Pedagógica" valor={notas.coerencia} />
          <ScoreItem label="Qualidade do Prompt" valor={notas.qualidade} />
          <ScoreItem label="Metodologia Ativa" valor={notas.metodologia} />
          <ScoreItem label="Critérios de Avaliação" valor={notas.avaliacao} />
          <ScoreItem label="Inclusão e Acessibilidade" valor={notas.inclusao} />
          <ScoreItem label="Inovação e Criatividade" valor={notas.inovacao} />
        </div>
        <hr style={styles.divider} />
        <div style={styles.sectionTitle}>
          <User size={16} color="var(--text-muted)" /> Comentários do Revisor
        </div>
        <div style={styles.feedbackGrid}>
          {pontos_fortes && (
            <div style={styles.feedbackBoxSuccess}>
              <div style={styles.feedbackLabelSuccess}>
                <ThumbsUp size={16} /> Pontos Fortes
              </div>
              <div style={styles.feedbackTextSuccess}>{pontos_fortes}</div>
            </div>
          )}
          {pontos_melhoria && (
            <div style={styles.feedbackBoxDanger}>
              <div style={styles.feedbackLabelDanger}>
                <AlertTriangle size={16} /> Sugestões de Melhoria
              </div>
              <div style={styles.feedbackTextDanger}>{pontos_melhoria}</div>
            </div>
          )}
          {!pontos_fortes && !pontos_melhoria && avaliacao.feedback_texto && (
            <div style={styles.feedbackBoxNeutral}>
              <div style={styles.feedbackTextNeutral}>
                {avaliacao.feedback_texto}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const GhostCard = () => (
  <div style={styles.ghostCard}>
    <div style={styles.ghostHeader}>
      <div style={styles.ghostTitle}>
        <Clock size={22} color="var(--text-muted)" />
        <span>AGUARDANDO 2º AVALIADOR</span>
      </div>
      <div style={styles.ghostBadge}>NA FILA</div>
    </div>
    <div style={styles.ghostContent}>
      <p style={styles.ghostText}>
        Esta produção já recebeu a sua primeira avaliação e agora aguarda o
        parecer de mais um colega.
      </p>
    </div>
  </div>
)

const ScoreItem = ({ label, valor }) => (
  <div style={styles.scoreRow}>
    <span style={styles.label}>{label}</span>
    <div style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={
            star <= valor
              ? valor <= 2
                ? "var(--text-danger)"
                : "#FFB300"
              : "var(--bg-main)"
          }
          color="transparent"
          style={{ marginRight: 2 }}
        />
      ))}
      <span
        style={{
          ...styles.numberValue,
          color: valor <= 2 ? "var(--text-danger)" : "var(--text-success)",
        }}
      >
        {valor}/5
      </span>
    </div>
  </div>
)

const styles = {
  container: {
    marginTop: "40px",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "30px",
  },
  mainHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  mainTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 4px 0",
  },
  mainSubtitle: { fontSize: "14px", color: "var(--text-muted)", margin: 0 },
  cardsWrapper: { display: "flex", flexDirection: "column", gap: "20px" },
  card: (aprovado) => ({
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: aprovado
      ? "1px solid var(--border-success)"
      : "1px solid var(--border-danger)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    overflow: "hidden",
  }),
  header: (aprovado) => ({
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
  headerTitle: (aprovado) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
  }),
  badge: (aprovado) => ({
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    backgroundColor: aprovado ? "var(--bg-success)" : "var(--bg-danger)",
    color: aprovado ? "var(--text-success)" : "var(--text-danger)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: aprovado
      ? "1px solid var(--text-success)"
      : "1px solid var(--text-danger)",
  }),
  content: { padding: "25px" },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-muted)",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  gridScores: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px 30px",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-alt)",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
  },
  label: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  starsContainer: { display: "flex", alignItems: "center" },
  numberValue: {
    fontSize: "13px",
    fontWeight: "800",
    marginLeft: "8px",
    minWidth: "25px",
    textAlign: "right",
  },
  divider: {
    border: "none",
    borderTop: "1px dashed var(--border-color)",
    margin: "25px 0",
  },
  feedbackGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  feedbackBoxSuccess: {
    backgroundColor: "var(--bg-success)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-success)",
  },
  feedbackLabelSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-success)",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  feedbackTextSuccess: {
    fontSize: "14px",
    color: "var(--text-success)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  feedbackBoxDanger: {
    backgroundColor: "var(--bg-danger)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--text-danger)",
  },
  feedbackLabelDanger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--text-danger)",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  feedbackTextDanger: {
    fontSize: "14px",
    color: "var(--text-danger)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  feedbackBoxNeutral: {
    backgroundColor: "var(--bg-alt)",
    borderRadius: "8px",
    padding: "15px",
    borderLeft: "4px solid var(--border-info)",
  },
  feedbackTextNeutral: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  ghostCard: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "12px",
    border: "2px dashed var(--border-color)",
    overflow: "hidden",
    opacity: 0.8,
  },
  ghostHeader: {
    backgroundColor: "var(--bg-alt)",
    padding: "15px 25px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ghostTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    color: "var(--text-muted)",
  },
  ghostBadge: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    backgroundColor: "var(--bg-main)",
    color: "var(--text-muted)",
    padding: "6px 12px",
    borderRadius: "20px",
  },
  ghostContent: { padding: "25px", textAlign: "center" },
  ghostText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
}

export default ParecerTecnico
