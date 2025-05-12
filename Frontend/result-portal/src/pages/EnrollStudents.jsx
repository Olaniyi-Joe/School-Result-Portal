// src/pages/EnrollStudents.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';

export default function EnrollStudents() {
  const [activeTab, setActiveTab] = useState('individual')
  const [classes, setClasses] = useState([])
  const [terms, setTerms] = useState([])
  const [sessions, setSessions] = useState([])
  const [filterClass, setFilterClass] = useState('')

  // Individual form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [term, setTerm] = useState('')
  const [session, setSession] = useState('')
  const [picture, setPicture] = useState(null)
  const [parentName, setParentName] = useState('')
  const [loading, setLoading] = useState(false)
  const [otherName, setOtherName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [daysPresent, setDaysPresent] = useState('')

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
    picture: null,
    othername: '',
    registration_number: '',
    days_present: '',
    parent_name: ''
  })
  const [picturePreview, setPicturePreview] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Ensure all API calls include the Authorization header with the token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Access token is missing. Please log in again.');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Use axiosInstance and relative paths
        const [classRes, termRes, sessionRes] = await Promise.all([
          axiosInstance.get('/classes/', { headers }),
          axiosInstance.get('/terms/', { headers }),
          axiosInstance.get('/sessions/', { headers })
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
      // Ensure all API calls include the Authorization header with the token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axiosInstance.get('/enrollments/', { headers }); // Use axiosInstance and relative path
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
    formData.append('othername', otherName)
    formData.append('email', email)
    formData.append('student_class', studentClass)
    formData.append('term', term)
    formData.append('session', session)
    formData.append('parent_name', parentName)
    formData.append('registration_number', registrationNumber)
    formData.append('days_present', daysPresent)
    if (picture) formData.append('picture', picture)

    // Debugging log to inspect FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      setLoading(true);
      // Ensure all API calls include the Authorization header with the token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Use axiosInstance and relative path, interceptor handles token, but keep Content-Type for FormData
      await axiosInstance.post('/enrollments/', formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Student enrolled successfully!');
      setFirstName('')
      setLastName('')
      setEmail('')
      setStudentClass('')
      setTerm('')
      setSession('')
      setParentName('')
      setPicture(null)
      setOtherName('')
      setRegistrationNumber('')
      setDaysPresent('')
      fetchEnrolledStudents()
    } catch (err) {
      // Check if registration_number already exists
      if (err.response?.data?.registration_number) {
        toast.error(err.response.data.registration_number[0]);
        return;
      }
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
        formData.append(`students[${index}][othername]`, entry.othername)
        formData.append(`students[${index}][email]`, entry.email)
        formData.append(`students[${index}][student_class]`, entry.student_class)
        formData.append(`students[${index}][term]`, entry.term)
        formData.append(`students[${index}][session]`, entry.session)
        formData.append(`students[${index}][registration_number]`, entry.registration_number)
        formData.append(`students[${index}][days_present]`, entry.days_present)
        formData.append(`students[${index}][parent_name]`, entry.parent_name)
        if (entry.picture) {
          formData.append(`students[${index}][picture]`, entry.picture)
        }
      });

      // Ensure all API calls include the Authorization header with the token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Use axiosInstance and relative path, keep Content-Type for FormData
      await axiosInstance.post('/bulk/enrollments/', formData, {
        headers: {
          ...headers,
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
      othername: student.student.othername,
      email: student.student.email,
      student_class: student.student_class,
      term: student.term,
      session: student.session,
      picture: null,
      registration_number: student.student.registration_number,
      days_present: student.student.days_present,
      parent_name: student.student.parent_name
    })
    setPicturePreview(student.student.picture)
    setEditModalOpen(true)
  }

  // Update handleUpdate to include picture removal
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        Object.keys(editFormData).forEach(key => {
            if (key === 'picture' && editFormData[key]) {
                formData.append(key, editFormData[key]);
            } else if (key === 'remove_picture' && editFormData[key]) {
                formData.append(key, editFormData[key]);
            } else if (key !== 'picture' && key !== 'remove_picture') {
                formData.append(key, editFormData[key]);
            }
        });

        // Debugging log to inspect FormData
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        // Ensure all API calls include the Authorization header with the token
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Access token is missing. Please log in again.');
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Use axiosInstance and relative path, keep Content-Type for FormData
        const response = await axiosInstance.put(`/enrollments/${editingStudent.id}/`, formData, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });

        if (response.status === 200) {
            toast.success('Student updated successfully!');
            setEditModalOpen(false);
            fetchEnrolledStudents();
        } else {
            toast.error('Failed to update student. Please try again.');
        }
    } catch (err) {
        // Check if registration_number already exists
        if (err.response?.data?.registration_number) {
            toast.error(err.response.data.registration_number[0]);
            return;
        }
        toast.error('Failed to update student');
        console.error('Server response:', err.response?.data);
        console.error('Error updating student:', err);
    }
};

  // Handle delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    try {
      // Ensure all API calls include the Authorization header with the token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Use axiosInstance and relative path
      await axiosInstance.delete(`/enrollments/${id}/`, { headers });
      toast.success('Enrollment deleted successfully!');
      fetchEnrolledStudents();
    } catch (err) {
      toast.error('Failed to delete enrollment')
      console.error('Error deleting enrollment:', err)
    }
  }

  const handleBulkFileSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please upload a file before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('class_id', studentClass);
    formData.append('term_id', term);
    formData.append('session_id', session);

    // Debugging log to inspect FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      await axiosInstance.post('/bulk/enrollments/file/', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Bulk enrollment via file was successful!');
      setFile(null);
      setStudentClass('');
      setTerm('');
      setSession('');
    } catch (err) {
      toast.error('Failed to process bulk enrollment via file.');
      console.error('Error during bulk file enrollment:', err);
    }
  };

  // Add a cleanup function for the preview URL
  useEffect(() => {
    return () => {
      if (picturePreview && picturePreview !== editingStudent?.student?.picture) {
        URL.revokeObjectURL(picturePreview)
      }
    }
  }, [picturePreview, editingStudent])

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Enroll Students</h2>

          <div className="mb-4 flex flex-wrap gap-4">
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
            <button
              onClick={() => setActiveTab('bulkFile')}
              className={`px-4 py-2 rounded ${activeTab === 'bulkFile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Bulk Enrollment (File)
            </button>
          </div>

          {activeTab === 'individual' && (
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border px-4 py-2 rounded w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border px-4 py-2 rounded w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Other Name</label>
                  <input type="text" placeholder="Other Name" value={otherName} onChange={(e) => setOtherName(e.target.value)} className="border px-4 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-4 py-2 rounded w-full"  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Number</label>
                  <input type="text" placeholder="Reg. Number" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="border px-4 py-2 rounded w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent's Name</label>
                  <input type="text" placeholder="Parent Name" value={parentName} onChange={(e) => setParentName(e.target.value)} className="border px-4 py-2 rounded w-full" required />
                </div>            
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                    <option value="">Select Class</option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Term</label>
                  <select value={term} onChange={(e) => setTerm(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                    <option value="">Select Term</option>
                    {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Session</label>
                  <select value={session} onChange={(e) => setSession(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                    <option value="">Select Session</option>
                    {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Days Present</label>
                  <input type="number" placeholder="Days" value={daysPresent} onChange={(e) => setDaysPresent(e.target.value)} className="border px-4 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Picture</label>
                  <input type="file" onChange={handlePictureChange} className="border px-4 py-2 rounded w-full hover:bg-green-400" />
                </div>            
              </div>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full md:w-auto">
                {loading ? 'Submitting...' : 'Enroll Student'}
              </button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <div>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                {bulkEntries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        value={entry.firstname}
                        onChange={(e) => handleBulkChange(index, 'firstname', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        value={entry.lastname}
                        onChange={(e) => handleBulkChange(index, 'lastname', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Other Name</label>
                      <input
                        type="text"
                        value={entry.othername}
                        onChange={(e) => handleBulkChange(index, 'othername', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={entry.email}
                        onChange={(e) => handleBulkChange(index, 'email', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                      />
                    </div>                
                    <div>
                      <label className="block text-sm font-medium mb-1">Registration Number</label>
                      <input
                        type="text"
                        value={entry.registration_number}
                        onChange={(e) => handleBulkChange(index, 'registration_number', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Parent Name</label>
                      <input
                        type="text"
                        value={entry.parent_name}
                        onChange={(e) => handleBulkChange(index, 'parent_name', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                      />
                    </div>                
                    <div>
                      <label className="block text-sm font-medium mb-1">Class</label>
                      <select
                        value={entry.student_class}
                        onChange={(e) => handleBulkChange(index, 'student_class', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Term</label>
                      <select
                        value={entry.term}
                        onChange={(e) => handleBulkChange(index, 'term', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      >
                        <option value="">Select Term</option>
                        {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session</label>
                      <select
                        value={entry.session}
                        onChange={(e) => handleBulkChange(index, 'session', e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                        required
                      >
                        <option value="">Select Session</option>
                        {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBulkChange(index, 'picture', e.target.files[0])}
                        className="border px-4 py-2 rounded w-full hover:bg-green-400"
                      />
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => removeBulkEntry(index)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBulkEntry}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Another Entry
                </button>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
                >
                  Submit Bulk Enrollment
                </button>
              </form>
            </div>
          )}

          {activeTab === 'bulkFile' && (
            <div>
              <form onSubmit={handleBulkFileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Class</label>
                    <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                      <option value="">Select Class</option>
                      {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Term</label>
                    <select value={term} onChange={(e) => setTerm(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                      <option value="">Select Term</option>
                      {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Session</label>
                    <select value={session} onChange={(e) => setSession(e.target.value)} className="border px-4 py-2 rounded w-full" required>
                      <option value="">Select Session</option>
                      {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Upload File</label>
                  <input type="file" accept=".csv, .xls, .xlsx" onChange={(e) => setFile(e.target.files[0])} className="border px-4 py-2 rounded w-full hover:bg-green-400" required />
                  <p className="text-sm text-gray-500 mt-2">Sample file structure: Firstname, Lastname, Othername, Email, Picture, Registration number, Parent name</p>
                </div>

                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4">
                  Submit Bulk Enrollment (File)
                </button>
              </form>
            </div>
          )}

          <h2 className="text-2xl font-bold mt-8 mb-4">Enrolled Students</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Filter by Class</label>
            <select
              onChange={(e) => setFilterClass(e.target.value)}
              className="border px-4 py-2 rounded w-full md:w-1/3"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">First Name</th>
                <th className="py-2">Last Name</th>
                <th className="py-2">Reg. Num.</th>
                <th className="py-2">Class</th>
                <th className="py-2">Term</th>
                <th className="py-2">Session</th>
                <th className="py-2">Picture</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>          
              {enrolledStudents
                .filter(student => !filterClass || student.student_class === parseInt(filterClass))
                .map(student => (
                  <tr key={student.id}>
                    <td className="border px-4 py-2">{student.student.firstname}</td>
                    <td className="border px-4 py-2">{student.student.lastname}</td>
                    <td className="border px-4 py-2">{student.student.registration_number}</td>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input type="text" placeholder="First Name" value={editFormData.firstname} onChange={(e) => setEditFormData({ ...editFormData, firstname: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input type="text" placeholder="Last Name" value={editFormData.lastname} onChange={(e) => setEditFormData({ ...editFormData, lastname: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Other Name</label>
                      <input type="text" placeholder="Other Name" value={editFormData.othername} onChange={(e) => setEditFormData({ ...editFormData, othername: e.target.value })} className="border px-4 py-2 rounded w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" placeholder="Email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Class</label>
                      <select value={editFormData.student_class} onChange={(e) => setEditFormData({ ...editFormData, student_class: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                        <option value="">Select Class</option>
                        {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Term</label>
                      <select value={editFormData.term} onChange={(e) => setEditFormData({ ...editFormData, term: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                        <option value="">Select Term</option>
                        {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session</label>
                      <select value={editFormData.session} onChange={(e) => setEditFormData({ ...editFormData, session: e.target.value })} className="border px-4 py-2 rounded w-full" required>
                        <option value="">Select Session</option>
                        {sessions.map(sess => <option key={sess.id} value={sess.id}>{sess.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Picture</label>
                      <input type="file" accept="image/*" onChange={handleEditPictureChange} className="border px-4 py-2 rounded w-full" />
                    </div>
                    {picturePreview && (
                      <div className="flex items-center gap-4">
                        <img src={picturePreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mt-2" />
                        <button type="button" onClick={handleRemovePicture} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Remove Picture</button>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">Registration Number</label>
                      <input type="text" placeholder="Registration Number" value={editFormData.registration_number} onChange={(e) => setEditFormData({ ...editFormData, registration_number: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Days Present</label>
                      <input type="number" placeholder="Days Present" value={editFormData.days_present} onChange={(e) => setEditFormData({ ...editFormData, days_present: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Parent's Name</label>
                      <input type="text" placeholder="Parent's Name" value={editFormData.parent_name} onChange={(e) => setEditFormData({ ...editFormData, parent_name: e.target.value })} className="border px-4 py-2 rounded w-full" required />
                    </div>
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full md:w-auto">Update Student</button>
                  <button type="button" onClick={() => setEditModalOpen(false)} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 ml-2 w-full md:w-auto">Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
