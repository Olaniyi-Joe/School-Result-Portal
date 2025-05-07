import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaCalendarAlt } from 'react-icons/fa'; // Example icons

export default function Home() {
  // Placeholder data - replace with actual data fetching later
  const stats = [
    { title: 'Total Students', value: '1250', icon: <FaUserGraduate className="text-blue-500" />, color: 'blue' },
    { title: 'Total Classes', value: '30', icon: <FaChalkboardTeacher className="text-green-500" />, color: 'green' },
    { title: 'Total Subjects', value: '55', icon: <FaBook className="text-yellow-500" />, color: 'yellow' },
    { title: 'Active Session', value: '2024/2025', icon: <FaCalendarAlt className="text-purple-500" />, color: 'purple' },
  ];

  const quickLinks = [
    { to: '/enroll-students', label: 'Enroll Students' },
    { to: '/enter-scores', label: 'Enter Scores' },
    { to: '/student-results', label: 'View Results' },
    { to: '/school-settings', label: 'School Settings' },
    { to: '/sessions', label: 'Manage Sessions' },
    { to: '/classes', label: 'Manage Classes' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Result Portal</h1>
      <p className="text-lg text-gray-700 text-center mb-6">
        Manage your school results efficiently and effectively.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4 bg-white shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">View Results</h2>
          <p className="text-gray-600">Access student results quickly.</p>
        </div>
        <div className="border rounded p-4 bg-white shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Manage Classes</h2>
          <p className="text-gray-600">Organize and manage class details.</p>
        </div>
        <div className="border rounded p-4 bg-white shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Enroll Students</h2>
          <p className="text-gray-600">Add new students to the system.</p>
        </div>
      </div>
    </div>
  );
}

