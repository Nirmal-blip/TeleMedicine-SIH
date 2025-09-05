import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-80 fixed left-0 top-0 h-screen flex flex-col p-6 bg-gradient-to-b from-white via-emerald-50 to-green-50 border-r-2 border-emerald-200 shadow-xl z-50 hidden lg:flex">
        
            {/* User Profile Section */}
            <div className="mb-8 p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl border border-emerald-200">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">U</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">Welcome Back!</h3>
                        <p className="text-emerald-600 text-xs">Patient Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-grow">
                <ul className="space-y-3">
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                    isActive(item.path)
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md'
                                }`}
                            >
                                <span className={`mr-4 text-xl transition-all duration-300 ${isActive(item.path) ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold text-sm">{item.name}</span>
                                <div className={`absolute right-0 w-1 h-full rounded-l-lg transition-all duration-300 ${
                                    isActive(item.path) ? 'bg-white' : 'bg-transparent group-hover:bg-emerald-300'
                                }`}></div>
                            </NavLink>
                        </div>
                    ))}
                </ul>
            </nav>

            {/* Section Divider */}
            <div className="my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
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
                        <button className="w-full flex items-center p-3 rounded-xl text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 group border border-red-200 hover:border-red-300">
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
