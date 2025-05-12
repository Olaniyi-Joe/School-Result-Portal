import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar'; 
import Header from '../components/Header'; 


const TeacherResults = () => {
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [studentInfo, setStudentInfo] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [effectiveDomain, setEffectiveDomain] = useState(null)
  const [psychomotorDomain, setPsychomotorDomain] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [resultSummary, setResultSummary] = useState(null)

  // Ensure all API calls include the Authorization header with the token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.error('Access token is missing. Please log in again.');
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || student.email.toLowerCase().includes(query)
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Use axiosInstance and relative paths
        const [studentsRes, sessionsRes] = await Promise.all([
          axiosInstance.get('/students/', { headers }),
          axiosInstance.get('/sessions/', { headers })
        ]);
        setStudents(studentsRes.data);
        setSessions(sessionsRes.data);
 
        // Fetch school details
        const schoolRes = await axiosInstance.get('/schools/details/', { headers }); // Use axiosInstance
        if (schoolRes.data) {
          setSchoolInfo(schoolRes.data);
        }
      } catch (error) {
        toast.error('Failed to fetch data')
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Fetch terms when session changes
  useEffect(() => {
    async function fetchTerms() {
      if (!selectedSession) {
        setTerms([])
        setSelectedTerm('')
        return
      }

      try {
        // Use axiosInstance and relative path
        const res = await axiosInstance.get(`/sessions/${selectedSession}/terms/`, { headers });
        setTerms(res.data);
        // Reset selected term when session changes
        setSelectedTerm('')
      } catch (error) {
        toast.error('Failed to fetch terms for selected session')
        console.error('Error:', error)
      }
    }

    fetchTerms()
  }, [selectedSession])

  const handleFetchResults = async () => {
    if (!selectedStudent || !selectedTerm) {
      toast.error('Please select a student and term')
      return
    }
    
    setLoading(true)
    // Reset state values before fetching new data
    setStudentInfo(null)
    setClassInfo(null)
    setSessionInfo(null)
    setResults([])
    setEffectiveDomain(null)
    setPsychomotorDomain(null)
    setResultSummary(null)
    
    try {
      // Use axiosInstance and relative paths
      const [studentRes, classRes, effectiveRes, psychomotorRes, summaryRes] = await Promise.all([
        axiosInstance.get(`/students/${selectedStudent}/`, { headers }),
        axiosInstance.get(`/students/${selectedStudent}/class/`, { headers }),
        axiosInstance.get('/effective-domains/', {
          params: {
            student_id: selectedStudent,
            term_id: selectedTerm
          },
          headers
        }),
        axiosInstance.get('/psychomotive-domains/', {
          params: {
            student_id: selectedStudent,
            term_id: selectedTerm
          },
          headers
        }),
        axiosInstance.get('/result-summaries/', {
          params: {
            student: selectedStudent,
            term: selectedTerm
          },
          headers
        })
      ])
      
      setStudentInfo(studentRes.data)
      setClassInfo(classRes.data)
      
      // Set domain data if available
      if (effectiveRes.data.length > 0) {
        setEffectiveDomain(effectiveRes.data[0])
      }
      if (psychomotorRes.data.length > 0) {
        setPsychomotorDomain(psychomotorRes.data[0])
      }
      
      // Set result summary if available
      if (summaryRes.data.length > 0) {
        setResultSummary(summaryRes.data[0])
      }
      
      // Get student scores
      // Use axiosInstance and relative path
      const scoresRes = await axiosInstance.get('/scores/filter/', {
        params: {
          student_id: selectedStudent,
          term_id: selectedTerm
        },
        headers
      })
      setResults(scoresRes.data);
      
      // Get detailed term info including session
      // Use axiosInstance and relative path
      const termRes = await axiosInstance.get(`/terms/${selectedTerm}/`, { headers });
      console.log('Term details:', termRes.data);
      
      // Set session info from the term details
      if (termRes.data.session_name) {
        setSessionInfo({ name: termRes.data.session_name });
      } else if (termRes.data.session) {
        try {
          // Use axiosInstance and relative path
          const sessionRes = await axiosInstance.get(`/sessions/${termRes.data.session}/`, { headers });
          setSessionInfo(sessionRes.data);
        } catch (error) {
          console.error('Error fetching session:', error);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch student results')
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get term details from state
  const selectedTermData = terms.find(t => t.id == selectedTerm) || {}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer className="print:hidden" />
      <Navbar />
      <Header />

      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-8 flex flex-wrap gap-4 bg-white p-6 rounded shadow-md">
          <div className="w-full sm:w-64 space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name or email"
              className="border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Student</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstname} {student.lastname} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Session</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={!selectedSession}
          >
            <option value="">Select Term</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>

          <button
            onClick={handleFetchResults}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading || !selectedStudent || !selectedTerm}
          >
            {loading ? 'Loading...' : 'View Results'}
          </button>
        </div>

        {/* Main Content Area */}
        {studentInfo && results.length > 0 ? (
          <div className="bg-white p-6 rounded shadow-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{schoolInfo?.name || "School Name"}</h1>
              <p className="text-gray-600">Continuous Assessment and Terminal Examination Report</p>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Subject</th>
                    <th className="border border-gray-300 px-4 py-2">CA Score</th>
                    <th className="border border-gray-300 px-4 py-2">Exam Score</th>
                    <th className="border border-gray-300 px-4 py-2">Total</th>
                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                    <th className="border border-gray-300 px-4 py-2">Position</th>
                    <th className="border border-gray-300 px-4 py-2">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{result.subject_name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{result.ca_score}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{result.exam_score}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-bold">{result.total}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{result.grade}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{result.position || '-'}</td>
                      <td className="border border-gray-300 px-4 py-2">{result.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading results...' : 'No results to display. Select a student and term, then click "View Results"'}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherResults;