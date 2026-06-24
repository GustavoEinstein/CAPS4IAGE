import React, { useState } from "react"
import api from "./services/api"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react" // Ícones importados para o botão de senha

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
)

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hover, setHover] = useState(false)

  // NOVO: Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const urlToken = "api/token/"

      const response = await api.post(urlToken, {
        username: username,
        password: password,
      })

      const token = response.data.access
      localStorage.setItem("access_token", token)
      localStorage.setItem("refresh_token", response.data.refresh)

      const urlUser = "api/user/me/"

      const userResponse = await api.get(urlUser, {
        headers: { Authorization: `Bearer ${token}` },
      })

      localStorage.setItem("user_name", userResponse.data.username || "Admin")
      localStorage.setItem(
        "user_disciplina",
        userResponse.data.disciplina || "Geral",
      )

      if (userResponse.data.avatar) {
        localStorage.setItem("user_avatar", userResponse.data.avatar)
      }

      if (userResponse.data.is_superuser) {
        localStorage.setItem("is_superuser", "true")
      } else {
        localStorage.removeItem("is_superuser")
      }

      window.dispatchEvent(new Event("storage"))
      window.location.href = "/dashboard"
    } catch (err) {
      console.error(err)
      if (err.code === "ERR_NETWORK") {
        setError("Erro de conexão. Verifique se o servidor está rodando.")
      } else if (err.response && err.response.status === 429) {
        setError(
          "Muitas tentativas falhadas. Por favor, aguarde 1 minuto e tente novamente.",
        )
      } else if (err.response && err.response.status === 401) {
        const detailMessage = err.response.data.detail
        if (detailMessage) {
          setError(detailMessage)
        } else {
          setError("Usuário ou senha incorretos.")
        }
      } else {
        setError("Ocorreu um erro inesperado.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.pageBackground}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <span>
              <SpiderWebIcon size={32} color="#1565C0" />
            </span>
          </div>
          <h2 style={styles.title}>T.E.I.A</h2>
          <p style={styles.subtitle}>
            Tecendo Educação com Inteligência Artificial
          </p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuário</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Seu usuário"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"} // Alterna entre text e password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Sua senha"
                required
              />
              {/* NOVO: Botão de alternância de visibilidade */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </button>
            </div>
          </div>

          <div style={styles.forgotPasswordContainer}>
            <Link to="/esqueceu-senha" style={styles.forgotPasswordLink}>
              Esqueceu a senha?
            </Link>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(hover ? styles.buttonHover : {}),
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            disabled={isLoading}
          >
            {isLoading ? "Conectando..." : "Entrar"}
          </button>

          <div style={styles.registerLinkContainer}>
            <Link to="/register" style={styles.registerLink}>
              Não tem conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  pageBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1565C0 0%, #64B5F6 100%)",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box", // Adicionado para garantir que o padding não quebre o layout
  },
  header: { textAlign: "center", marginBottom: "25px" },
  logoCircle: {
    width: "60px",
    height: "60px",
    backgroundColor: "#E3F2FD",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 15px auto",
  },
  title: {
    color: "#1565C0",
    fontSize: "24px",
    margin: "0 0 5px 0",
    fontWeight: "bold",
  },
  subtitle: { color: "#546E7A", fontSize: "14px", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    overflow: "hidden", // Garante que elementos internos não vazem das bordas arredondadas
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    flex: 1, // Permite que o input ocupe todo o espaço disponível, empurrando o botão para a direita
    padding: "12px",
    border: "none",
    background: "transparent",
    outline: "none",
    color: "#334155",
    width: "100%",
  },
  eyeButton: {
    background: "none",
    border: "none",
    padding: "0 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordContainer: { textAlign: "right", marginTop: "-5px" },
  forgotPasswordLink: {
    color: "#546E7A",
    fontSize: "13px",
    textDecoration: "none",
    fontWeight: "500",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    backgroundColor: "#1565C0",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonHover: { backgroundColor: "#0D47A1" },
  buttonDisabled: { backgroundColor: "#90CAF9", cursor: "not-allowed" },
  errorBox: {
    backgroundColor: "#FFEBEE",
    color: "#D32F2F",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    textAlign: "center",
  },
  registerLinkContainer: { textAlign: "center", marginTop: "10px" },
  registerLink: {
    color: "#1565C0",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
}

export default Login
