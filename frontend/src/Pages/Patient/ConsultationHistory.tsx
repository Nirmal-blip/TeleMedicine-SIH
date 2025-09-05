import React, { useState } from 'react'
import Sidebar from "../../Components/Sidebar"
import PatientHeader from '../../Components/PatientHeader'
import { FiCalendar, FiClock, FiUser, FiVideo, FiMapPin, FiFileText, FiStar, FiSearch, FiFilter } from 'react-icons/fi'

interface ConsultationRecord {
  id: number;
  appointmentId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  duration: string;
  type: 'Online' | 'In-Person';
  reason: string;
  diagnosis?: string;
  summary: string;
  prescriptionGiven: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  rating?: number;
  notes?: string;
  consultationFee: number;
  status: 'Completed' | 'Follow-up Required';
}

const ConsultationHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'follow-up'>('all');

  const consultations: ConsultationRecord[] = [
    {
      id: 1,
      appointmentId: "APT-2024-001",
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "45 minutes",
      type: "Online",
      reason: "Regular Checkup",
      diagnosis: "Mild Hypertension",
      summary: "Patient shows improved blood pressure control. Continue current medication regimen with minor adjustments.",
      prescriptionGiven: true,
      followUpRequired: true,
      followUpDate: "2024-02-15",
      rating: 5,
      notes: "Patient responded well to treatment",
      consultationFee: 150,
      status: "Follow-up Required"
    },
    {
      id: 2,
      appointmentId: "APT-2024-002",
      doctorName: "Dr. Michael Chen",
      specialization: "Dermatologist",
      date: "2024-01-10",
      time: "2:30 PM",
      duration: "30 minutes",
      type: "In-Person",
      reason: "Skin Rash",
      diagnosis: "Contact Dermatitis",
      summary: "Allergic reaction to new detergent. Prescribed topical corticosteroid and advised to avoid allergen.",
      prescriptionGiven: true,
      followUpRequired: false,
      rating: 4,
      consultationFee: 120,
      status: "Completed"
    },
    {
      id: 3,
      appointmentId: "APT-2024-003",
      doctorName: "Dr. Emily Rodriguez",
      specialization: "General Medicine",
      date: "2024-01-05",
      time: "11:00 AM",
      duration: "25 minutes",
      type: "Online",
      reason: "Flu Symptoms",
      diagnosis: "Viral Upper Respiratory Infection",
      summary: "Common cold symptoms. Recommended rest, hydration, and symptomatic treatment.",
      prescriptionGiven: false,
      followUpRequired: false,
      rating: 5,
      consultationFee: 100,
      status: "Completed"
    },
    {
      id: 4,
      appointmentId: "APT-2023-045",
      doctorName: "Dr. David Kumar",
      specialization: "Neurologist",
      date: "2023-12-20",
      time: "3:00 PM",
      duration: "60 minutes",
      type: "In-Person",
      reason: "Persistent Headaches",
      diagnosis: "Tension Headaches",
      summary: "Stress-related tension headaches. Recommended lifestyle changes and stress management techniques.",
      prescriptionGiven: true,
      followUpRequired: true,
      followUpDate: "2024-01-20",
      rating: 4,
      consultationFee: 200,
      status: "Follow-up Required"
    }
  ];

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'recent') {
      const consultationDate = new Date(consultation.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && consultationDate >= thirtyDaysAgo;
    }
    
    if (filterBy === 'follow-up') {
      return matchesSearch && consultation.followUpRequired;
    }
    
    return matchesSearch;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-cyan-50 relative poppins">
      <Sidebar />
      <main className="relative z-10 flex-1 p-6 overflow-y-auto">
        <PatientHeader />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Consultation History</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total</h3>
                  <p className="text-3xl font-bold text-amber-600">{consultations.length}</p>
                </div>
                <FiFileText className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Follow-ups</h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {consultations.filter(c => c.followUpRequired).length}
                  </p>
                </div>
                <FiCalendar className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-xl border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">This Month</h3>
                  <p className="text-3xl font-bold text-cyan-600">
                    {consultations.filter(c => {
                      const consultationDate = new Date(c.date);
                      const now = new Date();
                      return consultationDate.getMonth() === now.getMonth() && 
                             consultationDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <FiClock className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Avg Rating</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {(consultations.reduce((sum, c) => sum + (c.rating || 0), 0) / consultations.filter(c => c.rating).length).toFixed(1)}
                  </p>
                </div>
                <FiStar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search consultations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'follow-up')}
              >
                <option value="all">All Consultations</option>
                <option value="recent">Recent (30 days)</option>
                <option value="follow-up">Follow-up Required</option>
              </select>
            </div>
          </div>

          {/* Consultations List */}
          <div className="space-y-6">
            {filteredConsultations.map(consultation => (
              <div key={consultation.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{consultation.doctorName}</h3>
                        <p className="text-emerald-600 font-medium mb-2">{consultation.specialization}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-gray-400" />
                            <span>{new Date(consultation.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="text-gray-400" />
                            <span>{consultation.time} ({consultation.duration})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {consultation.type === 'Online' ? (
                              <FiVideo className="text-emerald-500" />
                            ) : (
                              <FiMapPin className="text-blue-500" />
                            )}
                            <span>{consultation.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        consultation.status === 'Follow-up Required' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {consultation.status}
                      </div>
                      {consultation.rating && (
                        <div className="flex items-center gap-1">
                          {renderStars(consultation.rating)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Reason & Diagnosis */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Reason for Visit</h4>
                        <p className="text-gray-700">{consultation.reason}</p>
                      </div>
                      
                      {consultation.diagnosis && (
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                          <p className="text-gray-700">{consultation.diagnosis}</p>
                        </div>
                      )}
                    </div>

                    {/* Summary & Status */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                        <p className="text-gray-700 text-sm">{consultation.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-lg text-center ${
                          consultation.prescriptionGiven 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <p className="text-xs font-medium">Prescription</p>
                          <p className="text-sm">{consultation.prescriptionGiven ? 'Given' : 'Not Given'}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center">
                          <p className="text-xs font-medium text-gray-600">Fee</p>
                          <p className="text-sm font-semibold text-gray-800">${consultation.consultationFee}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Section */}
                  {consultation.followUpRequired && consultation.followUpDate && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Follow-up Required</h4>
                      <p className="text-gray-700 text-sm">Next appointment recommended: {new Date(consultation.followUpDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {consultation.notes && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Additional Notes</h4>
                      <p className="text-gray-700 text-sm">{consultation.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2">
                      <FiFileText />
                      View Full Report
                    </button>
                    
                    {consultation.prescriptionGiven && (
                      <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300">
                        View Prescription
                      </button>
                    )}
                    
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300">
                      Book Follow-up
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredConsultations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No consultations found</h3>
              <p className="text-gray-600 mb-6">You don't have any consultations matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ConsultationHistory
