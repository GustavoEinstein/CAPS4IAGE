import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Trophy, LogOut } from 'lucide-react'; 

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
    '/dashboard/forum': 'Fórum de Rascunhos',
    '/dashboard/admin': 'Painel do Administrador',
    '/dashboard/aprovacoes': 'Aprovação de Contas',
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

  // --- DADOS DO USUÁRIO E GAMIFICAÇÃO ---
  const fullUserName = localStorage.getItem('user_name') || '';
  const userAvatar = localStorage.getItem('user_avatar');
  const userPontos = localStorage.getItem('user_pontos') || '0';
  const userNivel = localStorage.getItem('user_nivel') || 'Prof. Conectado(a)';
  
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
                
                {/* Linha 1: Nome e Sair (Lado a Lado) */}
                <div style={styles.nameRow}>
                    <span style={styles.userName}>
                        Prof. {displayName}
                    </span>
                    <span style={styles.separator}>|</span>
                    <span 
                        onClick={handleLogout} 
                        style={styles.logoutLink}
                        title="Sair do sistema"
                    >
                        Sair <LogOut size={12} style={{marginLeft: '4px'}}/>
                    </span>
                </div>
                
                {/* Linha 2: Etiqueta de XP Docente */}
                <div style={styles.xpBadgeHeader}>
                    <Trophy size={11} color="#B45309" />
                    <span>{userNivel} • {userPontos} XP</span>
                </div>

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
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 25px',
        position: 'sticky', 
        top: 0, 
        left: 0,                  
        zIndex: 900,
        width: '100%',             
        boxSizing: 'border-box',   
        flexShrink: 0              
    },
    leftSection: { display: 'flex', alignItems: 'center', gap: '15px' },
    menuButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
    breadcrumb: { fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
    
    userArea: { display: 'flex', alignItems: 'center' },
    profile: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
    
    // Organiza as duas linhas de texto
    userInfo: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '4px' },
    
    // Nome e Logout
    nameRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    userName: { fontSize: '14px', fontWeight: '800', color: '#1E293B' },
    separator: { color: '#CBD5E1', fontSize: '12px' },
    
    logoutLink: { 
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px', 
        color: '#64748B', 
        fontWeight: '600', 
        cursor: 'pointer',
        transition: 'color 0.2s',
    },

    // Etiqueta com cores pedagógicas (Amarelo/Ouro sutil)
    xpBadgeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#FFFBEB', 
        color: '#B45309', 
        border: '1px solid #FDE68A',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },

    avatar: { 
        width: '44px', 
        height: '44px', 
        backgroundColor: '#1565C0', 
        color: 'white', 
        borderRadius: '50%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontWeight: 'bold',
        fontSize: '18px',
        overflow: 'hidden', 
        border: '3px solid #F1F5F9',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    }
};

export default Header;