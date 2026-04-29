import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Trophy, LogOut } from 'lucide-react'; 
import api from '../services/api'; // <--- IMPORTAÇÃO DA API ADICIONADA AQUI

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

  // --- ESTADOS DINÂMICOS PARA ATUALIZAÇÃO EM TEMPO REAL ---
  const [userPontos, setUserPontos] = useState(localStorage.getItem('user_pontos') || '0');
  const [userNivel, setUserNivel] = useState(localStorage.getItem('user_nivel') || 'Prof. Conectado(a)');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('user_avatar'));

  useEffect(() => {
      // --- MÁGICA AQUI: Busca os dados na API logo ao logar e carregar o Header ---
      const buscarDadosDoUsuario = async () => {
          try {
              const token = localStorage.getItem('access_token');
              if (token) {
                  const response = await api.get('api/user/me/');
                  const data = response.data;
                  
                  // Atualiza o "banco de dados" do navegador
                  localStorage.setItem('user_pontos', data.pontos);
                  localStorage.setItem('user_nivel', data.nivel);
                  localStorage.setItem('user_name', data.username);
                  if (data.avatar) localStorage.setItem('user_avatar', data.avatar);

                  // Atualiza a tela imediatamente
                  setUserPontos(data.pontos);
                  setUserNivel(data.nivel);
                  setUserAvatar(data.avatar);
              }
          } catch (error) {
              console.error("Erro ao sincronizar perfil no Header:", error);
          }
      };

      // Executa a busca
      buscarDadosDoUsuario();

      // Função que atualiza o Header assim que os dados mudam em outra tela (ex: Fórum ou Revisão)
      const atualizarHeader = () => {
          setUserPontos(localStorage.getItem('user_pontos') || '0');
          setUserNivel(localStorage.getItem('user_nivel') || 'Prof. Conectado(a)');
          setUserAvatar(localStorage.getItem('user_avatar'));
      };

      // Escuta tanto as abas do navegador quanto os eventos dentro do próprio sistema
      window.addEventListener('storage', atualizarHeader);
      window.addEventListener('perfilAtualizado', atualizarHeader);

      return () => {
          window.removeEventListener('storage', atualizarHeader);
          window.removeEventListener('perfilAtualizado', atualizarHeader);
      };
  }, []);

  // --- AÇÕES ---
  const handleLogout = (e) => { 
      e.stopPropagation();
      localStorage.clear(); 
      navigate('/'); 
  };

  const handleProfileClick = () => {
      navigate('/perfil');
  };

  const fullUserName = localStorage.getItem('user_name') || '';
  
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
                
                {/* Linha 1: Nome e Sair */}
                <div style={styles.nameRow}>
                    <span style={styles.userName}>
                        Prof. {displayName}
                    </span>
                    <span style={styles.separator}>|</span>
                    <span onClick={handleLogout} style={styles.logoutLink} title="Sair do sistema">
                        Sair <LogOut size={12} style={{marginLeft: '4px'}}/>
                    </span>
                </div>
                
                {/* Linha 2: Badge de XP Profissional */}
                <div style={styles.xpBadgeHeader}>
                    <Trophy size={11} color="#B45309" />
                    <span>{userNivel} <span style={{opacity: 0.6, margin: '0 2px'}}>•</span> {userPontos} XP</span>
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
    profile: { display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' },
    
    userInfo: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '5px' },
    
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

    xpBadgeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#FFFBEB', 
        color: '#B45309', 
        border: '1px solid #FDE68A',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
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