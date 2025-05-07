import { useState } from 'react';
// import axios from 'axios'; // Remove default axios import
import axiosInstance from '../api/axiosInstance'; // Import the configured instance
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminSignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState('admin'); // Default or allow selection
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!username || !email || !password || !firstName || !lastName) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      // Use axiosInstance and relative path (or full path if baseURL isn't set reliably)
      // Headers are now handled by the interceptor
      const response = await axiosInstance.post(
        '/auth/register/', 
        { username, email, password, first_name: firstName, last_name: lastName, role: 'ADMIN' } // Role is now set to 'ADMIN' (uppercase)
      );
      toast.success('User registered successfully!');
      // Optionally navigate somewhere or clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Signup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Enter your password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="Enter your last name"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register User'}
        </button>
      </form>
    </div>
  );
}
