import React from 'react';
import { 
    Trophy, 
    Rocket, 
    Star, 
    ShieldCheck, 
    Sparkles 
} from 'lucide-react';

export default function Ranking() {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                
                <div style={styles.card}>
                    {/* Animação e Ícone de Destaque */}
                    <div style={styles.iconWrapper}>
                        <div style={styles.glowEffect}></div>
                        <Rocket size={64} color="#1565C0" style={styles.floatingIcon} />
                    </div>

                    <h1 style={styles.title}>O Hall da Fama está sendo construído!</h1>
                    <p style={styles.subtitle}>
                        Estamos preparando uma experiência incrível para reconhecer e recompensar 
                        os professores que mais contribuem com a comunidade T.E.I.A.
                    </p>

                    {/* Caixa de Spoilers / Hype */}
                    <div style={styles.hypeBox}>
                        <h3 style={styles.hypeTitle}>
                            <Sparkles size={20} color="#F59E0B" /> 
                            O que vem por aí?
                        </h3>
                        
                        <div style={styles.featuresGrid}>
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}><Trophy size={24} color="#F59E0B" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Ranking Oficial</h4>
                                    <p style={styles.featureDesc}>Dispute o topo do pódio mensalmente com seus colegas.</p>
                                </div>
                            </div>
                            
                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}><ShieldCheck size={24} color="#10B981" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Títulos e Níveis</h4>
                                    <p style={styles.featureDesc}>Evolua de Aprendiz até se tornar um Grão-Mestre do T.E.I.A.</p>
                                </div>
                            </div>

                            <div style={styles.featureItem}>
                                <div style={styles.featureIcon}><Star size={24} color="#8B5CF6" /></div>
                                <div>
                                    <h4 style={styles.featureName}>Conquistas Únicas</h4>
                                    <p style={styles.featureDesc}>Desbloqueie medalhas exclusivas para exibir no seu perfil.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerta de Suspense (Pegada Gamificada) */}
                    <div style={styles.alertBox}>
                        <strong style={styles.alertStrong}>🕵️‍♂️ O Hall da Fama  já está rodando na surdina...</strong>
                        Achou que as suas contribuições iam passar em branco? Cada material publicado e revisão feita já está gerando pontos secretos para o seu perfil. Continue engajando e garanta sua vantagem pro dia do lançamento oficial!
                    </div>

                </div>

            </div>
            
            {/* CSS in line para a animação de flutuação */}
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
        maxWidth: '550px'
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
        gap: '20px'
    },
    featureItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px'
    },
    featureIcon: {
        width: '48px',
        height: '48px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
        border: '1px solid #E2E8F0',
        flexShrink: 0
    },
    featureName: {
        margin: '0 0 4px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B'
    },
    featureDesc: {
        margin: 0,
        fontSize: '14px',
        color: '#64748B',
        lineHeight: '1.5'
    },

    // Alerta de suspense em tons de roxo
    alertBox: {
        backgroundColor: '#F5F3FF', // Roxo bem clarinho
        color: '#4C1D95', // Roxo escuro
        padding: '20px 25px',
        borderRadius: '12px',
        fontSize: '15px',
        lineHeight: '1.6',
        border: '1px dashed #8B5CF6',
        textAlign: 'left'
    },
    alertStrong: {
        color: '#5B21B6',
        fontWeight: '800',
        display: 'block',
        marginBottom: '4px'
    }
};