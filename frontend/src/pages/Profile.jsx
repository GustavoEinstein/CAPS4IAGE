import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { User, Mail, ArrowLeft, BookOpen, School } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        disciplina: '', 
        escola: '',
        avatar: null
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
                alert("Sessão expirada. Por favor, faça login novamente.");
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const updateLocalStorage = (data) => {
        localStorage.setItem('user_name', data.username);
        localStorage.setItem('user_disciplina', data.disciplina);
        localStorage.setItem('user_escola', data.escola); 
        if(data.avatar) localStorage.setItem('user_avatar', data.avatar);
        window.dispatchEvent(new Event('storage'));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return <div style={{padding:'40px', textAlign:'center', color: '#333'}}>Carregando perfil...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar ao Dashboard
                </button>

                <h2 style={styles.title}>Meu Perfil</h2>

                {/* Seção do Avatar (Apenas Visualização) */}
                <div style={styles.avatarSection}>
                    <div style={styles.avatarWrapper}>
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="Avatar" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.form}>
                    
                    {/* NOME (Fixo) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nome de Usuário</label>
                        <div style={styles.readOnlyInput}>
                            <User size={18} style={{marginRight:'10px', color:'#94A3B8'}}/>
                            <span>{userData.username}</span>
                        </div>
                    </div>

                    {/* EMAIL (Fixo) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail Institucional</label>
                        <div style={styles.readOnlyInput}>
                            <Mail size={18} style={{marginRight:'10px', color:'#94A3B8'}}/>
                            <span>{userData.email}</span>
                        </div>
                    </div>

                    {/* ESCOLA (Fixo) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Escola / Instituição</label>
                        <div style={styles.readOnlyInput}>
                            <School size={18} style={{marginRight:'10px', color:'#94A3B8'}}/>
                            <span>{userData.escola || "Não informada"}</span>
                        </div>
                    </div>

                    {/* DISCIPLINA (Fixo) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Área de Atuação / Disciplina</label>
                        <div style={styles.readOnlyInput}>
                            <BookOpen size={18} style={{marginRight:'10px', color:'#94A3B8'}}/>
                            <span>{userData.disciplina || "Não informada"}</span>
                        </div>
                    </div>

                    <p style={{textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px', lineHeight: '1.5'}}>
                        Os dados cadastrais são permanentes para garantir a integridade das avaliações duplo-cego.
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '40px', background: '#F1F5F9', minHeight: '100vh' },
    card: { width: '100%', maxWidth: '500px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontWeight: '600', marginBottom: '20px', fontSize: '14px' },
    title: { color: '#1E293B', fontSize: '24px', marginBottom: '25px', textAlign: 'center', fontWeight: '800' },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarWrapper: { position: 'relative', width: '110px', height: '110px' },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #F1F5F9' },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', fontWeight: 'bold' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    readOnlyInput: { 
        padding: '12px 16px', 
        backgroundColor: '#F8FAFC', 
        borderRadius: '10px', 
        border: '1px solid #E2E8F0', 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px',
        color: '#1E293B',
        fontWeight: '500',
        cursor: 'default'
    }
};

export default Profile;