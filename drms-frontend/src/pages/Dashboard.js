import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import RoleBadge from '../components/RoleBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ documents: 0, categories: 0, users: 0, audits: 0 });
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [documentsRes, categoriesRes] = await Promise.all([
        API.get('/documents?limit=5'),
        API.get('/categories')
      ]);

      let usersCount = 0, auditsCount = 0;
      if (user.role === 'Admin') {
        const [usersRes, auditRes] = await Promise.all([API.get('/auth/users'), API.get('/audit?limit=5')]);
        usersCount = usersRes.data.length || 0;
        auditsCount = auditRes.data.total || 0;
      } else if (user.role === 'Auditor') {
        const auditRes = await API.get('/audit?limit=5');
        auditsCount = auditRes.data.total || 0;
      }

      setStats({
        documents: documentsRes.data.total || 0,
        categories: categoriesRes.data.length || 0,
        users: usersCount,
        audits: auditsCount
      });
      setRecentDocuments(documentsRes.data.docs || []);
    };

    loadData().catch(() => {});
  }, [user.role]);

  const cards = [
    { label: 'Documents', value: stats.documents, link: '/documents' },
    { label: 'Categories', value: stats.categories, link: '/upload' },
    ...(user.role === 'Admin' ? [{ label: 'Users', value: stats.users, link: '/users' }] : []),
    ...(['Admin', 'Auditor'].includes(user.role) ? [{ label: 'Audit logs', value: stats.audits, link: '/audit' }] : [])
  ];

  const actions = [
    { label: 'Browse documents', path: '/documents', allowed: true },
    { label: 'Upload new record', path: '/upload', allowed: ['Admin', 'Record Manager'].includes(user.role) },
    { label: 'Open reports', path: '/reports', allowed: ['Admin', 'Auditor'].includes(user.role) },
    { label: 'Manage users', path: '/users', allowed: user.role === 'Admin' }
  ].filter((item) => item.allowed);

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 2px' }}>
            <h1 style={{ margin: 0 }}>Welcome, {user.name}</h1>
            <RoleBadge role={user.role} />
          </div>
          <p>Track records, manage document workflows, and jump into the tools assigned to your role.</p>
        </div>
      </section>

      <section className="stats-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="stat-card">
            <span className="stat-card__label">{card.label}</span>
            <strong className="stat-card__value">{card.value}</strong>
          </Link>
        ))}
      </section>

      <section className="two-column">
        <div className="panel">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Quick actions</span>
              <h2>Common tasks</h2>
            </div>
          </div>
          <div className="stack">
            {actions.map((action) => (
              <Link key={action.path} to={action.path} className="action-row">
                <span>{action.label}</span>
                <span>Open</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Latest uploads</span>
              <h2>Recent documents</h2>
            </div>
          </div>
          <div className="stack">
            {recentDocuments.length === 0 && <div className="empty-state">No records available yet.</div>}
            {recentDocuments.map((document) => (
              <div key={document._id} className="list-card">
                <div>
                  <strong>{document.title}</strong>
                  <p>{document.department} | v{document.currentVersion}</p>
                </div>
                <span>{new Date(document.recordDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
