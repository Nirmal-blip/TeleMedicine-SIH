import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const PatientHeader: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [patientName, setPatientName] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        // For now, set a default name until we implement the profile endpoint
        // axios.get('http://localhost:3000/api/patients/profile', { withCredentials: true })
        //     .then(response => {
        //         setPatientName(response.data.fullname || response.data.name);
        //     })
        //     .catch(error => console.error("Error fetching patient data:", error));
        setPatientName("Patient"); // Temporary default
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:3000/logout', { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="flex flex-col items-end bg-[#1f4e3f]/10 p-4 rounded-xl shadow-md border border-green-300/20 backdrop-blur-lg">
            <div className="relative flex items-center gap-4 mt-3 sm:mt-0">
                <div className="relative flex items-center gap-5" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <span className="text-[#064848] text-lg font-semibold">{patientName}</span>
                    <FontAwesomeIcon icon={faEllipsisV} className="text-[#064848] text-xl cursor-pointer" />

                    {isDropdownOpen && (
                        <button
                            className="absolute -right-2 top-6 w-2/3 text-left bg-white text-[#064848] px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PatientHeader;
