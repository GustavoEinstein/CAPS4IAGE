import React, { useState } from 'react';
import api from './services/api'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Lock, 
    AtSign, 
    ArrowRight, 
    Loader2, 
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    BookOpen,
    School,
    Users 
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', 
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        disciplina: '',
        escola: '' 
    });

    const disciplinas = [
        'História', 'Matemática', 'Geografia', 'Português', 'Ciências',
        'Física', 'Química', 'Biologia', 'Inglês', 'Artes',
        'Educação Física', 'Filosofia', 'Sociologia', 'Pedagogia', 'Projeto de vida',  'Computação'
    ];
    const escolas = [
        'Universidade de Brasília', 'CEMI-Gama'
    ];
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 

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

        // --- VALIDAÇÃO DE SEGURANÇA ---
        if (pwd.length < 8) {
            setError('A senha precisa ter no mínimo 8 caracteres.');
            return;
        }

        if (!/[A-Z]/.test(pwd)) {
            setError('A senha precisa ter pelo menos uma letra maiúscula.');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            setError('A senha precisa ter pelo menos um símbolo especial (ex: !@#$%^&*).');
            return;
        }

        if (pwd !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!formData.disciplina) {
            setError('Por favor, selecione sua área de atuação.');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('api/register/', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                disciplina: formData.disciplina,
                escola: formData.escola
            });

            alert('Conta criada com sucesso! Redirecionando para o login...');
            navigate('/login'); 

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data.erro) {
                setError(err.response.data.erro);
            } else if (err.code === "ERR_NETWORK") {
                setError('Erro de conexão. Verifique se o servidor Django está rodando.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Verifique os dados.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                
                {/* Lado Esquerdo - Visual (Sidebar Azul) */}
                <div style={styles.sidebar}>
                    <h2 style={styles.sidebarTitle}>Junte-se à comunidade.</h2>
                    <p style={styles.sidebarText}>
                        Cataloge práticas, use IA e receba feedback de professores de todo o Distrito Federal.
                    </p>
                    
                    <div style={styles.featureItem}>
                        <Users size={18} color="#BBDEFB" /> 
                        <span>Troca de Experiências Reais</span>
                    </div>

                    <div style={styles.featureItem}>
                        <CheckCircle2 size={18} color="#BBDEFB" /> 
                        <span>Revisão Duplo-Cego</span>
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div style={styles.formSection}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Crie sua conta</h2>
                        <p style={styles.subtitle}>Preencha seus dados para começar.</p>
                    </div>

                    <form onSubmit={handleRegister} style={styles.form}>
                        
                        {/* Nome Completo */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nome Completo</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} color="#64748B" />
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    style={styles.input} 
                                    placeholder="Como quer ser chamado?" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Usuário e Email */}
                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Usuário</label>
                                <div style={styles.inputWrapper}>
                                    <AtSign size={18} color="#64748B" />
                                    <input 
                                        type="text" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleChange} 
                                        style={styles.input} 
                                        placeholder="user123" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>E-mail</label>
                                <div style={styles.inputWrapper}>
                                    <Mail size={18} color="#64748B" />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        style={styles.input} 
                                        placeholder="prof@escola.com" 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ESCOLA */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Sua Escola</label>
                            <div style={styles.inputWrapper}>
                                <School size={18} color="#64748B" />
                                <select 
                                    name="escola" // <--- CORRIGIDO AQUI: estava "disciplina"
                                    value={formData.escola} 
                                    onChange={handleChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="" disabled>Selecione a escola onde atua</option>
                                    {escolas.map(escola => (
                                        <option key={escola} value={escola}>
                                            {escola}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* DISCIPLINA */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Sua Disciplina / Área</label>
                            <div style={styles.inputWrapper}>
                                <BookOpen size={18} color="#64748B" />
                                <select 
                                    name="disciplina"
                                    value={formData.disciplina} 
                                    onChange={handleChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="" disabled>Selecione uma disciplina</option>
                                    {disciplinas.map(disc => (
                                        <option key={disc} value={disc}>
                                            {disc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Senhas */}
                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Senha</label>
                                <div style={styles.inputWrapper}>
                                    <Lock size={18} color="#64748B" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        style={styles.input} 
                                        placeholder="8+ caracteres" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirmar</label>
                                <div style={styles.inputWrapper}>
                                    <Lock size={18} color="#64748B" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        style={styles.input} 
                                        placeholder="Repita a senha" 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={styles.showPassContainer}>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.toggleBtn}>
                                    {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>} 
                                    {showPassword ? ' Ocultar senhas' : ' Mostrar senhas'}
                            </button>
                        </div>

                        {error && (
                            <div style={styles.errorBox}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 size={18} className="spin" /> Criando conta...</>
                            ) : (
                                <>Cadastrar <ArrowRight size={18} /></>
                            )}
                        </button>

                        <div style={styles.footerLink}>
                            Já tem uma conta? <Link to="/login" style={styles.link}>Fazer Login</Link>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
};

const styles = {
    wrapper: {
        minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F1F5F9', padding: '20px', fontFamily: "'Segoe UI', Roboto, sans-serif"
    },
    container: {
        display: 'flex', backgroundColor: 'white', borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: '900px', width: '100%'
    },
    sidebar: {
        flex: 1, backgroundColor: '#1565C0', padding: '40px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', color: 'white', minWidth: '280px',
        '@media (max-width: 768px)': { display: 'none' } 
    },
    sidebarTitle: { fontSize: '28px', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2' },
    sidebarText: { fontSize: '15px', lineHeight: '1.6', color: '#BBDEFB', marginBottom: '30px' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#E3F2FD' },
    
    formSection: { flex: 1.5, padding: '40px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    header: { marginBottom: '30px' },
    title: { fontSize: '26px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748B' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: '200px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' },
    
    inputWrapper: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px',
        border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC',
        transition: 'border 0.2s', height: '42px'
    },
    input: {
        border: 'none', background: 'transparent', outline: 'none', width: '100%',
        fontSize: '14px', color: '#1E293B', height: '100%'
    },
    select: {
        border: 'none', background: 'transparent', outline: 'none', width: '100%',
        fontSize: '14px', color: '#1E293B', height: '100%', cursor: 'pointer',
        appearance: 'none', 
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0px top 50%',
        backgroundSize: '.65em auto',
    },
    
    showPassContainer: { display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' },
    toggleBtn: { background: 'none', border: 'none', color: '#64748B', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    button: {
        backgroundColor: '#1565C0', color: 'white', padding: '12px', borderRadius: '8px', border: 'none',
        fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '10px', transition: 'background 0.2s', marginTop: '10px'
    },
    errorBox: {
        backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B',
        padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px'
    },
    footerLink: { textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '10px' },
    link: { color: '#1565C0', fontWeight: '700', textDecoration: 'none' }
};

export default Register;