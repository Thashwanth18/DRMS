import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { role: 'Admin',   identifier: 'admin@drms.com',   pass: 'Admin@123',   color: '#ef4444' },
    { role: 'Manager', identifier: 'manager@drms.com', pass: 'Manager@123', color: '#f59e0b' },
    { role: 'User',    identifier: 'tk@drms.com',      pass: 'User@123',    color: '#10b981', key: 'user1' },
    { role: 'User',    identifier: 'gowsik@drms.com', pass: 'Gowsik@123', color: '#10b981', key: 'user2' },
    { role: 'Auditor', identifier: 'auditor@drms.com', pass: 'Auditor@123', color: '#6366f1' },
  ];

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero__panel">
          <span className="eyebrow">Secure Searchable Accountable</span>
          <h1>Digital Records Management System</h1>
          <p>Centrally store, version-control, and audit your organization's documents with role-based access.</p>
          <div className="feature-list">
            {['Role-Based Access Control', 'Document Version Control', 'Reports and Analytics', 'Full Audit Trail'].map((feature) => (
              <div key={feature} className="feature-list__item">{feature}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card__header">
            <span className="eyebrow">Sign in</span>
            <h2>Welcome back</h2>
            <p>Use your DRMS credentials to continue.</p>
          </div>

          {error && <div className="message message--error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Username or Email</label>
              <input className="input" placeholder="username or you@example.com" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="password-row">
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="button button--ghost" onClick={() => setShowPass(!showPass)}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="button button--primary button--full" disabled={loading} style={{ padding: '12px', fontSize: '15px', marginTop: '4px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></p>

          <div className="info-card">
            <h3>Demo Credentials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {demos.map((demo) => (
                <div key={demo.key || demo.role} onClick={() => setForm({ identifier: demo.identifier, password: demo.pass })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <span style={{ background: demo.color, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 10px', borderRadius: '10px', minWidth: '60px', textAlign: 'center' }}>{demo.role}</span>
                  <span style={{ fontSize: '12px', color: '#475569', flex: 1 }}>{demo.identifier}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{demo.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
