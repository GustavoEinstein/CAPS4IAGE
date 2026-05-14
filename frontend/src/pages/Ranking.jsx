import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trophy, 
    Rocket, 
    Star, 
    ShieldCheck, 
    Sparkles,
    ArrowLeft
} from 'lucide-react';

export default function Ranking() {
    const navigate = useNavigate();

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                
                <div style={styles.card}>
                    {/* Animação e Ícone de Destaque */}
                    <div style={styles.iconWrapper}>
                        <div style={styles.glowEffect}></div>
                        <Rocket size={64} color="#1565C0" style={styles.floatingIcon} />
                    </div>

                    <h1 style={styles.title}>O Espaço de Reconhecimento está em construção!</h1>
                    <p style={styles.subtitle}>
                        Estamos preparando uma experiência incrível para celebrar e recompensar 
                        o impacto pedagógico dos professores que mais contribuem com a comunidade T.E.I.A.
                    </p>

                    {/* Caixa de Spoilers / Hype (Com efeito visual de "Bloqueado") */}
                    <div style={styles.hypeBox}>
                        <h3 style={styles.hypeTitle}>
                            <Sparkles size={20} color="#F59E0B" /> 
                            O que vem por aí?
                        </h3>
                        
                        <div style={styles.featuresGrid}>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIconLocked}><Trophy size={24} color="#94A3B8" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Rede de Destaques</h4>
                                    <p style={styles.featureDesc}>
                                        Um espaço dedicado a celebrar os educadores mais engajados. Destaque suas contribuições pedagógicas, inspire colegas e seja reconhecido.
                                    </p>
                                </div>
                            </div>
                            
                            <div style={styles.featureItem}>
                                <div style={styles.featureIconLocked}><ShieldCheck size={24} color="#94A3B8" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Trilhas de Evolução</h4>
                                    <p style={styles.featureDesc}>
                                        Acompanhe seu crescimento na plataforma, evoluindo de "Iniciante" até se tornar um "Curador Pedagógico" respeitado na rede.
                                    </p>
                                </div>
                            </div>

                            <div style={styles.featureItem}>
                                <div style={styles.featureIconLocked}><Star size={24} color="#94A3B8" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Marcos Colaborativos</h4>
                                    <p style={styles.featureDesc}>
                                        Desbloqueie insígnias exclusivas baseadas na qualidade e no impacto positivo das suas práticas validadas em sala de aula.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerta de Suspense */}
                    <div style={styles.alertBox}>
                        <strong style={styles.alertStrong}>🕵️‍♂️ A rede já está mapeando seus impactos na surdina...</strong>
                        Achou que as suas contribuições iam passar em branco? Cada material publicado e revisão de qualidade já está gerando um histórico valioso para o seu perfil. Continue colaborando e garanta sua vantagem para o dia do lançamento oficial!
                    </div>

                    {/* Botão de Saída (Evitar "Beco sem saída") */}
                    <div style={styles.footerAction}>
                        <button onClick={() => navigate('/dashboard')} style={styles.btnPrimary}>
                            <ArrowLeft size={18} /> Voltar ao Painel
                        </button>
                    </div>

                </div>

            </div>
            
            {/* CSS in line para as animações */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
                .locked-blur {
                    filter: grayscale(100%) opacity(0.7);
                }
            `}</style>
        </div>
    );
}

const styles = {
    wrapper: { 
        backgroundColor: '#F8FAFC', 
        minHeight: '100vh', 
        padding: '40px 20px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif' 
    },
    container: { 
        maxWidth: '800px', 
        width: '100%' 
    },
    card: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: '24px', 
        padding: '50px 40px', 
        border: '1px solid #E2E8F0', 
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    
    iconWrapper: {
        position: 'relative',
        width: '120px',
        height: '120px',
        margin: '0 auto 30px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    glowEffect: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#EFF6FF',
        borderRadius: '50%',
        animation: 'pulse 3s infinite ease-in-out',
        zIndex: 0
    },
    floatingIcon: {
        position: 'relative',
        zIndex: 1,
        animation: 'float 3s infinite ease-in-out'
    },

    title: { 
        margin: '0 0 15px 0', 
        fontSize: '32px', 
        color: '#0F172A', 
        fontWeight: '900', 
        letterSpacing: '-1px' 
    },
    subtitle: { 
        margin: '0 auto 40px auto', 
        color: '#64748B', 
        fontSize: '16px', 
        lineHeight: '1.6',
        maxWidth: '600px'
    },

    hypeBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        padding: '30px',
        border: '1px solid #E2E8F0',
        marginBottom: '30px',
        textAlign: 'left'
    },
    hypeTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        margin: '0 0 25px 0',
        fontSize: '20px',
        color: '#0F172A',
        fontWeight: '800'
    },
    featuresGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        // Efeito para dar um ar de que está "bloqueado" / em construção
        opacity: '0.8'
    },
    featureItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        padding: '10px',
        borderRadius: '12px',
        transition: 'background-color 0.2s',
    },
    featureIconLocked: {
        width: '48px',
        height: '48px',
        backgroundColor: '#F1F5F9',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #CBD5E1',
        flexShrink: 0
    },
    featureName: {
        margin: '0 0 6px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: '#334155' // Cor um pouco mais apagada
    },
    featureDesc: {
        margin: 0,
        fontSize: '14px',
        color: '#64748B',
        lineHeight: '1.6'
    },

    alertBox: {
        backgroundColor: '#F5F3FF', 
        color: '#4C1D95', 
        padding: '20px 25px',
        borderRadius: '12px',
        fontSize: '15px',
        lineHeight: '1.6',
        border: '1px dashed #8B5CF6',
        textAlign: 'left',
        marginBottom: '35px'
    },
    alertStrong: {
        color: '#5B21B6',
        fontWeight: '800',
        display: 'block',
        marginBottom: '6px'
    },
    
    footerAction: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: '1px solid #F1F5F9',
        paddingTop: '30px'
    },
    btnPrimary: {
        backgroundColor: '#1565C0',
        color: 'white',
        border: 'none',
        padding: '14px 28px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)',
        transition: 'transform 0.2s',
    }
};