import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: '/', label: 'Dashboard', icon: 'home' },
    { to: '/school-settings', label: 'School Settings', icon: 'school' },
    { to: '/sessions', label: 'Sessions', icon: 'calendar' },
    { to: '/terms', label: 'Terms', icon: 'calendar-alt' },
    { to: '/classes', label: 'Classes', icon: 'graduation-cap' },
    { to: '/subjects', label: 'Subjects', icon: 'book' },
    { to: '/enroll-students', label: 'Enroll Students', icon: 'user-plus' },
    { to: '/enter-scores', label: 'Enter Scores', icon: 'edit' },
    { to: '/student-scores', label: 'View Scores', icon: 'chart-bar' },
    { to: '/student-results', label: 'Student Results', icon: 'file-alt' },
    { to: '/student-domains', label: 'Student Domains', icon: 'star' },
    { to: '/comments', label: 'Comments', icon: 'comments' },
    { to: '/promotion-demotion', label: 'Promote/Demote Students', icon: 'exchange-alt' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden bg-gray-800 text-white p-2 fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-4 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-64`}
      >
        <div className="text-xl font-bold mb-6">Result Portal</div>
        <nav>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center p-2 mb-2 rounded ${
                isActive(link.to) ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => setIsOpen(false)} // Close sidebar on link click (for mobile)
            >
              <i className={`fas fa-${link.icon} mr-3`}></i>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
