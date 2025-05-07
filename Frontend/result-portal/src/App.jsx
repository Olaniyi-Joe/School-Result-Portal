import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Sessions from './pages/Sessions'
import Home from './pages/Home'
import Terms from './pages/Terms'
import SessionTerms from './pages/SessionTerms'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import EnrollStudents from './pages/EnrollStudents'
import EnterScores from './pages/EnterScores'
import StudentScores from './pages/StudentScores'
import StudentResults from './pages/StudentResults'
import StudentDomains from './pages/StudentDomains'
import SchoolSettings from './pages/SchoolSettings';
import CommentsManagement from './pages/CommentsManagement';
import AdminSignupPage from './pages/AdminSignupPage'; // Import Admin Signup
import PublicSignupPage from './pages/PublicSignupPage'; // Import Public Signup
import TeacherSignupPage from './pages/TeacherSignupPage'; // Import Teacher Signup Page

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken'); // Updated to check for 'accessToken'
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default function App() {
  // Remove isAuthenticated state and useEffect
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   setIsAuthenticated(!!token);
  // }, []);

  // Helper to check token for public routes
  const isAlreadyLoggedIn = () => !!localStorage.getItem('token');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes: Redirect if already logged in */}
          <Route 
            path="/login" 
            element={isAlreadyLoggedIn() ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAlreadyLoggedIn() ? <Navigate to="/" /> : <PublicSignupPage />} 
          /> 
          <Route path="/teacher-signup" element={<TeacherSignupPage />} />
          <Route path="/public-signup" element={<PublicSignupPage />} />
          <Route path="/admin-signup" element={<AdminSignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Topbar />
                  <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/sessions" element={<Sessions />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/sessions/:sessionId/terms" element={<SessionTerms />} />
                      <Route path="/classes" element={<Classes />} />
                      <Route path="/subjects" element={<Subjects />} />
                      <Route path="/enroll-students" element={<EnrollStudents />} />
                      <Route path="/enter-scores" element={<EnterScores />} />
                      <Route path="/student-scores" element={<StudentScores />} />
                      <Route path="/student-results" element={<StudentResults />} />
                      <Route path="/student-domains" element={<StudentDomains />} />
                      <Route path="/school-settings" element={<SchoolSettings />} />
                      <Route path="/comments" element={<CommentsManagement />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  )
}
