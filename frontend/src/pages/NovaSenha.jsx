import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const NovaSenha = () => {
    const { uid, token } = useParams(); // Captura os códigos da URL
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validação local
        if (password !== confirm) {
            setErrorMessage("As senhas não coincidem.");
            setStatus('error');
            return;
        }
        if (password.length < 8) {
            setErrorMessage("A senha deve ter no mínimo 8 caracteres.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            // 2. Envio para o Backend Django
            await api.post(`api/password_reset_confirm/${uid}/${token}/`, { password });
            
            setStatus('success');
            
            // Redireciona para o login após 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            // Tenta pegar a mensagem de erro específica do backend ou usa uma genérica
            const msg = error.response?.data?.erro || "O link é inválido ou expirou. Solicite novamente.";
            setErrorMessage(msg);
        }
    };

    return (
        <div style={styles.background}>
            <div style={styles.card}>
                
                <h2 style={styles.title}>Definir Nova Senha</h2>

                {status === 'success' ? (
                    <div style={styles.successBox}>
                        <CheckCircle2 size={48} style={{marginBottom: '15px'}} />
                        <h3 style={{margin: '0 0 10px 0', fontSize: '20px'}}>Senha Alterada!</h3>
                        <p style={{margin: 0, fontSize: '14px', lineHeight: '1.5'}}>
                            Sua senha foi atualizada com sucesso.<br/>
                            Redirecionando para o login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={styles.subtitle}>Crie uma nova senha segura para sua conta.</p>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nova Senha</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} color="#90A4AE" style={{marginLeft: '12px'}}/>
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    style={styles.input} 
                                    placeholder="Mínimo de 8 caracteres"
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirmar Senha</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} color="#90A4AE" style={{marginLeft: '12px'}}/>
                                <input 
                                    type="password" 
                                    required 
                                    value={confirm} 
                                    onChange={e => setConfirm(e.target.value)} 
                                    style={styles.input} 
                                    placeholder="Repita a senha"
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={16} style={{marginRight: '6px', minWidth: '16px'}} />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            style={{
                                ...styles.button,
                                opacity: status === 'loading' ? 0.7 : 1,
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                            }} 
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Salvando...' : 'Alterar Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    background: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F1F5F9' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' },
    
    title: { margin: '0 0 10px 0', color: '#1E293B', fontSize: '24px', fontWeight: '800', textAlign: 'center' },
    subtitle: { textAlign: 'center', color: '#64748B', fontSize: '14px', marginBottom: '30px' },
    
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC', transition: 'border-color 0.2s' },
    input: { width: '100%', padding: '14px 12px', border: 'none', background: 'transparent', outline: 'none', color: '#334155', fontSize: '15px' },
    
    button: { width: '100%', padding: '14px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', marginTop: '10px', transition: 'background 0.2s' },
    
    successBox: { textAlign: 'center', color: '#15803D', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' },
    
    errorBox: { display: 'flex', alignItems: 'center', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid #FECACA' }
};

export default NovaSenha;