import React from "react";
import { useNavigate } from "react-router-dom";
import { FiVideo, FiPackage, FiMapPin, FiCalendar, FiFileText, FiActivity, FiTrendingUp, FiUsers, FiStar } from "react-icons/fi";
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
      desc: "Connect with doctors instantly through secure video calls", 
      icon: <FiVideo className="w-8 h-8" />, 
      route: "/video-consultation",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      title: "Medicine Recommendation", 
      desc: "Get AI-powered medicine suggestions and alternatives", 
      icon: <FiPackage className="w-8 h-8" />, 
      route: "/medicine-recommendation",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Nearby Hospitals", 
      desc: "Find the closest healthcare facilities and emergency services", 
      icon: <FiMapPin className="w-8 h-8" />, 
      route: "/patient-support",
      color: "from-purple-500 to-pink-500"
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <PatientHeader />

        {/* Welcome Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 mt-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Good morning, John!</h1>
                <p className="text-emerald-100">Ready to manage your health today?</p>
              </div>
            </div>
            
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              Your personalized healthcare dashboard is here to help you stay healthy and connected with the best medical professionals.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/prescription')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/20">
                View Prescriptions
              </button>
              <button 
                onClick={() => navigate('/appointments')}
                className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-gray-50 hover:scale-105">
                Book Appointment
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-500">Everything you need in one place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div 
                key={index} 
                onClick={() => navigate(specialty.route)} 
                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200/50 hover:border-transparent hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${specialty.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {specialty.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {specialty.desc}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Overview */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Upcoming</h4>
              <p className="text-sm text-gray-600">Appointments this week</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Active</h4>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">12</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Total</h4>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-purple-600">85%</span>
                  <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Health Score</h4>
              <p className="text-sm text-gray-600">Looking great!</p>
            </div>
          </div>
        </section>
        
        <Chatbot />
      </main>
    </div>
  );
};

export default PatientDashboard;
