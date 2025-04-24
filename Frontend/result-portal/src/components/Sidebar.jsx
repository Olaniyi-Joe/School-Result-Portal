import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
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
    { to: '/admin-signup', label: 'Register User', icon: 'user-plus' } // Added Admin Signup Link
  ]
  
  const isActive = (path) => location.pathname === path
  
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 sticky top-0 overflow-y-auto">
      <div className="text-xl font-bold mb-6">Result Portal</div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center p-2 mb-2 rounded ${
              isActive(link.to) ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <i className={`fas fa-${link.icon} mr-3`}></i>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
