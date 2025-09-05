import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiFileText, FiClock, FiBell, FiSettings } from "react-icons/fi";

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    path: string;
}

const Sidebar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');

    const menuItems: MenuItem[] = [
        { name: "Dashboard", icon: <FiHome />, path: "/patient-dashboard" },
        { name: "Doctors", icon: <FiUser />, path: "/doctors-list" },
        { name: "Appointments", icon: <FiCalendar />, path: "/appointments" },
        { name: "Prescriptions", icon: <FiFileText />, path: "/prescription" },
        { name: "Consultation History", icon: <FiClock />, path: "/consultation-history" }
    ];

    return (
        <aside className="relative z-10 w-64 bg-gradient-to-b from-emerald-50 to-emerald-100 border-r border-emerald-200 p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-8 text-emerald-800 montserrat">
                TeleMedicine
            </h1>
            <nav>
                <ul className="space-y-3">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={`flex items-center p-3 rounded-xl transition-all duration-300 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-amber-100 hover:text-emerald-800 hover:shadow-md
                                    ${activeTab === item.name ? "bg-gradient-to-r from-emerald-100 to-cyan-50 text-emerald-800 shadow-md border-l-4 border-emerald-500" : ""}`}
                                onClick={() => setActiveTab(item.name)}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span> 
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
