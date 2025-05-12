// src/pages/Terms.jsx
import { useEffect, useState } from 'react';
// import axios from 'axios'; // Remove default axios
import axiosInstance from '../api/axiosInstance'; // Import the configured instance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal'
import Sidebar from '../components/Sidebar'; // Added missing import for Sidebar

export default function Terms() {
  const [terms, setTerms] = useState([])
  const [sessions, setSessions] = useState([])
  const [name, setName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingSessionId, setEditingSessionId] = useState('')

  const fetchTerms = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      const res = await axiosInstance.get('/terms/', { headers });
      setTerms(res.data);
    } catch (err) {
      toast.error('Failed to fetch terms');
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      const res = await axiosInstance.get('/sessions/', { headers });
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to fetch sessions');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTerms()
    fetchSessions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axiosInstance.post(
        '/terms/',
        { name, session: sessionId }, // Payload
        { headers } // Headers passed as a separate config object
      );

      setName('');
      setSessionId('');
      toast.success('Term added successfully!');
      fetchTerms();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Unauthorized: Please check your token or log in again.');
      } else {
        toast.error('Failed to create term');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (term) => {
    setEditingTerm(term)
    setEditingName(term.name)
    setEditingSessionId(term.session)
    setEditModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      await axiosInstance.patch(`/terms/${editingTerm.id}/`, {
        name: editingName,
        session: editingSessionId,
      })
      toast.success('Term updated successfully!')
      setEditModalOpen(false)
      fetchTerms()
    } catch (err) {
      toast.error('Failed to update term')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      await axiosInstance.delete(`/terms/${id}/`);
      toast.success('Term deleted successfully!');
      fetchTerms();
    } catch (err) {
      toast.error('Failed to delete term')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          <ToastContainer />
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Terms</h2>

          <form onSubmit={handleSubmit} className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-6 rounded shadow-md">
            <input
              type="text"
              value={name}
              placeholder="Enter term name"
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Term'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terms.map((term) => (
              <div key={term.id} className="border rounded p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-gray-800">{term.name}</h2>
                <p className="text-gray-600">Session: {sessions.find((s) => s.id === term.session)?.name || 'Unknown'}</p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => openEditModal(term)}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(term.id)}
                    className="text-red-600 hover:underline focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Term"
          >
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="border px-4 py-2 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={editingSessionId}
              onChange={(e) => setEditingSessionId(e.target.value)}
              className="border px-4 py-2 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Save Changes
            </button>
          </Modal>
        </div>
      </main>
    </div>
  )
}
