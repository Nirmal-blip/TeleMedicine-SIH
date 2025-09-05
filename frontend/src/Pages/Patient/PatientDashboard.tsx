import React from "react";
import { useNavigate } from "react-router-dom";
import { FiVideo, FiMapPin, FiCalendar, FiFileText, FiActivity, FiTrendingUp, FiUsers, FiStar, FiHeart, FiShield, FiClock } from "react-icons/fi";
import { RiStethoscopeLine, RiCapsuleLine, RiHospitalLine } from "react-icons/ri";
import Chatbot from "../../Components/Chatbot";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";

interface Specialty {
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const specialties: Specialty[] = [
    { 
      title: "Video Consultation", 
      desc: "Connect with certified doctors through secure video calls", 
      icon: <RiStethoscopeLine className="w-8 h-8" />, 
      route: "/video-consultation",
      color: "from-blue-400 to-blue-600"
    },
    { 
      title: "Medicine Recommendation", 
      desc: "Get personalized medicine suggestions from our AI assistant", 
      icon: <RiCapsuleLine className="w-8 h-8" />, 
      route: "/medicine-recommendation",
      color: "from-green-400 to-emerald-600"
    },
    { 
      title: "Nearby Hospitals", 
      desc: "Find trusted healthcare facilities and emergency services near you", 
      icon: <RiHospitalLine className="w-8 h-8" />, 
      route: "/patient-support",
      color: "from-purple-400 to-purple-600"
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <PatientHeader />

        {/* Welcome Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 rounded-3xl p-8 mt-6 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <FiHeart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Hello John! 👋</h1>
                <p className="text-blue-100">How can we help you stay healthy today?</p>
              </div>
            </div>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
              Welcome to your personal health companion. We're here to make healthcare accessible, friendly, and stress-free.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/doctors-list')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2">
                <RiStethoscopeLine className="w-5 h-5" />
                Find a Doctor
              </button>
              <button 
                onClick={() => navigate('/appointments')}
                className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-blue-50 hover:scale-105 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                My Appointments
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Quick Actions</h2>
              <p className="text-gray-600">Everything you need in one place</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <FiShield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div 
                key={index} 
                onClick={() => navigate(specialty.route)} 
                className="group relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-blue-200 hover:-translate-y-3"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className={`w-18 h-18 bg-gradient-to-r ${specialty.color} rounded-3xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {specialty.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {specialty.desc}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm">Get Started</span>
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Overview & Tips */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Health Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                  <FiCalendar className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Upcoming</h4>
              <p className="text-sm text-gray-600">Appointments this week</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <RiCapsuleLine className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Active</h4>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-purple-600">12</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Total</h4>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <FiHeart className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold text-green-600">85%</span>
                  <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Health Score</h4>
              <p className="text-sm text-gray-600">Looking great!</p>
            </div>
          </div>
          
          {/* Health Tips */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 border border-green-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">💡 Today's Health Tip</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Remember to stay hydrated! Drinking 8 glasses of water daily helps maintain optimal health and supports your immune system.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <Chatbot />
      </main>
    </div>
  );
};

export default PatientDashboard;
