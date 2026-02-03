import React, { useState } from 'react';
import api from './services/api'; // <--- USANDO A CONFIGURAÇÃO CENTRAL (URL Base automática)
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hover, setHover] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. URL de Login (Token) - A api já sabe o endereço base
            const urlToken = 'api/token/';
            
            const response = await api.post(urlToken, {
                username: username,
                password: password
            });

            const token = response.data.access;
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', response.data.refresh);

            // 2. BUSCA OS DADOS DO PERFIL IMEDIATAMENTE
            const urlUser = 'api/user/me/';
            
            // Passamos o token no header manualmente aqui para garantir, 
            // pois acabamos de recebê-lo e o interceptor pode não ter atualizado ainda
            const userResponse = await api.get(urlUser, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Salva os dados importantes no localStorage
            localStorage.setItem('user_name', userResponse.data.username);
            localStorage.setItem('user_disciplina', userResponse.data.disciplina);
            if (userResponse.data.avatar) {
                localStorage.setItem('user_avatar', userResponse.data.avatar);
            }

            // Dispara evento para atualizar o cabeçalho imediatamente (se houver listeners)
            window.dispatchEvent(new Event('storage'));

            // 3. Redireciona
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            if (err.code === "ERR_NETWORK") {
                setError('Erro de conexão. Verifique se o servidor está rodando.');
            } else if (err.response && err.response.status === 401) {
                setError('Usuário ou senha incorretos.');
            } else {
                setError('Ocorreu um erro inesperado.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageBackground}>
            <div style={styles.card}>
                
                <div style={styles.header}>
                    <div style={styles.logoCircle}>
                        <span style={{ fontSize: '32px' }}>📘</span>
                    </div>
                    <h2 style={styles.title}>CAPSIAGE</h2>
                    <p style={styles.subtitle}>Uma comunidade de aprendizagem para professores</p>
                </div>
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuário</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Seu usuário"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Sua senha"
                            required
                        />
                    </div>

                    {/* Link de Esqueci a Senha - NOVO */}
                    <div style={styles.forgotPasswordContainer}>
                        <Link to="/esqueceu-senha" style={styles.forgotPasswordLink}>
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        style={{
                            ...styles.button,
                            ...(hover ? styles.buttonHover : {}),
                            ...(isLoading ? styles.buttonDisabled : {})
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Conectando...' : 'Entrar'}
                    </button>

                    <div style={styles.registerLinkContainer}>
                        <Link to="/register" style={styles.registerLink}>
                            Não tem conta? Cadastre-se
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageBackground: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #64B5F6 100%)',
        fontFamily: 'Arial, sans-serif', margin: 0, padding: 0,
    },
    card: {
        width: '100%', maxWidth: '400px', padding: '40px',
        backgroundColor: 'white', borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
    },
    header: { textAlign: 'center', marginBottom: '25px' },
    logoCircle: {
        width: '60px', height: '60px', backgroundColor: '#E3F2FD', borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px auto',
    },
    title: { color: '#1565C0', fontSize: '24px', margin: '0 0 5px 0', fontWeight: 'bold' },
    subtitle: { color: '#546E7A', fontSize: '14px', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { color: '#455A64', fontSize: '13px', fontWeight: '600', marginLeft: '2px' },
    input: {
        padding: '12px', borderRadius: '6px', border: '1px solid #CFD8DC', fontSize: '15px',
        outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border 0.2s',
    },
    
    // Estilos novos para o link de esqueci senha
    forgotPasswordContainer: { textAlign: 'right', marginTop: '-5px' },
    forgotPasswordLink: { color: '#546E7A', fontSize: '13px', textDecoration: 'none', fontWeight: '500' },

    button: {
        marginTop: '10px', padding: '14px', backgroundColor: '#1565C0', color: 'white',
        border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', transition: 'background 0.3s',
    },
    buttonHover: { backgroundColor: '#0D47A1' },
    buttonDisabled: { backgroundColor: '#90CAF9', cursor: 'not-allowed' },
    errorBox: {
        backgroundColor: '#FFEBEE', color: '#D32F2F', padding: '12px',
        borderRadius: '6px', fontSize: '14px', textAlign: 'center',
    },
    registerLinkContainer: { textAlign: 'center', marginTop: '10px' },
    registerLink: { color: '#1565C0', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }
};

export default Login;