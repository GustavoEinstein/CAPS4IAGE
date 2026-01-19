import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Ícone do menu

function Header({ onToggleMenu, showMenuButton }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitles = {
    '/dashboard': 'Visão Geral',
    '/dashboard/catalogar-producoes': 'Catalogar Nova Produção',
    '/dashboard/minhas-producoes': 'Minhas Produções',
    '/dashboard/revisao': 'Revisão (Duplo Cego)',
    '/dashboard/comunidade': 'Comunidade',
    '/dashboard/ajuda': 'Ajuda e Suporte'
  };

  const currentTitle = pageTitles[location.pathname] || 'Página do Sistema';
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {/* Botão Hamburguer (Só no Mobile) */}
        {showMenuButton && (
            <button onClick={onToggleMenu} style={styles.menuButton}>
                <Menu size={24} color="#1565C0" />
            </button>
        )}

        {}
        <div style={styles.breadcrumb}>
            {!showMenuButton && <span style={{color: '#90A4AE', marginRight: '8px'}}>Dashboard /</span>}
            <span style={{color: '#1565C0'}}>{currentTitle}</span>
        </div>
      </div>

      <div style={styles.userArea}>
        <div style={styles.profile} onClick={handleLogout}>
            <div style={{...styles.userInfo, display: showMenuButton ? 'none' : 'flex'}}>
                <span style={styles.userName}>Professor(a)</span>
                <span style={styles.userRole}>Sair</span>
            </div>
            <div style={styles.avatar}>P</div>
        </div>
      </div>
    </header>
  );
}

const styles = {
    header: {
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', // Padding menor para mobile
        position: 'sticky', top: 0, zIndex: 900
    },
    leftSection: { display: 'flex', alignItems: 'center', gap: '15px' },
    menuButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
    breadcrumb: { fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    userArea: { display: 'flex', alignItems: 'center', gap: '15px' },
    profile: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    userInfo: { flexDirection: 'column', alignItems: 'flex-end' }, // display controlado no JSX
    userName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    userRole: { fontSize: '11px', color: '#D32F2F', fontWeight: '600' },
    avatar: { width: '36px', height: '36px', backgroundColor: '#1565C0', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }
};

export default Header;