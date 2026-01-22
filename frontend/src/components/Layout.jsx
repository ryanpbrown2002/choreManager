import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900">
                Chore Manager
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md">
                Settings
              </Link>
              <span className="text-gray-700 ml-4">
                {user?.name}
                {user?.role === 'admin' && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-900 font-medium">{user?.name}</span>
                {user?.role === 'admin' && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-gray-900"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="py-4 sm:py-10 px-3 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
