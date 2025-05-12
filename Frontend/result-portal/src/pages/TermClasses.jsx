import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function TermClasses() {
  const { termId } = useParams();
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [schoolDetails, setSchoolDetails] = useState({ name: '', logo: '' });

  // Ensure all API calls include the Authorization header with the token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.error('Access token is missing. Please log in again.');
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get(`/terms/${termId}/classes/`, { headers });
      setClasses(res.data);
    } catch (err) {
      toast.error('Failed to fetch classes');
      console.log('Error fetching classes:', err);
    }
  };

  const fetchSchoolDetails = async () => {
    try {
      const res = await axiosInstance.get('/schools/details/', { headers });
      setSchoolDetails(res.data);
    } catch (err) {
      toast.error('Failed to fetch school details');
      console.log('Error fetching school details:', err);
    }
  };

  useEffect(() => {
    fetchSchoolDetails();
    fetchClasses();
  }, [termId]);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Navbar */}
     <Navbar />
      {/* Header Section */}
      <Header />
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
        Back
      </button>
      {/*Main Content */}
      <div className="flex flex-col md:flex-row">
        
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Classes in Term</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <div key={classItem.id} className="border rounded p-4 bg-white shadow-md">
                <h2 className="text-lg font-semibold">
                  <Link to={`/classes/${classItem.id}/subjects`} className="text-blue-600 hover:underline">
                    {classItem.name}
                  </Link>
                </h2>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}