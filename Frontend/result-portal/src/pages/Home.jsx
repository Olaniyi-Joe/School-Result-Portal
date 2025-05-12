import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaCalendarAlt } from 'react-icons/fa'; // Example icons
import Sidebar from '../components/Sidebar';

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
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Result Portal</h1>
        <p className="text-lg text-gray-700 text-center mb-6">
          Manage your school results efficiently and effectively.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`border rounded p-4 bg-white shadow-md text-center border-${stat.color}-500`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{stat.title}</h2>
              <p className="text-gray-600">{stat.value}</p>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mt-8 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className="border rounded p-4 bg-blue-100 hover:bg-blue-200 text-center shadow-md"
            >
              <h3 className="text-lg font-semibold text-blue-600">{link.label}</h3>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

