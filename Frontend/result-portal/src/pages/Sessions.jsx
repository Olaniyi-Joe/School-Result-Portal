import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import Modal from '../components/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar';

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [editName, setEditName] = useState('')

  const navigate = useNavigate()

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axiosInstance.get('/sessions/', { headers });
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to fetch sessions')
      console.log('Error fetching sessions:', err)
    }
  }
 
  useEffect(() => {
    fetchSessions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      await axiosInstance.post('/sessions/', { name }, { headers });
      setName('');
      toast.success('Session added!');
      fetchSessions()
    } catch (err) {
      toast.error('Failed to create session')
      console.log('Error creating session:', err)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (session) => {
    setSelectedSession(session)
    setEditName(session.name)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      await axiosInstance.put(`/sessions/${selectedSession.id}/`, { name: editName }, { headers });
      toast.success('Session updated!');
      setEditModalOpen(false);
      fetchSessions()
    } catch (err){
      toast.error('Failed to update session')
      console.log('Error updating session:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      await axiosInstance.delete(`/sessions/${id}/`, { headers });
      toast.success('Session deleted!');
      fetchSessions();
    } catch (err){
      toast.error('Failed to delete session')
      console.log('Error deleting session:', err)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <ToastContainer />
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Sessions</h1>

          <form onSubmit={handleSubmit} className="mb-6 flex gap-4">
            <input
              type="text"
              value={name}
              placeholder="Enter session name"
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-64"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Session'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/sessions/${session.id}/terms`}
                className="border rounded p-4 bg-white shadow-md block"
              >
                <h2 className="text-lg font-semibold hover:underline">{session.name}</h2>
                <div className="space-x-2 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(session) }} className="text-sm text-blue-600">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }} className="text-sm text-red-600">Delete</button>
                </div>
              </Link>
            ))}
          </div>

          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Session"
          >
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border px-4 py-2 w-full rounded mb-4"
            />
            <button
              onClick={handleEditSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Save Changes
            </button>
          </Modal>
        </div>
      </main>
    </div>
  )
}
