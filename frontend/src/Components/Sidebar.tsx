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
        <aside className="w-72 h-screen flex flex-col p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-12">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                    <FaStethoscope className="text-white text-2xl" />
                </div>
                <span className="text-3xl font-bold font-secondary">
                    TeleMedicine
                </span>
            </div>

            {/* Main Navigation */}
            <nav className="flex-grow">
                <ul className="space-y-3">
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-all duration-300 group ${
                                    isActive(item.path)
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className={`mr-4 text-xl ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold">{item.name}</span>
                                <div className={`absolute right-0 w-1 h-full rounded-l-lg transition-all duration-300 ${
                                    isActive(item.path) ? 'bg-emerald-400' : 'bg-transparent'
                                }`}></div>
                            </NavLink>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Bottom Navigation */}
            <div>
                <ul className="space-y-3 pt-6 border-t border-gray-700">
                    {bottomMenuItems.map((item) => (
                         <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-all duration-300 group ${
                                    isActive(item.path)
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className={`mr-4 text-xl ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <button className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group">
                            <span className="mr-4 text-xl text-red-400 group-hover:text-red-300">
                                <FaSignOutAlt />
                            </span>
                            <span className="font-semibold">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;
