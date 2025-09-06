import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';

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
    const { logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        try {
            await logout();
            toast.success("Logged out successfully!", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout. Please try again.", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setShowLogoutModal(false);
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
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
                            onClick={handleLogoutClick}
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

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={handleLogoutCancel}   
                onConfirm={handleLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to logout? You will need to sign in again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
            />
        </aside>
    );
}

export default Sidebar;
