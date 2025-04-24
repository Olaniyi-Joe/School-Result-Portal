import { useState } from 'react';
// import axios from 'axios'; // Remove default axios import
import axiosInstance from '../api/axiosInstance'; // Import the configured instance
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminSignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('teacher'); // Default or allow selection
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!username || !email || !password) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // Use axiosInstance and relative path (or full path if baseURL isn't set reliably)
      // Headers are now handled by the interceptor
      const response = await axiosInstance.post(
        '/auth/register/', 
        { username, email, password, user_type: userType } // Adjust payload based on backend expectations
      );
      toast.success('User registered successfully!');
      // Optionally navigate somewhere or clear form
      setUsername('');
      setEmail('');
      setPassword('');
      // navigate('/users'); // Example: navigate to a user list page if it exists
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Registration failed. Please try again.';
      toast.error(`Registration failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register New User (Admin)</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        {/* Optional: Add user type selection if needed */}
        {/* <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userType">
            User Type
          </label>
          <select 
            id="userType" 
            value={userType} 
            onChange={(e) => setUserType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
             <option value="admin">Admin</option> // Add other roles as needed
          </select>
        </div> */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register User'}
          </button>
        </div>
      </form>
    </div>
  );
}
