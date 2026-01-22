import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    ArrowLeft, 
    Save, 
    UploadCloud, 
    Lock, 
    BookOpen, 
    Wrench, 
    Clock, 
    Package, 
    Lightbulb, 
    Target, 
    FileText,
    CheckCircle2,
    Layout
} from 'lucide-react';

const NewProduction = () => {
    const navigate = useNavigate();
    const { isMobile } = useOutletContext() || { isMobile: false };

    // --- SIMULAÇÃO DE USUÁRIO ---
    const user = {
        nome: "Ricardo Silva",
        disciplina: "Filosofia" 
    };

    const [formData, setFormData] = useState({
        titulo: '',
        disciplina: user.disciplina,
        nivel: '',
        modelo_ia: '',
        categoria: '',
        bncc: '',
        metodologia: '',
        duracao: '',
        recursos: '',
        experiencia: '',
        resultados: '',
        arquivo: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, arquivo: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            alert("Prática enviada com sucesso!");
            navigate('/dashboard/minhas-atividades');
        }, 1500);
    };

    return (
        <div style={styles.fullPageWrapper}>
            <div style={styles.container}>
                
                <div style={styles.topBar}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <ArrowLeft size={20} /> Cancelar
                    </button>
                    <div style={{textAlign: isMobile ? 'left' : 'right'}}>
                        <h1 style={styles.pageTitle}>Catalogar Nova Prática</h1>
                        <p style={styles.pageSubtitle}>Compartilhe seu conhecimento com a rede.</p>
                    </div>
                </div>

                {/* --- CARD ÚNICO EXPANSIVO --- */}
                <div style={styles.mainCard}>
                    <form onSubmit={handleSubmit}>
                        
                        <div style={{
                            ...styles.splitLayout,
                            flexDirection: isMobile ? 'column' : 'row'
                        }}>
                            
                            {/* --- COLUNA ESQUERDA: DADOS TÉCNICOS & UPLOAD --- */}
                            <div style={{...styles.leftCol, width: isMobile ? '100%' : '35%'}}>
                                
                                <h3 style={styles.sectionTitle}>
                                    <FileText size={20} color="#1565C0" /> Ficha Técnica
                                </h3>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Título da Atividade</label>
                                    <input 
                                        type="text" name="titulo"
                                        placeholder="Ex: Dilemas Éticos com IA"
                                        value={formData.titulo} onChange={handleChange}
                                        style={styles.input} required
                                    />
                                </div>

                                {/* CAMPO TRAVADO */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Disciplina (Sua Especialidade)</label>
                                    <div style={styles.lockedInputWrapper}>
                                        <Lock size={16} color="#78909C" style={{marginLeft: '12px'}}/>
                                        <input 
                                            type="text" name="disciplina"
                                            value={formData.disciplina} readOnly
                                            style={styles.lockedInput}
                                        />
                                    </div>
                                </div>

                                <div style={styles.gridTwoSmall}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Nível</label>
                                        <select name="nivel" value={formData.nivel} onChange={handleChange} style={styles.input} required>
                                            <option value="">Selecione...</option>
                                            <option value="Fundamental 1">Fund. 1</option>
                                            <option value="Fundamental 2">Fund. 2</option>
                                            <option value="Ensino Médio">Ensino Médio</option>
                                            <option value="Superior">Superior</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Categoria</label>
                                        <select name="categoria" value={formData.categoria} onChange={handleChange} style={styles.input} required>
                                            <option value="">Selecione...</option>
                                            <option value="Estudo de Caso">Estudo de Caso</option>
                                            <option value="Gamificação">Gamificação</option>
                                            <option value="Roleplay">Roleplay</option>
                                            <option value="Metodologia Ativa">Metodologia</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Modelo de IA</label>
                                    <input 
                                        type="text" name="modelo_ia"
                                        placeholder="Ex: ChatGPT-4"
                                        value={formData.modelo_ia} onChange={handleChange}
                                        style={styles.input} required
                                    />
                                </div>

                                {/* BOX DE UPLOAD NA LATERAL */}
                                <div style={styles.uploadSection}>
                                    <label style={styles.label}><UploadCloud size={16}/> Anexar Material</label>
                                    <div style={styles.uploadContainer}>
                                        <input 
                                            type="file" id="file-upload" 
                                            onChange={handleFileChange} style={{display: 'none'}} 
                                        />
                                        <label htmlFor="file-upload" style={styles.uploadLabel}>
                                            {formData.arquivo ? (
                                                <div style={styles.fileSelected}>
                                                    <CheckCircle2 size={28} color="#4CAF50" />
                                                    <span style={styles.fileName}>{formData.arquivo.name}</span>
                                                    <span style={styles.changeLink}>Alterar arquivo</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={styles.uploadIconCircle}>
                                                        <UploadCloud size={20} color="#1565C0" />
                                                    </div>
                                                    <span style={styles.uploadTextMain}>Clique para carregar</span>
                                                    <span style={styles.uploadTextSub}>PDF/DOCX (Max 10MB)</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                            </div>

                            {/* DIVISOR VERTICAL (Apenas Desktop) */}
                            {!isMobile && <div style={styles.verticalDivider}></div>}

                            {/* --- COLUNA DIREITA: PEDAGÓGICO (Mais larga) --- */}
                            <div style={{...styles.rightCol, width: isMobile ? '100%' : '65%'}}>
                                
                                <h3 style={styles.sectionTitle}>
                                    <BookOpen size={20} color="#1565C0" /> Detalhamento Pedagógico
                                </h3>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Alinhamento BNCC / Objetivos de Aprendizagem</label>
                                    <textarea 
                                        name="bncc"
                                        placeholder="Cite os códigos da BNCC ou descreva os objetivos pedagógicos..."
                                        value={formData.bncc} onChange={handleChange}
                                        style={styles.textarea} rows="2" required
                                    />
                                </div>

                                <div style={styles.gridThree}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Wrench size={14}/> Metodologia</label>
                                        <input 
                                            type="text" name="metodologia" placeholder="Ex: Sala Invertida"
                                            value={formData.metodologia} onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Clock size={14}/> Duração</label>
                                        <input 
                                            type="text" name="duracao" placeholder="Ex: 100 min"
                                            value={formData.duracao} onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}><Package size={14}/> Recursos</label>
                                        <input 
                                            type="text" name="recursos" placeholder="Ex: Projetor"
                                            value={formData.recursos} onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Lightbulb size={14}/> Relato da Experiência (O "Pulo do Gato")</label>
                                    <textarea 
                                        name="experiencia"
                                        placeholder="Como foi a aplicação real? Descreva a mediação do professor, as reações dos alunos e como a IA foi integrada."
                                        value={formData.experiencia} onChange={handleChange}
                                        style={{...styles.textarea, minHeight: '120px'}} required
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}><Target size={14}/> Resultados e Evidências</label>
                                    <textarea 
                                        name="resultados"
                                        placeholder="Quais foram as evidências de aprendizagem observadas?"
                                        value={formData.resultados} onChange={handleChange}
                                        style={styles.textarea} rows="3" required
                                    />
                                </div>

                                {/* FOOTER BUTTON ALINHADO A DIREITA */}
                                <div style={styles.formFooter}>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        style={styles.submitButton}
                                    >
                                        <Save size={18} />
                                        {isSubmitting ? "Enviando..." : "Enviar Prática para Revisão"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS EXPANSIVOS ---
const styles = {
    fullPageWrapper: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '20px' },
    container: { maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }, // Mais largo (1400px)
    
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap-reverse', gap: '20px' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#546E7A', fontWeight: '600', fontSize: '15px' },
    
    pageTitle: { fontSize: '24px', color: '#1565C0', fontWeight: '800', margin: '0 0 4px 0' },
    pageSubtitle: { fontSize: '14px', color: '#546E7A', margin: 0 },

    // CARD ÚNICO (Layout Split)
    mainCard: { 
        backgroundColor: '#FFFFFF', 
        borderRadius: '16px', 
        padding: '30px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
        border: '1px solid #E0E0E0' 
    },

    splitLayout: { display: 'flex', gap: '40px' },
    verticalDivider: { width: '1px', backgroundColor: '#F0F0F0', alignSelf: 'stretch' },
    
    leftCol: { display: 'flex', flexDirection: 'column' },
    rightCol: { display: 'flex', flexDirection: 'column' },

    sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#37474F', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },

    // GRIDS INTERNOS
    gridTwoSmall: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },

    // INPUTS (Estilo Clean Branco)
    inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
    label: { fontSize: '13px', fontWeight: '600', color: '#455A64', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
    
    input: { 
        width: '100%', padding: '12px 15px', borderRadius: '8px', 
        border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F',
        outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box',
        transition: 'border 0.2s'
    },
    
    textarea: { 
        width: '100%', padding: '12px 15px', borderRadius: '8px', 
        border: '1px solid #CFD8DC', fontSize: '14px', color: '#37474F',
        outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box',
        resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5'
    },

    // CAMPO TRAVADO (Sutil)
    lockedInputWrapper: {
        display: 'flex', alignItems: 'center', backgroundColor: '#FAFAFA', 
        border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden'
    },
    lockedInput: {
        flex: 1, border: 'none', backgroundColor: 'transparent', padding: '12px 15px',
        fontSize: '14px', fontWeight: '600', color: '#78909C', outline: 'none', cursor: 'not-allowed'
    },

    // UPLOAD COMPACTO
    uploadSection: { marginTop: 'auto', paddingTop: '10px' },
    uploadContainer: {
        border: '2px dashed #BBDEFB', borderRadius: '12px', backgroundColor: '#F8FBFF',
        textAlign: 'center', padding: '20px', transition: 'all 0.2s',
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px'
    },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
    uploadIconCircle: { backgroundColor: 'white', padding: '10px', borderRadius: '50%', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    uploadTextMain: { fontSize: '13px', fontWeight: '700', color: '#1565C0' },
    uploadTextSub: { fontSize: '11px', color: '#90A4AE', marginTop: '2px' },
    fileSelected: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    fileName: { fontSize: '13px', fontWeight: '600', color: '#333', marginTop: '5px', wordBreak: 'break-all' },
    changeLink: { fontSize: '11px', color: '#1565C0', textDecoration: 'underline', marginTop: '2px' },

    // FOOTER
    formFooter: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end' },
    submitButton: {
        backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', 
        padding: '14px 40px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', 
        display: 'flex', alignItems: 'center', gap: '10px', 
        boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)', transition: 'transform 0.2s'
    }
};

export default NewProduction;