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
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="text-gray-600 mt-1">Here's a quick overview of your school portal.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white p-6 rounded-lg shadow border-l-4 border-${stat.color}-500 flex items-center space-x-4`}>
            <div className={`text-3xl`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg text-center transition duration-150 ease-in-out shadow"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Placeholder for future components like charts or recent activity */}
      {/* 
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Recent activity feed will be shown here...</p>
        </div>
      </div> 
      */}
    </div>
  );
}
  
