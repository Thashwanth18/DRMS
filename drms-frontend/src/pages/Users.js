import { useEffect, useState } from 'react';
import API from '../services/api';

const ROLES = ['Admin', 'Record Manager', 'Authorized User', 'Auditor'];
const EMPTY_FORM = { name: '', username: '', email: '', password: '', role: 'Authorized User' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRemove, setSelectedRemove] = useState('');

  const loadUsers = async () => {
    const { data } = await API.get('/auth/users');
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch(() => setMessage({ text: 'Unable to load users.', type: 'error' }));
  }, []);

  const notify = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'info' }), 3000);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/auth/register', form);
      notify('User created successfully.');
      setShowModal(false);
      setForm(EMPTY_FORM);
      loadUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await API.put(`/auth/users/${userId}`, { role });
      notify('Role updated.');
      loadUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Unable to update role.', 'error');
    }
  };

  const removeUser = async (userId, name) => {
    if (!window.confirm(`Remove "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/auth/users/${userId}`);
      notify('User removed.');
      loadUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Unable to remove user.', 'error');
    }
  };

  const updateUsername = async (userId, username, current) => {
    if (!username || username === current) return;
    try {
      await API.put(`/auth/users/${userId}`, { username });
      notify('Username updated.');
      loadUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Unable to update username.', 'error');
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Users</h1>
          <p>Manage DRMS user accounts and role-based access control.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="button button--primary" onClick={() => setShowModal(true)}>+ Add User</button>
          <button className="button button--ghost" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setShowRemoveModal(true)}>− Remove User</button>
        </div>
      </section>

      {message.text && (
        <div className={`message message--${message.type === 'error' ? 'error' : 'info'}`}>{message.text}</div>
      )}

      <section className="panel">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username || '-'}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        className="input"
                        style={{ width: '130px' }}
                        defaultValue={user.username || ''}
                        placeholder="username"
                        onBlur={(e) => updateUsername(user._id, e.target.value.trim(), user.username)}
                      />
                      <select className="input" style={{ width: '160px' }} value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <span className="eyebrow">Administration</span>
                <h2>Add New User</h2>
              </div>
              <button className="button button--ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="grid grid--2">
                <div className="field">
                  <label>Full Name</label>
                  <input className="input" placeholder="John Doe" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input className="input" placeholder="johndoe" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" placeholder="john@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select className="input" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="button button--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="button button--primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div className="modal-backdrop" onClick={() => setShowRemoveModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <span className="eyebrow">Administration</span>
                <h2>Remove User</h2>
              </div>
              <button className="button button--ghost" onClick={() => setShowRemoveModal(false)}>✕</button>
            </div>
            <div className="field">
              <label>Select User</label>
              <select className="input" value={selectedRemove} onChange={(e) => setSelectedRemove(e.target.value)}>
                <option value="">-- Select a user --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="button button--ghost" onClick={() => setShowRemoveModal(false)}>Cancel</button>
              <button className="button button--ghost" style={{ color: '#ef4444', borderColor: '#ef4444' }}
                disabled={!selectedRemove}
                onClick={() => {
                  const u = users.find((x) => x._id === selectedRemove);
                  setShowRemoveModal(false);
                  setSelectedRemove('');
                  removeUser(selectedRemove, u?.name);
                }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
