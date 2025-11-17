// src/App.jsx
import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useState } from 'react';
import Loading from './components/Loading';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;

  // ROUTES where navbar & footer should NOT appear
  const hideOnRoutes = ['/login', '/register'];
  const hideLayout = hideOnRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  return (
    <AuthProvider>
      {/* Show Navbar ONLY when not on auth pages */}
      {!hideLayout && <Navbar />}

      <main className="min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary">
        <Outlet />
      </main>

      {/* Show Footer ONLY when not on auth pages */}
      {!hideLayout && <Footer />}
    </AuthProvider>
  );
}

export default App;
