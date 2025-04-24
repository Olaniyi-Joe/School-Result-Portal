// src/pages/EnrollStudents.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EnrollStudents() {
  const [activeTab, setActiveTab] = useState('individual')
  const [classes, setClasses] = useState([])
  const [terms, setTerms] = useState([])
  const [sessions, setSessions] = useState([])

  // Individual form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [term, setTerm] = useState('')
  const [session, setSession] = useState('')
  const [picture, setPicture] = useState(null)
  const [loading, setLoading] = useState(false)

  // Bulk entries state
  const [bulkEntries, setBulkEntries] = useState([
    { firstname: '', lastname: '', email: '', student_class: '', term: '', session: '', picture: null }
  ])

  // Add states for enrolled students and edit modal
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [editFormData, setEditFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    student_class: '',
    term: '',
    session: '',
    picture: null
  })
  const [picturePreview, setPicturePreview] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Use axiosInstance and relative paths
        const [classRes, termRes, sessionRes] = await Promise.all([
          axiosInstance.get('/classes/'),
          axiosInstance.get('/terms/'),
          axiosInstance.get('/sessions/')
        ]);
        setClasses(classRes.data);
        setTerms(termRes.data)
        setSessions(sessionRes.data)
      } catch (error) {
        toast.error('Failed to fetch reference data')
        console.error('Error fetching reference data:', error)
      }
    }
    fetchData()
  }, [])

  // Fetch enrolled students
  const fetchEnrolledStudents = async () => {
    try {
      const res = await axiosInstance.get('/enrollments/'); // Use axiosInstance and relative path
      setEnrolledStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch enrolled students')
      console.error('Error fetching enrolled students:', err)
    }
  }

  useEffect(() => {
    fetchEnrolledStudents()
  }, [])

  const handleIndividualSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('firstname', firstName)
    formData.append('lastname', lastName)
    formData.append('email', email)
    formData.append('student_class', studentClass)
    formData.append('term', term)
    formData.append('session', session)
    if (picture) formData.append('picture', picture)

    try {
      setLoading(true);
      // Use axiosInstance and relative path, interceptor handles token, but keep Content-Type for FormData
      await axiosInstance.post('/enrollments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Student enrolled successfully!');
      setFirstName('')
      setLastName('')
      setEmail('')
      setStudentClass('')
      setTerm('')
      setSession('')
      setPicture(null)
      fetchEnrolledStudents()
    } catch (err) {
      toast.error('Failed to enroll student')
      console.error('Error enrolling student:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add image validation functions
  const validateImage = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG and PNG files are allowed')
      return false
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 2MB')
      return false
    }

    return true
  }

  // Update picture handling functions
  const handlePictureChange = (e) => {
    const file = e.target.files[0]
    if (file && validateImage(file)) {
      setPicture(file)
    } else {
      e.target.value = null // Reset input
    }
  }

  const handleEditPictureChange = (e) => {
    const file = e.target.files[0]
    if (file && validateImage(file)) {
      setEditFormData(prev => ({
        ...prev,
        picture: file
      }))
      setPicturePreview(URL.createObjectURL(file))
    } else {
      e.target.value = null // Reset input
    }
  }

  const handleRemovePicture = () => {
    setEditFormData(prev => ({
      ...prev,
      picture: null,
      remove_picture: true // Add flag to indicate picture removal
    }))
    setPicturePreview(null)
  }

  // Update handleBulkChange to include picture validation
  const handleBulkChange = (index, field, value) => {
    if (field === 'picture' && value) {
      if (validateImage(value)) {
        const updated = [...bulkEntries]
        updated[index][field] = value
        setBulkEntries(updated)
      }
      return
    }
    const updated = [...bulkEntries]
    updated[index][field] = value
    setBulkEntries(updated)
  }

  const addBulkEntry = () => {
    setBulkEntries([
      ...bulkEntries,
      { firstname: '', lastname: '', email: '', student_class: '', term: '', session: '', picture: null }
    ])
  }

  const removeBulkEntry = (index) => {
    const updated = bulkEntries.filter((_, i) => i !== index)
    setBulkEntries(updated)
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
  
    try {
      const formData = new FormData()
  
      bulkEntries.forEach((entry, index) => {
        formData.append(`students[${index}][firstname]`, entry.firstname)
        formData.append(`students[${index}][lastname]`, entry.lastname)
        formData.append(`students[${index}][email]`, entry.email)
        formData.append(`students[${index}][student_class]`, entry.student_class)
        formData.append(`students[${index}][term]`, entry.term)
        formData.append(`students[${index}][session]`, entry.session)
        if (entry.picture) {
          formData.append(`students[${index}][picture]`, entry.picture)
        }
      });
  
      // Use axiosInstance and relative path, keep Content-Type for FormData
      await axiosInstance.post('/bulk/enrollments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
  
      toast.success('Bulk enrollment successful!')
      setBulkEntries([
        { firstname: '', lastname: '', email: '', student_class: '', term: '', session: '', picture: null }
      ])
      fetchEnrolledStudents()
    } catch (err) {
      toast.error('Bulk enrollment failed')
      console.error('Error during bulk enrollment:', err)
    }
  }

  // Handle edit student click with picture
  const handleEditClick = (student) => {
    setEditingStudent(student)
    setEditFormData({
      firstname: student.student.firstname,
      lastname: student.student.lastname,
      email: student.student.email,
      student_class: student.student_class,
      term: student.term,
      session: student.session,
      picture: null
    })
    setPicturePreview(student.student.picture)
    setEditModalOpen(true)
  }

  // Update handleUpdate to include picture removal
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      Object.keys(editFormData).forEach(key => {
        if (key === 'picture' && editFormData[key]) {
          formData.append(key, editFormData[key])
        } else if (key === 'remove_picture') {
          formData.append(key, editFormData[key])
        } else if (key !== 'picture') {
          formData.append(key, editFormData[key])
        }
      });

      // Use axiosInstance and relative path, keep Content-Type for FormData
      await axiosInstance.put(`/enrollments/${editingStudent.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Student updated successfully!');
      setEditModalOpen(false)
      fetchEnrolledStudents()
    } catch (err) {
      toast.error('Failed to update student')
      console.error('Error updating student:', err)
    }
  }

  // Handle delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    try {
      // Use axiosInstance and relative path
      await axiosInstance.delete(`/enrollments/${id}/`);
      toast.success('Enrollment deleted successfully!');
      fetchEnrolledStudents();
    } catch (err) {
      toast.error('Failed to delete enrollment')
      console.error('Error deleting enrollment:', err)
    }
  }

  // Add a cleanup function for the preview URL
  useEffect(() => {
    return () => {
      if (picturePreview && picturePreview !== editingStudent?.student?.picture) {
        URL.revokeObjectURL(picturePreview)
      }
    }
  }, [picturePreview, editingStudent])

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Enroll Students</h2>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-2 rounded ${activeTab === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Individual Enrollment
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded ${activeTab === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Bulk Enrollment
        </button>
      </div>

      {activeTab === 'individual' && (
        <form onSubmit={handleIndividualSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border px-4 py-2 rounded w-64" required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border px-4 py-2 rounded w-64" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-4 py-2 rounded w-64" required />
            <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="border px-4 py-2 rounded w-64" required>
              <option value="">Select Class</option>
              {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
            </select>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="border px-4 py-2 rounded w-64" required>
              <option value="">Select Term</option>
              {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
            </select>
            <select value={session} onChange={(e) => setSession(e.target.value)} className="border px-4 py-2 rounded w-64" required>
              <option value="">Select Session</option>
              {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
            </select>
            <input type="file" onChange={handlePictureChange} className="w-64" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            {loading ? 'Submitting...' : 'Enroll Student'}
          </button>
        </form>
      )}

      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {bulkEntries.map((entry, index) => (
            <div key={index} className="flex gap-2 flex-wrap border p-4 rounded mb-2 bg-gray-50">
                <input type="text" placeholder="First Name" value={entry.firstname} onChange={(e) => handleBulkChange(index, 'firstname', e.target.value)} className="border px-2 py-1 rounded w-48" required />
                <input type="text" placeholder="Last Name" value={entry.lastname} onChange={(e) => handleBulkChange(index, 'lastname', e.target.value)} className="border px-2 py-1 rounded w-48" required />
                <input type="email" placeholder="Email" value={entry.email} onChange={(e) => handleBulkChange(index, 'email', e.target.value)} className="border px-2 py-1 rounded w-64" required />
                <select value={entry.student_class} onChange={(e) => handleBulkChange(index, 'student_class', e.target.value)} className="border px-2 py-1 rounded w-40" required>
                <option value="">Class</option>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <select value={entry.term} onChange={(e) => handleBulkChange(index, 'term', e.target.value)} className="border px-2 py-1 rounded w-40" required>
                <option value="">Term</option>
                {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
                <select value={entry.session} onChange={(e) => handleBulkChange(index, 'session', e.target.value)} className="border px-2 py-1 rounded w-40" required>
                <option value="">Session</option>
                {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
                </select>
                <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBulkChange(index, 'picture', e.target.files[0])}
                className="border px-2 py-1 rounded w-60"
                />
                <button type="button" onClick={() => removeBulkEntry(index)} className="text-red-600">Remove</button>
            </div>
            ))}

          <div className="flex gap-2">
            <button type="button" onClick={addBulkEntry} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add More
            </button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Bulk Enrollment
            </button>
          </div>
        </form>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Enrolled Students</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">First Name</th>
            <th className="py-2">Last Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Class</th>
            <th className="py-2">Term</th>
            <th className="py-2">Session</th>
            <th className="py-2">Picture</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrolledStudents.map(student => (
            <tr key={student.id}>
              <td className="border px-4 py-2">{student.student.firstname}</td>
              <td className="border px-4 py-2">{student.student.lastname}</td>
              <td className="border px-4 py-2">{student.student.email}</td>
              <td className="border px-4 py-2">{student.class_name}</td>
              <td className="border px-4 py-2">{student.term_name}</td>
              <td className="border px-4 py-2">{student.session_name}</td>
              <td className="border px-4 py-2">
                {student.student.picture && (
                  <img src={student.student.picture} alt="Student" className="w-16 h-16 object-cover rounded-full" />
                )}
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => handleEditClick(student)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(student.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" placeholder="First Name" value={editFormData.firstname} onChange={(e) => setEditFormData({ ...editFormData, firstname: e.target.value })} className="border px-4 py-2 rounded w-full" required />
              <input type="text" placeholder="Last Name" value={editFormData.lastname} onChange={(e) => setEditFormData({ ...editFormData, lastname: e.target.value })} className="border px-4 py-2 rounded w-full" required />
              <input type="email" placeholder="Email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="border px-4 py-2 rounded w-full" required />
              <select value={editFormData.student_class} onChange={(e) => setEditFormData({ ...editFormData, student_class: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                <option value="">Select Class</option>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
              <select value={editFormData.term} onChange={(e) => setEditFormData({ ...editFormData, term: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                <option value="">Select Term</option>
                {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
              </select>
              <select value={editFormData.session} onChange={(e) => setEditFormData({ ...editFormData, session: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                <option value="">Select Session</option>
                {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={handleEditPictureChange} className="border px-4 py-2 rounded w-full" />
              {picturePreview && (
                <div className="flex items-center gap-4">
                  <img src={picturePreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mt-2" />
                  <button type="button" onClick={handleRemovePicture} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Remove Picture</button>
                </div>
              )}
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Update Student</button>
              <button type="button" onClick={() => setEditModalOpen(false)} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 ml-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
