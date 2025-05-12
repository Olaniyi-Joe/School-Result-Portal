import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromotionDemotion = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    // Fetch students, classes, and sessions
    axiosInstance.get('/students/').then((response) => setStudents(response.data));
    axiosInstance.get('/classes/').then((response) => setClasses(response.data));
    axiosInstance.get('/sessions/').then((response) => setSessions(response.data));
  }, []);

  const handleStudentSelection = (studentId, newClassId, newSessionId) => {
  
    setSelectedStudents((prev) => {
      const existing = prev.find((s) => s.student_id === studentId);
      if (existing) {
        return prev.map((s) =>
          s.student_id === studentId ? { student_id: studentId, new_class_id: newClassId, new_session_id: newSessionId } : s
        );
      }
      return [...prev, { student_id: studentId, new_class_id: newClassId, new_session_id: newSessionId }];
    });
  };

  const handleSubmit = () => {

    // Validate that all students have both newClassId and newSessionId
    const invalidStudents = selectedStudents.filter(student => !student.new_class_id || !student.new_session_id);
    if (invalidStudents.length > 0) {
      toast.error('Please ensure all students have both a new class and session selected.');
      return;
    }

    axiosInstance
      .post('/student/promote-or-demote/', { students: selectedStudents })
      .then((response) => {
        toast.success('Promotion/Demotion successful!');
        setSelectedStudents([]);
      })
      .catch((error) => {
        toast.error('An error occurred: ' + (error.response?.data?.error || error.message));
      });
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Promote or Demote Students</h1>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Student Name</th>
                <th className="border border-gray-300 px-4 py-2">Current Class</th>
                <th className="border border-gray-300 px-4 py-2">New Class</th>
                <th className="border border-gray-300 px-4 py-2">New Session</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{`${student.firstname} ${student.lastname}`}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.current_class?.name || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        const existingSessionId = selectedStudents.find(s => s.student_id === student.id)?.new_session_id || '';
                        handleStudentSelection(student.id, newClassId, existingSessionId);
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
                      onChange={(e) => {
                        const newSessionId = e.target.value;
                        const existingClassId = selectedStudents.find(s => s.student_id === student.id)?.new_class_id || '';
                        handleStudentSelection(student.id, existingClassId, newSessionId);
                      }}
                    >
                      <option value="">Select Session</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </main>
    </div>
  );
};

export default PromotionDemotion;