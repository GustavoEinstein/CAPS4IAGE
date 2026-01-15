import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import CatalogarProducoes from "./pages/CatalogarProducoes";

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
            element={<CatalogarProducoes />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
