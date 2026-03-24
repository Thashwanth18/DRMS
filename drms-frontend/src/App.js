import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import UploadDocument from './pages/UploadDocument';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute roles={['Admin', 'Record Manager']}><UploadDocument /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute roles={['Admin', 'Record Manager']}><Categories /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['Admin', 'Auditor']}><Reports /></PrivateRoute>} />
          <Route path="/audit" element={<PrivateRoute roles={['Admin', 'Auditor']}><AuditLogs /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['Admin']}><Users /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
