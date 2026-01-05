import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    // Estados visuais
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    const [hover, setHover] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        const pwd = formData.password;

        // --- VALIDAÇÃO SIMPLIFICADA ---
        
        // 1. Verifica tamanho (8 ou mais)
        if (pwd.length < 8) {
            setError('A senha precisa ter no mínimo 8 caracteres.');
            return;
        }

        // 2. Verifica se é inteiramente numérica (Regex: ^\d+$ significa "só dígitos do começo ao fim")
        if (/^\d+$/.test(pwd)) {
            setError('A senha não pode ser composta apenas por números.');
            return;
        }

        // 3. Confirmação
        if (pwd !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        // --- FIM DA VALIDAÇÃO ---

        setIsLoading(true);

        try {
            const url = 'http://127.0.0.1:8000/kipo_playground/api/register/';
            
            await axios.post(url, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            alert('Conta criada com sucesso! Faça login.');
            navigate('/'); 

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data.erro) {
                setError(err.response.data.erro);
            } else if (err.code === "ERR_NETWORK") {
                setError('Erro de conexão com o servidor.');
            } else {
                setError('Erro ao criar conta. Tente novamente.');
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
                        <span style={{ fontSize: '30px' }}>🚀</span>
                    </div>
                    <h2 style={styles.title}>Criar Conta</h2>
                </div>
                
                <form onSubmit={handleRegister} style={styles.form}>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuário</label>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Nome de usuário"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="seu@email.com"
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <div style={styles.passwordWrapper}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.inputPassword}
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {/* Texto de ajuda discreto */}
                        <p style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
                            Deve ter 8+ caracteres e não pode ser apenas números.
                        </p>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirmar Senha</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Repita a senha"
                            required
                        />
                    </div>

                    {error && <div style={styles.errorBox}>⚠️ {error}</div>}

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
                        {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>

                    <div style={styles.loginLinkContainer}>
                        <Link to="/" style={styles.loginLink}>Voltar para Login</Link>
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
        width: '100%', maxWidth: '420px', padding: '30px',
        backgroundColor: 'white', borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
    },
    header: { textAlign: 'center', marginBottom: '20px' },
    logoCircle: {
        width: '50px', height: '50px', backgroundColor: '#E3F2FD', borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px auto',
    },
    title: { color: '#0D47A1', fontSize: '22px', margin: '0', fontWeight: 'bold' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { color: '#455A64', fontSize: '13px', fontWeight: '600', marginLeft: '2px' },
    input: {
        padding: '12px', borderRadius: '6px', border: '1px solid #CFD8DC', fontSize: '15px',
        outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    passwordWrapper: {
        position: 'relative', width: '100%', display: 'flex', alignItems: 'center'
    },
    inputPassword: {
        padding: '12px', paddingRight: '40px',
        borderRadius: '6px', border: '1px solid #CFD8DC', fontSize: '15px',
        outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    eyeButton: {
        position: 'absolute', right: '10px', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: '18px', color: '#666'
    },
    button: {
        marginTop: '10px', padding: '14px', backgroundColor: '#1565C0', color: 'white',
        border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', transition: 'background 0.3s',
    },
    buttonHover: { backgroundColor: '#0D47A1' },
    buttonDisabled: { backgroundColor: '#90CAF9', cursor: 'not-allowed' },
    errorBox: {
        backgroundColor: '#FFEBEE', color: '#D32F2F', padding: '10px',
        borderRadius: '6px', fontSize: '13px', textAlign: 'center',
    },
    loginLinkContainer: { textAlign: 'center', marginTop: '5px' },
    loginLink: { color: '#1565C0', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }
};

export default Register;