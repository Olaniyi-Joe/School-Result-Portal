import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [name, setName] = useState('')
  const [classId, setClassId] = useState('')
  const [loading, setLoading] = useState(false)

  const [bulkSubjects, setBulkSubjects] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingClassId, setEditingClassId] = useState('')

  // Ensure all API calls include the Authorization header with the token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.error('Access token is missing. Please log in again.');
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSubjects = async () => {
    try {
      const res = await axiosInstance.get('/subjects/', { headers }); // Use axiosInstance and relative path
      setSubjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch subjects')
      console.error(err)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get('/classes/', { headers }); // Use axiosInstance and relative path
      setClasses(res.data);
    } catch (err) {
      toast.error('Failed to fetch classes')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSubjects()
    fetchClasses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      // Use axiosInstance and relative path
      await axiosInstance.post('/subjects/', {
        name,
        class_group: classId,
      }, { headers })
      setName('')
      setClassId('')
      toast.success('Subject added successfully!')
      fetchSubjects()
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error)
      } else {
        toast.error('Failed to create subject')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkCreate = async (e) => {
    e.preventDefault()
    if (!classId) {
      toast.error('Please select a class for bulk creation')
      return
    }
    const names = bulkSubjects
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (names.length === 0) {
      toast.error('Please enter at least one subject name')
      return
    }
 
    setBulkLoading(true);
    try {
      // Use axiosInstance and relative path
      await axiosInstance.post('/bulk-create/subjects/', {
        subjects: names,
        class_group_id: classId,
      }, { headers })
      toast.success('Bulk subjects added!')
      setBulkSubjects('')
      fetchSubjects()
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error)
      } else {
        toast.error('Bulk subject creation failed')
      }
      console.error(err)
    } finally {
      setBulkLoading(false)
    }
  }

  const openEditModal = (subject) => {
    setEditingSubject(subject)
    setEditingName(subject.name)
    setEditingClassId(subject.class_group)
    setEditModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      // Use axiosInstance and relative path
      await axiosInstance.put(`/subjects/${editingSubject.id}/`, {
        name: editingName,
        class_group: editingClassId,
      }, { headers })
      toast.success('Subject updated successfully!')
      setEditModalOpen(false)
      fetchSubjects()
    } catch (err) {
      toast.error('Failed to update subject')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      // Use axiosInstance and relative path
      await axiosInstance.delete(`/subjects/${id}/`, { headers });
      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to delete subject')
      console.error(err)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Manage Subjects</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={name}
          placeholder="Enter subject name"
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
          required
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64"
          required
        >
          <option value="">Select class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Subject'}
        </button>
      </form>

      {/* Bulk subject creation form */}
      <form onSubmit={handleBulkCreate} className="mb-8 flex flex-col gap-2 w-full max-w-2xl">
        <label className="text-lg font-semibold">Bulk Create Subjects (comma-separated)</label>
        <textarea
          value={bulkSubjects}
          onChange={(e) => setBulkSubjects(e.target.value)}
          placeholder="e.g. English, Mathematics, Basic Science"
          className="border border-gray-300 px-4 py-2 rounded h-24 resize-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-40"
          disabled={bulkLoading}
        >
          {bulkLoading ? 'Adding...' : 'Bulk Create'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="border rounded p-4 bg-white shadow-md flex justify-between items-center text-gray-800"
          >
            <div>
              <h2 className="text-lg font-semibold">{subject.name}</h2>
              <p className="text-gray-600">Class: {classes.find((c) => c.id === subject.class_group)?.name || 'Unknown'}</p>
            </div>
            <div className="flex gap-2">                    
              <button
                onClick={() => openEditModal(subject)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(subject.id)}
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
        title="Edit Subject"
      >
        <input
          type="text"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="border px-4 py-2 w-full rounded mb-4"
        />
        <select
          value={editingClassId}
          onChange={(e) => setEditingClassId(e.target.value)}
          className="border px-4 py-2 w-full rounded mb-4"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
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
