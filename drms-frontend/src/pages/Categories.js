import { useEffect, useState } from 'react';
import API from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState('');

  const loadCategories = async () => {
    const { data } = await API.get('/categories');
    setCategories(data);
  };

  useEffect(() => {
    loadCategories().catch(() => setMessage('Unable to load categories.'));
  }, []);

  const resetDraft = () => {
    setDraft({ name: '', description: '' });
    setEditingId('');
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setDraft({ name: category.name, description: category.description || '' });
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    resetDraft();
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, draft);
        setMessage('Category updated.');
        closeEdit();
      } else {
        await API.post('/categories', draft);
        setMessage('Category created.');
      }
      resetDraft();
      loadCategories();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Category action failed.');
    }
  };

  const removeCategory = async (id) => {
    try {
      await API.delete(`/categories/${id}`);
      setMessage('Category deleted.');
      loadCategories();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Classification</span>
          <h1>Categories</h1>
          <p>Create, edit, and remove categories used for record organization and filtering.</p>
        </div>
      </section>

      {message && <div className="message message--info">{message}</div>}

      <div className="two-column two-column--wide">
        <form className="panel" onSubmit={saveCategory}>
          <div className="panel__header">
            <div>
              <span className="eyebrow">{editingId ? 'Edit category' : 'New category'}</span>
              <h2>{editingId ? 'Update category' : 'Create category'}</h2>
            </div>
          </div>
          <div className="stack">
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Category name" required />
            <textarea className="input input--textarea" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
            <div className="inline-actions">
              <button className="button button--primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
              {editingId && <button className="button button--ghost" type="button" onClick={resetDraft}>Cancel</button>}
            </div>
          </div>
        </form>

        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="button button--ghost" onClick={() => openEdit(category)}>Edit</button>
                        <button className="button button--danger" onClick={() => removeCategory(category._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showEditModal && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <span className="eyebrow">Classification</span>
                <h2>Edit Category</h2>
              </div>
              <button className="button button--ghost" onClick={closeEdit}>✕</button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="stack">
                <div className="field">
                  <label>Category Name</label>
                  <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Category name" required />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea className="input input--textarea" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="button button--ghost" type="button" onClick={closeEdit}>Cancel</button>
                  <button className="button button--primary" type="submit">Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
