import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Download, 
    Bookmark, 
    Bot, 
    BookOpen, 
    CheckCircle2,
    AlertCircle,
    Package, 
    Wrench,
    ListOrdered,
    Lightbulb,
    ShieldCheck,
    XCircle
} from 'lucide-react';

// --- BANCO DE DADOS MOCKADO (AGORA COM RELATOS PROFUNDOS) ---
const MOCK_DB = {
    // 1. O Item "Estrela" (Aprovado)
    "filosofia-01": {
        titulo: "Dilemas Éticos com IA na Sala de Aula",
        disciplina: "Filosofia",
        nivel: "Ensino Médio (2º Ano)",
        modelo_ia: "Claude 3",
        categoria: "Estudo de Caso",
        data_publicacao: "14/05/2024",
        revisado: true,
        aprovado: true,
        
        bncc: "EM13CHS101 - Analisar e avaliar criticamente as relações de poder e as formas de participação política no mundo contemporâneo. / EM13CHS502 - Analisar situações da vida cotidiana... utilizando conceitos éticos.",
        metodologia: "Sala de Aula Invertida e Debate Socrático",
        duracao: "2 aulas (100 min)",
        recursos: "Projetor, Celulares dos alunos (BYOD), Acesso à Internet (Dados ou Wi-Fi)",
        
        resumo: "Uma atividade prática onde os alunos utilizam a IA para gerar cenários de dilemas éticos modernos (carros autônomos, triagem médica, privacidade) e debatem as soluções baseadas em correntes filosóficas.",
        
        // RELATO RICO E DETALHADO
        experiencia: `A aplicação desta atividade ocorreu em duas turmas de 35 alunos cada. O maior desafio inicial foi vencer a "brincadeira" com a IA. Nos primeiros 10 minutos, os alunos tentaram fazer a IA gerar piadas ou respostas absurdas.
        
        Intervenção Pedagógica:
        Ao invés de proibir, usei isso como gancho. Perguntei: "Por que a IA se recusa a responder certas coisas?". Isso nos levou direto ao conceito de "Viés Algorítmico" e "Ética na Programação", que não estava no plano original, mas enriqueceu muito a aula.
        
        Desenvolvimento:
        Quando focamos nos dilemas (ex: Carro Autônomo), a turma se dividiu. O grupo "Utilitarista" usou a IA para calcular danos (matar 1 para salvar 5), enquanto o grupo "Deontológico" argumentava que a IA não tinha o direito de escolher quem morre.
        
        Ponto Alto:
        Um grupo pediu para a IA simular um juiz decidindo uma pena. A IA foi extremamente fria e lógica. Isso chocou os alunos e gerou um debate espontâneo sobre "Humanidade vs. Eficiência" que durou 20 minutos além do previsto. Recomendo fortemente que o professor tenha domínio sobre as alucinações da IA, pois em um momento ela inventou uma lei que não existia, e precisei intervir para corrigir.`,
        
        roteiro: [
            { etapa: "1. Sensibilização (15 min)", descricao: "Apresentação breve sobre Utilitarismo (Bentham/Mill) e Deontologia (Kant). Introdução do conceito de 'Viés Algorítmico'." },
            { etapa: "2. A Oficina de Prompts (25 min)", descricao: "Em grupos, os alunos criam prompts para a IA gerar dilemas específicos. Ex: 'Crie um dilema onde um carro autônomo deve escolher entre salvar o passageiro ou dois pedestres'." },
            { etapa: "3. O Julgamento (40 min)", descricao: "Cada grupo apresenta o dilema gerado. A turma vota na decisão a ser tomada. O professor media conectando com as teorias filosóficas." },
            { etapa: "4. Análise da Resposta da IA (20 min)", descricao: "Pedimos para a IA resolver o dilema. Analisamos: A resposta foi neutra? Foi utilitarista? O que isso diz sobre quem criou a IA?" }
        ],
        arquivo: "plano_aula_etica_ia_vfinal.pdf"
    },

    // 2. O Item Pendente (Aguardando Revisão)
    "filosofia-11": {
        titulo: "O Panóptico Digital: Foucault e Redes",
        disciplina: "Filosofia",
        nivel: "Ensino Médio (3º Ano)",
        modelo_ia: "ChatGPT-4",
        categoria: "Análise Crítica",
        data_publicacao: "Ontem",
        revisado: false, 
        aprovado: false,
        
        bncc: "EM13CHS502 - Analisar situações da vida cotidiana, estilos de vida, valores e condutas... desnaturalizando formas de violência e dominação.",
        metodologia: "Análise de Discurso Assistida por IA",
        duracao: "1 aula (50 min)",
        recursos: "Laboratório de Informática ou Tablets",
        
        resumo: "Comparação entre o conceito de Panóptico de Jeremy Bentham/Michel Foucault e os algoritmos de recomendação e vigilância das redes sociais modernas.",
        
        // RELATO RICO (Expectativa vs Realidade)
        experiencia: `A proposta nasceu da observação de que os alunos não percebem o "olhar invisível" do algoritmo.
        
        A dinâmica funcionou assim:
        Pedi que os alunos baixassem seus dados de uso do Instagram/TikTok (ou apenas olhassem as configurações de anúncios). Copiamos os "Termos de Uso" (partes selecionadas) e pedimos para a IA resumir com a seguinte persona: "Aja como Michel Foucault analisando este texto".
        
        Resultados Preliminares:
        A resposta da IA foi assustadora para eles. Ela descreveu os termos de uso como "celas digitais onde o usuário fornece trabalho gratuito em troca de visibilidade".
        
        Dificuldades:
        O texto gerado pela IA foi muito denso, com vocabulário acadêmico difícil. Tive que gastar 15 minutos "traduzindo" o que a IA disse. Sugiro pedir no prompt: "Explique como Foucault para um adolescente de 16 anos". Sem isso, a aula trava.`,
        
        roteiro: [
            { etapa: "1. Teoria Rápida", descricao: "Exibição da imagem do presídio Panóptico. Conceito de 'Vigiar sem ser visto'." },
            { etapa: "2. Coleta de Dados", descricao: "Alunos acessam 'Sua atividade' nas redes sociais." },
            { etapa: "3. Análise com IA", descricao: "Prompt: 'Analise este comportamento de usuário sob a ótica de Foucault'. Discussão sobre liberdade vigiada." }
        ],
        arquivo: "projeto_panoptico_foucault.pdf"
    },

    // 3. O Item Rejeitado (Falha Pedagógica)
    "filosofia-old": {
        titulo: "Simulação: O Mito da Caverna",
        disciplina: "Filosofia",
        nivel: "Fundamental 2 (9º Ano)",
        modelo_ia: "Gemini",
        categoria: "Roleplay",
        data_publicacao: "20/04/2024",
        revisado: true,
        aprovado: false, 
        feedback_revisor: "A proposta é válida, mas o roteiro técnico para a IA ficou vago. Na prática, a IA tende a alucinar e inventar trechos que não existem na obra original se o prompt não for blindado.",
        
        bncc: "EF09LI11 - Produzir textos...",
        metodologia: "Teatro Improvisado",
        duracao: "3 aulas",
        recursos: "Nenhum específico",
        
        resumo: "Encenação do Mito da Caverna adaptado para a era das Fake News, usando a IA para escrever o roteiro da peça.",
        
        // RELATO DE "FRACASSO" (Aprendizado)
        experiencia: `Tentei fazer com que a IA reescrevesse o Mito da Caverna como se fosse uma thread de Twitter. A ideia parecia ótima no papel.
        
        O Problema:
        Quando os alunos pediram "Reescreva Platão", a IA inventou personagens que não existem no diálogo original e simplificou tanto o conceito de "mundo das ideias" que virou apenas "mundo da mentira".
        
        Consequência:
        Os alunos apresentaram peças que distorciam o conceito filosófico. Gastei mais tempo corrigindo o erro da IA do que ensinando filosofia. Percebi que deveria ter fornecido o texto original para a IA primeiro, ao invés de confiar no treinamento dela. Não recomendo aplicar sem testar os prompts antes exaustivamente.`,
        
        roteiro: [
            { etapa: "1. Leitura", descricao: "Leitura do texto clássico em sala." },
            { etapa: "2. Adaptação", descricao: "IA reescreve o texto como roteiro de teatro moderno." },
            { etapa: "3. Apresentação", descricao: "Grupos encenam para a turma." }
        ],
        arquivo: "rascunho_caverna_falho.docx"
    },

    // 4. Item de Matemática (O que eu revisei)
    "matematica-10": {
        titulo: "Frações no Minecraft: Construção Guiada",
        disciplina: "Matematica",
        nivel: "Fundamental 1 (5º Ano)",
        modelo_ia: "ChatGPT-4o",
        categoria: "Gamificação",
        data_publicacao: "10/06/2024",
        revisado: true,
        aprovado: true,
        
        bncc: "EF05MA03 - Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão ou à ideia de parte de um todo.",
        metodologia: "Aprendizagem Baseada em Jogos (GBL)",
        duracao: "3 aulas (150 min)",
        recursos: "Tablets ou PCs com Minecraft Education, Projetor",
        
        resumo: "Utilização do jogo Minecraft para ensinar frações equivalentes através de desafios de construção gerados pela IA.",
        
        // RELATO POSITIVO
        experiencia: `Notei que meus alunos tinham muita dificuldade em visualizar "frações equivalentes". No papel, 2/4 e 1/2 eram coisas diferentes. 
        
        A Estratégia:
        No Minecraft, ao construir muros, eles perceberam visualmente que ocupavam o mesmo espaço físico. A IA foi fundamental para atuar como "Mestre do Jogo". Eu inseria no ChatGPT: "Gere uma missão de construção que exija usar 3/6 de blocos de madeira". A IA criava uma narrativa ("O Rei precisa de um muro...").
        
        Engajamento:
        Alunos que geralmente dormiam na aula de matemática lideraram os grupos de construção. A avaliação final mostrou um aumento de 40% na compreensão visual de frações. O único cuidado é o tempo: eles se empolgam construindo e esquecem a conta. É preciso usar um cronômetro rígido.`,
        
        roteiro: [
            { etapa: "1. Tutorial (20 min)", descricao: "Comandos básicos de construção no jogo." },
            { etapa: "2. Missão dada pela IA (50 min)", descricao: "IA gera o desafio matemático que deve ser resolvido visualmente." },
            { etapa: "3. Tour de Avaliação (30 min)", descricao: "A turma 'visita' o mundo dos colegas para checar se a fração está correta." }
        ],
        arquivo: "guia_minecraft_fracoes.pdf"
    }
};

const DetalheProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };

    const [data, setData] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Simula carregamento
        setTimeout(() => {
            // Busca no "Banco" ou retorna um fallback se não achar
            const item = MOCK_DB[id] || MOCK_DB["filosofia-01"];
            setData(item);
            setIsSaved(false);
        }, 300);
    }, [id]);

    const getTheme = (disciplina) => {
        const themes = {
            Filosofia: { main: '#455A64', bg: '#ECEFF1', light: '#CFD8DC' },
            Matematica: { main: '#C2185B', bg: '#FCE4EC', light: '#F8BBD0' },
            Historia: { main: '#7B1FA2', bg: '#F3E5F5', light: '#E1BEE7' },
            Ciencias: { main: '#2E7D32', bg: '#E8F5E9', light: '#C8E6C9' },
            Default: { main: '#616161', bg: '#F5F5F5', light: '#E0E0E0' }
        };
        return themes[disciplina] || themes.Default;
    };

    if (!data) return <div style={{padding: '50px', textAlign: 'center'}}>Carregando...</div>;

    const theme = getTheme(data.disciplina);

    // Lógica para cor do status
    const getStatusColor = () => {
        if (!data.revisado) return { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2', icon: <Clock size={20} />, label: "Aguardando Revisão" };
        if (data.aprovado) return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', icon: <ShieldCheck size={20} />, label: "Revisado & Aprovado" };
        return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2', icon: <XCircle size={20} />, label: "Rejeitado na Revisão" };
    };

    const statusStyle = getStatusColor();

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar
                </button>

                <div style={{...styles.grid, flexDirection: isMobile ? 'column' : 'row'}}>
                    
                    {/* --- COLUNA ESQUERDA --- */}
                    <div style={{flex: 2}}>
                        
                        <div style={styles.headerSection}>
                            <div style={styles.badgesRow}>
                                <span style={{...styles.badge, backgroundColor: theme.bg, color: theme.main}}>
                                    {data.disciplina}
                                </span>
                                <span style={styles.badgeNeutral}>{data.nivel}</span>
                                <span style={styles.badgeAi}>
                                    <Bot size={14} style={{marginRight: 4}}/> {data.modelo_ia}
                                </span>
                            </div>
                            
                            <h1 style={styles.title}>{data.titulo}</h1>
                            
                            <div style={styles.metaRow}>
                                <span style={styles.dateText}>
                                    <Calendar size={14} style={{marginRight: '6px'}}/> 
                                    Publicado em {data.data_publicacao}
                                </span>
                            </div>
                        </div>

                        {/* Box Técnico */}
                        <div style={{
                            ...styles.techSheet,
                            backgroundColor: theme.bg,
                            borderColor: theme.light 
                        }}>
                            <div style={styles.techItem}>
                                <div style={styles.iconCircle}>
                                    <Wrench size={20} color={theme.main} />
                                </div>
                                <div style={styles.techContent}>
                                    <span style={{...styles.techLabel, color: theme.main}}>Metodologia</span>
                                    <span style={styles.techValue}>{data.metodologia}</span>
                                </div>
                            </div>

                            <div style={styles.techItem}>
                                <div style={styles.iconCircle}>
                                    <Clock size={20} color={theme.main} />
                                </div>
                                <div style={styles.techContent}>
                                    <span style={{...styles.techLabel, color: theme.main}}>Duração</span>
                                    <span style={styles.techValue}>{data.duracao}</span>
                                </div>
                            </div>

                            <div style={styles.techItem}>
                                <div style={styles.iconCircle}>
                                    <Package size={20} color={theme.main} />
                                </div>
                                <div style={styles.techContent}>
                                    <span style={{...styles.techLabel, color: theme.main}}>Recursos</span>
                                    <span style={styles.techValue}>{data.recursos}</span>
                                </div>
                            </div>
                        </div>

                        {/* Alerta de Rejeição (Se houver) */}
                        {data.revisado && !data.aprovado && (
                            <div style={styles.rejectionBox}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                                    <AlertCircle size={20} color="#B71C1C"/>
                                    <h4 style={{margin: 0, fontSize: '15px', fontWeight: '800', color: '#B71C1C'}}>Parecer da Revisão (Reprovado):</h4>
                                </div>
                                <p style={{margin: 0, fontSize: '14px', lineHeight: '1.5', color: '#B71C1C'}}>
                                    "{data.feedback_revisor}"
                                </p>
                            </div>
                        )}

                        <div style={styles.bnccBox}>
                            <h4 style={styles.bnccTitle}><BookOpen size={16}/> Alinhamento BNCC</h4>
                            <p style={styles.bnccText}>{data.bncc}</p>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Resumo da Atividade</h3>
                            <p style={styles.text}>{data.resumo}</p>
                            
                            <h3 style={styles.sectionTitle}>Relato de Experiência</h3>
                            {/* Renderiza o texto com quebras de linha preservadas */}
                            <p style={styles.text}>{data.experiencia}</p>
                        </div>

                        <div style={styles.roadmapSection}>
                            <div style={{...styles.roadmapHeader, backgroundColor: theme.main}}>
                                <h3 style={{...styles.sectionTitle, marginBottom: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <ListOrdered size={22} /> Roteiro de Aplicação
                                </h3>
                            </div>
                            
                            <div style={styles.roadmapContent}>
                                {data.roteiro.map((passo, index) => (
                                    <div key={index} style={styles.stepItem}>
                                        <div style={{...styles.stepNumber, borderColor: theme.main, color: theme.main}}>
                                            {index + 1}
                                        </div>
                                        <div style={styles.stepText}>
                                            <h4 style={styles.stepTitle}>{passo.etapa}</h4>
                                            <p style={styles.stepDesc}>{passo.descricao}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* --- COLUNA DIREITA --- */}
                    <div style={{flex: 1, minWidth: '300px'}}>
                        
                        <div style={styles.actionCard}>
                            <h3 style={styles.sidebarTitle}>Status do Material</h3>
                            
                            <div style={{
                                ...styles.statusIndicator,
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                borderColor: statusStyle.border
                            }}>
                                {statusStyle.icon}
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <span style={{fontWeight: '700', fontSize: '14px'}}>
                                        {statusStyle.label}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.divider}></div>

                            <h3 style={styles.sidebarTitle}>Downloads</h3>
                            <div style={styles.filePreview}>
                                <div style={styles.fileIcon}><CheckCircle2 size={24} color="#2E7D32"/></div>
                                <div>
                                    <span style={styles.fileName}>{data.arquivo}</span>
                                    <span style={styles.fileMeta}>PDF • Pronto para impressão</span>
                                </div>
                            </div>
                            
                            <button style={styles.downloadButton}>
                                <Download size={18} /> Baixar Roteiro
                            </button>

                            <div style={styles.divider}></div>

                            <div style={styles.socialActions}>
                                <button onClick={() => setIsSaved(!isSaved)} style={{...styles.actionIconBtn, color: isSaved ? '#F57C00' : '#546E7A', backgroundColor: isSaved ? '#FFF3E0' : '#F5F7FA', width: '100%'}}>
                                    <Bookmark size={20} fill={isSaved ? "#F57C00" : "none"} /> 
                                    {isSaved ? "Salvo em Minhas Atividades" : "Salvar para depois"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.tipCard}>
                            <h4 style={styles.tipTitle}>
                                <Lightbulb size={18} /> Adaptação Sugerida
                            </h4>
                            <p style={styles.tipText}>
                                Para turmas sem acesso a celular, o professor pode projetar a IA no quadro e conduzir os prompts coletivamente.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', paddingTop: '20px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', fontFamily: "'Segoe UI', sans-serif" },
    backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#546E7A', fontWeight: '600', marginBottom: '20px' },
    grid: { display: 'flex', gap: '40px' },
    
    headerSection: { marginBottom: '30px' },
    badgesRow: { display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' },
    badge: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    badgeNeutral: { backgroundColor: '#F5F5F5', color: '#616161', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    badgeAi: { backgroundColor: '#ECEFF1', color: '#455A64', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', border: '1px solid #CFD8DC' },
    title: { fontSize: '32px', fontWeight: '800', color: '#263238', margin: '0 0 15px 0', lineHeight: '1.2' },
    metaRow: { display: 'flex', alignItems: 'center', gap: '10px', color: '#78909C', fontSize: '14px' },
    dateText: { display: 'flex', alignItems: 'center', color: '#546E7A', fontWeight: '500' },
    
    techSheet: { 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', padding: '25px', borderRadius: '16px', 
        border: '1px solid', // Cor via inline
        marginBottom: '30px' 
    },
    techItem: { display: 'flex', alignItems: 'center', gap: '15px' },
    iconCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    techContent: { display: 'flex', flexDirection: 'column' },
    techLabel: { fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
    techValue: { fontSize: '15px', color: '#37474F', fontWeight: '600', lineHeight: '1.2' },

    rejectionBox: { backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', padding: '20px', borderRadius: '12px', marginBottom: '30px' },

    bnccBox: { backgroundColor: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px 20px', borderRadius: '0 8px 8px 0', marginBottom: '30px' },
    bnccTitle: { margin: '0 0 5px 0', fontSize: '13px', color: '#F57C00', display: 'flex', alignItems: 'center', gap: '6px' },
    bnccText: { margin: 0, fontSize: '15px', color: '#5D4037' },
    section: { marginBottom: '40px' },
    sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#37474F', marginBottom: '15px', marginTop: '25px' },
    text: { fontSize: '16px', lineHeight: '1.7', color: '#455A64', whiteSpace: 'pre-wrap' },

    roadmapSection: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0E0E0', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    roadmapHeader: { padding: '15px 25px' },
    roadmapContent: { backgroundColor: '#FFFFFF', padding: '25px' },
    stepItem: { display: 'flex', gap: '20px', marginBottom: '25px', position: 'relative' },
    stepNumber: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', flexShrink: 0, backgroundColor: 'white', zIndex: 1 },
    stepText: { flex: 1 },
    stepTitle: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: '700', color: '#333' },
    stepDesc: { margin: 0, fontSize: '15px', color: '#546E7A', lineHeight: '1.5' },

    actionCard: { backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    sidebarTitle: { margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', fontWeight: '700', color: '#90A4AE', letterSpacing: '0.5px' },
    
    statusIndicator: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '8px', border: '1px solid', marginBottom: '20px' },

    filePreview: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F1F8E9', borderRadius: '8px', marginBottom: '20px' },
    fileIcon: { backgroundColor: 'white', borderRadius: '50%', padding: '4px' },
    fileName: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#2E7D32' },
    fileMeta: { fontSize: '11px', color: '#558B2F' },
    downloadButton: { width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' },
    divider: { height: '1px', backgroundColor: '#EEE', margin: '20px 0' },
    socialActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
    actionIconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
    
    tipCard: { backgroundColor: '#FFF3E0', padding: '20px', borderRadius: '12px', border: '1px solid #FFE0B2' },
    tipTitle: { margin: '0 0 8px 0', fontSize: '14px', color: '#E65100', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
    tipText: { margin: 0, fontSize: '13px', color: '#BF360C', lineHeight: '1.5' }
};

export default DetalheProducao;