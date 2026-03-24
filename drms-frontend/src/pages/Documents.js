import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const buildPreviewUrl = (previewUrl) => {
  const base = (API.defaults.baseURL || '').replace(/\/api$/, '');
  return `${base}${previewUrl}`;
};

export default function Documents() {
  const { user } = useAuth();
  const canManage = ['Admin', 'Record Manager'].includes(user.role);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', department: '', fileType: '', tag: '', startDate: '', endDate: '' });
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [versionFile, setVersionFile] = useState(null);
  const [versionNotes, setVersionNotes] = useState('');

  const loadDocuments = async (page = 1) => {
    const params = { page, limit: 10 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    const { data } = await API.get('/documents', { params });
    setDocuments(data.docs);
    setPagination({ page: data.page, pages: data.pages, total: data.total });
  };

  useEffect(() => {
    API.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadDocuments().catch(() => setMessage('Unable to load documents.'));
  }, [filters.search, filters.category, filters.department, filters.fileType, filters.tag, filters.startDate, filters.endDate]);

  const openDocument = async (documentId) => {
    const { data } = await API.get(`/documents/${documentId}`);
    setSelected(data);
  };

  const downloadDocument = async (record) => {
    const response = await API.get(`/documents/${record._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = record.originalName || record.title;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteDocument = async (documentId) => {
    await API.delete(`/documents/${documentId}`);
    setMessage('Document deleted.');
    await loadDocuments(pagination.page);
    if (selected?._id === documentId) setSelected(null);
  };

  const uploadVersion = async () => {
    if (!versionFile || !selected) return;
    const formData = new FormData();
    formData.append('file', versionFile);
    formData.append('notes', versionNotes);
    await API.post(`/documents/${selected._id}/version`, formData);
    setMessage('New version uploaded.');
    setVersionFile(null);
    setVersionNotes('');
    await openDocument(selected._id);
    await loadDocuments(pagination.page);
  };

  const restoreVersion = async (versionNumber) => {
    await API.put(`/documents/${selected._id}/restore`, { versionNumber });
    setMessage(`Restored version ${versionNumber}.`);
    await openDocument(selected._id);
    await loadDocuments(pagination.page);
  };

  const deleteVersion = async (versionNumber) => {
    await API.delete(`/documents/${selected._id}/version/${versionNumber}`);
    setMessage(`Version ${versionNumber} deleted.`);
    await openDocument(selected._id);
    await loadDocuments(pagination.page);
  };

  const preview = selected && ['.pdf', '.jpg', '.jpeg'].includes(selected.fileType);

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Records workspace</span>
          <h1>Documents</h1>
          <p>Search, filter, preview, download, and manage version history for organizational records.</p>
        </div>
        <div className="badge">{pagination.total} records</div>
      </section>

      {message && <div className="message message--info">{message}</div>}

      <section className="panel">
        <div className="filters-grid">
          <input className="input" placeholder="Keyword search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <input className="input" placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
          <select className="input" value={filters.fileType} onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}>
            <option value="">All file types</option>
            <option value=".pdf">PDF</option>
            <option value=".docx">DOCX</option>
            <option value=".xlsx">XLSX</option>
            <option value=".jpg">JPG</option>
            <option value=".jpeg">JPEG</option>
          </select>
          <input className="input" placeholder="Tag" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} />
          <input className="input" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input className="input" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <button className="button button--ghost" onClick={() => setFilters({ search: '', category: '', department: '', fileType: '', tag: '', startDate: '', endDate: '' })}>Clear</button>
        </div>
      </section>

      <section className="panel">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Department</th>
                <th>Record date</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document._id}>
                  <td>
                    <strong>{document.title}</strong>
                    <p>{document.originalName}</p>
                  </td>
                  <td>{document.category?.name || 'Uncategorized'}</td>
                  <td>{document.department}</td>
                  <td>{new Date(document.recordDate).toLocaleDateString()}</td>
                  <td>v{document.currentVersion}</td>
                  <td>
                    <div className="inline-actions">
                      <button className="button button--ghost" onClick={() => openDocument(document._id)}>View</button>
                      <button className="button button--ghost" onClick={() => downloadDocument(document)}>Download</button>
                      {canManage && <button className="button button--danger" onClick={() => deleteDocument(document._id)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((pageNumber) => (
              <button key={pageNumber} className={`button ${pagination.page === pageNumber ? 'button--primary' : 'button--ghost'}`} onClick={() => loadDocuments(pageNumber)}>
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <span className="eyebrow">Document details</span>
                <h2>{selected.title}</h2>
              </div>
              <button className="button button--ghost" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className="grid grid--2">
              <div className="panel panel--soft">
                <p><strong>Department:</strong> {selected.department}</p>
                <p><strong>Category:</strong> {selected.category?.name || 'Uncategorized'}</p>
                <p><strong>Record date:</strong> {new Date(selected.recordDate).toLocaleDateString()}</p>
                <p><strong>Tags:</strong> {selected.tags?.join(', ') || 'None'}</p>
                <p><strong>Current version:</strong> v{selected.currentVersion}</p>
              </div>
              <div className="panel panel--soft">
                <span className="eyebrow">Preview</span>
                {!preview && <div className="empty-state">Preview is available for PDF and image files.</div>}
                {preview && selected.fileType === '.pdf' && (
                  <iframe title={selected.title} src={buildPreviewUrl(selected.previewUrl)} className="preview-frame" />
                )}
                {preview && selected.fileType !== '.pdf' && (
                  <img alt={selected.title} src={buildPreviewUrl(selected.previewUrl)} className="preview-image" />
                )}
              </div>
            </div>

            <div className="panel panel--soft">
              <div className="panel__header">
                <div>
                  <span className="eyebrow">Version control</span>
                  <h2>History</h2>
                </div>
              </div>
              <div className="stack">
                {selected.versions?.map((version) => (
                  <div key={version.versionNumber} className="list-card">
                    <div>
                      <strong>Version {version.versionNumber}</strong>
                      <p>{version.notes || 'No notes provided'} | {new Date(version.uploadedAt).toLocaleString()}</p>
                    </div>
                    {canManage && version.versionNumber !== selected.currentVersion && (
                      <div className="inline-actions">
                        <button className="button button--ghost" onClick={() => restoreVersion(version.versionNumber)}>Restore</button>
                        <button className="button button--danger" onClick={() => deleteVersion(version.versionNumber)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {canManage && (
              <div className="panel panel--soft">
                <div className="panel__header">
                  <div>
                    <span className="eyebrow">Update record</span>
                    <h2>Upload new version</h2>
                  </div>
                </div>
                <div className="stack">
                  <input className="input" type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg" onChange={(e) => setVersionFile(e.target.files?.[0] || null)} />
                  <input className="input" placeholder="Version notes" value={versionNotes} onChange={(e) => setVersionNotes(e.target.value)} />
                  <button className="button button--primary" onClick={uploadVersion}>Upload version</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
