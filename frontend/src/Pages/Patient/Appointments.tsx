import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
import { FaCalendar, FaClock, FaUser, FaVideo, FaMapPin, FaFilter, FaPlus, FaCheckCircle, FaPhone, FaHeart, FaStethoscope, FaFileAlt } from 'react-icons/fa'
import { FaX } from "react-icons/fa6";

interface Appointment {
  id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  type: 'Online' | 'In-Person';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  location?: string;
  reason: string;
  consultationFee: number;
}

const Appointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  const appointments: Appointment[] = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "Online",
      status: "Upcoming",
      reason: "Regular Checkup",
      consultationFee: 150
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialization: "Dermatologist",
      date: "2024-01-18",
      time: "2:30 PM",
      type: "In-Person",
      status: "Upcoming",
      location: "Medical Center, Downtown",
      reason: "Skin Consultation",
      consultationFee: 120
    },
    {
      id: 3,
      doctorName: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      date: "2024-01-10",
      time: "9:00 AM",
      type: "Online",
      status: "Completed",
      reason: "Child Vaccination",
      consultationFee: 100
    },
    {
      id: 4,
      doctorName: "Dr. David Wilson",
      specialization: "Orthopedist",
      date: "2024-01-05",
      time: "3:00 PM",
      type: "In-Person",
      status: "Completed",
      location: "Orthopedic Clinic",
      reason: "Knee Pain Consultation",
      consultationFee: 180
    },
    {
      id: 5,
      doctorName: "Dr. Lisa Thompson",
      specialization: "Psychiatrist",
      date: "2024-01-12",
      time: "11:30 AM",
      type: "Online",
      status: "Cancelled",
      reason: "Mental Health Check",
      consultationFee: 200
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'all') return true;
    return appointment.status.toLowerCase() === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Online' ? <FaVideo className="w-4 h-4" /> : <FaMapPin className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        <PatientHeader />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaCalendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">My Appointments</h1>
              <p className="text-gray-600">Manage your healthcare appointments</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <button className="btn-primary flex items-center gap-2">
                <FaPlus className="w-4 h-4" />
                Book New Appointment
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <FaFilter className="w-4 h-4" />
                Filter
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Total: {appointments.length} appointments
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(a => a.status === 'Upcoming').length },
              { key: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length },
              { key: 'all', label: 'All', count: appointments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map((appointment, index) => (
            <div 
              key={appointment.id} 
              className="card card-hover p-6 rounded-2xl animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaStethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{appointment.doctorName}</h3>
                    <p className="text-emerald-600 font-medium">{appointment.specialization}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar className="w-4 h-4 text-emerald-500" />
                  <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaClock className="w-4 h-4 text-emerald-500" />
                  <span>{appointment.time}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  {getTypeIcon(appointment.type)}
                  <span>{appointment.type}</span>
                  {appointment.location && (
                    <span className="text-sm">• {appointment.location}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaHeart className="w-4 h-4 text-emerald-500" />
                  <span>{appointment.reason}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-lg font-bold text-emerald-600">
                  ${appointment.consultationFee}
                </div>
                
                <div className="flex gap-2">
                  {appointment.status === 'Upcoming' && (
                    <>
                      <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-300 flex items-center gap-2">
                        <FaVideo className="w-4 h-4" />
                        Join
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-300 flex items-center gap-2">
                        <FaX className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {appointment.status === 'Completed' && (
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-300 flex items-center gap-2">
                      <FaFileAlt className="w-4 h-4" />
                      View Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">You don't have any {activeTab} appointments at the moment.</p>
            <button className="btn-primary">
              Book Your First Appointment
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Appointments