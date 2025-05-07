// src/pages/Terms.jsx
import { useEffect, useState } from 'react';
// import axios from 'axios'; // Remove default axios
import axiosInstance from '../api/axiosInstance'; // Import the configured instance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal'

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
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Manage Terms</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={name}
          placeholder="Enter term name"
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
          required
        />
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Term'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {terms.map((term) => (
          <div key={term.id} className="border rounded p-4 bg-white shadow-md">
            <h2 className="text-lg font-semibold">{term.name}</h2>
            <p className="text-gray-600">Session: {sessions.find((s) => s.id === term.session)?.name || 'Unknown'}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => openEditModal(term)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(term.id)}
                className="text-red-600 hover:underline"
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
          className="border px-4 py-2 w-full rounded mb-4"
        />
        <select
          value={editingSessionId}
          onChange={(e) => setEditingSessionId(e.target.value)}
          className="border px-4 py-2 w-full rounded mb-4"
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Save Changes
        </button>
      </Modal>
    </div>
  )
}
