import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { authClient } from './lib/neon';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PacientePerfil from './pages/PacientePerfil';

function ProtectedRoute({ children }) {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!data || error) {
    return <Navigate to="/login" />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (data) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas Públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Rotas Protegidas com Layout Principal (Sidebar) */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/:id" element={<PacientePerfil />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
