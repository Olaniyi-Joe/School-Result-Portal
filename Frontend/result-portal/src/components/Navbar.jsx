import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 text-white py-4 px-6 print:hidden fixed top-[64px] left-0 w-full z-10">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold">School Portal</div>
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            <div
                className={`mt-4 md:mt-0 md:flex md:space-x-4 ${isOpen ? 'block' : 'hidden'}`}
            >
                <Link to="/teacher-home" className="block py-2 md:py-0 hover:underline">Home</Link>
                <Link to="/teacher-student-list" className="block py-2 md:py-0 hover:underline">Student List</Link>
                <Link to="/teacher-results" className="block py-2 md:py-0 hover:underline">Results</Link>
            </div>
        </nav>
    );
}