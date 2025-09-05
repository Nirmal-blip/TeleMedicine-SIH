import React from "react";
import { useNavigate } from "react-router-dom";
import DeliveryImg from "../../../public/admin.jpg";
import Chatbot from "../../Components/Chatbot";
import Sidebar from "../../Components/Sidebar";
import PatientHeader from "../../Components/PatientHeader";

interface Specialty {
  title: string;
  desc: string;
  img: string;
  route: string;
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const specialties: Specialty[] = [
    { title: "Video Consultation", desc: "Instant expert advice via video call", img: DeliveryImg, route: "/video-consultation" },
    { title: "Medicine Recommendation", desc: "Reliable solutions for common health concerns", img: DeliveryImg, route: "/medicine-recommendation" },
    { title: "Nearby Hospitals", desc: "Find trusted healthcare facilities within a 20-25 km radius for quick and reliable medical assistance.", img: DeliveryImg, route: "/patient-support" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-cyan-50 relative poppins">
      <Sidebar />
      <main className="relative z-10 flex-1 p-6 overflow-y-auto">
        <PatientHeader />

        <section className="w-full p-8 rounded-2xl mt-6 shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="w-full flex flex-col justify-center items-start">
            <h3 className="text-4xl font-bold text-white mb-2">
              Welcome to Your Health Dashboard
            </h3>
            <p className="text-xl mb-6 text-emerald-50">Better healthcare at your fingertips - anytime, anywhere</p>

            <button 
              onClick={() => navigate('/prescription')}
              className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out 
              hover:bg-yellow-100 hover:text-emerald-700 hover:shadow-lg transform hover:scale-105">
              View Previous Prescriptions
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <div 
                key={index} 
                onClick={() => navigate(specialty.route)} 
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-200 transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {specialty.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{specialty.desc}</p>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md">
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-6 rounded-xl border border-yellow-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Appointments</h4>
              <p className="text-3xl font-bold text-amber-600">3</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-6 rounded-xl border border-emerald-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Active Prescriptions</h4>
              <p className="text-3xl font-bold text-emerald-600">2</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-xl border border-cyan-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Consultations</h4>
              <p className="text-3xl font-bold text-cyan-600">12</p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Health Score</h4>
              <p className="text-3xl font-bold text-purple-600">85%</p>
            </div>
          </div>
        </section>
        
        <Chatbot />
      </main>
    </div>
  );
};

export default PatientDashboard;
