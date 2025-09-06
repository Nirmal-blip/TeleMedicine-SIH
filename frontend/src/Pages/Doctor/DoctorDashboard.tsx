import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaVideo, 
  FaUsers, 
  FaCalendar, 
  FaStethoscope, 
  FaPills, 
  FaBell, 
  FaChartLine,
  FaClock,
  FaHeart,
  FaStar,
  FaUserMd
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import Chatbot from "../../Components/Chatbot";
import DoctorSidebar from "../../Components/DoctorSidebar";
import doctorImage from "../../assets/girl.png";

interface QuickAction {
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState<string>("Dr. Smith");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    activePrescriptions: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/doctors/me', {
          withCredentials: true,
        });
        
        if (response.data && response.data.fullname) {
          setDoctorName(response.data.fullname);
          setIsAuthenticated(true);
        } else if (response.data && response.data.name) {
          setDoctorName(response.data.name);
          setIsAuthenticated(true);
        }
        
        // Fetch dashboard statistics
        await fetchDashboardStats();
      } catch (error: any) {
        console.error('Failed to fetch doctor data:', error);
        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          const tempName = localStorage.getItem('tempDoctorName');
          setDoctorName(tempName || "Doctor");
        } else {
          setIsAuthenticated(false);
          setDoctorName("Doctor");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch today's appointments
      const appointmentsResponse = await axios.get('http://localhost:3000/api/appointments/my/upcoming', {
        withCredentials: true,
      });
      
      // Filter for today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsResponse.data.filter((apt: any) => 
        new Date(apt.date).toISOString().split('T')[0] === today
      ).length;

      // Fetch total patients
      const patientsResponse = await axios.get('http://localhost:3000/api/patients', {
        withCredentials: true,
      });
      
      // Get doctor's own stats
      const doctorStatsResponse = await axios.get('http://localhost:3000/api/doctors/me/stats', {
        withCredentials: true,
      });
      
      setDashboardStats({
        todayAppointments,
        totalPatients: patientsResponse.data.length,
        activePrescriptions: 24, // This would need a prescriptions endpoint
        rating: doctorStatsResponse.data?.rating || 4.8
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Keep default values on error
    }
  };

  const handleNameClick = async () => {
    const newName = prompt("Enter your name:", doctorName);
    if (newName && newName.trim()) {
      try {
        await axios.patch('http://localhost:3000/api/doctors/me', {
          fullname: newName.trim()
        }, {
          withCredentials: true,
        });
        
        setDoctorName(newName.trim());
        alert('Name updated successfully!');
      } catch (error: any) {
        console.error('Failed to update name:', error);
        if (error.response?.status === 401) {
          setDoctorName(newName.trim());
          localStorage.setItem('tempDoctorName', newName.trim());
          alert('Name saved temporarily! Please log in to save permanently.');
        } else {
          alert('Failed to update name. Please try again.');
        }
      }
    }
  };

  const quickActions: QuickAction[] = [
    { 
      title: "Video Consultation", 
      desc: "Start video calls with your patients for consultations", 
      icon: <FaVideo className="w-8 h-8" />, 
      route: "/doctor/video-consultation",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Patient List", 
      desc: "View and manage your list of patients", 
      icon: <FaUsers className="w-8 h-8" />, 
      route: "/doctor/patient-list",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Prescribed Patients", 
      desc: "Monitor patients with active prescriptions", 
      icon: <FaPills className="w-8 h-8" />, 
      route: "/doctor/prescribed-patients",
      color: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
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
                    <FaUserMd className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 font-secondary">
                      Welcome back, <span 
                        className="cursor-pointer hover:underline" 
                        onClick={handleNameClick}
                        title="Click to change name"
                      >
                        {doctorName}
                      </span>!
                    </h1>
                    <p className="text-emerald-100">Ready to help your patients today?</p>
                  </div>
                </div>
                
                <p className="text-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                  Your medical practice dashboard - manage consultations, track patient progress, and provide excellent healthcare.
                </p>
                
                <p className="text-sm text-white/90 mb-8 max-w-2xl leading-relaxed">
                  <span className="font-bold">Medical Insight: </span>Remember to follow up with patients within 24-48 hours after prescribing new medications to monitor for side effects and treatment compliance.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/doctor/patient-list')}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2">
                    <FaUsers className="w-5 h-5" />
                    View Patients
                  </button>
                  <button 
                    onClick={() => navigate('/doctor/consultation-history')}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-emerald-50 hover:scale-105 flex items-center gap-2">
                    <FaCalendar className="w-5 h-5" />
                    Consultation History
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <img 
                  src={doctorImage} 
                  alt="Doctor" 
                  className="w-64 h-60 lg:w-64 lg:h-60 xl:w-80 xl:h-76 object-cover rounded-2xl"
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
              <p className="text-gray-600">Manage your medical practice efficiently</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <FaShield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                onClick={() => navigate(action.route)} 
                className="group relative card card-hover p-8 rounded-3xl cursor-pointer animate-fade-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className={`w-18 h-18 bg-gradient-to-r ${action.color} rounded-3xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {action.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {action.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    {action.desc}
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

        {/* Medical Practice Overview */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-secondary">Practice Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaCalendar className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">
                  {loading ? '...' : dashboardStats.todayAppointments}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Today</h4>
              <p className="text-sm text-gray-600">Scheduled appointments</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaUsers className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">
                  {loading ? '...' : dashboardStats.totalPatients}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Total</h4>
              <p className="text-sm text-gray-600">Patients</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaPills className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">
                  {loading ? '...' : dashboardStats.activePrescriptions}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Active</h4>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </div>
            
            <div className="card hover-lift p-6 rounded-3xl border border-emerald-100 animate-fade-scale" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaStar className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold text-emerald-600">
                    {loading ? '...' : dashboardStats.rating.toFixed(1)}
                  </span>
                  <FaStar className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Rating</h4>
              <p className="text-sm text-gray-600">Patient satisfaction</p>
            </div>
          </div>
        </section>
        
        <Chatbot />
      </main>
    </div>
  );
};

export default DoctorDashboard;
