// src/components/Topbar.jsx
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow px-6 py-4 sticky top-0 z-20 flex justify-between items-center print:hidden">
      <h1 className="text-xl font-semibold text-gray-800">School Result Portal</h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-gray-600">
              {user.first_name} {user.last_name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}