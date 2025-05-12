import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function Header() {
    const [schoolDetails, setSchoolDetails] = useState({ name: '', logo: '' });
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast.error('Access token is missing. Please log in again.');
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const fetchSchoolDetails = async () => {
        try {
            const res = await axiosInstance.get('/schools/details/', { headers });
            setSchoolDetails(res.data);
        } catch (err) {
            toast.error('Failed to fetch school details');
            console.log('Error fetching school details:', err);
        }
    };

    useEffect(() => {
        fetchSchoolDetails();
    }, []);

    return (
        <header className="bg-blue-100 py-6 px-6 text-center md:text-left md:flex md:items-center md:justify-between print:hidden">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">{schoolDetails.name || 'School Name'}</h1>
            {schoolDetails.logo && (
                <img
                    src={schoolDetails.logo}
                    alt="School Logo"
                    className="w-16 h-16 object-contain mx-auto md:mx-0"
                />
            )}
        </header>
    );
}