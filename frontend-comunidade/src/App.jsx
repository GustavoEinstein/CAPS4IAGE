import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import CatalogarProducoes from "./pages/CatalogarProducoes";
import MinhasProducoes from './pages/MinhasProducoes';
import RevisaoDuploCego from './pages/RevisaoDuploCego';
import PainelComunidade from './pages/PainelComunidade';
import Ajuda from './pages/Ajuda';
import Register from './Register';
import MainContent from './components/MainContent';
import PrivateRoute from './components/PrivateRoute';

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

          <Route
            path="/dashboard/comunidade"
            element={<PainelComunidade />} />

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
