import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';

export default function StudentScores() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [terms, setTerms] = useState([])
  
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [studentScores, setStudentScores] = useState([])
  const [loading, setLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Access token is missing. Please log in again.');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };
        const [classRes, termRes] = await Promise.all([
          axiosInstance.get('/classes/', { headers }),
          axiosInstance.get('/terms/', { headers })
        ]);
        setClasses(classRes.data);
        setTerms(termRes.data);
      } catch (error) {
        toast.error('Failed to fetch initial data');
        console.error('Error:', error);
      }
    }
    fetchData()
  }, [])

  // Load subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      async function fetchSubjects() {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            toast.error('Access token is missing. Please log in again.');
            return;
          }

          const headers = {
            Authorization: `Bearer ${token}`
          };
          const res = await axiosInstance.get(`/classes/${selectedClass}/subjects/`, { headers });
          setSubjects(res.data);
        } catch (error) {
          toast.error('Failed to fetch subjects')
          console.error('Error:', error)
        }
      }
      fetchSubjects()
      setSelectedSubject('') // Reset subject when class changes
    } else {
      setSubjects([])
    }
  }, [selectedClass])

  const handleFetchScores = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      toast.error('Please select class, subject and term')
      return
    }
    
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
      const response = await axiosInstance.get('/scores/filter/', {
        headers,
        params: {
          class_id: selectedClass,
          subject_id: selectedSubject,
          term_id: selectedTerm
        }
      })
      
      if (response.data.length === 0) {
        toast.info('No scores found for the selected criteria')
      }
      
      setStudentScores(response.data)
    } catch (error) {
      toast.error('Failed to fetch scores')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          <ToastContainer />
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">View Student Scores</h2>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded shadow-md">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>

            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!selectedClass}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>

            <select 
              value={selectedTerm} 
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>{term.name}</option>
              ))}
            </select>

            <button 
              onClick={handleFetchScores} 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading || !selectedClass || !selectedSubject || !selectedTerm}
            >
              {loading ? 'Loading...' : 'View Scores'}
            </button>
          </div>

          {studentScores.length > 0 ? (
            <div className="overflow-x-auto bg-white p-6 rounded shadow-md">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border text-left text-gray-800">Student Name</th>
                    <th className="py-2 px-4 border text-center text-gray-800">CA Score</th>
                    <th className="py-2 px-4 border text-center text-gray-800">Exam Score</th>
                    <th className="py-2 px-4 border text-center text-gray-800">Total Score</th>
                    <th className="py-2 px-4 border text-center text-gray-800">Grade</th>
                    <th className="py-2 px-4 border text-center text-gray-800">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.map(score => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border text-gray-700">{score.student_name}</td>
                      <td className="py-2 px-4 border text-center text-gray-700">{parseFloat(score.ca_score).toFixed(1)}</td>
                      <td className="py-2 px-4 border text-center text-gray-700">{parseFloat(score.exam_score).toFixed(1)}</td>
                      <td className="py-2 px-4 border text-center font-bold text-gray-800">{parseFloat(score.total).toFixed(1)}</td>
                      <td className="py-2 px-4 border text-center text-gray-700">{score.grade}</td>
                      <td className="py-2 px-4 border text-center text-gray-700">{score.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading scores...' : 'No scores to display. Select filters and click "View Scores"'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
