import Card from '../components/Card';

const Dashboard = () => {
  const stats = [
    { title: 'Total Records', value: '1,234', icon: '📄', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { title: 'Recent Uploads', value: '45', icon: '📤', bgColor: 'bg-gradient-to-br from-green-500 to-green-600' },
    { title: 'Total Users', value: '89', icon: '👥', bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { title: 'Storage Used', value: '2.4 GB', icon: '💾', bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600' }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} title={stat.title} value={stat.value} icon={stat.icon} bgColor={stat.bgColor} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { name: 'Document_2024.pdf', time: '2 hours ago', type: 'upload' },
              { name: 'Report_Q1.xlsx', time: '5 hours ago', type: 'upload' },
              { name: 'Invoice_2024.pdf', time: '1 day ago', type: 'upload' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Upload New Document', icon: '📤', color: 'blue' },
              { label: 'View All Records', icon: '📄', color: 'green' },
              { label: 'Generate Report', icon: '📊', color: 'purple' },
              { label: 'Manage Users', icon: '👥', color: 'orange' }
            ].map((action, i) => (
              <button key={i} className={`w-full flex items-center p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition text-left`}>
                <span className="text-2xl mr-4">{action.icon}</span>
                <span className="font-semibold text-gray-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
