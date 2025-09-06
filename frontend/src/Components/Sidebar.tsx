import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaThLarge, 
    FaUserMd, 
    FaCalendarAlt, 
    FaFilePrescription, 
    FaHistory, 
    FaBell, 
    FaCog, 
    FaSignOutAlt,
    FaStethoscope
} from "react-icons/fa";

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    path: string;
}

const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: <FaThLarge />, path: "/patient-dashboard" },
    { name: "Doctors", icon: <FaUserMd />, path: "/doctors-list" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/appointments" },
    { name: "Prescriptions", icon: <FaFilePrescription />, path: "/prescription" },
    { name: "Consultation History", icon: <FaHistory />, path: "/consultation-history" },
    { name: "Notifications", icon: <FaBell />, path: "/notifications" },
];

const bottomMenuItems: MenuItem[] = [
    { name: "Settings", icon: <FaCog />, path: "/settings" },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        // Show confirmation dialog
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (!confirmLogout) return;

        try {
            // Try to call the logout endpoint to clear server-side session
            await axios.get('http://localhost:3000/api/auth/logout', { withCredentials: true });
            console.log("Successfully logged out from server");
        } catch (error: any) {
            // Handle different error types appropriately
            if (error.response?.status === 401) {
                console.log("Not authenticated on server, proceeding with local logout. This is normal.");
            } else if (error.response?.status === 404) {
                console.log("Logout endpoint not found, proceeding with local logout anyway.");
            } else {
                console.error("Unexpected logout error:", error);
            }
        }
        
        // Always clear any local storage and redirect to landing page
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cookies client-side as backup
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Navigate to landing page
        navigate('/');
        
        // Show success message after navigation
        setTimeout(() => {
            alert("Logged out successfully!");
        }, 100);
    };

    return (
        <aside className="w-80 fixed left-0 top-0 h-screen flex-col py-6 bg-gradient-to-b from-white via-emerald-50 to-green-50  shadow-xl z-50 hidden lg:flex">
        {/* User Profile Section */}
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10 px-6 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaStethoscope className="text-white text-xl" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold gradient-text-primary font-secondary">
              TeleMedicine
            </span>
          </div>

            {/* Main Navigation */}
            <nav className="flex-grow px-6">
                <ul className="space-y-3">
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-4 rounded-xl border-transparenttransition-all duration-300 group relative  ${
                                    isActive(item.path)
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md'
                                }`}
                            >
                                <span className={`mr-4 text-xl transition-all duration-300 ${isActive(item.path) ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold text-sm">{item.name}</span>
                             
                            </NavLink>
                        </div>
                    ))}
                </ul>
            </nav>

            {/* Section Divider */}
            <div className="my-6">
                <div className="h-px bg-gradient-to-r from-emerald-200 via-emerald-200 to-emerald-200"></div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-emerald-50 px-6  ">
                <ul className="space-y-3">
                    {bottomMenuItems.map((item) => (
                         <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-3 rounded-xl transition-all duration-300 group ${
                                    isActive(item.path)
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-emerald-200 hover:text-emerald-800'
                                }`}
                            >
                                <span className={`mr-4 text-xl ${isActive(item.path) ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-800'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold text-sm">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 rounded-xl text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 group border border-red-200 hover:border-red-300 cursor-pointer"
                        >
                            <span className="mr-4 text-xl text-red-600 group-hover:text-red-700">
                                <FaSignOutAlt />
                            </span>
                            <span className="font-semibold text-sm">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;
