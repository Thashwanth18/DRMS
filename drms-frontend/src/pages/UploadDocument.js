import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function UploadDocument() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: '',
    department: '',
    recordDate: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    API.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const { data } = await API.post('/categories', newCategory);
      setCategories((current) => [...current, data]);
      setForm({ ...form, category: data._id });
      setNewCategory({ name: '', description: '' });
      setMessage('Category created.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please choose a file to upload.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', file);

    try {
      await API.post('/documents', formData);
      setMessage('Document uploaded successfully.');
      window.setTimeout(() => navigate('/documents'), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed.');
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Record intake</span>
          <h1>Upload document</h1>
          <p>Add new records with metadata, category assignment, tags, and initial version notes.</p>
        </div>
      </section>

      {message && <div className="message message--info">{message}</div>}

      <div className="two-column two-column--wide">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="grid grid--2">
            <div className="field">
              <label>Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Department</label>
              <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid--2">
            <div className="field">
              <label>Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Record date</label>
              <input className="input" type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} required />
            </div>
          </div>

          <div className="field">
            <label>Tags</label>
            <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="finance, annual, confidential" />
          </div>

          <div className="field">
            <label>Version notes</label>
            <textarea className="input input--textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Describe the uploaded version" />
          </div>

          <div className="field">
            <label>File</label>
            <input className="input" type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>

          <button type="submit" className="button button--primary">Upload document</button>
        </form>

        <div className="panel">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Category management</span>
              <h2>Create category</h2>
            </div>
          </div>
          <div className="stack">
            <input className="input" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Category name" />
            <textarea className="input input--textarea" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Category description" />
            <button type="button" className="button button--ghost" onClick={handleCreateCategory}>Create category</button>
          </div>

          <div className="panel panel--soft">
            <span className="eyebrow">Supported upload types</span>
            <p>PDF, DOCX, XLSX, JPG, and JPEG files up to 20MB.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
