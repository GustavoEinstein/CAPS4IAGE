import React, { useState, useEffect } from "react"
import api from "../services/api" 
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft, Calendar, Clock, Bot, BookOpen, CheckCircle2,
  XCircle, AlertCircle, Wrench, Lightbulb, Target, Download,
  FileText, User, Bookmark, ShieldCheck, Package, Cpu, Terminal,
  Star, BarChart3, ThumbsUp, AlertTriangle, Link, ExternalLink
} from "lucide-react"

const DetalharProducao = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // 1. LENDO A ETIQUETA SECRETA DA URL
  const location = useLocation();
  const fromHistory = location.state?.fromHistory || false;

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleDownload = async () => {
    if (!data || !data.arquivo) return;
    try {
      const urlRelativa = data.arquivo.replace('https://teia.cic.unb.br/kipo_playground/', '');
      const response = await api.get(urlRelativa, { responseType: 'blob' });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `producao-${data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Erro no download:", error);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`api/production/${id}/`)
        setData(response.data)
      } catch (error) {
        console.error("Erro ao carregar:", error)
        alert("Erro ao carregar a produção.")
        navigate("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetails()
  }, [id, navigate])

  if (loading) return <div style={{ padding: "50px", textAlign: "center", color: "#90A4AE" }}>Carregando detalhes...</div>
  if (!data) return null

  const isRejected = data.status && (data.status.toLowerCase().includes("rejeitado") || data.status.toLowerCase().includes("correção"))
  const isApproved = data.status && (data.status.toLowerCase().includes("aprovado") || data.status.toLowerCase().includes("publicado"))

  const getTheme = (disciplina) => {
    const disc = disciplina ? disciplina.trim() : "Outra"
    const themes = {
      História: { main: "#7B1FA2", bg: "#F3E5F5" }, Geografia: { main: "#E65100", bg: "#FFF3E0" },
      Filosofia: { main: "#455A64", bg: "#ECEFF1" }, Sociologia: { main: "#5D4037", bg: "#EFEBE9" },
      Português: { main: "#1565C0", bg: "#E3F2FD" }, Matemática: { main: "#C2185B", bg: "#FCE4EC" },
      Ciências: { main: "#2E7D32", bg: "#E8F5E9" }, Default: { main: "#1565C0", bg: "#E3F2FD" }
    }
    return themes[disc] || themes["Default"]
  }
  const theme = getTheme(data.disciplina)

  // 2. A LÓGICA FINAL DE QUEM PODE VER A AVALIAÇÃO
  const podeVerParecer = data.is_dono || data.is_admin || (data.is_revisor && fromHistory);

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div style={styles.grid}>
          <div style={styles.columnContent}>
            <div style={styles.materialCard}>
              <div style={styles.headerSection}>
                <div style={styles.badgesRow}>
                  <span style={{ ...styles.badge, backgroundColor: theme.bg, color: theme.main }}>{data.disciplina}</span>
                  <span style={styles.badgeNeutral}>{data.nivel}</span>
                </div>
                <h1 style={styles.title}>{data.titulo}</h1>
                <div style={styles.metaRow}>
                  <div style={styles.iaTag}><Bot size={14} /> {data.modelo_ia}</div>
                  <span style={styles.dateText}><Calendar size={14} /> {data.data}</span>
                </div>
              </div>

              {data.producao_base && (
                <div style={styles.derivationBanner}>
                  <Bookmark size={20} color="#1565C0" />
                  <span style={{ fontSize: "14px", color: "#1A237E" }}>
                    Inspirada em: <strong><a href={`/dashboard/producao/${data.producao_base.id}`} style={{ color: "#1565C0" }}>{data.producao_base.titulo}</a></strong>
                  </span>
                </div>
              )}

              <div style={styles.techSheet}>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}><Wrench size={18} color={theme.main} /></div>
                  <div><span style={{ ...styles.techLabel, color: theme.main }}>Metodologia</span><span style={styles.techValue}>{data.metodologia || "-"}</span></div>
                </div>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}><Clock size={18} color={theme.main} /></div>
                  <div><span style={{ ...styles.techLabel, color: theme.main }}>Duração</span><span style={styles.techValue}>{data.duracao || "-"}</span></div>
                </div>
                <div style={styles.techItem}>
                  <div style={styles.iconCircle}><Package size={18} color={theme.main} /></div>
                  <div>
                    <span style={{ ...styles.techLabel, color: theme.main }}>Recursos</span>
                    <span style={styles.techValue}>
                        {Array.isArray(data.recursos) 
                            ? data.recursos.join(', ') 
                            : (typeof data.recursos === 'string' 
                                ? data.recursos.split(',').map(r => r.trim()).join(', ') 
                                : '-')}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}><BookOpen size={18}/> Alinhamento BNCC</h3>
                <div style={styles.bnccBox}>{data.bncc || "Não informado."}</div>
              </div>

              <div style={styles.section}>
                  <h3 style={styles.sectionTitle}><Cpu size={20} /> BNCC Computação</h3>
                  <div style={{ ...styles.bnccBox, backgroundColor: '#E3F2FD', borderLeft: '4px solid #1565C0' }}>
                      <p style={{ ...styles.bnccText, color: '#0D47A1' }}>
                        {data.bncc_computacao || "Nenhuma habilidade registrada."}
                      </p>
                  </div>
              </div>

              <div style={styles.section}>
                  <h3 style={styles.sectionTitle}><Terminal size={20} /> Prompts na IA</h3>
                  <div style={styles.promptBox}>{data.prompts_ia || "Nenhum prompt registrado."}</div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}><Lightbulb size={20} color="#F57C00" /> Relato de Experiência</h3>
                <div style={styles.textBody}>{data.experiencia}</div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}><Target size={20} color="#2E7D32" /> Resultados</h3>
                <div style={styles.resultsBox}>{data.resultados}</div>
              </div>
              
              {/* O COMPONENTE COM A TRAVA ABSOLUTA */}
              {podeVerParecer && (
                  <ParecerTecnico producao={data} />
              )}
              
            </div>
          </div>

          <div style={styles.columnSidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Status do Material</h3>
              {isApproved && (
                <div style={styles.statusBoxApproved}>
                  <ShieldCheck size={24} color="#2E7D32" />
                  <div>
                      <span style={styles.statusTitleApproved}>APROVADO</span>
                      <p style={styles.statusDesc}>Validado pela comunidade.</p>
                  </div>
                </div>
              )}
              {!isApproved && !isRejected && (
                <div style={styles.statusBoxPending}>
                  <Clock size={24} color="#EF6C00" />
                  <div><span style={styles.statusTitlePending}>EM ANÁLISE</span></div>
                </div>
              )}
              <div style={styles.divider}></div>
              
              <h3 style={styles.sidebarTitle}>Arquivos e Links</h3>
              
              {data.arquivo && (
                <button onClick={handleDownload} style={styles.downloadBtn}>
                  <Download size={18} /> Baixar Roteiro
                </button>
              )}
              
              {data.link_material && (
                <a href={data.link_material} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ ...styles.downloadBtn, backgroundColor: '#7B1FA2', marginTop: data.arquivo ? '10px' : '0' }}>
                    <ExternalLink size={18} /> Acessar Link Externo
                  </button>
                </a>
              )}

              {!data.arquivo && !data.link_material && (
                <p style={{ fontSize: "13px", color: "#999", textAlign: "center" }}>Nenhum material anexado.</p>
              )}

            </div>
          </div>
        </div>  
      </div>
    </div>
  )
}

const ParecerTecnico = ({ producao }) => {
    // Retorna nulo se a lista de avaliações vier vazia (backend esvaziou ou não existe)
    if (!producao || !producao.avaliacoes_detalhadas || producao.avaliacoes_detalhadas.length === 0) {
        return null;
    }

    const avaliacoes = producao.avaliacoes_detalhadas;
    
    return (
        <div style={styles.ptContainer}>
            <div style={styles.ptMainHeader}>
                <BarChart3 size={24} color="#1565C0" />
                <div>
                    <h3 style={styles.ptMainTitle}>Histórico de Revisão</h3>
                    <p style={styles.ptMainSubtitle}>Detalhamento dos avaliadores sobre esta prática.</p>
                </div>
            </div>
            <div style={styles.ptCardsWrapper}>
                {avaliacoes.map((aval) => (
                    <ReviewCard key={aval.ordem} avaliacao={aval} />
                ))}
                
                {/* 3. CARD FANTASMA AGORA SÓ APARECE PARA O DONO OU ADMIN */}
                {avaliacoes.length === 1 && (producao.is_dono || producao.is_admin) && !producao.status.toLowerCase().includes('rejeitado') && (
                    <GhostCard />
                )}
            </div>
        </div>
    );
};

const ReviewCard = ({ avaliacao }) => {
    const isAprovado = avaliacao.aprovado;
    const { notas, pontos_fortes, pontos_melhoria, ordem } = avaliacao;
    return (
        <div style={styles.rcCard(isAprovado)}>
            <div style={styles.rcHeader(isAprovado)}>
                <div style={styles.rcHeaderTitle(isAprovado)}>
                    {isAprovado ? <CheckCircle2 size={22}/> : <ShieldAlert size={22}/>}
                    <span>PARECER DO {ordem}º AVALIADOR</span>
                </div>
                <div style={styles.rcBadge(isAprovado)}>{isAprovado ? 'APROVADO' : 'AJUSTES'}</div>
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
                            <div style={styles.rcFeedbackLabelSuccess}><ThumbsUp size={16}/> Pontos Fortes</div>
                            <div style={styles.rcFeedbackTextSuccess}>{pontos_fortes}</div>
                        </div>
                    )}
                    {pontos_melhoria && (
                        <div style={styles.rcFeedbackBoxDanger}>
                            <div style={styles.rcFeedbackLabelDanger}><AlertTriangle size={16}/> Melhorias</div>
                            <div style={styles.rcFeedbackTextDanger}>{pontos_melhoria}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GhostCard = () => (
    <div style={styles.gcCard}>
        <div style={styles.gcHeader}>
            <div style={styles.gcTitle}><Clock size={22} color="#90A4AE" /><span>AGUARDANDO 2º AVALIADOR</span></div>
        </div>
        <div style={styles.gcContent}><p style={styles.gcText}>Aguardando o parecer de mais um colega para finalização.</p></div>
    </div>
);

const ScoreItem = ({ label, valor }) => (
    <div style={styles.rcScoreRow}>
        <span style={styles.rcLabel}>{label}</span>
        <div style={styles.rcStarsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={12} fill={star <= valor ? "#EF5350" : "#E0E0E0"} color="transparent" />
            ))}
            <span style={styles.rcNumberValue}>{valor}/5</span>
        </div>
    </div>
);

const styles = {
  fullPageWrapper: { backgroundColor: "#F0F2F5", minHeight: "100vh", paddingTop: "20px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px 20px" },
  backButton: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#546E7A", fontWeight: "700", marginBottom: "15px" },
  grid: { display: "flex", gap: "20px", alignItems: "flex-start" },
  columnContent: { flex: 1, minWidth: "0" },
  columnSidebar: { width: "320px", position: "sticky", top: "20px" },
  materialCard: { backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "30px", border: "1px solid #E0E0E0" },
  headerSection: { marginBottom: "20px", borderBottom: "1px solid #F0F0F0", paddingBottom: "15px" },
  badgesRow: { display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" },
  badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
  badgeNeutral: { backgroundColor: "#F5F5F5", color: "#616161", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  title: { fontSize: "24px", fontWeight: "800", color: "#1A237E", margin: "0 0 8px 0", wordBreak: "break-word", overflowWrap: "break-word" },
  metaRow: { display: "flex", alignItems: "center", gap: "15px", marginTop: "5px" },
  iaTag: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#546E7A", backgroundColor: "#F5F5F5", padding: "4px 8px", borderRadius: "6px" },
  dateText: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#90A4AE" },
  derivationBanner: { backgroundColor: "#E3F2FD", borderLeft: "4px solid #1565C0", padding: "12px 15px", borderRadius: "6px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" },
  techSheet: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "30px" },
  techItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  iconCircle: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center" },
  techLabel: { display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: "800", color: "#90A4AE" },
  techValue: { fontSize: "13px", color: "#37474F", fontWeight: "600", wordBreak: "break-word", overflowWrap: "break-word" },
  section: { marginBottom: "30px" },
  sectionTitle: { fontSize: "16px", fontWeight: "800", color: "#37474F", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" },
  bnccBox: { backgroundColor: "#FFF8E1", borderLeft: "4px solid #FFC107", padding: "15px", borderRadius: "6px", marginBottom: "30px", wordBreak: "break-word", overflowWrap: "break-word" },
  bnccText: { margin: 0, fontSize: "14px", color: "#3E2723", lineHeight: "1.5", wordBreak: "break-word", overflowWrap: "break-word" },
  promptBox: { backgroundColor: "#F8FAFC", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #8B5CF6", color: "#475569", fontSize: "14px", fontStyle: "italic", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" },
  textBody: { fontSize: "15px", lineHeight: "1.6", color: "#455A64", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" },
  resultsBox: { backgroundColor: "#E8F5E9", padding: "15px", borderRadius: "8px", border: "1px solid #C8E6C9", color: "#1B5E20", fontSize: "14px", fontStyle: "italic", wordBreak: "break-word", overflowWrap: "break-word" },
  sidebarCard: { backgroundColor: "white", border: "1px solid #E0E0E0", borderRadius: "12px", padding: "20px" },
  sidebarTitle: { fontSize: "12px", textTransform: "uppercase", fontWeight: "800", color: "#90A4AE", borderBottom: "1px solid #EEE", paddingBottom: "8px" },
  statusBoxApproved: { display: "flex", alignItems: "center", gap: "12px", padding: "15px", backgroundColor: "#E8F5E9", borderRadius: "8px", border: "1px solid #C8E6C9" },
  statusTitleApproved: { fontSize: "14px", fontWeight: "900", color: "#2E7D32" },
  statusBoxPending: { display: "flex", alignItems: "center", gap: "12px", padding: "15px", backgroundColor: "#FFF3E0", borderRadius: "8px", border: "1px solid #FFE0B2" },
  statusTitlePending: { fontSize: "14px", fontWeight: "900", color: "#EF6C00" },
  statusDesc: { fontSize: "11px", color: "#546E7A", margin: 0 },
  divider: { height: "1px", backgroundColor: "#EEE", margin: "20px 0" },
  downloadBtn: { width: "100%", padding: "12px", backgroundColor: "#1565C0", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  ptContainer: { marginTop: '40px', borderTop: '1px solid #E0E0E0', paddingTop: '30px' },
  ptMainHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  ptMainTitle: { fontSize: '20px', fontWeight: '800', color: '#1A237E', margin: '0 0 4px 0' },
  ptMainSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },
  ptCardsWrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rcCard: (aprovado) => ({ backgroundColor: '#FFFFFF', borderRadius: '12px', border: aprovado ? '1px solid #A5D6A7' : '1px solid #EF9A9A', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }),
  rcHeader: (aprovado) => ({ backgroundColor: aprovado ? '#E8F5E9' : '#FFEBEE', padding: '15px 25px', borderBottom: aprovado ? '1px solid #C8E6C9' : '1px solid #FFCDD2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  rcHeaderTitle: (aprovado) => ({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '900', color: aprovado ? '#2E7D32' : '#C62828' }),
  rcBadge: (aprovado) => ({ fontSize: '11px', fontWeight: '800', backgroundColor: aprovado ? '#C8E6C9' : '#FFCDD2', color: aprovado ? '#1B5E20' : '#B71C1C', padding: '6px 12px', borderRadius: '20px' }),
  rcContent: { padding: '25px' },
  rcSectionTitle: { fontSize: '13px', fontWeight: '800', color: '#78909C', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' },
  rcGridScores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 30px' },
  rcScoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', padding: '8px 12px', borderRadius: '8px', border: '1px solid #F0F0F0' },
  rcLabel: { fontSize: '13px', color: '#455A64', fontWeight: '600' },
  rcStarsContainer: { display: 'flex', alignItems: 'center' },
  rcNumberValue: { fontSize: '13px', fontWeight: '800', marginLeft: '8px', minWidth: '25px', textAlign: 'right' },
  rcDivider: { border: 'none', borderTop: '1px dashed #CFD8DC', margin: '25px 0' },
  rcFeedbackGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  rcFeedbackBoxSuccess: { backgroundColor: '#F1F8E9', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #7CB342' },
  rcFeedbackLabelSuccess: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#33691E', marginBottom: '8px', textTransform: 'uppercase' },
  rcFeedbackTextSuccess: { fontSize: '14px', color: '#33691E', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
  rcFeedbackBoxDanger: { backgroundColor: '#FFF3E0', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #FF9800' },
  rcFeedbackLabelDanger: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#E65100', marginBottom: '8px', textTransform: 'uppercase' },
  rcFeedbackTextDanger: { fontSize: '14px', color: '#E65100', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
  rcFeedbackBoxNeutral: { backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #90A4AE' },
  rcFeedbackTextNeutral: { fontSize: '14px', color: '#455A64', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' },
  gcCard: { backgroundColor: '#FAFAFA', borderRadius: '12px', border: '2px dashed #CFD8DC', overflow: 'hidden', opacity: 0.8 },
  gcHeader: { backgroundColor: '#F5F7FA', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  gcTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '900', color: '#90A4AE' },
  gcContent: { padding: '25px', textAlign: 'center' },
  gcText: { margin: 0, fontSize: '14px', color: '#78909C', lineHeight: '1.6' }
}

export default DetalharProducao