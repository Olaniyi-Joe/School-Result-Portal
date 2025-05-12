// src/pages/TermsBySession.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../components/Modal'
import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function SessionTerms() {
  const { sessionId } = useParams()
  const [terms, setTerms] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [editName, setEditName] = useState('')
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
 
  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get(`/sessions/${sessionId}/terms/`, { headers }); // Use axiosInstance and relative path
      setTerms(res.data);
    } catch (err) {
      toast.error('Failed to fetch terms')
      console.log('Error fetching terms:', err)
    }
  }
  
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
    fetchTerms()
  }, [sessionId])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      
       {/* Navbar */}
      <Navbar />
        {/* Header Section */}
      <Header />
    
      {/* Main Content */}
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Session Terms</h1>
      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terms.map((term) => (
            <div key={term.id} className="border rounded p-4 bg-white shadow-md">
              <h2 className="text-lg font-semibold">
                <Link to={`/terms/${term.id}/classes`} className="text-blue-600 hover:underline">
                  {term.name}
                </Link>
              </h2>            
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
