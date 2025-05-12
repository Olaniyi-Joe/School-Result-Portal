import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import React from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function TeacherStudentList() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    toast.error('Access token is missing. Please log in again.');
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };

                const classRes = await axiosInstance.get('/classes/', { headers });
                setClasses(classRes.data);
            } catch (error) {
                toast.error('Failed to fetch classes.');
            }
        };

        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            if (!selectedClass) {
                toast.error('Please select a class to fetch students.');
                return;
            }
    
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Access token is missing. Please log in again.');
                return;
            }
    
            const headers = { Authorization: `Bearer ${token}` };
    
            const response = await axiosInstance.get('/students', {
                headers,
                params: {
                    class: selectedClass
                }
            });
    
            setStudents(response.data);
        } catch (error) {
            toast.error('Failed to fetch students.');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <ToastContainer />
            <Navbar />

            <Header />

            {/* Filters */}
            <div className="mb-8 bg-white p-6 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Filter Students</h2>
                <div className="grid grid-cols-1 gap-4">
                    <select
                        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={fetchStudents}
                >
                    Fetch Students
                </button>
            </div>

            {/* Main Content */}
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Student List</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <div key={student.id} className="border rounded p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                        <img src={student.picture} alt={student.name} className="w-20 h-20 rounded-full mb-4 mx-auto" />
                        <h2 className="text-lg font-semibold text-center text-gray-800">
                            <button 
                                className="text-blue-600 hover:underline focus:outline-none" 
                                onClick={() => setSelectedStudent(student)}
                            >
                                {`${student.firstname} ${student.lastname} ${student.othername || ''}`.trim()}
                            </button>
                        </h2>
                        <p className="text-center text-gray-600">Registration Number: {student.registration_number || 'N/A'}</p>
                        <p className="text-center text-gray-600">Class: {student.current_class?.name || 'N/A'}</p>

                        {/* Modal for Student Details */}
                        {selectedStudent && selectedStudent.id === student.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800">Student Details</h2>
                                    <div className="flex justify-center mb-4">
                                        <img 
                                            src={selectedStudent.picture || '/default-student-image.png'} 
                                            alt="Student" 
                                            className="w-32 h-32 rounded-full object-cover border"
                                        />
                                    </div>
                                    <p className="text-gray-700"><strong>Name:</strong> {`${selectedStudent.firstname} ${selectedStudent.lastname} ${selectedStudent.othername || ''}`.trim()}</p>
                                    <p className="text-gray-700"><strong>Registration Number:</strong> {selectedStudent.registration_number || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Class:</strong> {selectedStudent.current_class?.name || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Email:</strong> {selectedStudent.email || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Days Present:</strong> {selectedStudent.days_present || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Parent's Name:</strong> {selectedStudent.parent_name || 'N/A'}</p>
                                    <button 
                                        className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        onClick={() => setSelectedStudent(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}