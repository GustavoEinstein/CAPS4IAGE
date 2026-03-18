import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Camera, Save, ArrowLeft, BookOpen } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';


const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        disciplina: 'Outra', 
        avatar: null
    });
    
    const [newPhoto, setNewPhoto] = useState(null);
    const [preview, setPreview] = useState(null);

    const disciplinas = [
        'História', 'Matemática', 'Geografia', 'Português', 'Ciências',
        'Física', 'Química', 'Biologia', 'Inglês', 'Artes',
        'Educação Física', 'Filosofia', 'Sociologia', 'Pedagogia', 'Outra'
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            // Se não tiver token, já chuta pro login
            if (!token) {
                navigate('/');
                return;
            }

            const response = await axios.get('http://127.0.0.1:8000/kipo_playground/api/user/me/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            updateLocalStorage(response.data);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            // CORREÇÃO DO 401: Se der erro de autenticação, força logout
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
        if(data.avatar) localStorage.setItem('user_avatar', data.avatar);
        window.dispatchEvent(new Event('storage'));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        
        formData.append('disciplina', userData.disciplina);
        if (newPhoto) {
            formData.append('avatar', newPhoto);
        }

        try {
            const response = await axios.put('http://127.0.0.1:8000/kipo_playground/api/user/me/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const novaFoto = response.data.avatar ? `${response.data.avatar}?t=${Date.now()}` : null;
            
            setUserData(prev => ({ 
                ...prev, 
                avatar: novaFoto,
                disciplina: response.data.disciplina 
            }));
            
            updateLocalStorage({
                ...userData,
                avatar: novaFoto,
                disciplina: response.data.disciplina
            });

            alert("Perfil salvo com sucesso!");
            setNewPhoto(null);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            // CORREÇÃO DO 401 NO SALVAMENTO
            if (error.response && error.response.status === 401) {
                alert("Sessão expirada. Faça login novamente para salvar.");
                handleLogout();
            } else {
                alert("Erro ao salvar. Verifique se o servidor está rodando.");
            }
        }
    };

    if (loading) return <div style={{padding:'40px', textAlign:'center', color: '#333'}}>Carregando perfil...</div>;

    return (
        <div style={styles.container}>
            {/* Força as opções do select a terem fundo branco e texto escuro */}
            <style>{`
                select option {
                    background-color: white;
                    color: #333;
                    padding: 10px;
                }
            `}</style>

            <div style={styles.card}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <ArrowLeft size={20} /> Voltar ao Dashboard
                </button>

                <h2 style={styles.title}>Editar Perfil</h2>

                <div style={styles.avatarSection}>
                    <div style={styles.avatarWrapper}>
                        {preview ? (
                            <img src={preview} alt="Preview" style={styles.avatarImg} />
                        ) : userData.avatar ? (
                            <img src={userData.avatar} alt="Avatar" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <label htmlFor="avatar-upload" style={styles.cameraButton}>
                            <Camera size={20} color="white" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{display:'none'}} />
                    </div>
                </div>

                <form onSubmit={handleSave} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nome (Somente Leitura)</label>
                        <div style={styles.readOnlyInput}>
                            <User size={18} style={{marginRight:'10px', color:'#555'}}/>
                            {/* Texto escuro forçado */}
                            <span style={{color: '#101828', fontWeight: '600'}}>
                                {userData.username || "Carregando..."}
                            </span>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.readOnlyInput}>
                            <Mail size={18} style={{marginRight:'10px', color:'#555'}}/>
                            <span style={{color: '#101828', fontWeight: '500'}}>
                                {userData.email || "Carregando..."}
                            </span>
                        </div>
                    </div>


                    <button type="submit" style={styles.saveButton}>
                        <Save size={18} style={{marginRight:'8px'}} /> Salvar Dados
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '40px', background: '#F5F7FA', minHeight: '100vh' },
    card: { width: '100%', maxWidth: '500px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#546E7A', fontWeight: '600', marginBottom: '20px' },
    title: { color: '#1565C0', fontSize: '24px', marginBottom: '20px', textAlign: 'center' },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' },
    avatarWrapper: { position: 'relative', width: '100px', height: '100px' },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #E3F2FD' },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold' },
    cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1565C0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#37474F' },
    
    // CORRIGIDO: Cores escuras para leitura
    readOnlyInput: { 
        padding: '12px', 
        backgroundColor: '#F7F9FC', 
        borderRadius: '8px', 
        border: '1px solid #E0E0E0', 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px',
        color: '#101828' // Texto quase preto
    },
    
    select: { 
        width: '100%', 
        padding: '12px 10px 12px 40px', 
        borderRadius: '8px', 
        border: '1px solid #CFD8DC', 
        fontSize: '14px', 
        backgroundColor: 'white', 
        color: '#101828', // Texto escuro
        cursor: 'pointer',
        appearance: 'none', 
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right .7em top 50%',
        backgroundSize: '.65em auto',
    },
    
    saveButton: { padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }
};

export default Profile;