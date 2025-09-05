import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt, FaCog } from 'react-icons/fa';
import axios from 'axios';

const PatientHeader: React.FC<{ patientName: string, setPatientName: (name: string) => void }> = ({ patientName, setPatientName }) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        // Mocking patient name, replace with actual API call
        setPatientName("John Doe"); 
    }, [setPatientName]);

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:3000/logout', { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            {/* Welcome Message */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {patientName}!</h1>
                <p className="text-gray-500">Have a nice day and take care of your health.</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-6">
                {/* Notifications */}
                <div className="relative">
                    <button className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-300">
                        <FaBell size={20} />
                    </button>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-3"
                    >
                        <FaUserCircle size={40} className="text-gray-400" />
                        <div className="text-left hidden md:block">
                            <div className="font-semibold text-gray-800">{patientName}</div>
                            <div className="text-sm text-gray-500">Patient</div>
                        </div>
                        <FaChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-2xl py-2 z-20 animate-fade-scale">
                            <a href="#profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200">
                                <FaUserCircle className="mr-3" />
                                Profile
                            </a>
                            <a href="#settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200">
                                <FaCog className="mr-3" />
                                Settings
                            </a>
                            <div className="my-2 border-t border-gray-100"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                            >
                                <FaSignOutAlt className="mr-3" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PatientHeader;
