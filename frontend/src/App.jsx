import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SectionPage from './pages/SectionPage.jsx';
import ChildrenPage from './pages/ChildrenPage.jsx';
import AiSupportPage from './pages/AiSupportPage.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { LoadingScreen } from './components/LoadingScreen.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  return allowedRoles.includes(user.role) ? children : <Navigate to="/dashboard" replace />;
}

function SectionRoute() {
  const { section } = useParams();
  return <SectionPage key={section} />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/app/children" element={<RoleRoute allowedRoles={['parent']}><ChildrenPage /></RoleRoute>} />
        <Route path="/app/ai-support" element={<RoleRoute allowedRoles={['parent']}><AiSupportPage /></RoleRoute>} />
        <Route path="/app/:section" element={<SectionRoute />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
