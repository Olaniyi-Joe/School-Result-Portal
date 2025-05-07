import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">View Student Scores</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">Select Class</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border px-4 py-2 rounded"
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
          className="border px-4 py-2 rounded"
        >
          <option value="">Select Term</option>
          {terms.map(term => (
            <option key={term.id} value={term.id}>{term.name}</option>
          ))}
        </select>
        
        <button 
          onClick={handleFetchScores} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading || !selectedClass || !selectedSubject || !selectedTerm}
        >
          {loading ? 'Loading...' : 'View Scores'}
        </button>
      </div>
      
      {studentScores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border text-left">Student Name</th>
                <th className="py-2 px-4 border text-center">CA Score</th>
                <th className="py-2 px-4 border text-center">Exam Score</th>
                <th className="py-2 px-4 border text-center">Total Score</th>
                <th className="py-2 px-4 border text-center">Grade</th>
                <th className="py-2 px-4 border text-center">Remark</th>
              </tr>
            </thead>
            <tbody>
              {studentScores.map(score => (
                <tr key={score.id}>
                  <td className="py-2 px-4 border">{score.student_name}</td>
                  <td className="py-2 px-4 border text-center">{parseFloat(score.ca_score).toFixed(1)}</td>
                  <td className="py-2 px-4 border text-center">{parseFloat(score.exam_score).toFixed(1)}</td>
                  <td className="py-2 px-4 border text-center font-bold">{parseFloat(score.total).toFixed(1)}</td>
                  <td className="py-2 px-4 border text-center">{score.grade}</td>
                  <td className="py-2 px-4 border text-center">{score.remark}</td>
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
  )
}
