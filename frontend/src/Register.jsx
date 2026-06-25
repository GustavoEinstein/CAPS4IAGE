import React, { useState } from "react"
import api from "./services/api"
import { useNavigate, Link } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  AtSign,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  School,
  X,
  ArrowLeft, // Ícone novo importado
} from "lucide-react"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    disciplina: "",
    escola: "",
  })

  const disciplinas = [
    "História",
    "Matemática",
    "Geografia",
    "Português",
    "Ciências",
    "Física",
    "Química",
    "Biologia",
    "Inglês",
    "Artes",
    "Educação Física",
    "Filosofia",
    "Sociologia",
    "Pedagogia",
    "Projeto de vida",
    "Computação",
  ]

  const escolas = ["Universidade de Brasília", "CEMI-Gama"]

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [aceitouTermos, setAceitouTermos] = useState(false)

  const [activeModal, setActiveModal] = useState(null)
  const openModal = (type) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    const pwd = formData.password

    if (pwd.length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres.")
      return
    }

    if (!/[A-Z]/.test(pwd)) {
      setError("A senha precisa ter pelo menos uma letra maiúscula.")
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      setError(
        "A senha precisa ter pelo menos um símbolo especial (ex: !@#$%^&*).",
      )
      return
    }

    if (pwd !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    if (!formData.escola) {
      setError("Por favor, selecione sua escola.")
      return
    }

    if (!formData.disciplina) {
      setError("Por favor, selecione sua área de atuação.")
      return
    }

    if (!aceitouTermos) {
      setError(
        "Você precisa ler e concordar com os Termos de Uso e a Política de Privacidade para criar sua conta.",
      )
      return
    }

    setIsLoading(true)

    try {
      await api.post("api/register/", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        disciplina: formData.disciplina,
        escola: formData.escola,
      })

      alert("Conta criada com sucesso! Aguarde a aprovação do administrador.")
      navigate("/login")
    } catch (err) {
      console.error(err)
      if (err.response && err.response.data.erro) {
        setError(err.response.data.erro)
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Erro de conexão. Verifique se o servidor Django está rodando.",
        )
      } else {
        setError("Ocorreu um erro ao criar a conta. Verifique os dados.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* BOTÃO VOLTAR POR FORA DO CONTAINER BRANCO PARA NÃO QUEBRAR O LAYOUT */}
      <div style={styles.topBar}>
        <button onClick={() => navigate("/login")} style={styles.backButton}>
          <ArrowLeft size={16} /> Voltar ao Login
        </button>
      </div>

      <div style={styles.container}>
        {/* Formulário Centralizado e Único */}
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
                  name="escola"
                  value={formData.escola}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="" disabled>
                    Selecione a escola onde atua
                  </option>
                  {escolas.map((escola) => (
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
                  <option value="" disabled>
                    Selecione uma disciplina
                  </option>
                  {disciplinas.map((disc) => (
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPassword ? " Ocultar senhas" : " Mostrar senhas"}
              </button>
            </div>

            {/* CAIXINHA DE TERMOS E CONDIÇÕES */}
            <div style={styles.termsContainer}>
              <input
                type="checkbox"
                id="termos"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.termsText}>
                Li e concordo com os{" "}
                <span
                  onClick={() => openModal("terms")}
                  style={styles.termsLink}
                >
                  Termos de Uso
                </span>{" "}
                e a{" "}
                <span
                  onClick={() => openModal("privacy")}
                  style={styles.termsLink}
                >
                  Política de Privacidade
                </span>
                .
              </span>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" style={styles.button} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" /> Criando conta...
                </>
              ) : (
                <>
                  Cadastrar <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={styles.footerLink}>
              Já tem uma conta?{" "}
              <Link to="/login" style={styles.link}>
                Fazer Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* === MODAIS DE TERMOS E PRIVACIDADE === */}
      {activeModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} style={styles.closeModalBtn}>
              <X size={20} />
            </button>
            <h2 style={styles.modalTitle}>
              {activeModal === "terms"
                ? "Termos de Uso"
                : "Política de Privacidade"}
            </h2>

            <div style={styles.modalBody}>
              {activeModal === "terms" ? (
                <>
                  <p style={{ marginBottom: "15px" }}>
                    Ao acessar e utilizar a plataforma T.E.I.A, você concorda
                    expressamente com as seguintes diretrizes e
                    responsabilidades:
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      margin: 0,
                      paddingLeft: "15px",
                    }}
                  >
                    <li>
                      <strong>1. Responsabilidade sobre o Conteúdo:</strong> O
                      usuário é o único responsável legal e pedagógico pelo
                      material submetido. É estritamente proibido enviar
                      conteúdos ilegais, discriminatórios, ofensivos ou que
                      violem direitos autorais de terceiros.
                    </li>
                    <li>
                      <strong>2. Geração por Inteligência Artificial:</strong> O
                      T.E.I.A integra ferramentas de IA como suporte criativo. A
                      IA pode apresentar "alucinações" ou imprecisões. A
                      revisão, validação factual e adequação à BNCC são
                      obrigações exclusivas do professor titular.
                    </li>
                    <li>
                      <strong>3. Propriedade Intelectual e Colaboração:</strong>{" "}
                      Ao submeter e ter sua produção aprovada, você concorda em
                      disponibilizá-la sob licença colaborativa para a
                      comunidade do T.E.I.A, permitindo que outros docentes
                      acessem e adaptem seu material para fins educacionais (não
                      comerciais).
                    </li>
                    <li>
                      <strong>4. Integridade da Revisão Duplo-Cego:</strong> O
                      usuário se compromete a não inserir dados de identificação
                      pessoal no corpo do material submetido. Qualquer tentativa
                      deliberada de fraudar, manipular notas ou quebrar o
                      anonimato da avaliação resultará no banimento permanente
                      da plataforma.
                    </li>
                    <li>
                      <strong>5. Moderação e Banimento:</strong> A administração
                      do T.E.I.A reserva-se o direito de excluir conteúdos,
                      suspender ou cancelar contas que violem estes termos, sem
                      aviso prévio.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: "15px" }}>
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD -
                    Lei nº 13.709/2018), detalhamos o tratamento de suas
                    informações:
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      margin: 0,
                      paddingLeft: "15px",
                    }}
                  >
                    <li>
                      <strong>1. Coleta Mínima Necessária:</strong> Coletamos
                      apenas os dados estritamente necessários para o
                      funcionamento da plataforma e autenticação: Nome, E-mail,
                      Instituição de Ensino e Área de Atuação/Disciplina.
                    </li>
                    <li>
                      <strong>2. Proteção do Anonimato (Duplo-Cego):</strong>{" "}
                      Seus dados de identificação são rigorosamente separados do
                      seu conteúdo durante a fila de revisão. Revisores não têm
                      acesso à sua identidade, e você não tem acesso à
                      identidade de quem avalia.
                    </li>
                    <li>
                      <strong>3. Compartilhamento de Dados:</strong> O T.E.I.A
                      não comercializa, aluga ou cede seus dados pessoais a
                      terceiros sob nenhuma hipótese. Os dados são mantidos em
                      servidores seguros e utilizados exclusivamente para
                      métricas internas do sistema educacional.
                    </li>
                    <li>
                      <strong>4. Tecnologias Essenciais e de Segurança:</strong>{" "}
                      Empregamos recursos técnicos estritamente necessários
                      operando em segundo plano para manter a sua conexão ativa
                      e proteger o seu acesso enquanto navega. O sistema é
                      totalmente livre de rastreadores comportamentais ou
                      publicidade de terceiros.
                    </li>
                    <li>
                      <strong>5. Direito de Exclusão (Esquecimento):</strong> O
                      usuário pode solicitar a exclusão de sua conta a qualquer
                      momento. Caso existam produções aprovadas e publicadas na
                      comunidade, o autor poderá optar por excluí-las ou
                      mantê-las sob autoria "Anônima" para não prejudicar a rede
                      de ensino.
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.btnModalCompreendido}>
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } 
                .spin { animation: spin 1s linear infinite; }
                `}
      </style>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: "20px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  topBar: {
    width: "100%",
    maxWidth: "600px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "flex-start",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#546E7A",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
  },
  container: {
    display: "flex",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    overflow: "hidden",
    maxWidth: "600px",
    width: "100%",
  },
  formSection: {
    flex: 1,
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  header: { marginBottom: "30px", textAlign: "center" },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: "8px",
  },
  subtitle: { fontSize: "14px", color: "#64748B" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  row: { display: "flex", gap: "18px", flexWrap: "wrap" },
  inputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "200px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 12px",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    transition: "border 0.2s",
    height: "42px",
  },
  input: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#1E293B",
    height: "100%",
  },
  select: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: "#1E293B",
    height: "100%",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0px top 50%",
    backgroundSize: ".65em auto",
  },

  showPassContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-8px",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#64748B",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  termsContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "5px",
  },
  checkbox: {
    marginTop: "2px",
    cursor: "pointer",
    accentColor: "#1565C0",
    width: "16px",
    height: "16px",
    flexShrink: 0,
  },
  termsText: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.4",
    margin: 0,
  },
  termsLink: {
    color: "#1565C0",
    fontWeight: "700",
    textDecoration: "none",
    cursor: "pointer",
  },

  button: {
    backgroundColor: "#1565C0",
    color: "white",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
    marginTop: "10px",
    boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#991B1B",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  footerLink: {
    textAlign: "center",
    fontSize: "14px",
    color: "#64748B",
    marginTop: "10px",
  },
  link: { color: "#1565C0", fontWeight: "700", textDecoration: "none" },

  // --- ESTILOS DOS MODAIS ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    maxWidth: "600px",
    padding: "35px",
    borderRadius: "16px",
    position: "relative",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  closeModalBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "#F1F5F9",
    borderRadius: "50%",
    padding: "6px",
    border: "none",
    cursor: "pointer",
    color: "#64748B",
    display: "flex",
    transition: "background 0.2s",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: "20px",
  },
  modalBody: { fontSize: "14px", lineHeight: "1.7", color: "#475569" },
  modalFooter: {
    marginTop: "30px",
    textAlign: "right",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "20px",
  },
  btnModalCompreendido: {
    padding: "10px 24px",
    backgroundColor: "#1565C0",
    color: "white",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
}

export default Register
