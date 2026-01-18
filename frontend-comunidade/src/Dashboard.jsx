import "./Dashboard.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Cabeçalho fixo */}
      <Header />

      {/* Corpo da dashboard */}
      <div className="dashboard-body">
        {/* Menu lateral */}
        <Sidebar />

        {/* Área dinâmica de conteúdo */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
