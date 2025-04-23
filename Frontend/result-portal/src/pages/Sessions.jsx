// src/pages/Sessions.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import Modal from '../components/Modal'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

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
      const res = await axios.get('http://127.0.0.1:8000/api/sessions/')
      setSessions(Array.isArray(res.data) ? res.data : [])
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
    setLoading(true)
    try {
      await axios.post('http://127.0.0.1:8000/api/sessions/', { name })
      setName('')
      toast.success('Session added!')
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
      await axios.put(`http://127.0.0.1:8000/api/sessions/${selectedSession.id}/`, { name: editName })
      toast.success('Session updated!')
      setEditModalOpen(false)
      fetchSessions()
    } catch (err){
      toast.error('Failed to update session')
      console.log('Error updating session:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return
    try {
      await axios.delete(`http://127.0.0.1:8000/api/sessions/${id}/`)
      toast.success('Session deleted!')
      fetchSessions()
    } catch (err){
      toast.error('Failed to delete session')
      console.log('Error deleting session:', err)
    }
  }

  return (
    <div>
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Manage Sessions</h2>

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

      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex justify-between items-center border-b py-2 text-gray-800 hover:bg-gray-100 px-2 rounded cursor-pointer"
            onClick={() => navigate(`/sessions/${session.id}/terms`)}
          >
            <span>{session.name}</span>
            <div className="space-x-2">
              <button onClick={(e) => { e.stopPropagation(); openEditModal(session) }} className="text-sm text-blue-600">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>

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
  )
}
