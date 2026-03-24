import { useEffect, useState } from 'react';
import API from '../services/api';

const TABS = [
  { key: 'upload', label: 'Upload summary' },
  { key: 'activity', label: 'User activity' },
  { key: 'department', label: 'Department report' },
  { key: 'access', label: 'Access log report' }
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('upload');
  const [reportData, setReportData] = useState({
    upload: [],
    activity: [],
    department: [],
    access: []
  });

  useEffect(() => {
    Promise.all([
      API.get('/reports/upload-summary'),
      API.get('/reports/user-activity'),
      API.get('/reports/department'),
      API.get('/reports/access-log')
    ]).then(([upload, activity, department, access]) => {
      setReportData({
        upload: upload.data,
        activity: activity.data,
        department: department.data,
        access: access.data
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">Compliance workspace</span>
          <h1>Reports</h1>
          <p>Review upload patterns, department usage, user activity, and access-log volume.</p>
        </div>
      </section>

      <section className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`button ${activeTab === tab.key ? 'button--primary' : 'button--ghost'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === 'upload' && (
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Uploads</th><th>Total size (KB)</th></tr>
              </thead>
              <tbody>
                {reportData.upload.map((row) => (
                  <tr key={row._id}>
                    <td>{row._id}</td>
                    <td>{row.count}</td>
                    <td>{(row.totalSize / 1024).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Total actions</th><th>Breakdown</th></tr>
              </thead>
              <tbody>
                {reportData.activity.map((row) => (
                  <tr key={row._id}>
                    <td>{row._id}</td>
                    <td>{row.total}</td>
                    <td>{row.actions.map((action) => `${action.action}: ${action.count}`).join(' | ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'department' && (
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Department</th><th>Documents</th><th>Total size (KB)</th><th>Latest record date</th></tr>
              </thead>
              <tbody>
                {reportData.department.map((row) => (
                  <tr key={row._id}>
                    <td>{row._id}</td>
                    <td>{row.count}</td>
                    <td>{(row.totalSize / 1024).toFixed(1)}</td>
                    <td>{row.latestRecordDate ? new Date(row.latestRecordDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'access' && (
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Action</th><th>Count</th><th>Latest activity</th></tr>
              </thead>
              <tbody>
                {reportData.access.map((row) => (
                  <tr key={row._id}>
                    <td>{row._id}</td>
                    <td>{row.count}</td>
                    <td>{new Date(row.latestActivity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
