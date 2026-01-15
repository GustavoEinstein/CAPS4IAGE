import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/dashboard"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Início
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/catalogar-producoes"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Catalogar produções didáticas
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/minhas-producoes"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Minhas produções didáticas catalogadas
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/revisao-duplo-cego"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Revisão de produção (duplo cego)
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/painel-comunidade"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Painel de produções didáticas da comunidade
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/ajuda"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Ajuda
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
