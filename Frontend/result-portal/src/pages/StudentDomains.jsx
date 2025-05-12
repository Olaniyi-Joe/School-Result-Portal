import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';

const RATING_OPTIONS = ['A', 'B', 'C', 'D', 'E']
 
const EFFECTIVE_DOMAIN_FIELDS = [
  { key: 'aesthetic', label: 'Aesthetic' },
  { key: 'appreciation', label: 'Appreciation' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'honesty', label: 'Honesty' },
  { key: 'initiative', label: 'Initiative' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'neatness', label: 'Neatness' },
  { key: 'obedience', label: 'Obedience' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'sense_of_duty', label: 'Sense of Duty' },
  { key: 'self_control', label: 'Self Control' },
  { key: 'sociability', label: 'Sociability' }
]

const PSYCHOMOTOR_DOMAIN_FIELDS = [
  { key: 'sport', label: 'Sports' },
  { key: 'handling_tools', label: 'Handling Tools' },
  { key: 'hand_writing', label: 'Hand Writing' },
  { key: 'painting_drawing', label: 'Painting & Drawing' },
  { key: 'musical_skills', label: 'Musical Skills' },
  { key: 'crafts', label: 'Crafts' }
]

export default function StudentDomains() {
  const [students, setStudents] = useState([])
  const [terms, setTerms] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [effectiveDomain, setEffectiveDomain] = useState({})
  const [psychomotorDomain, setPsychomotorDomain] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Use axiosInstance and relative paths
        const [studentsRes, termsRes] = await Promise.all([
          axiosInstance.get('/students/', { headers }),
          axiosInstance.get('/terms/', { headers })
        ]);
        setStudents(studentsRes.data);
        setTerms(termsRes.data)
      } catch (error) {
        toast.error('Failed to fetch data')
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const initializeDefaultValues = (fields) => {
    const defaultData = {}
    fields.forEach(field => {
      defaultData[field.key] = 'C'
    })
    return defaultData
  }

  const fetchExistingData = async () => {
    if (!selectedStudent || !selectedTerm) {
      toast.error('Please select a student and term')
      return
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Access token is missing. Please log in again.');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    setLoading(true);
    try {
      // Use axiosInstance and relative paths
      const [effectiveRes, psychomotorRes] = await Promise.all([
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
        })
      ])
      
      // Set effective domain data
      if (effectiveRes.data.length > 0) {
        setEffectiveDomain(effectiveRes.data[0])
        toast.info('Loaded existing effective domain data')
      } else {
        setEffectiveDomain(initializeDefaultValues(EFFECTIVE_DOMAIN_FIELDS))
      }

      // Set psychomotor domain data
      if (psychomotorRes.data.length > 0) {
        setPsychomotorDomain(psychomotorRes.data[0])
        toast.info('Loaded existing psychomotor domain data')
      } else {
        setPsychomotorDomain(initializeDefaultValues(PSYCHOMOTOR_DOMAIN_FIELDS))
      }
    } catch (error) {
      toast.error('Failed to fetch domain data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (domain, field, value) => {
    if (domain === 'effective') {
      setEffectiveDomain(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      setPsychomotorDomain(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleDelete = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete this ${domain} domain assessment?`)) {
      return
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Access token is missing. Please log in again.');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const id = domain === 'effective' ? effectiveDomain.id : psychomotorDomain.id;
      const endpoint = domain === 'effective' ? 'effective-domains' : 'psychomotive-domains';
      
      // Use axiosInstance and relative path
      await axiosInstance.delete(`/${endpoint}/${id}/`, { headers });
      toast.success(`${domain} domain assessment deleted successfully`);
      
      // Reset the state for the deleted domain
      if (domain === 'effective') {
        setEffectiveDomain(initializeDefaultValues(EFFECTIVE_DOMAIN_FIELDS))
      } else {
        setPsychomotorDomain(initializeDefaultValues(PSYCHOMOTOR_DOMAIN_FIELDS))
      }
    } catch (error) {
      toast.error(`Failed to delete ${domain} domain assessment`)
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !selectedTerm) {
      toast.error('Please select a student and term')
      return
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Access token is missing. Please log in again.');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    setSubmitting(true)
    try {
      // Prepare payloads
      const effectivePayload = {
        ...effectiveDomain,
        student: selectedStudent,
        term: selectedTerm
      }

      const psychomotorPayload = {
        ...psychomotorDomain,
        student: selectedStudent,
        term: selectedTerm
      }

      // Submit both domains in parallel
      // Use axiosInstance and relative paths
      await Promise.all([
        // Submit effective domain
        effectiveDomain.id
          ? axiosInstance.put(`/effective-domains/${effectiveDomain.id}/`, effectivePayload, { headers })
          : axiosInstance.post('/effective-domains/', effectivePayload, { headers }),
        
        // Submit psychomotor domain
        psychomotorDomain.id
          ? axiosInstance.put(`/psychomotive-domains/${psychomotorDomain.id}/`, psychomotorPayload, { headers })
          : axiosInstance.post('/psychomotive-domains/', psychomotorPayload, { headers })
      ]);

      toast.success('Assessments saved successfully');
      // Refresh data to get the updated records
      fetchExistingData()
    } catch (error) {
      toast.error('Failed to save assessments')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const RatingScale = () => (
    <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
      <div className="flex gap-4 justify-center">
        <div>A - Excellent</div>
        <div>B - Very Good</div>
        <div>C - Good</div>
        <div>D - Fair</div>
        <div>E - Poor</div>
      </div>
    </div>
  )

  const DomainSection = ({ title, fields, domain, data, onRatingChange }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {data.id && (
          <button
            onClick={() => handleDelete(domain)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(field => (
          <div key={field.key} className="p-2 border rounded bg-white">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{field.label}</label>
              <div className="flex gap-1">
                {RATING_OPTIONS.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={`${domain}_${field.key}`}
                      value={option}
                      checked={data[field.key] === option}
                      onChange={(e) => onRatingChange(domain, field.key, e.target.value)}
                      className="sr-only"
                    />
                    <span className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer text-xs
                      ${data[field.key] === option 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <ToastContainer />
        <h2 className="text-xl font-bold mb-4">Student Domain Assessments</h2>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstname} {student.lastname}
              </option>
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
            onClick={fetchExistingData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading || !selectedStudent || !selectedTerm}
          >
            {loading ? 'Loading...' : 'Load Assessments'}
          </button>
        </div>

        {(Object.keys(effectiveDomain).length > 0 || Object.keys(psychomotorDomain).length > 0) && (
          <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto">
            <RatingScale />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded">
                <DomainSection
                  title="Effective Domain Assessment"
                  fields={EFFECTIVE_DOMAIN_FIELDS}
                  domain="effective"
                  data={effectiveDomain}
                  onRatingChange={handleRatingChange}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <DomainSection
                  title="Psychomotor Domain Assessment"
                  fields={PSYCHOMOTOR_DOMAIN_FIELDS}
                  domain="psychomotor"
                  data={psychomotorDomain}
                  onRatingChange={handleRatingChange}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save All Assessments'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
