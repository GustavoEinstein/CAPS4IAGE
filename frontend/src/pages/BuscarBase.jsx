import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import Swal from 'sweetalert2'
import { ArrowLeft } from "lucide-react"

const BuscarBase = () => {
  const navigate = useNavigate()
  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)

  // LÓGICA DE BUSCA AUTOMÁTICA (DEBOUNCE)
  useEffect(() => {
    if (!busca.trim()) {
      setResultados([]);
      return;
    }

    setLoading(true);
    const delayBusca = setTimeout(async () => {
      try {
        // ATENÇÃO: Confirme se esta rota está correta no seu urls.py
        const url = `api/public/feed/?search=${busca}`; 
        const response = await api.get(url);
        setResultados(response.data.results || response.data);
      } catch (error) {
        console.error("Erro na busca automática", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms de Debounce

    return () => clearTimeout(delayBusca);
  }, [busca]);

  const handleSelect = (prod) => {
    Swal.fire({
      title: 'Usar como base?',
      text: `Você vai criar uma nova prática baseada em "${prod.titulo}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, usar esta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1565C0'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redireciona para o formulário passando os dados na "mochila" (state)
        navigate("/dashboard/catalogar/manual", { 
          state: { baseData: prod } 
        });
      }
    })
  }

  return (
    <div style={styles.fullPageWrapper}>
      <div style={styles.containerCenter}>
        {/* Voltar para a tela de seleção de método */}
        <button onClick={() => navigate("/dashboard/catalogar")} style={styles.backButtonSimple}>
          <ArrowLeft size={20} /> Voltar
        </button>
        
        <div style={{ ...styles.headerCenter, marginBottom: "30px" }}>
          <h2 style={styles.titleCenter}>Buscar Prática Base</h2>
          <p style={styles.subtitleCenter}>
            Digite palavras-chave para encontrar a prática que servirá de inspiração.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "600px", marginBottom: "30px", position: "relative" }}>
          <input 
            type="text" 
            placeholder="Buscar por título, disciplina... (Busca automática)" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ ...styles.input, flex: 1, paddingRight: "40px" }}
          />
          {loading && (
            <div style={{ position: "absolute", right: "15px", top: "12px", color: "#1565C0", fontSize: "12px", fontWeight: "bold" }}>
              Buscando...
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "15px" }}>
          {resultados.map(prod => (
            <div key={prod.id} style={{ ...styles.mainCard, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#1565C0" }}>{prod.titulo}</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#546E7A" }}>{prod.disciplina} • {prod.nivel}</p>
              </div>
              <button onClick={() => handleSelect(prod)} style={{ ...styles.draftButton, padding: "8px 16px", fontSize: "13px" }}>
                Selecionar
              </button>
            </div>
          ))}
          
          {!busca.trim() && (
            <p style={{ textAlign: "center", color: "#90A4AE" }}>Comece a digitar para ver as produções disponíveis.</p>
          )}
          
          {resultados.length === 0 && !loading && busca.trim() !== "" && (
            <p style={{ textAlign: "center", color: "#90A4AE", backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E0E0E0" }}>
              Nenhuma prática encontrada com o termo "{busca}".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  fullPageWrapper: { backgroundColor: "#F8F9FA", minHeight: "100vh", width: "100%", boxSizing: "border-box", padding: "20px" },
  containerCenter: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", width: "100%", maxWidth: "1000px", margin: "0 auto" },
  backButtonSimple: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#546E7A", fontWeight: "600", fontSize: "15px", marginBottom: "20px", alignSelf: "flex-start" },
  headerCenter: { textAlign: "center", maxWidth: "600px" },
  titleCenter: { fontSize: "32px", color: "#1565C0", margin: "0 0 10px 0", fontWeight: "800" },
  subtitleCenter: { fontSize: "18px", color: "#546E7A", margin: 0 },
  input: { width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #CFD8DC", fontSize: "14px", color: "#37474F", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box", height: "45px" },
  mainCard: { backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #E0E0E0" },
  draftButton: { backgroundColor: "white", color: "#1565C0", border: "1px solid #1565C0", borderRadius: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" },
}

export default BuscarBase