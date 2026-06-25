import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

// --- PÁGINAS PÚBLICAS ---
import LandingPage from "./pages/LandingPage"
import Login from "./Login"
import Register from "./Register"

// --- PÁGINAS DE RECUPERAÇÃO DE SENHA ---
import EsqueceuSenha from "./pages/EsqueceuSenha"
import NovaSenha from "./pages/NovaSenha"

// --- PÁGINAS DO DASHBOARD (PRIVADAS) ---
import Dashboard from "./Dashboard"
import MainContent from "./components/MainContent"
import DetalheProducao from "./pages/DetalharProducao"
import VisualizarMinhaProducao from "./pages/VisualizarMinhaProducao"
import FormularioManual from "./pages/formularios/FormularioManual"
import SelecionarMetodo from "./pages/SelecionarMetodo"
import BuscarBase from "./pages/BuscarBase"
import MinhasProducoes from "./pages/MinhasProducoes"
import RevisaoDuploCego from "./pages/RevisaoDuploCego"
import Revisao from "./pages/FormRevisao"
import Ajuda from "./pages/Ajuda"
import Profile from "./pages/Profile"
import AprovacaoContas from "./pages/AprovacaoContas"
import Ranking from "./pages/Ranking"

// --- NOVAS PÁGINAS DO FÓRUM E ADMIN ---
import Forum from "./pages/Forum/Forum"
import TopicoDetalhe from "./pages/Forum/TopicoDetalhe"
import Admin from "./pages/Admin"
import CentralAdmin from "./pages/CentralAdmin"
import GamificacaoAdmin from "./pages/GamificacaoAdmin"
import DiarioOperacoes from "./pages/DiarioOperacoes" // <--- NOVA IMPORTAÇÃO AQUI

// --- PÁGINA DE EDIÇÃO ---
import EditarProducao from "./EditarProducao"

// --- COMPONENTE DE PROTEÇÃO ---
import PrivateRoute from "./components/PrivateRoute"

function App() {
  return (
    <Router>
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/reset-password/:uid/:token" element={<NovaSenha />} />

        {/* === ROTAS PRIVADAS (Só acessa com login) === */}
        <Route element={<PrivateRoute />}>
          {/* O Dashboard contém a barra lateral e o topo */}
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Rota padrão do dashboard (Feed) */}
            <Route index element={<MainContent />} />
            {/* Visualizações */}
            <Route path="producao/:id" element={<DetalheProducao />} />
            <Route
              path="minha-producao/:id"
              element={<VisualizarMinhaProducao />}
            />
            {/* Funcionalidades de Produção */}
            <Route path="catalogar" element={<SelecionarMetodo />} />
            <Route path="catalogar/base" element={<BuscarBase />} />
            <Route path="catalogar/manual" element={<FormularioManual />} />
            <Route path="minhas-producoes" element={<MinhasProducoes />} />
            <Route path="revisao" element={<RevisaoDuploCego />} />
            <Route path="revisao/:id" element={<Revisao />} />
            <Route path="ajuda" element={<Ajuda />} />
            {/* --- ROTA DE GAMIFICAÇÃO (USUÁRIO) --- */}
            <Route path="ranking" element={<Ranking />} />
            {/* --- ROTAS DO FÓRUM --- */}
            <Route path="forum" element={<Forum />} />
            <Route path="forum/:id" element={<TopicoDetalhe />} />
            {/* --- ROTA DE EDIÇÃO --- */}
            <Route path="editar-producao/:id" element={<EditarProducao />} />
            {/* --- ROTAS DE ADMINISTRAÇÃO --- */}
            <Route path="central-admin" element={<CentralAdmin />} />
            <Route path="aprovacoes" element={<AprovacaoContas />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/gamificacao" element={<GamificacaoAdmin />} />
            <Route path="admin/diario" element={<DiarioOperacoes />} />{" "}
            {/* <--- NOVA ROTA AQUI */}
          </Route>

          {/* Perfil fica fora do layout do Dashboard */}
          <Route path="/perfil" element={<Profile />} />
        </Route>

        {/* Rota de segurança (Catch-all) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
