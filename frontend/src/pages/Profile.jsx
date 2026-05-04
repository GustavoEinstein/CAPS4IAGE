import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    User, Mail, ArrowLeft, BookOpen, School, 
    Trophy, Zap, Star, History, Award, Info 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dados');
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        disciplina: '',
        escola: '',
        avatar: null,
        pontos: 0,
        nivel: '',
        progresso: { porcentagem: 0, falta: 0, proximo_marco: 0, label: '' },
        conquistas: [] // Campo integrado com o novo backend
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            const response = await api.get('api/user/me/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUserData(response.data);
            updateLocalStorage(response.data);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const updateLocalStorage = (data) => {
        localStorage.setItem('user_name', data.username);
        localStorage.setItem('user_pontos', data.pontos);
        localStorage.setItem('user_nivel', data.nivel);
        window.dispatchEvent(new Event('storage'));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return (
        <div style={styles.loadingContainer}>
            <Zap size={32} color="#1565C0" className="animate-pulse" />
            <p>Sincronizando seu progresso...</p>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <ArrowLeft size={18} /> Painel Principal
                </button>

                {/* Cabeçalho do Perfil */}
                <div style={styles.headerSection}>
                    <div style={styles.avatarWrapper}>
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="Avatar" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                {userData.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div style={styles.levelBadge}>
                            <Star size={12} fill="white" color="white" />
                        </div>
                    </div>
                    <h2 style={styles.userName}>{userData.username}</h2>
                    <p style={styles.userSub}>{userData.disciplina} • {userData.escola}</p>
                </div>

                {/* Seção de Gamificação / Barra de XP */}
                <div style={styles.xpCard}>
                    <div style={styles.xpHeader}>
                        <div>
                            <span style={styles.labelTitle}>Nível Atual</span>
                            <h3 style={styles.nivelStatus}>{userData.nivel}</h3>
                        </div>
                        <div style={styles.xpBadge}>
                            <Zap size={14} fill="#1565C0" color="#1565C0" />
                            <span>{userData.pontos} XP</span>
                        </div>
                    </div>

                    <div style={styles.progressContainer}>
                        <div style={styles.progressTrack}>
                            <div 
                                style={{ 
                                    ...styles.progressFill, 
                                    width: `${userData.progresso?.porcentagem || 0}%` 
                                }} 
                            />
                        </div>
                        <div style={styles.progressLabels}>
                            <span>{userData.progresso?.label}</span>
                            <span>Faltam {userData.progresso?.falta} XP</span>
                        </div>
                    </div>
                </div>

                {/* Abas */}
                <div style={styles.tabs}>
                    <button 
                        onClick={() => setActiveTab('dados')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'dados' ? styles.tabBtnActive : {}) }}
                    >
                        <User size={16} /> Dados Pessoais
                    </button>
                    <button 
                        onClick={() => setActiveTab('conquistas')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'conquistas' ? styles.tabBtnActive : {}) }}
                    >
                        <Award size={16} /> Conquistas
                    </button>
                </div>

                {/* Conteúdo das Abas */}
                <div style={styles.tabContent}>
                    {activeTab === 'dados' ? (
                        <div style={styles.infoGrid}>
                            <InfoItem icon={<Mail size={18}/>} label="E-mail" value={userData.email} />
                            <InfoItem icon={<School size={18}/>} label="Instituição" value={userData.escola} />
                            <InfoItem icon={<BookOpen size={18}/>} label="Área" value={userData.disciplina} />
                        </div>
                    ) : (
                        <div style={styles.conquistasGrid}>
                            {userData.conquistas && userData.conquistas.length > 0 ? (
                                userData.conquistas.map((item) => (
                                    <div key={item.id} style={styles.conquistaCard}>
                                        <div style={styles.conquistaIconBox}>
                                            <Trophy size={22} color="#F59E0B" />
                                        </div>
                                        <div style={{flex: 1}}>
                                            <h4 style={styles.conquistaNome}>{item.nome}</h4>
                                            <p style={styles.conquistaDesc}>{item.descricao}</p>
                                            <span style={styles.conquistaData}>Desbloqueado em: {item.data}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyConquistas}>
                                    <History size={40} color="#CBD5E1" />
                                    <p>Suas medalhas aparecerão aqui à medida que você participar da comunidade!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>Sair da Conta</button>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div style={styles.infoItem}>
        <div style={styles.infoIcon}>{icon}</div>
        <div>
            <p style={styles.infoLabel}>{label}</p>
            <p style={styles.infoValue}>{value || "Não informado"}</p>
        </div>
    </div>
);

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '40px 20px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '15px', color: '#64748B' },
    card: { width: '100%', maxWidth: '480px', background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: '600', marginBottom: '24px', fontSize: '14px' },
    headerSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' },
    avatarWrapper: { position: 'relative', marginBottom: '16px', display: 'inline-block' },
    avatarImg: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #F1F5F9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    avatarPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' },
    levelBadge: { position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#F59E0B', padding: '5px', borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    userName: { color: '#0F172A', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', textTransform: 'capitalize' },
    userSub: { color: '#64748B', fontSize: '14px', margin: 0 },
    xpCard: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', marginBottom: '24px' },
    xpHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    labelTitle: { fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
    nivelStatus: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' },
    xpBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#1565C0', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
    progressContainer: { width: '100%' },
    progressTrack: { height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #1565C0, #3B82F6)', borderRadius: '10px', transition: 'width 0.8s ease' },
    progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', fontWeight: '600' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px', background: '#F8FAFC', padding: '4px', borderRadius: '12px' },
    tabBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: 'none', background: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '600' },
    tabBtnActive: { background: 'white', color: '#1565C0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '12px', border: '1px solid #F1F5F9' },
    infoIcon: { color: '#94A3B8' },
    infoLabel: { margin: 0, fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
    infoValue: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' },
    
    // ESTILOS DA GRADE DE CONQUISTAS
    conquistasGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    conquistaCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' },
    conquistaIconBox: { width: '42px', height: '42px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    conquistaNome: { margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E293B' },
    conquistaDesc: { margin: '2px 0 4px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' },
    conquistaData: { fontSize: '10px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
    
    emptyConquistas: { padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    logoutBtn: { marginTop: '24px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #FEE2E2', background: 'white', color: '#EF4444', fontWeight: '700', cursor: 'pointer' }
};

export default Profile;