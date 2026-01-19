import React from 'react';
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, FilePlus2, FolderOpen, Scale, Globe, LifeBuoy, BookOpenCheck, X 
} from 'lucide-react';

function Sidebar({ isOpen, isMobile, onClose }) {
  
  const getLinkStyle = ({ isActive }) => ({
    ...styles.link,
    ...(isActive ? styles.linkActive : {})
  });

  return (
    <aside style={{
        ...styles.sidebar,
        // Lógica de visualização Responsiva
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: 'fixed', // Sempre fixed para garantir overlay no mobile
        boxShadow: isOpen ? '4px 0 10px rgba(0,0,0,0.1)' : 'none'
    }}>
      {/* Logo Area */}
      <div style={styles.logoContainer}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={styles.logoIconBg}>
                <BookOpenCheck size={28} color="#1565C0" />
            </div>
            <div>
            <h1 style={styles.logoTitle}>CAPSIAGE</h1>
            </div>
        </div>
        
        {/* Botão de Fechar (Só aparece no Mobile) */}
        {isMobile && (
            <button onClick={onClose} style={styles.closeButton}>
                <X size={24} color="#546E7A" />
            </button>
        )}
      </div>

      <nav style={styles.nav}>
        <p style={styles.sectionLabel}>MENU PRINCIPAL</p>
        <ul style={styles.ul}>
          <li><NavLink to="/dashboard" end style={getLinkStyle} onClick={isMobile ? onClose : undefined}><LayoutDashboard size={20} style={styles.icon} />Início</NavLink></li>
          <li><NavLink to="/dashboard/catalogar-producoes" style={getLinkStyle} onClick={isMobile ? onClose : undefined}><FilePlus2 size={20} style={styles.icon} />Catalogar Produção</NavLink></li>
          <li><NavLink to="/dashboard/minhas-producoes" style={getLinkStyle} onClick={isMobile ? onClose : undefined}><FolderOpen size={20} style={styles.icon} />Minhas Produções</NavLink></li>
          <li><NavLink to="/dashboard/revisao" style={getLinkStyle} onClick={isMobile ? onClose : undefined}><Scale size={20} style={styles.icon} />Revisão (Duplo Cego)</NavLink></li>
          
          <p style={styles.sectionLabel}>COMUNIDADE</p>
          <li><NavLink to="/dashboard/comunidade" style={getLinkStyle} onClick={isMobile ? onClose : undefined}><Globe size={20} style={styles.icon} />Painel da Comunidade</NavLink></li>
        </ul>

        <div style={{marginTop: 'auto'}}>
            <ul style={styles.ul}>
                <li><NavLink to="/dashboard/ajuda" style={getLinkStyle} onClick={isMobile ? onClose : undefined}><LifeBuoy size={20} style={styles.icon} />Ajuda e Suporte</NavLink></li>
            </ul>
        </div>
      </nav>

      <div style={styles.footer}>
        <div style={styles.proCard}>
          <p style={{margin: '0 0 4px 0', fontWeight: 'bold'}}>Sistema CAPSIAGE</p>
          <p style={{margin: 0, fontSize: '11px', opacity: 0.85}}>Versão Beta 1.0</p>
        </div>
      </div>
    </aside>
  );
}

const styles = {
    sidebar: {
        width: '260px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        top: 0,
        left: 0,
        zIndex: 1000,
        transition: 'transform 0.3s ease-in-out', // Animação de deslizar
    },
    logoContainer: {
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Para separar logo do botão X
        borderBottom: '1px solid #F5F5F5',
    },
    logoIconBg: { width: '40px', height: '40px', backgroundColor: '#E3F2FD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoTitle: { fontSize: '18px', fontWeight: '800', color: '#1565C0', margin: 0, lineHeight: 1.1 },
    logoSubtitle: { fontSize: '12px', color: '#546E7A', fontWeight: '600', letterSpacing: '0.5px' },
    closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
    nav: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    ul: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' },
    sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#90A4AE', letterSpacing: '0.8px', margin: '15px 0 10px 12px', textTransform: 'uppercase' },
    link: { display: 'flex', alignItems: 'center', padding: '12px 14px', textDecoration: 'none', color: '#546E7A', fontSize: '14px', fontWeight: '500', borderRadius: '10px', transition: 'all 0.2s ease', border: '1px solid transparent' },
    linkActive: { backgroundColor: '#E3F2FD', color: '#1565C0', fontWeight: '600', border: '1px solid #BBDEFB' },
    icon: { marginRight: '12px' },
    footer: { padding: '20px', borderTop: '1px solid #F5F5F5' },
    proCard: { background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', borderRadius: '10px', padding: '16px', color: 'white', fontSize: '14px', textAlign: 'center' }
};

export default Sidebar;