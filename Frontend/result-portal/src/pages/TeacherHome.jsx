import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import React from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function TeacherHome() {
  const [sessions, setSessions] = useState([]);

  // Ensure all API calls include the Authorization header with the token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.error('Access token is missing. Please log in again.');
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get('/sessions/', { headers });
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to fetch sessions');
      console.log('Error fetching sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <Navbar />

      <Header />

      {/* Main Content */}
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Available Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="border rounded p-4 bg-white shadow-md">
            <h2 className="text-lg font-semibold">
              <Link to={`/sessions/${session.id}/terms`} className="text-blue-600 hover:underline">
                {session.name}
              </Link>
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}