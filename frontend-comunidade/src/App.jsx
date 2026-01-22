import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import CatalogarProducoes from "./pages/CatalogarProducoes";
import MinhasProducoes from './pages/MinhasProducoes';
import RevisaoDuploCego from './pages/RevisaoDuploCego';
import Revisao from './pages/FormRevisao';
import Ajuda from './pages/Ajuda';
import Register from './Register';
import MainContent from './components/MainContent';
import PrivateRoute from './components/PrivateRoute';
import DetalheProducao from './pages/DetalharProducao';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas (Qualquer um acessa) */}
        {/* Tela de login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Privadas (Só acessa se estiver logado) */}
        <Route element={<PrivateRoute />}>
                {/* Dashboard (layout base) */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Página padrão da dashboard */}
          <Route index element={<MainContent />} />

          {/* Nova Rota para Visualização da Produção */}
          <Route path="producao/:id" element={<DetalheProducao />} />

          {/* Catalogar produções didáticas */}
          <Route
            path="catalogar-producoes"
            element={<CatalogarProducoes />} />

          <Route 
            path="/dashboard/minhas-producoes" 
            element={<MinhasProducoes />} />

          <Route
            path="/dashboard/revisao"
            element={<RevisaoDuploCego />} />

          {/* Rota do Formulário (Específica com ID) */}
          <Route 
            path="revisao/:id" 
            element={<Revisao />} />         

          <Route
            path="ajuda"
            element={<Ajuda />} />

        </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
