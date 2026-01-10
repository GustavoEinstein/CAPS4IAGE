import './Dashboard.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Cabeçalho fixo no topo */}
      <Header />

      {/* Corpo da dashboard: sidebar + conteúdo */}
      <div className="dashboard-body">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default Dashboard;
