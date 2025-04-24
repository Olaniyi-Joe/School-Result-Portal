// src/pages/TermsBySession.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../components/Modal'

export default function SessionTerms() {
  const { sessionId } = useParams()
  const [terms, setTerms] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [editName, setEditName] = useState('')

  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get(`/sessions/${sessionId}/terms/`); // Use axiosInstance and relative path
      setTerms(res.data);
    } catch (err) {
      toast.error('Failed to fetch terms')
      console.log('Error fetching terms:', err)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [sessionId])

  const openEditModal = (term) => {
    setSelectedTerm(term)
    setEditName(term.name)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      // Use axiosInstance and relative path
      await axiosInstance.put(`/terms/${selectedTerm.id}/`, { name: editName, session: sessionId });
      toast.success('Term updated!');
      setEditModalOpen(false);
      fetchTerms()
    } catch (err){
      toast.error('Failed to update term')
      console.log('Error updating term:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return;
    try {
      // Use axiosInstance and relative path
      await axiosInstance.delete(`/terms/${id}/`);
      toast.success('Term deleted!');
      fetchTerms();
    } catch (err){
      toast.error('Failed to delete term')
      console.log('Error deleting term:', err)
    }
  }

  return (
    <div>
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Terms in Selected Session</h2>

      <ul className="space-y-2">
        {terms.map((term) => (
          <li
            key={term.id}
            className="flex justify-between items-center border-b py-2 text-gray-800 px-2 hover:bg-gray-100"
          >
            <span>{term.name}</span>
            <div className="space-x-2">
              <button onClick={() => openEditModal(term)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => handleDelete(term.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Term"
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
  )
}
