import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Import axiosInstance
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';

export default function CommentsManagement() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [grade, setGrade] = useState('')
  const [commentType, setCommentType] = useState('teacher')
  const [comment, setComment] = useState('')
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingComment, setEditingComment] = useState(null)

  const GRADES = [
    { value: 'A', label: 'A - Excellent (80-100)' },
    { value: 'B', label: 'B - Very Good (70-79)' },
    { value: 'C', label: 'C - Good (65-69)' },
    { value: 'D', label: 'D - Fair (50-64)' },
    { value: 'E', label: 'E - Pass (40-49)' },
    { value: 'F', label: 'F - Poor (0-39)' }
  ]

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
            if (!token) {
              toast.error('Access token is missing. Please log in again.');
              return;
            }
      
            const headers = {
              Authorization: `Bearer ${token}`
            };
      const res = await axiosInstance.get('/comments-templates/',
        { headers }
      );
      setComments(res.data);
    } catch (err) {
      toast.error('Failed to fetch comments')
      console.error('Error fetching comments:', err)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
            if (!token) {
              toast.error('Access token is missing. Please log in again.');
              return;
            }
      
            const headers = {
              Authorization: `Bearer ${token}`
            };
      await axiosInstance.post('/comments-templates/', {
        grade,
        comment_type: commentType,
        comment
      }, { headers })
      toast.success('Comment template added successfully!')
      setGrade('')
      setComment('')
      fetchComments()
    } catch (err) {
      toast.error('Failed to add comment template')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (comment) => {
    setEditingComment(comment)
    setGrade(comment.grade)
    setCommentType(comment.comment_type)
    setComment(comment.comment)
    setEditModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
            if (!token) {
              toast.error('Access token is missing. Please log in again.');
              return;
            }
      
            const headers = {
              Authorization: `Bearer ${token}`
            };
      await axiosInstance.put(`/comments-templates/${editingComment.id}/`, {
        grade,
        comment_type: commentType,
        comment
      }, { headers })
      toast.success('Comment template updated successfully!')
      setEditModalOpen(false)
      fetchComments()
    } catch (err) {
      toast.error('Failed to update comment template')
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment template?')) return;
    try {
      const token = localStorage.getItem('accessToken');
            if (!token) {
              toast.error('Access token is missing. Please log in again.');
              return;
            }
      
            const headers = {
              Authorization: `Bearer ${token}`
            };
      await axiosInstance.delete(`/comments-templates/${id}/`, { headers });
      toast.success('Comment template deleted successfully!');
      fetchComments();
    } catch (err) {
      toast.error('Failed to delete comment template')
      console.error('Error:', err)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar className="hidden md:block fixed top-0 left-0 h-full w-64" />
      <main className="flex-1 p-4 md:ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Manage Comment Templates</h2>

          {/* Add new comment form */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="border px-4 py-2 rounded w-full"
                  required
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Comment Type</label>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value)}
                  className="border px-4 py-2 rounded w-full"
                  required
                >
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border px-4 py-2 rounded w-full h-24"
                required
                placeholder="Enter comment template..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Comment Template'}
            </button>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border rounded p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
                    <span>Grade: {comment.grade_display}</span>
                    <span>Type: {comment.comment_type_display}</span>
                  </div>
                  <p className="text-gray-800">{comment.comment}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => openEditModal(comment)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Comment Template"
          >
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="border px-4 py-2 rounded w-full"
                    required
                  >
                    {GRADES.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Comment Type</label>
                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value)}
                    className="border px-4 py-2 rounded w-full"
                    required
                  >
                    <option value="teacher">Teacher</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border px-4 py-2 rounded w-full h-24"
                  required
                />
              </div>
              <button
                onClick={handleUpdate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  )
}
