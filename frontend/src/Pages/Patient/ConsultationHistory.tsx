import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import { FaCalendar, FaClock, FaUser, FaVideo, FaFileExport, FaDownload, FaEye, FaFilter, FaSearch, FaStethoscope, FaHeart, FaPills, FaFileAlt } from 'react-icons/fa'

interface Consultation {
  id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  duration: string;
  type: 'Video' | 'In-Person';
  status: 'Completed' | 'Cancelled';
  diagnosis: string;
  prescription?: string;
  notes: string;
  rating: number;
  followUp?: string;
}

const ConsultationHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const consultations: Consultation[] = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "45 minutes",
      type: "Video",
      status: "Completed",
      diagnosis: "Hypertension - Stage 1",
      prescription: "Lisinopril 10mg daily",
      notes: "Patient shows good response to current medication. Blood pressure readings improved.",
      rating: 5,
      followUp: "2024-02-15"
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialization: "Dermatologist",
      date: "2024-01-10",
      time: "2:30 PM",
      duration: "30 minutes",
      type: "In-Person",
      status: "Completed",
      diagnosis: "Acne vulgaris - moderate",
      prescription: "Tretinoin cream 0.05%",
      notes: "Patient advised on proper skincare routine and dietary changes.",
      rating: 4,
      followUp: "2024-02-10"
    },
    {
      id: 3,
      doctorName: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      date: "2024-01-05",
      time: "9:00 AM",
      duration: "25 minutes",
      type: "Video",
      status: "Completed",
      diagnosis: "Common cold",
      prescription: "Children's acetaminophen",
      notes: "Child is recovering well. Fever has subsided.",
      rating: 5,
      followUp: "2024-01-12"
    },
    {
      id: 4,
      doctorName: "Dr. David Wilson",
      specialization: "Orthopedist",
      date: "2024-01-02",
      time: "3:00 PM",
      duration: "40 minutes",
      type: "In-Person",
      status: "Completed",
      diagnosis: "Knee osteoarthritis - mild",
      prescription: "Ibuprofen 400mg as needed",
      notes: "Recommended physical therapy and weight management.",
      rating: 4,
      followUp: "2024-03-02"
    }
  ];

  const specializations = ['all', ...Array.from(new Set(consultations.map(c => c.specialization)))];

  const filteredConsultations = consultations
    .filter(consultation => 
      consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(consultation => 
      filterSpecialization === 'all' || consultation.specialization === filterSpecialization
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    return status === 'Completed' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaHeart
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaFileAlt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">Consultation History</h1>
              <p className="text-gray-600">Review your past medical consultations</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search consultations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-6">
          {filteredConsultations.map((consultation, index) => (
            <div 
              key={consultation.id} 
              className="card card-hover p-6 rounded-2xl animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaStethoscope className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-xl">{consultation.doctorName}</h3>
                    <p className="text-emerald-600 font-medium">{consultation.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {renderStars(consultation.rating)}
                      </div>
                      <span className="text-sm text-gray-500">({consultation.rating}/5)</span>
                    </div>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consultation.status)}`}>
                  {consultation.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{new Date(consultation.date).toLocaleDateString()}</p>
                    <p className="text-xs">{consultation.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaClock className="w-4 h-4 text-emerald-500" />
                  <span>{consultation.duration}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  {consultation.type === 'Video' ? <FaVideo className="w-4 h-4 text-emerald-500" /> : <FaUser className="w-4 h-4 text-emerald-500" />}
                  <span>{consultation.type}</span>
                </div>
                
                {consultation.followUp && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaCalendar className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">Follow-up</p>
                      <p className="text-xs">{new Date(consultation.followUp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnosis and Notes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaHeart className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-gray-800">Diagnosis</h4>
                </div>
                <p className="text-gray-700 mb-4 pl-6">{consultation.diagnosis}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <FaFileAlt className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-gray-800">Notes</h4>
                </div>
                <p className="text-gray-700 pl-6">{consultation.notes}</p>
              </div>

              {/* Prescription */}
              {consultation.prescription && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaPills className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-800">Prescription</h4>
                  </div>
                  <p className="text-emerald-700">{consultation.prescription}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="btn-primary flex items-center gap-2">
                  <FaEye className="w-4 h-4" />
                  View Details
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <FaDownload className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredConsultations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileAlt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No consultations found</h3>
            <p className="text-gray-600 mb-6">You don't have any consultations matching your search criteria.</p>
            <button className="btn-primary">
              Book Your First Consultation
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default ConsultationHistory