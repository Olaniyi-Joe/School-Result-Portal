// src/pages/Classes.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal'

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
      const res = await axiosInstance.get('/classes/'); // Use axiosInstance and relative path
      setClasses(res.data);
    } catch (err) {
      toast.error('Failed to fetch classes')
      console.error(err)
    }
  }

  // Fetch terms
  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get('/terms/'); // Use axiosInstance and relative path
      setTerms(res.data);
    } catch (err) {
      toast.error('Failed to fetch terms')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTerms()
    fetchClasses()
  }, [])

  // Create new class
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      // Use axiosInstance and relative path
      await axiosInstance.post('/classes/', {
        name,
        term: termId,
      })
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
      // Use axiosInstance and relative path
      await axiosInstance.put(`/classes/${editingClass.id}/`, {
        name: editingName,
        term: editingTermId,
      })
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
      // Use axiosInstance and relative path
      await axiosInstance.delete(`/classes/${id}/`);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      toast.error('Failed to delete class')
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Manage Classes</h2>

      {/* Add New Class */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          value={name}
          placeholder="Enter class name"
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
          required
        />
        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Class'}
        </button>
      </form>

      {/* Class List */}
      <ul className="space-y-2">
        {classes.map(cls => (
          <li key={cls.id} className="border-b py-2 flex justify-between items-center text-gray-800">
            <div>
              <span className="font-semibold">{cls.name}</span>{' '}
              <span className="text-sm text-gray-500">({cls.term_name || 'Unknown Term'})</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(cls)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cls.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

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
          className="border px-4 py-2 w-full rounded mb-4"
        />
        <select
          value={editingTermId}
          onChange={(e) => setEditingTermId(e.target.value)}
          className="border px-4 py-2 w-full rounded mb-4"
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Save Changes
        </button>
      </Modal>
    </div>
  )
}
