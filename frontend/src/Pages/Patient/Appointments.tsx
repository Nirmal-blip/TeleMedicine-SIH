import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import { FaCalendar, FaClock, FaUser, FaVideo, FaMapPin, FaFilter, FaPlus, FaCheckCircle, FaPhone, FaHeart, FaStethoscope, FaFileAlt, FaSearch } from 'react-icons/fa'
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Online' | 'In-Person'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'doctor' | 'specialization'>('date');

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
    // Filter by tab
    let matchesTab = true;
    if (activeTab !== 'all') {
      matchesTab = appointment.status.toLowerCase() === activeTab;
    }
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = filterType === 'all' || appointment.type === filterType;
    
    return matchesTab && matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'doctor':
        return a.doctorName.localeCompare(b.doctorName);
      case 'specialization':
        return a.specialization.localeCompare(b.specialization);
      case 'date':
      default:
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  const handleBookAppointment = () => {
    navigate('/patient/doctors');
  };

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
        {/* Appointments Header Card */}
        <section className="mb-8">
          <div className="relative overflow-hidden gradient-bg-primary rounded-3xl p-6 shadow-xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaCalendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 font-secondary">My Appointments</h1>
                  <p className="text-emerald-100">Manage and track your healthcare appointments</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaSearch className="w-5 h-5 text-emerald-600" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search appointments by doctor, specialization, or reason..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-lg shadow-lg"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
                  >
                    <option value="all">All Types</option>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="doctor">Sort by Doctor</option>
                    <option value="specialization">Sort by Specialty</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons and Stats */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Book New Appointment Button */}
                <button
                  onClick={handleBookAppointment}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-3 shadow-lg"
                >
                  <FaPlus className="w-5 h-5" />
                  Book New Appointment
                </button>

                {/* Stats */}
                <div className="flex gap-4 text-white/90 text-sm">
                  <span>Total: {appointments.length}</span>
                  <span>•</span>
                  <span>Filtered: {filteredAppointments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-2xl w-fit shadow-lg border border-emerald-100">
            {[
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(a => a.status === 'Upcoming').length },
              { key: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length },
              { key: 'all', label: 'All', count: appointments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
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
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendar className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? "No appointments match your current filters. Try adjusting your search or filters."
                : `You don't have any ${activeTab} appointments at the moment.`
              }
            </p>
            <button 
              onClick={handleBookAppointment}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <FaPlus className="w-4 h-4" />
              Book Your First Appointment
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Appointments