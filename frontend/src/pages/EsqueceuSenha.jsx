import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

// --- ÍCONE DO SISTEMA (Mesmo do Login) ---
const SpiderWebIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M4.93 4.93l14.14 14.14" />
    <path d="M19.07 4.93L4.93 19.07" />
    <path d="M12 7 L15.53 8.47 L17 12 L15.53 15.53 L12 17 L8.47 15.53 L7 12 L8.47 8.47 Z" />
    <path d="M12 3 L18.36 5.64 L21 12 L18.36 18.36 L12 21 L5.64 18.36 L3 12 L5.64 5.64 Z" />
  </svg>
);

const EsqueceuSenha = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [hover, setHover] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');
        
        try {
            await api.post('api/password_reset/', { email });
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Ocorreu um erro ao tentar enviar o e-mail. Tente novamente mais tarde.');
        }
    };

    return (
        <div style={styles.pageBackground}>
            <div style={styles.card}>
                
                <button onClick={() => navigate('/login')} style={styles.backButton}>
                    <ArrowLeft size={18} /> Voltar
                </button>

                <div style={styles.header}>
                    <div style={styles.logoCircle}>
                        <span><SpiderWebIcon size={32} color="#1565C0" /></span>
                    </div>
                    <h2 style={styles.title}>Recuperar Senha</h2>
                    <p style={styles.subtitle}>
                        Informe seu e-mail cadastrado para receber as instruções de redefinição.
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={styles.successBox}>
                        <CheckCircle2 size={40} color="#166534" style={{ marginBottom: '10px' }} />
                        <h3 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '18px' }}>E-mail Enviado!</h3>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                            Se o e-mail <strong>{email}</strong> estiver em nossa base de dados, você receberá um link para criar uma nova senha em instantes.
                        </p>
                        <p style={{ margin: '15px 0 0 0', fontSize: '13px', fontWeight: 'bold' }}>
                            Não se esqueça de verificar também sua caixa de spam.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>E-mail</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={18} color="#90A4AE" style={{marginLeft: '12px'}}/>
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={styles.input}
                                    placeholder="ex: professor@escola.com"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div style={styles.errorBox}>{errorMessage}</div>
                        )}

                        <button 
                            type="submit" 
                            style={{
                                ...styles.button,
                                ...(hover ? styles.buttonHover : {}),
                                ...(status === 'loading' ? styles.buttonDisabled : {}),
                            }}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Processando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    pageBackground: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #64B5F6 100%)',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box'
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '35px 40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    },
    backButton: { 
        background: 'none', 
        border: 'none', 
        color: '#64748B', 
        cursor: 'pointer', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '5px', 
        fontSize: '14px', 
        fontWeight: '600',
        padding: 0,
        position: 'absolute',
        top: '25px',
        left: '25px',
        transition: 'color 0.2s'
    },
    header: { textAlign: 'center', marginBottom: '25px', marginTop: '20px' },
    logoCircle: {
        width: '60px',
        height: '60px',
        backgroundColor: '#E3F2FD',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 15px auto',
    },
    title: {
        color: '#1565C0',
        fontSize: '22px',
        margin: '0 0 8px 0',
        fontWeight: 'bold',
    },
    subtitle: { color: '#546E7A', fontSize: '14px', margin: 0, lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#334155',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        backgroundColor: '#F8FAFC',
        transition: 'border-color 0.2s',
    },
    input: {
        width: '100%',
        padding: '12px 10px',
        border: 'none',
        background: 'transparent',
        outline: 'none',
        color: '#334155',
        fontSize: '14px'
    },
    button: {
        padding: '14px',
        backgroundColor: '#1565C0',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s',
        marginTop: '5px'
    },
    buttonHover: { backgroundColor: '#0D47A1' },
    buttonDisabled: { backgroundColor: '#90CAF9', cursor: 'not-allowed' },
    errorBox: {
        backgroundColor: '#FFEBEE',
        color: '#D32F2F',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '13px',
        textAlign: 'center',
        border: '1px solid #FFCDD2'
    },
    successBox: { 
        backgroundColor: '#F0FDF4', 
        padding: '25px', 
        borderRadius: '10px', 
        textAlign: 'center', 
        color: '#166534', 
        border: '1px solid #BBF7D0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
};

export default EsqueceuSenha;