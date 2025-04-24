import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentResults = () => {
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
          axiosInstance.get('/students/'),
          axiosInstance.get('/sessions/')
        ]);
        setStudents(studentsRes.data);
        setSessions(sessionsRes.data);

        // Fetch school details
        const schoolRes = await axiosInstance.get('/school/'); // Use axiosInstance
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
        const res = await axiosInstance.get(`/sessions/${selectedSession}/terms/`);
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
        axiosInstance.get(`/students/${selectedStudent}/`),
        axiosInstance.get(`/students/${selectedStudent}/class/`),
        axiosInstance.get('/effective-domains/', {
          params: {
            student_id: selectedStudent,
            term_id: selectedTerm
          }
        }),
        axiosInstance.get('/psychomotive-domains/', {
          params: {
            student_id: selectedStudent,
            term_id: selectedTerm
          }
        }),
        axiosInstance.get('/result-summaries/', {
          params: {
            student: selectedStudent,
            term: selectedTerm
          }
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
        }
      })
      setResults(scoresRes.data);
      
      // Get detailed term info including session
      // Use axiosInstance and relative path
      const termRes = await axiosInstance.get(`/terms/${selectedTerm}/`);
      console.log('Term details:', termRes.data);
      
      // Set session info from the term details
      if (termRes.data.session_name) {
        setSessionInfo({ name: termRes.data.session_name });
      } else if (termRes.data.session) {
        try {
          // Use axiosInstance and relative path
          const sessionRes = await axiosInstance.get(`/sessions/${termRes.data.session}/`);
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
    <div className="min-h-[297mm] w-[210mm] mx-auto bg-white print:p-[15mm] p-4 font-serif text-[12pt] leading-tight relative">
      <ToastContainer className="print:hidden" />
      
      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 print:hidden">
        <div className="w-64 space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name or email"
            className="border px-4 py-2 rounded w-full"
          />
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border px-4 py-2 rounded w-full"
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
          className="border px-4 py-2 rounded w-64"
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
          className="border px-4 py-2 rounded w-64"
          disabled={!selectedSession}
        >
          <option value="">Select Term</option>
          {terms.map(term => (
            <option key={term.id} value={term.id}>{term.name}</option>
          ))}
        </select>
        
        <button 
          onClick={handleFetchResults} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading || !selectedStudent || !selectedTerm}
        >
          {loading ? 'Loading...' : 'View Results'}
        </button>
      </div>

      {/* Main Content Area */}
      {studentInfo && results.length > 0 ? (
        <div className="print:p-0">
          {/* Header */}
          <div className="text-center mb-4 border-b border-black pb-2">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex items-center gap-2">
                {schoolInfo?.logo && (
                  <img 
                    src={schoolInfo.logo} 
                    alt="School Logo" 
                    className="h-16 w-16 object-contain"
                  />
                )}
              </div>
              <div>
                <h1 className="text-[18pt] font-bold uppercase mb-1">
                  {schoolInfo?.name || "DEMO INTERNATIONAL SCHOOL"}
                </h1>
                <p className="text-[12pt] mb-0.5">{schoolInfo?.address || "School Address"}</p>
              
                {schoolInfo?.registration && (
                  <p className="text-[12pt] mb-0.5 font-bold">(RC: {schoolInfo.registration})</p>
                )}
                <p className="text-[12pt] font-bold">CONTINUOUS ASSESSMENT AND TERMINAL EXAMINATION REPORT</p>
                <p className="text-[12pt] font-bold">FOR UNIVERSAL BASIC EDUCATION</p>
              </div>
              <div className="flex items-center gap-2">
                {studentInfo?.picture && (
                  <img 
                    src={studentInfo.picture} 
                    alt="Student Photo" 
                    className="h-16 w-16 object-cover border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex justify-between items-start mb-3 mt-3">
            <div className="w-[48%]">
              <p className="text-[11pt] mb-1">
                <strong>CLASS OR LEVEL:</strong> {classInfo?.name || 'N/A'}
              </p>
              <p className="text-[11pt] mb-1">
                <strong>TERM:</strong> {selectedTermData?.name || 'N/A'}
              </p>
            </div>
            <div className="text-[13pt] font-bold text-center">
              {studentInfo.firstname} {studentInfo.lastname}
            </div>
            <div className="w-[48%] text-right">
              <p className="text-[11pt] mb-1">
                <strong>ACADEMIC SESSION:</strong> {sessionInfo?.name || 'N/A'}
              </p>
              <p className="text-[11pt] mb-1">
                <strong>ADMISSION NUMBER:</strong> {studentInfo.registration_number || 'N/A'}
              </p>
            </div>
          </div>

          {/* Main Results Grid */}
          <div className="flex gap-2">
            {/* Subject Scores Table - Left Side */}
            <div className="w-[65%] border border-black">
              <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-black p-2 text-left w-[32%] text-[10pt]">SUBJECT</th>
                      <th className="border border-black p-2 text-center w-[9%] text-[10pt] whitespace-nowrap">CA<br/>Score</th>
                      <th className="border border-black p-2 text-center w-[9%] text-[10pt] whitespace-nowrap">Exam<br/>Score</th>
                      <th className="border border-black p-2 text-center w-[9%] text-[10pt]">Total<br/>Score</th>
                      <th className="border border-black p-1 text-center w-[7%] text-[10pt] [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 h-20">Grade</th>
                      <th className="border border-black p-1 text-center w-[7%] text-[10pt] [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 h-20">Position</th>
                      <th className="border border-black p-2 text-center w-[16%] text-[10pt]">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td className="border border-black p-2 text-[10pt] pl-3">{result.subject_name}</td>
                        <td className="border border-black p-2 text-center text-[10pt]">{parseFloat(result.ca_score).toFixed(1)}</td>
                        <td className="border border-black p-2 text-center text-[10pt]">{parseFloat(result.exam_score).toFixed(1)}</td>
                        <td className="border border-black p-2 text-center font-bold text-[10pt]">{parseFloat(result.total).toFixed(1)}</td>
                        <td className="border border-black p-2 text-center text-[10pt]">{result.grade}</td>
                        <td className="border border-black p-2 text-center text-[10pt]">{result.position || "-"}</td>
                        <td className="border border-black p-2 text-center text-[10pt]">{result.remark}</td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Domains - Right Side */}
            <div className="w-[33%] space-y-2">
              {/* Affective Domain */}
              <div className="border border-black">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-black p-1.5 text-left text-[10pt] w-[60%]">AFFECTIVE DOMAIN</th>
                      <th className="border-b border-black p-1.5 text-center text-[10pt]" colSpan="5">GRADING</th>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="text-center text-[10pt] w-[8%]">A</td>
                      <td className="text-center text-[10pt] w-[8%]">B</td>
                      <td className="text-center text-[10pt] w-[8%]">C</td>
                      <td className="text-center text-[10pt] w-[8%]">D</td>
                      <td className="text-center text-[10pt] w-[8%]">E</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "aesthetic", label: "Aesthetic" },
                      { key: "appreciation", label: "Appreciation" },
                      { key: "attendance", label: "Attendance" },
                      { key: "honesty", label: "Honesty" },
                      { key: "initiative", label: "Initiative" },
                      { key: "leadership", label: "Leadership" },
                      { key: "neatness", label: "Neatness" },
                      { key: "obedience", label: "Obedience" },
                      { key: "punctuality", label: "Punctuality" },
                      { key: "sense_of_duty", label: "Sense of Duty" },
                      { key: "self_control", label: "Self Control" },
                      { key: "sociability", label: "Sociability" }
                    ].map((trait) => (
                      <tr key={trait.key}>
                        <td className="border-t border-black p-1 text-left text-[10pt]">{trait.label}</td>
                        {["A", "B", "C", "D", "E"].map((grade) => (
                          <td key={grade} className="border-t border-l border-black p-1 text-center text-[10pt] w-[8%]">
                            {effectiveDomain?.[trait.key] === grade ? "•" : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Psychomotor Domain */}
              <div className="border border-black mt-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-black p-1.5 text-left text-[10pt] w-[60%]">PSYCHOMOTOR DOMAIN</th>
                      <th className="border-b border-black p-1.5 text-center text-[10pt]" colSpan="5">GRADING</th>
                    </tr>
                    <tr>
                      <td className="text-[10pt] p-1 text-center italic" colSpan="6">(Manual & Physical Skill)</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="text-center text-[10pt] w-[8%]">A</td>
                      <td className="text-center text-[10pt] w-[8%]">B</td>
                      <td className="text-center text-[10pt] w-[8%]">C</td>
                      <td className="text-center text-[10pt] w-[8%]">D</td>
                      <td className="text-center text-[10pt] w-[8%]">E</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "sport", label: "Sports" },
                      { key: "handling_tools", label: "Handling Tools" },
                      { key: "hand_writing", label: "Hand Writing" },
                      { key: "painting_drawing", label: "Painting & Drawing" },
                      { key: "musical_skills", label: "Musical Skills" },
                      { key: "crafts", label: "Crafts" }
                    ].map((trait) => (
                      <tr key={trait.key}>
                        <td className="border-t border-black p-1 text-left text-[10pt]">{trait.label}</td>
                        {["A", "B", "C", "D", "E"].map((grade) => (
                          <td key={grade} className="border-t border-l border-black p-1 text-center text-[10pt] w-[8%]">
                            {psychomotorDomain?.[trait.key] === grade ? "•" : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Tables */}
          <div className="mt-4 space-y-2">
            {/* Attendance and Performance Tables */}
            <table className="w-full border-collapse border border-black">
              <tr>
                <th className="border border-black p-1.5 text-left text-[10pt] w-1/2">Number of Times Present in School:</th>
                <td className="border border-black p-1.5 text-[10pt]">{studentInfo.days_present || 'N/A'}</td>
                <th className="border border-black p-1.5 text-left text-[10pt] w-1/2">Number of Times School Opened:</th>
                <td className="border border-black p-1.5 text-[10pt]">{studentInfo.school_days || 'N/A'}</td>
              </tr>
              <tr>
                <th className="border border-black p-1.5 text-left text-[10pt]" colSpan="2">Percentage Attendance (%):</th>
                <td className="border border-black p-1.5 text-[10pt]" colSpan="2">
                  {studentInfo.days_present && studentInfo.school_days
                    ? ((studentInfo.days_present / studentInfo.school_days) * 100).toFixed(2)
                    : 'N/A'}
                </td>
              </tr>
            </table>

            {/* Performance Summary Table */}
            <table className="w-full border-collapse border border-black">
              <tr>
                <td className="border border-black p-1.5 text-[10pt]"><strong>Terminal total score:</strong></td>
                <td className="border border-black p-1.5 text-[10pt]">{resultSummary?.total_score || 0}</td>
                <td className="border border-black p-1.5 text-[10pt]"><strong>Out of:</strong></td>
                <td className="border border-black p-1.5 text-[10pt]">{(resultSummary?.number_of_subjects || 0) * 100}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 text-[10pt]"><strong>Average Score:</strong></td>
                <td className="border border-black p-1.5 text-[10pt]" colSpan="3">{resultSummary?.average_score || 0}%</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 text-[10pt]"><strong>Last Term Average:</strong></td>
                <td className="border border-black p-1.5 text-[10pt]">{studentInfo.last_term_average || 'N/A'}</td>
                <td className="border border-black p-1.5 text-[10pt]"><strong>Current Term Average:</strong></td>
                <td className="border border-black p-1.5 text-[10pt]">{resultSummary?.average_score || 0}%</td>
              </tr>
            </table>

            {/* Grade Scale and Signature Section */}
            <div className="flex w-full space-x-4 mt-4">
              {/* Grade Scale Table */}
              <div className="w-2/3">
                <div className="border border-black text-[10pt]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-black p-1.5 text-center bg-gray-50" colSpan="6">GRADE SCALE</th>
                      </tr>
                      <tr>
                        <th className="border border-black p-1">KEY</th>
                        <th className="border border-black p-1">FROM</th>
                        <th className="border border-black p-1">TO</th>
                        <th className="border border-black p-1">GRADE</th>
                        <th className="border border-black p-1">RANGE</th>
                        <th className="border border-black p-1">REMARK</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black pl-2">A1 = Excellent</td>
                        <td className="border border-black text-center">80</td>
                        <td className="border border-black text-center">100</td>
                        <td className="border border-black text-center">A1</td>
                        <td className="border border-black text-center">80–100</td>
                        <td className="border border-black text-center">EXCELLENT</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">B2 = Very Good</td>
                        <td className="border border-black text-center">70</td>
                        <td className="border border-black text-center">79</td>
                        <td className="border border-black text-center">B2</td>
                        <td className="border border-black text-center">70–79</td>
                        <td className="border border-black text-center">VERY GOOD</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">B3 = Good</td>
                        <td className="border border-black text-center">65</td>
                        <td className="border border-black text-center">69</td>
                        <td className="border border-black text-center">B3</td>
                        <td className="border border-black text-center">65–69</td>
                        <td className="border border-black text-center">GOOD</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">C4 = Credit</td>
                        <td className="border border-black text-center">60</td>
                        <td className="border border-black text-center">64</td>
                        <td className="border border-black text-center">C4</td>
                        <td className="border border-black text-center">60–64</td>
                        <td className="border border-black text-center">CREDIT</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">C5 = Credit</td>
                        <td className="border border-black text-center">55</td>
                        <td className="border border-black text-center">59</td>
                        <td className="border border-black text-center">C5</td>
                        <td className="border border-black text-center">55–59</td>
                        <td className="border border-black text-center">CREDIT</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">C6 = Credit</td>
                        <td className="border border-black text-center">50</td>
                        <td className="border border-black text-center">54</td>
                        <td className="border border-black text-center">C6</td>
                        <td className="border border-black text-center">50–54</td>
                        <td className="border border-black text-center">CREDIT</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">D7 = Pass</td>
                        <td className="border border-black text-center">45</td>
                        <td className="border border-black text-center">49</td>
                        <td className="border border-black text-center">D7</td>
                        <td className="border border-black text-center">45–49</td>
                        <td className="border border-black text-center">PASS</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">E8 = Pass</td>
                        <td className="border border-black text-center">40</td>
                        <td className="border border-black text-center">44</td>
                        <td className="border border-black text-center">E8</td>
                        <td className="border border-black text-center">40–44</td>
                        <td className="border border-black text-center">PASS</td>
                      </tr>
                      <tr>
                        <td className="border border-black pl-2">F9 = Fail</td>
                        <td className="border border-black text-center">0</td>
                        <td className="border border-black text-center">39</td>
                        <td className="border border-black text-center">F9</td>
                        <td className="border border-black text-center">0–39</td>
                        <td className="border border-black text-center">FAIL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signature and Stamp Section */}
              <div className="w-1/3 bg-blue-50 p-4 rounded flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                  {schoolInfo?.principal_signature && (
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={schoolInfo.principal_signature}
                        alt="Principal's Signature"
                        className="h-12 object-contain"
                      />
                      <div className="text-[11pt] font-semibold">
                        {schoolInfo?.principal_name ? `${schoolInfo.principal_name}` : "Principal's Signature"}
                      </div>
                    </div>
                  )}
                  
                  {schoolInfo?.school_stamp && (
                    <div className="relative w-32 h-32 mx-auto mt-2">
                      <img 
                        src={schoolInfo.school_stamp} 
                        alt="School Stamp" 
                        className="w-full h-full object-contain opacity-70"
                      />
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10pt] text-gray-700 bg-white bg-opacity-70 px-2 rounded">
                        {new Date().toISOString().split('T')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Print button */}
          {results.length > 0 && (
            <button 
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 print:hidden mt-4"
              onClick={() => window.print()}
            >
              Print Result
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {loading ? 'Loading results...' : 'No results to display. Select a student and term, then click "View Results"'}
        </div>
      )}
    </div>
  )
}

export default StudentResults
