import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import CatalogarProducoes from "./pages/CatalogarProducoes";
import MinhasProducoes from './pages/MinhasProducoes';
import RevisaoDuploCego from './pages/RevisaoDuploCego';
import PainelComunidade from './pages/PainelComunidade';
import Ajuda from './pages/Ajuda';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
// import Dashboard from './Dashboard';
import Register from './Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Tela de login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard (layout base) */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Página padrão da dashboard */}
          <Route index element={<h2>Início</h2>} />

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
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
