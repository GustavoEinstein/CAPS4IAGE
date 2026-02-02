import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const EsqueceuSenha = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            await api.post('api/password_reset/', { email });
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div style={styles.background}>
            <div style={styles.card}>
                <button onClick={() => navigate('/login')} style={styles.backButton}>
                    <ArrowLeft size={18} /> Voltar
                </button>
                
                <h2 style={styles.title}>Recuperar Senha</h2>
                <p style={styles.text}>Informe seu e-mail para receber o link de redefinição.</p>

                {status === 'success' ? (
                    <div style={styles.successBox}>
                        <p>✅ Solicitação enviada!</p>
                        <p style={{fontSize: '13px'}}>Verifique seu e-mail (ou o terminal do servidor backend).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>E-mail cadastrado</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={18} color="#90A4AE" style={{marginLeft: '10px'}}/>
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
                        <button type="submit" style={styles.button} disabled={status === 'loading'}>
                            {status === 'loading' ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    background: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F1F5F9' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' },
    backButton: { background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' },
    title: { margin: '0 0 10px 0', color: '#1E293B', fontSize: '24px', fontWeight: '800' },
    text: { color: '#64748B', marginBottom: '25px', lineHeight: '1.5' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' },
    input: { width: '100%', padding: '12px', border: 'none', background: 'transparent', outline: 'none', color: '#334155' },
    button: { width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' },
    successBox: { backgroundColor: '#F0FDF4', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#166534', border: '1px solid #BBF7D0' }
};

export default EsqueceuSenha;