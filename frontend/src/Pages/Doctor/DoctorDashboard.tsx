import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { initializeVideoCallService, VideoCallNotification } from "../../utils/video-call";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaVideo, 
  FaUsers, 
  FaCalendar, 
  FaPills, 
  FaStar, 
  FaUserMd, 
  FaTimes 
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import Chatbot from "../../Components/Chatbot";
import DoctorSidebar from "../../Components/DoctorSidebar";
import doctorImage from "../../assets/girl.png";
import { BACKEND_BASE_URL } from "../../utils/env";

interface QuickAction {
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}


const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctorName, setDoctorName] = useState<string>("Dr. Smith");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    activePrescriptions: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState<VideoCallNotification | null>(null);
  const [showCallNotification, setShowCallNotification] = useState(false);

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);

        // Get auth info
        const authResponse = await axios.get(`${BACKEND_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (authResponse.data?.user) {
          const authUser = authResponse.data.user;
          if (authUser.userType === "doctor") {
            setDoctorName(authUser.fullname || "Doctor");
            setIsAuthenticated(true);

            // Get detailed doctor info
            try {
              const doctorResponse = await axios.get(`${BACKEND_BASE_URL}/api/doctors/me`, {
                withCredentials: true,
              });
              if (doctorResponse.data?.fullname) {
                setDoctorName(doctorResponse.data.fullname);
              }
            } catch {
              console.log("Could not fetch detailed doctor info, using auth data");
            }
          } else {
            setIsAuthenticated(false);
            setDoctorName("Doctor");
          }
        }

        await fetchDashboardStats();
      } catch (error: any) {
        console.error("Failed to fetch doctor data:", error);
        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          const tempName = localStorage.getItem("tempDoctorName");
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

  // Initialize video call service
  useEffect(() => {
    const initVideoCallService = async () => {
      try {
        let userId: string | null = user?.userId || localStorage.getItem("userId") || localStorage.getItem("doctorId");

        if (!userId) {
          // Fallback: get from API
          const response = await axios.get(`${BACKEND_BASE_URL}/api/auth/me`, {
            withCredentials: true,
          });
          userId = response.data.user?.userId;
          if (!userId) {
            console.error("No user ID found for video call service");
            return;
          }
        }

        // Delay to ensure backend is ready
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const service = initializeVideoCallService(userId, "doctor");

        // Incoming call listener
        service.onIncomingVideoCall((callData) => {
          setIncomingCall(callData);
          setShowCallNotification(true);
        });

        // Error listener
        service.onCallError((error) => {
          console.error("Video call error:", error);
        });

      } catch (error) {
        console.error("Failed to initialize video call service:", error);
      }
    };

    // Initialize after user is available
    if (user) {
      initVideoCallService();
    } else {
      setTimeout(initVideoCallService, 3000);
    }
  }, [user]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const appointmentsResponse = await axios.get(`${BACKEND_BASE_URL}/api/appointments/my/upcoming`, { withCredentials: true });
      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointmentsResponse.data.filter((apt: any) => new Date(apt.date).toISOString().split("T")[0] === today).length;

      const patientsResponse = await axios.get(`${BACKEND_BASE_URL}/api/patients`, { withCredentials: true });
      const doctorStatsResponse = await axios.get(`${BACKEND_BASE_URL}/api/doctors/me/stats`, { withCredentials: true });

      setDashboardStats({
        todayAppointments,
        totalPatients: patientsResponse.data.length,
        activePrescriptions: 24,
        rating: doctorStatsResponse.data?.rating || 4.8
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  // Handle name update
  const handleNameClick = async () => {
    const newName = prompt("Enter your name:", doctorName);
    if (newName?.trim()) {
      try {
        await axios.patch(`${BACKEND_BASE_URL}/api/doctors/me`, { fullname: newName.trim() }, { withCredentials: true });
        setDoctorName(newName.trim());
        alert("Name updated successfully!");
      } catch (error: any) {
        console.error("Failed to update name:", error);
        if (error.response?.status === 401) {
          setDoctorName(newName.trim());
          localStorage.setItem("tempDoctorName", newName.trim());
          alert("Name saved temporarily! Please log in to save permanently.");
        } else {
          alert("Failed to update name. Please try again.");
        }
      }
    }
  };

  // Quick Actions
  const quickActions: QuickAction[] = [
    { title: "Video Consultation", desc: "Start video calls with your patients for consultations", icon: <FaVideo className="w-8 h-8" />, route: "/doctor/video-consultation", color: "from-emerald-500 to-teal-500" },
    { title: "Patient List", desc: "View and manage your list of patients", icon: <FaUsers className="w-8 h-8" />, route: "/doctor/patient-list", color: "from-emerald-500 to-teal-500" },
    { title: "Prescribed Patients", desc: "Monitor patients with active prescriptions", icon: <FaPills className="w-8 h-8" />, route: "/doctor/prescribed-patients", color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 overflow-y-auto min-h-screen">
        {/* Welcome Section */}
        <section className="relative overflow-hidden gradient-bg-primary rounded-3xl p-4 px-8 mt-6 shadow-xl animate-fade-scale">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FaUserMd className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 font-secondary">
                    Welcome back, <span className="cursor-pointer hover:underline" onClick={handleNameClick}>{doctorName}</span>!
                  </h1>
                  <p className="text-emerald-100">Ready to help your patients today?</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/doctor/patient-list')} className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2">
                  <FaUsers className="w-5 h-5" /> View Patients
                </button>
                <button onClick={() => navigate('/doctor/consultation-history')} className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-emerald-50 hover:scale-105 flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" /> Consultation History
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img src={doctorImage} alt="Doctor" className="w-64 h-60 lg:w-64 lg:h-60 xl:w-80 xl:h-76 object-cover rounded-2xl"/>
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
              <div key={index} onClick={() => navigate(action.route)} className="group relative card card-hover p-8 rounded-3xl cursor-pointer animate-fade-scale" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative z-10">
                  <div className={`w-18 h-18 bg-gradient-to-r ${action.color} rounded-3xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors duration-300">{action.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Chatbot />
      </main>

      {/* Video Call Notification Modal */}
      {showCallNotification && incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-bounce text-6xl mb-4">📞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Incoming Video Call</h2>
              <p className="text-lg text-emerald-600 font-medium mb-2">{incomingCall.patientName}</p>
              <p className="text-gray-600 mb-6">{incomingCall.specialization}</p>
              
              <div className="flex gap-4">
                <button onClick={() => { setShowCallNotification(false); setIncomingCall(null); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200">
                  <FaTimes /> Decline
                </button>
                <button onClick={() => { setShowCallNotification(false); navigate('/doctor/video-consultation'); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200">
                  <FaVideo /> Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
