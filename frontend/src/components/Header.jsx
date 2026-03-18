import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react'; 

function Header({ onToggleMenu, showMenuButton }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitles = {
    '/dashboard': 'Visão Geral',
    '/dashboard/catalogar-producoes': 'Catalogar Nova Produção',
    '/dashboard/minhas-producoes': 'Minhas Produções',
    '/dashboard/revisao': 'Revisão (Duplo Cego)',
    '/dashboard/comunidade': 'Comunidade',
    '/dashboard/ajuda': 'Ajuda e Suporte',
    '/perfil': 'Meu Perfil'
  };

  const currentTitle = pageTitles[location.pathname] || 'Página do Sistema';

  // --- AÇÕES ---
  const handleLogout = (e) => { 
      e.stopPropagation();
      localStorage.clear(); 
      navigate('/'); 
  };

  const handleProfileClick = () => {
      navigate('/perfil');
  };

  // --- DADOS DO USUÁRIO ---
  const fullUserName = localStorage.getItem('user_name') || '';
  const userAvatar = localStorage.getItem('user_avatar');
  
  const getFirstName = (fullName) => {
      if (!fullName) return '';
      const first = fullName.split(' ')[0]; 
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  };

  const displayName = getFirstName(fullUserName);
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'P';

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {showMenuButton && (
            <button onClick={onToggleMenu} style={styles.menuButton}>
                <Menu size={24} color="#1565C0" />
            </button>
        )}

        <div style={styles.breadcrumb}>
            {!showMenuButton && <span style={{color: '#90A4AE', marginRight: '8px'}}>Dashboard /</span>}
            <span style={{color: '#1565C0'}}>{currentTitle}</span>
        </div>
      </div>

      <div style={styles.userArea}>
        
        <div style={styles.profile} onClick={handleProfileClick} title="Ir para meu perfil">
            
            <div style={{...styles.userInfo, display: showMenuButton ? 'none' : 'flex'}}>
                <span style={styles.userName}>
                    Professor(a) {displayName}
                </span>
                
                <span 
                    onClick={handleLogout} 
                    style={styles.logoutLink}
                >
                    Sair
                </span>
            </div>
            
            <div style={styles.avatar}>
                {userAvatar && userAvatar !== "null" ? (
                    <img src={userAvatar} alt="Perfil" style={styles.avatarImg} />
                ) : (
                    <span>{userInitial}</span>
                )}
            </div>

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
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 20px',
        
        // --- CORREÇÃO DE POSICIONAMENTO ---
        position: 'sticky', 
        top: 0, 
        left: 0,                  // Força o alinhamento à esquerda
        zIndex: 900,
        width: '100%',             // Ocupa a largura total do container pai
        boxSizing: 'border-box',   // Padding interno não expande o tamanho do elemento
        flexShrink: 0              // Impede que o header seja "esmagado" por outros elementos flex
    },
    leftSection: { display: 'flex', alignItems: 'center', gap: '15px' },
    menuButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
    breadcrumb: { fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    
    userArea: { display: 'flex', alignItems: 'center', gap: '15px' },
    profile: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    userInfo: { flexDirection: 'column', alignItems: 'flex-end' },
    userName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    
    logoutLink: { 
        fontSize: '11px', 
        color: '#D32F2F', 
        fontWeight: '600', 
        marginTop: '2px',
        cursor: 'pointer',
        textDecoration: 'none'
    },

    avatar: { 
        width: '40px', 
        height: '40px', 
        backgroundColor: '#1565C0', 
        color: 'white', 
        borderRadius: '50%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontWeight: 'bold',
        fontSize: '18px',
        overflow: 'hidden', 
        border: '2px solid #E3F2FD',
        flexShrink: 0
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    }
};

export default Header;