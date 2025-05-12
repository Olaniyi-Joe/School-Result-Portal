import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function ClassSubjects() {
  const { classId, termId } = useParams();
  const [subjects, setSubjects] = useState([]);
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

  const fetchSubjects = async () => {
    try {
      const res = await axiosInstance.get(`/classes/${classId}/subjects/`, { headers });
      setSubjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch subjects');
      console.log('Error fetching subjects:', err);
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
    fetchSubjects();
  }, [classId]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Navbar */}  
     <Navbar />
      {/* Header Section */}
      <Header />
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Subjects in Class</h1>
      <div className="flex flex-col md:flex-row">
        
        <main className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="border rounded p-4 bg-white shadow-md">
                <h2 className="text-lg font-semibold">
                  <Link to={`/subjects/${subject.id}/scores`} className="text-blue-600 hover:underline">
                    {subject.name}
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