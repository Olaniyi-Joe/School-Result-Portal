import { useState, useEffect } from 'react';
// import axios from 'axios'; // Remove default axios
import axiosInstance from '../api/axiosInstance'; // Import the configured instance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EnterScores() {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [terms, setTerms] = useState([])
  
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [studentScores, setStudentScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Access token is missing. Please log in again.');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        const [classRes, termRes] = await Promise.all([
          axiosInstance.get('/classes/', { headers }),
          axiosInstance.get('/terms/', { headers })
        ]);
        setClasses(classRes.data);
        setTerms(termRes.data);
      } catch (error) {
        toast.error('Failed to fetch reference data');
        console.error('Error fetching reference data:', error);
      }
    }
    fetchData()
  }, [])

  // Load subjects when a class is selected
  useEffect(() => {
    if (selectedClass) {
      async function fetchSubjects() {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            toast.error('Access token is missing. Please log in again.');
            return;
          }
          const headers = { Authorization: `Bearer ${token}` };

          const res = await axiosInstance.get(`/classes/${selectedClass}/subjects/`, { headers });
          setSubjects(res.data);
        } catch (error) {
          toast.error('Failed to fetch subjects for this class')
          console.error('Error fetching subjects:', error)
        }
      }
      fetchSubjects()
      setSelectedSubject('') // Reset subject when class changes
      setDataFetched(false)
    } else {
      setSubjects([])
    }
  }, [selectedClass])

  // Reset data fetched state when filters change
  useEffect(() => {
    setDataFetched(false)
  }, [selectedClass, selectedSubject, selectedTerm])

  // Load students and their scores when class, subject and term are selected
  const handleFetchStudents = async () => {
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
      const headers = { Authorization: `Bearer ${token}` };

      const studentsResponse = await axiosInstance.get(
        `/stu/class/${selectedClass}/subjects/${selectedSubject}/students/`,
        { headers }
      );

      const scoresResponse = await axiosInstance.get('/scores/filter/', {
        headers,
        params: {
          class_id: selectedClass,
          subject_id: selectedSubject,
          term_id: selectedTerm
        }
      })
      
      // Map students to their scores (if any)
      const studentsWithScores = studentsResponse.data.map(student => {
        // Find if this student has an existing score
        const existingScore = scoresResponse.data.find(
          score => score.student === student.id
        )
        
        if (existingScore) {
          // If score exists, use those values
          return {
            student_id: student.id,
            student_name: `${student.firstname} ${student.lastname}`,
            ca_score: existingScore.ca_score,
            exam_score: existingScore.exam_score,
            score_id: existingScore.id,
            has_existing_score: true
          }
        } else {
          // Otherwise initialize with default values
          return {
            student_id: student.id,
            student_name: `${student.firstname} ${student.lastname}`,
            ca_score: 0,
            exam_score: 0,
            has_existing_score: false
          }
        }
      })
      
      setStudentScores(studentsWithScores)
      setDataFetched(true)
      
      // If we found existing scores, show a notification
      const existingScoresCount = studentsWithScores.filter(s => s.has_existing_score).length
      if (existingScoresCount > 0) {
        toast.info(`Found existing scores for ${existingScoresCount} student(s). These can be updated.`)
      }
      
    } catch (error) {
      toast.error('Failed to fetch students and scores')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (index, field, value) => {
    // Create a copy of student scores array
    // Create a copy of student scores array
    const updatedScores = [...studentScores];
    
    // Validate and parse the input value
    let score = parseInt(value, 10);
    
    // Handle NaN case (e.g., empty input) - treat as 0 for calculation, but maybe allow empty input visually?
    // For simplicity here, we'll default NaN to 0.
    if (isNaN(score)) {
        score = 0; 
    }

    // Define maximums based on the field
    const maxScore = field === 'ca_score' ? 30 : field === 'exam_score' ? 70 : 100; // Default 100 if field unknown

    // Ensure score is within the valid range [0, maxScore]
    score = Math.max(0, Math.min(maxScore, score));
    
    // Update the specific field with the validated value
    // Store as number
    updatedScores[index][field] = score; 
    
    // Update state
    setStudentScores(updatedScores)
  }

  const handleSubmitScores = async () => {
    if (studentScores.length === 0) {
      toast.error('No student scores to submit')
      return
    }
    
    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Format scores data according to the backend's expected structure
      const formattedScores = studentScores.map(student => ({
        student_id: student.student_id,
        ca_score: student.ca_score,
        exam_score: student.exam_score,
      }));

      await axiosInstance.post(
        `/scores/input/subject/${selectedSubject}/class/${selectedClass}/term/${selectedTerm}/`,
        { scores: formattedScores },
        { headers }
      );
      toast.success('Scores submitted successfully')
      
      // Mark all scores as existing scores after submission
      setStudentScores(studentScores.map(score => ({
        ...score,
        has_existing_score: true
      })))
      
    } catch (error) {
      if (error.response?.data?.errors) {
        // Show specific validation errors from backend
        error.response.data.errors.forEach(err => {
          toast.error(typeof err === 'string' ? err : JSON.stringify(err))
        })
      } else {
        toast.error('Failed to submit scores')
      }
      console.error('Error submitting scores:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Enter Student Scores</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border px-4 py-2 rounded w-full"
        >
          <option value="">Select Class</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
        
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border px-4 py-2 rounded w-full"
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
          className="border px-4 py-2 rounded w-full"
        >
          <option value="">Select Term</option>
          {terms.map(term => (
            <option key={term.id} value={term.id}>{term.name}</option>
          ))}
        </select>
        
        <button 
          onClick={handleFetchStudents} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
          disabled={loading || !selectedClass || !selectedSubject || !selectedTerm}
        >
          {loading ? 'Loading...' : dataFetched ? 'Refresh Data' : 'Load Students'}
        </button>
      </div>
      
      {studentScores.length > 0 ? (
        <div>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">Student</th>
                  <th className="py-2 px-4 border text-center">CA Score</th>
                  <th className="py-2 px-4 border text-center">Exam Score</th>
                  <th className="py-2 px-4 border text-center">Total</th>
                  <th className="py-2 px-4 border text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentScores.map((student, index) => (
                  <tr key={student.student_id} className={student.has_existing_score ? "bg-blue-50" : ""}>
                    <td className="py-2 px-4 border">{student.student_name}</td>
                    <td className="py-2 px-4 border text-center">
                      <input 
                        type="number" 
                        min="0" 
                        max="30" 
                        value={student.ca_score} 
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className="border rounded px-2 py-1 w-16 text-center"
                      />
                    </td>
                    <td className="py-2 px-4 border text-center">
                      <input 
                        type="number" 
                        min="0" 
                        max="70" 
                        value={student.exam_score} 
                        onChange={(e) => handleScoreChange(index, 'exam_score', e.target.value)}
                        className="border rounded px-2 py-1 w-16 text-center"
                      />
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {/* Ensure values are treated as numbers */}
                      {(Number(student.ca_score || 0) + Number(student.exam_score || 0)).toFixed(1)}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {student.has_existing_score ? 
                        <span className="text-blue-600 text-sm">Existing Score</span> : 
                        <span className="text-gray-500 text-sm">New</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            onClick={handleSubmitScores} 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full md:w-auto"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Save Scores'}
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {loading ? 'Loading students...' : 'No students to display. Select filters and click "Load Students"'}
        </div>
      )}
    </div>
  )
}
