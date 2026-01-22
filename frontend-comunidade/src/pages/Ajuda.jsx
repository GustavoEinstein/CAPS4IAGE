import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HelpCircle, 
    PlayCircle, 
    ChevronDown, 
    ChevronUp, 
    BookOpen, 
    ShieldCheck, 
    FileText,
    ArrowLeft
} from 'lucide-react';

const Ajuda = () => {
    const navigate = useNavigate();
    const [faqAtivo, setFaqAtivo] = useState(null);

    const toggleFaq = (index) => {
        setFaqAtivo(faqAtivo === index ? null : index);
    };

    const faqs = [
        {
            pergunta: 'Como funciona o processo de "Revisão por Pares"?',
            resposta: 'Após enviar sua produção, ela entra em uma fila anônima. Um outro professor da sua mesma área (ex: Filosofia revisa Filosofia) avaliará seu material seguindo uma Rúbrica de 6 Eixos: Coerência Pedagógica, Qualidade Didática, Metodologia, Avaliação, Inclusão e Inovação.'
        },
        {
            pergunta: 'Por que não consigo revisar atividades de outras disciplinas?',
            resposta: 'Para garantir a qualidade técnica e pedagógica, o sistema restringe a revisão à sua área de especialidade. Isso garante que quem avalia entende profundamente o conteúdo e a BNCC aplicável.'
        },
        {
            pergunta: 'O que acontece se minha produção for rejeitada?',
            resposta: 'Não se preocupe! Você receberá um feedback detalhado com "Pontos Fortes" e "Sugestões de Melhoria" e você podera reenviar o material ajustado.'
        },
        {
            pergunta: 'Quais dados devo preencher ao catalogar?',
            resposta: 'O foco agora é na Prática Pedagógica. Além do básico (Título, Nível), pedimos detalhamento sobre: Alinhamento com a BNCC, Metodologia usada, Relato de Experiência (como foi a aula) e Resultados Observados.'
        },
        {
            pergunta: 'Quem pode ver meus materiais aprovados?',
            resposta: 'Uma vez aprovado, seu material ganha o selo "Revisado por Pares" e fica visível na vitrine da página inicial para toda a comunidade escolar utilizar e replicar.'
        }
    ];

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                {/* Header com Botão Voltar opcional */}
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div>
                        <h1 style={styles.pageTitle}>Central de Ajuda</h1>
                        <p style={styles.pageSubtitle}>
                            Tire suas dúvidas sobre o funcionamento da plataforma.
                        </p>
                    </div>
                </div>

                {/* --- SEÇÃO DE TUTORIAIS (CARDS) --- */}
                <h3 style={styles.sectionTitle}>
                    <PlayCircle size={22} color="#1565C0" /> Primeiros Passos
                </h3>
                
                <div style={styles.tutorialsGrid}>
                    <div style={styles.tutorialCard}>
                        <div style={styles.iconBox}><FileText size={24} color="#1565C0"/></div>
                        <h4 style={styles.cardTitle}>Guia de Catalogação</h4>
                        <p style={styles.cardText}>
                            Aprenda a preencher os campos pedagógicos (BNCC, Metodologia) para garantir sua aprovação.
                        </p>
                        <button style={styles.videoButton}>Assistir Tutorial</button>
                    </div>

                    <div style={styles.tutorialCard}>
                        <div style={styles.iconBox}><ShieldCheck size={24} color="#2E7D32"/></div>
                        <h4 style={styles.cardTitle}>Como Revisar um Par</h4>
                        <p style={styles.cardText}>
                            Entenda como aplicar a Rúbrica de 6 Eixos para avaliar seus colegas de forma justa.
                        </p>
                        <button style={styles.videoButton}>Assistir Tutorial</button>
                    </div>

                    <div style={styles.tutorialCard}>
                        <div style={styles.iconBox}><BookOpen size={24} color="#E65100"/></div>
                        <h4 style={styles.cardTitle}>Usando Materiais em Sala</h4>
                        <p style={styles.cardText}>
                            Dicas de como adaptar os roteiros e prompts da plataforma para a sua realidade escolar.
                        </p>
                        <button style={styles.videoButton}>Assistir Tutorial</button>
                    </div>
                </div>

                {/* --- SEÇÃO DE FAQ (ACCORDION) --- */}
                <h3 style={{...styles.sectionTitle, marginTop: '40px'}}>
                    <HelpCircle size={22} color="#1565C0" /> Perguntas Frequentes
                </h3>

                <div style={styles.faqContainer}>
                    {faqs.map((faq, index) => (
                        <div key={index} style={styles.faqItem}>
                            <button
                                style={{
                                    ...styles.faqQuestion,
                                    color: faqAtivo === index ? '#1565C0' : '#37474F'
                                }}
                                onClick={() => toggleFaq(index)}
                            >
                                {faq.pergunta}
                                {faqAtivo === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {faqAtivo === index && (
                                <div style={styles.faqAnswer}>
                                    {faq.resposta}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- RODAPÉ DE SUPORTE --- */}
                <div style={styles.supportFooter}>
                    <p style={{margin: 0, color: '#546E7A'}}>
                        Ainda com dúvidas? Entre em contato com a coordenação pedagógica.
                    </p>
                    <a href="#" style={styles.contactLink}>Fale Conosco</a>
                </div>

            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '30px 20px' },
    container: { maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    
    header: { marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '15px' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '600', fontSize: '15px', alignSelf: 'flex-start', padding: 0 },
    pageTitle: { fontSize: '28px', color: '#1565C0', fontWeight: '800', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '16px', color: '#546E7A', margin: 0 },

    sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#37474F', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },

    // TUTORIAL CARDS
    tutorialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    tutorialCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    iconBox: { backgroundColor: '#F5F7FA', padding: '12px', borderRadius: '10px', marginBottom: '15px' },
    cardTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: '700', color: '#333' },
    cardText: { margin: '0 0 20px 0', fontSize: '14px', color: '#546E7A', lineHeight: '1.5', flex: 1 },
    videoButton: { backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: '100%' },

    // FAQ
    faqContainer: { backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #E0E0E0', overflow: 'hidden' },
    faqItem: { borderBottom: '1px solid #F0F0F0' },
    faqQuestion: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' },
    faqAnswer: { padding: '0 25px 25px 25px', fontSize: '14px', color: '#546E7A', lineHeight: '1.6' },

    supportFooter: { marginTop: '40px', textAlign: 'center', borderTop: '1px solid #E0E0E0', paddingTop: '20px' },
    contactLink: { display: 'inline-block', marginTop: '8px', color: '#1565C0', fontWeight: '700', textDecoration: 'none' }
};

export default Ajuda;