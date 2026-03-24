import { useEffect, useState } from 'react';
import API from '../services/api';

const ACTIONS = ['', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DELETE', 'DOWNLOAD', 'UPDATE', 'VIEW', 'RESTORE', 'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE', 'USER_UPDATE'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ action: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadLogs = async (page = 1) => {
    const params = { page, limit: 20 };
    if (filters.action) params.action = filters.action;
    if (filters.search) params.search = filters.search;

    const { data } = await API.get('/audit', { params });
    setLogs(data.logs);
    setPagination({ page: data.page, pages: data.pages, total: data.total });
  };

  useEffect(() => {
    loadLogs().catch(() => {});
  }, [filters.action, filters.search]);

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Traceability</span>
          <h1>Audit logs</h1>
          <p>Track authentication, document access, version actions, category changes, and user administration events.</p>
        </div>
        <div className="badge">{pagination.total} events</div>
      </section>

      <section className="panel">
        <div className="filters-grid filters-grid--compact">
          <select className="input" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
            {ACTIONS.map((action) => <option key={action} value={action}>{action || 'All actions'}</option>)}
          </select>
          <input className="input" placeholder="Search user, resource, or details" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
      </section>

      <section className="panel">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.userName || log.user?.name || '-'}</td>
                  <td>{log.action}</td>
                  <td>{log.resource || '-'}</td>
                  <td>{log.details || '-'}</td>
                  <td>{log.ipAddress || '-'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`button ${pagination.page === pageNumber ? 'button--primary' : 'button--ghost'}`}
                onClick={() => loadLogs(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
