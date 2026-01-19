import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function Dashboard() {
  // 1. Detecta largura da tela
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // 2. Controla se a sidebar está visível (no mobile começa fechada)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Monitora redimensionamento da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Se virou desktop, abre a sidebar. Se virou mobile, fecha.
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA', position: 'relative' }}>
      
      {/* Sidebar recebe o estado e a função de fechar (para clicar no X ou no fundo) */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Overlay Escuro (Só aparece no mobile quando menu está aberto) */}
      {isMobile && sidebarOpen && (
        <div 
            onClick={() => setSidebarOpen(false)}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
            }}
        />
      )}

      {/* Conteúdo Principal */}
      <div style={{ 
          flex: 1, 
          // Se for mobile, margem é 0. Se for desktop, 260px.
          marginLeft: isMobile ? '0' : '260px', 
          display: 'flex', 
          flexDirection: 'column',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          transition: 'margin-left 0.3s ease' 
      }}>
        
        <Header onToggleMenu={toggleSidebar} showMenuButton={isMobile} />
        
        <main style={{ padding: '0', flex: 1 }}>
          <Outlet context={{ isMobile }} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;