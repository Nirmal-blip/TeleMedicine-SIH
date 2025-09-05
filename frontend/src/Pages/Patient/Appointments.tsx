import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
import { FiCalendar, FiClock, FiUser, FiVideo, FiMapPin, FiFilter, FiPlus, FiCheckCircle, FiX, FiPhone } from 'react-icons/fi'

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
      time: "11:00 AM",
      type: "Online",
      status: "Completed",
      reason: "Child Health Checkup",
      consultationFee: 100
    },
    {
      id: 4,
      doctorName: "Dr. David Kumar",
      specialization: "Neurologist",
      date: "2024-01-20",
      time: "3:00 PM",
      type: "Online",
      status: "Upcoming",
      reason: "Headache Consultation",
      consultationFee: 200
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'upcoming') return appointment.status === 'Upcoming';
    if (activeTab === 'completed') return appointment.status === 'Completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <PatientHeader />
        
        <div className="mt-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage your upcoming and past medical appointments</p>
            </div>
            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-2xl font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:scale-105 flex items-center gap-2 shadow-emerald-200">
              <FiPlus className="w-5 h-5" />
              Book New Appointment
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
                  <p className="text-3xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">
                    {appointments.filter(a => a.status === 'Upcoming').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <FiCalendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    {appointments.filter(a => a.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total</h3>
                  <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">{appointments.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                  <FiUser className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg mb-8 border border-gray-200/50">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
              >
                <FiClock className="w-4 h-4" />
                Upcoming ({appointments.filter(a => a.status === 'Upcoming').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
              >
                <FiCheckCircle className="w-4 h-4" />
                Completed ({appointments.filter(a => a.status === 'Completed').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
              >
                <FiCalendar className="w-4 h-4" />
                All ({appointments.length})
              </button>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{appointment.doctorName}</h3>
                        <p className="text-emerald-600 font-medium mb-2">{appointment.specialization}</p>
                        <p className="text-gray-600 text-sm">{appointment.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </div>
                      <p className="text-gray-600 text-sm">Fee: <span className="font-semibold">${appointment.consultationFee}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-gray-400" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiClock className="text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {appointment.type === 'Online' ? (
                        <FiVideo className="text-emerald-500" />
                      ) : (
                        <FiMapPin className="text-blue-500" />
                      )}
                      <span>{appointment.type}</span>
                      {appointment.location && <span className="text-sm">- {appointment.location}</span>}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {appointment.status === 'Upcoming' && (
                      <>
                        {appointment.type === 'Online' && (
                          <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2">
                            <FiVideo />
                            Join Call
                          </button>
                        )}
                        <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-all duration-300">
                          Reschedule
                        </button>
                        <button className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-all duration-300">
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'Completed' && (
                      <>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300">
                          View Summary
                        </button>
                        <button className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-all duration-300">
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-6">You don't have any {activeTab} appointments</p>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600">
                Book Your First Appointment
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Appointments
