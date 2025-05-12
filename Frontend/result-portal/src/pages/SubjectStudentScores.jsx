import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function SubjectStudentScores() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [subjectName, setSubjectName] = useState('');
  const [studentScores, setStudentScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [schoolDetails, setSchoolDetails] = useState({ name: '', logo: '' });

  // Ensure the API response is correctly processed
  useEffect(() => {
    async function fetchSubjectAndStudents() {
      try {
        // Ensure the Authorization header is included
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Access token is missing. Please log in again.');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch subject details to display the subject name
        const subjectResponse = await axiosInstance.get(`/subjects/${subjectId}/`, { headers });
        setSubjectName(subjectResponse.data.name || '');

        // Fetch students and their scores using the new endpoint
        const response = await axiosInstance.get(`/subjects/${subjectId}/scores/`, { headers });

        if (response.data && Array.isArray(response.data)) {
          setStudentScores(response.data);
        } else {
          toast.error('Unexpected API response format.');
        }
      } catch (error) {
        toast.error('Failed to fetch subject or students');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSchoolDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axiosInstance.get('/schools/details/', { headers });
        setSchoolDetails(res.data);
      } catch (err) {
        toast.error('Failed to fetch school details');
        console.log('Error fetching school details:', err);
      }
    };

    setLoading(true);
    fetchSchoolDetails();
    fetchSubjectAndStudents();
  }, [subjectId]);

  const handleScoreChange = (index, field, value) => {
    const updatedScores = [...studentScores];

    let score = parseInt(value, 10);
    if (isNaN(score)) {
      score = 0;
    }

    const maxScore = field === 'ca_score' ? 30 : field === 'exam_score' ? 70 : 100;
    score = Math.max(0, Math.min(maxScore, score));

    updatedScores[index][field] = score;
    setStudentScores(updatedScores);
  };

  const handleSubmitScores = async () => {
    if (studentScores.length === 0) {
      toast.error('No student scores to submit');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure the Authorization header is included
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const formattedScores = studentScores.map((student) => ({
        student_id: student.student_id,
        ca_score: student.ca_score,
        exam_score: student.exam_score
      }));

      await axiosInstance.post(
        `/subjects/${subjectId}/scores/`,
        { scores: formattedScores },
        { headers }
      );
      toast.success('Scores submitted successfully');

      setStudentScores(
        studentScores.map((score) => ({
          ...score,
          has_existing_score: true
        }))
      );
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(typeof err === 'string' ? err : JSON.stringify(err));
        });
      } else {
        toast.error('Failed to submit scores');
      }
      console.error('Error submitting scores:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Navbar */}
      <Navbar />
      {/* Header Section */}
      <Header />
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
        Back
      </button>
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        Enter Scores for {subjectName}
      </h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading students...</div>
      ) : studentScores.length > 0 ? (
        <div>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">Student</th>
                  <th className="py-2 px-4 border text-center">CA Score</th>
                  <th className="py-2 px-4 border text-center">Exam Score</th>
                  <th className="py-2 px-4 border text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {studentScores.map((student, index) => (
                  <tr
                    key={student.student_id}
                    className={student.has_existing_score ? 'bg-blue-50' : ''}
                  >
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
                      {(Number(student.ca_score || 0) + Number(student.exam_score || 0)).toFixed(1)}
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
          No students to display.
        </div>
      )}
    </div>
  );
}