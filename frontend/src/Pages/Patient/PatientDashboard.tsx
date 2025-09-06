import React from "react";
import { useNavigate } from "react-router-dom";
import { FaVideo, FaMapPin, FaCalendar, FaUsers, FaStar, FaHeart, FaClock, FaStethoscope, FaPills, FaHospital } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import Chatbot from "../../Components/Chatbot";
import Sidebar from "../../Components/Sidebar";
import girlImage from "../../assets/girl.png";

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
      icon: <FaStethoscope className="w-8 h-8" />, 
      route: "/video-consultation",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Medicine Recommendation", 
      desc: "Get personalized medicine suggestions from our AI assistant", 
      icon: <FaPills className="w-8 h-8" />, 
      route: "/medicine-recommendation",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Nearby Hospitals", 
      desc: "Find trusted healthcare facilities and emergency services near you", 
      icon: <FaHospital className="w-8 h-8" />, 
      route: "/patient-support",
      color: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 overflow-y-auto min-h-screen">
        {/* Welcome Hero Section */}
        <section className="relative overflow-hidden gradient-bg-primary rounded-3xl p-4 px-8 mt-6 shadow-xl animate-fade-scale">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-float-delayed"></div>
          
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-4 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FaHeart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 font-secondary">Hello Patient! 👋</h1>
                    <p className="text-emerald-100">How can we help you stay healthy today?</p>
                  </div>
                </div>
                
                <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                  Welcome to your personal health companion. We're here to make healthcare accessible, friendly, and stress-free.
                </p>
                
                <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/doctors-list')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2">
                <FaStethoscope className="w-5 h-5" />
                Find a Doctor
              </button>
              <button 
                onClick={() => navigate('/appointments')}
                className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-emerald-50 hover:scale-105 flex items-center gap-2">
                <FaCalendar className="w-5 h-5" />
                My Appointments
              </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <img 
                  src={girlImage} 
                  alt="Healthcare Professional" 
                  className="w-64 h-60 lg:w-64 lg:h-60 xl:w-80 xl:h-76 object-cover "
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1 font-secondary">Quick Actions</h2>
              <p className="text-gray-600">Everything you need in one place</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <FaShield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div 
                key={index} 
                onClick={() => navigate(specialty.route)} 
                className="group relative card card-hover p-8 rounded-3xl cursor-pointer animate-fade-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className={`w-18 h-18 bg-gradient-to-r ${specialty.color} rounded-3xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {specialty.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {specialty.desc}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-secondary">Your Health Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaCalendar className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Upcoming</h4>
              <p className="text-sm text-gray-600">Appointments this week</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaPills className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Active</h4>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaUsers className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">12</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Total</h4>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaHeart className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold text-emerald-600">85%</span>
                  <FaStar className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Health Score</h4>
              <p className="text-sm text-gray-600">Looking great!</p>
            </div>
          </div>
          
          {/* Health Tips */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaClock className="w-6 h-6 text-white" />
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