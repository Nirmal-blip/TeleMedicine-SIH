import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiCalendar, FiFileText, FiClock, FiActivity, FiLogOut } from "react-icons/fi";

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
        <aside className="relative z-10 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl min-h-screen">
            {/* Header */}
            <div className="p-8 border-b border-gray-100/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FiActivity className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        TeleMedicine
                    </h1>
                </div>
                <p className="text-sm text-gray-500 ml-13">Your health, our priority</p>
            </div>

            {/* Navigation */}
            <nav className="p-6">
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden
                                    ${isActive 
                                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-100/50" 
                                        : "text-gray-600 hover:bg-gray-50/80 hover:text-emerald-600"
                                    }
                                `}
                                onClick={() => setActiveTab(item.name)}
                            >
                                {/* Active indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-300 ${
                                    activeTab === item.name ? "opacity-100" : "opacity-0"
                                }`} />
                                
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                                    activeTab === item.name 
                                        ? "bg-emerald-100 text-emerald-600" 
                                        : "bg-gray-100/50 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                                }`}>
                                    <span className="text-lg">{item.icon}</span>
                                </div>
                                
                                <span className="font-medium text-sm tracking-wide">{item.name}</span>
                                
                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                            </NavLink>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100/50">
                <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300 w-full group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100/50 group-hover:bg-red-50 transition-all duration-300">
                        <FiLogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
