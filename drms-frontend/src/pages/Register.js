import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div className="auth-card" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="auth-card__header">
          <span className="eyebrow">Get started</span>
          <h2>Create Account</h2>
          <p>Join the Digital Records Management System</p>
        </div>

        {error && <div className="message message--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid--2">
            <div className="field">
              <label>Full Name</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Username</label>
              <input className="input" placeholder="yourusername" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid--2">
            <div className="field">
              <label>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="button button--primary button--full" style={{ padding: '12px', fontSize: '15px', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
