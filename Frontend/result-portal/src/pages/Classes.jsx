// src/pages/Classes.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal'
import Sidebar from '../components/Sidebar';

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [terms, setTerms] = useState([])

  const [name, setName] = useState('')
  const [termId, setTermId] = useState('')
  const [loading, setLoading] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingTermId, setEditingTermId] = useState('')

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      const res = await axiosInstance.get('/classes/', { headers });
      setClasses(res.data);
    } catch (err) {
      toast.error('Failed to fetch classes');
      console.error(err);
    }
  };

  // Fetch terms
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

  useEffect(() => {
    fetchTerms()
    fetchClasses()
  }, [])

  // Create new class
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      await axiosInstance.post('/classes/', {
        name,
        term: termId,
      }, { headers})
      setName('')
      setTermId('')
      toast.success('Class added successfully')
      fetchClasses()
    } catch (err) {
      toast.error('Failed to add class')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (cls) => {
    setEditingClass(cls)
    setEditingName(cls.name)
    setEditingTermId(cls.term) // assuming cls.term is the term ID
    setEditModalOpen(true)
  }

  // Update class
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
      await axiosInstance.put(`/classes/${editingClass.id}/`, {
        name: editingName,
        term: editingTermId,
      }, { headers })
      toast.success('Class updated successfully')
      setEditModalOpen(false)
      fetchClasses()
    } catch (err) {
      toast.error('Failed to update class')
      console.error(err)
    }
  }

  // Delete class
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      await axiosInstance.delete(`/classes/${id}/`, { headers });
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      toast.error('Failed to delete class')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          <ToastContainer />
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Classes</h2>

          {/* Add New Class */}
          <form onSubmit={handleSubmit} className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-6 rounded shadow-md">
            <input
              type="text"
              value={name}
              placeholder="Enter class name"
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.session_name || 'No session'})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Class'}
            </button>
          </form>

          {/* Class List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <div key={cls.id} className="border rounded p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div>
                  <span className="font-semibold text-lg text-gray-800">{cls.name}</span>{' '}
                  <span className="text-sm text-gray-500">({cls.term_name || 'Unknown Term'})</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="text-red-600 hover:underline focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Class"
          >
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="border px-4 py-2 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={editingTermId}
              onChange={(e) => setEditingTermId(e.target.value)}
              className="border px-4 py-2 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.session_name || 'No session'})
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
