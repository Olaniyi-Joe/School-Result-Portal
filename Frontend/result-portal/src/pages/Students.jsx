import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';

export default function Students() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Access token is missing. Please log in again.');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axiosInstance.get('/classes/', { headers });
        setClasses(res.data);
      } catch (err) {
        toast.error('Failed to fetch classes');
      }
    };
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      // Fetch enrollments for the selected class
      const res = await axiosInstance.get(`/enrollments/?student_class=${selectedClass}`, { headers });
      setStudents(res.data.map(e => e.student));
    } catch (err) {
      toast.error('Failed to fetch students for this class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left text-blue-700">View Students by Class</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <button
              onClick={fetchStudents}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
              disabled={loading || !selectedClass}
            >
              {loading ? 'Fetching...' : "Fetch Students"}
            </button>
          </div>
          <div className="overflow-x-auto">
            {students.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200 rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border text-left">First Name</th>
                    <th className="py-2 px-4 border text-left">Last Name</th>
                    <th className="py-2 px-4 border text-left">Email</th>
                    <th className="py-2 px-4 border text-left">Registration Number</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-blue-50">
                      <td className="py-2 px-4 border">{student.firstname}</td>
                      <td className="py-2 px-4 border">{student.lastname}</td>
                      <td className="py-2 px-4 border">{student.email}</td>
                      <td className="py-2 px-4 border">{student.registration_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {loading ? 'Loading students...' : 'No students to display. Select a class and click "Fetch Students".'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
