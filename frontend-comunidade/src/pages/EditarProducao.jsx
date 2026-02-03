import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, FileText } from 'lucide-react';

const EditarProducao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { isMobile } = useOutletContext() || { isMobile: false };
    
    const [formData, setFormData] = useState({
        titulo: '', disciplina: '', nivel_ensino: '', modelo_ia: '',
        categoria: '', bncc: '', metodologia: '', duracao: '',
        recursos: '', experiencia: '', resultados: ''
    });
    
    // Carrega dados atuais
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await api.get(`api/production/${id}/`);
                const d = response.data;
                // Preenche o formulário com o que veio do banco
                setFormData({
                    titulo: d.titulo, disciplina: d.disciplina, nivel_ensino: d.nivel,
                    modelo_ia: d.modelo_ia, categoria: d.categoria, bncc: d.bncc,
                    metodologia: d.metodologia, duracao: d.duracao,
                    recursos: d.recursos, experiencia: d.experiencia, resultados: d.resultados
                });
            } catch (error) {
                alert("Erro ao carregar dados.");
                navigate('/dashboard/minhas-producoes');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        const dataToSend = new FormData();
        // Adiciona todos os campos textuais
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        
        // Pega arquivo apenas se o usuário selecionou um novo (input file)
        const fileInput = document.getElementById('arquivo-input');
        if (fileInput && fileInput.files[0]) {
            dataToSend.append('arquivo', fileInput.files[0]);
        }

        try {
            await api.put(`api/production/${id}/update/`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Produção corrigida e reenviada para a fila!");
            navigate('/dashboard/minhas-producoes');
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar produção.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#F8F9FA', minHeight: '100vh' }}>
            <div style={{background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #E0E0E0'}}>
                <button onClick={() => navigate(-1)} style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', marginBottom:'20px', fontWeight: 'bold', color: '#546E7A'}}>
                    <ArrowLeft size={18} /> Cancelar
                </button>
                
                <h1 style={{color: '#1565C0', fontSize: '24px', marginBottom: '5px'}}>Corrigir Produção</h1>
                <p style={{color: '#666', marginBottom: '25px', fontSize: '14px'}}>Faça os ajustes necessários e reenvie para aprovação.</p>

                <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    
                    <div style={styles.group}>
                        <label style={styles.label}>Título</label>
                        <input style={styles.input} name="titulo" value={formData.titulo} onChange={handleChange} required />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px'}}>
                        <div style={styles.group}>
                            <label style={styles.label}>Disciplina</label>
                            <input style={{...styles.input, background: '#F5F5F5'}} name="disciplina" value={formData.disciplina} readOnly />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.label}>Nível</label>
                            <input style={styles.input} name="nivel_ensino" value={formData.nivel_ensino} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={styles.group}>
                        <label style={styles.label}>Relato de Experiência (Foco da correção)</label>
                        <textarea style={styles.textarea} name="experiencia" value={formData.experiencia} onChange={handleChange} rows="6" required />
                    </div>

                    <div style={styles.group}>
                        <label style={styles.label}>BNCC</label>
                        <textarea style={{...styles.textarea, minHeight: '60px'}} name="bncc" value={formData.bncc} onChange={handleChange} />
                    </div>

                    <div style={{padding:'15px', background:'#F5F7FA', borderRadius:'8px', border:'1px dashed #B0BEC5'}}>
                        <label style={{...styles.label, marginBottom: '10px', display: 'block'}}>Substituir Arquivo (Opcional)</label>
                        <input type="file" id="arquivo-input" />
                    </div>

                    <button type="submit" disabled={submitting} style={styles.btnSave}>
                        {submitting ? <Loader2 className="spin" /> : <><Save size={18}/> Salvar e Reenviar para Fila</>}
                    </button>
                </form>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
            </div>
        </div>
    );
};

const styles = {
    group: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '13px', fontWeight: '700', color: '#455A64' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', outline: 'none' },
    textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #CFD8DC', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif' },
    btnSave: { marginTop: '10px', padding: '15px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '15px' }
};

export default EditarProducao;