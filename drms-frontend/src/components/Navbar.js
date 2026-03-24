import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/documents', label: 'Documents' },
  { path: '/upload', label: 'Upload', roles: ['Admin', 'Record Manager'] },
  { path: '/categories', label: 'Categories', roles: ['Admin', 'Record Manager'] },
  { path: '/reports', label: 'Reports', roles: ['Admin', 'Auditor'] },
  { path: '/audit', label: 'Audit Logs', roles: ['Admin', 'Auditor'] },
  { path: '/users', label: 'Users', roles: ['Admin'] }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = navItems.filter((item) => !item.roles || item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="topbar">
      <div className="topbar__left">
        <div className="brand-block">
          <span className="brand-block__eyebrow">Digital Records</span>
          <span className="brand-block__title">DRMS Control Center</span>
        </div>
        <div className="topbar__divider" />
        {links.map((item) => (
          <Link key={item.path} to={item.path} className={`topbar__link${location.pathname === item.path ? ' topbar__link--active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="topbar__right">
        <div className="user-chip">
          <div className="user-chip__avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="user-chip__body">
            <span className="user-chip__name">{user.name}</span>
            <span className="user-chip__role-badge" data-role={user.role}>{user.role}</span>
          </div>
        </div>
        <button className="button button--ghost" onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}
