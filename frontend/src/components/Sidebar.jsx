import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, User } from 'lucide-react';
import { authClient } from '../lib/neon';

export default function Sidebar() {
  const navigate = useNavigate();
  const { data } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <h1 className="logo-brand">nutriwel</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard className="nav-icon" size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/pacientes" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users className="nav-icon" size={20} />
            <span>Pacientes</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{data?.user?.name || 'Nutricionista'}</span>
            <span className="user-email">{data?.user?.email || ''}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-logout" title="Sair da conta">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
