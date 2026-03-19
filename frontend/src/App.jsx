import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { useContext, lazy, Suspense } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));

const Loading = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/admin/*" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/staff/*" element={
                    <PrivateRoute allowedRoles={['Staff']}>
                      <StaffDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/student/*" element={
                    <PrivateRoute allowedRoles={['Student']}>
                      <StudentDashboard />
                    </PrivateRoute>
                  } />

                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </DndProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
