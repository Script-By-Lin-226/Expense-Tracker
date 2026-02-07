import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">ET</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 hidden sm:block">Expense Tracker</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-900 transition-colors"
              >
                Expenses
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-gray-900 p-2"
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
            >
              Expenses
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
