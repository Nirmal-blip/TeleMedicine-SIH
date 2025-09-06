import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from "../../Components/Sidebar"
import { FaFileExport, FaCalendar, FaUser, FaDownload, FaEye, FaFilter, FaSearch, FaClock, FaCheckCircle, FaExclamationTriangle, FaPills, FaStethoscope, FaHeart, FaFileAlt, FaPlus } from 'react-icons/fa'
import { FaShield } from "react-icons/fa6";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  id: number;
  prescriptionNumber: string;
  doctorName: string;
  specialization: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  status: 'Active' | 'Completed' | 'Cancelled';
  refillsRemaining?: number;
  nextRefillDate?: string;
  consultationFee: number;
}

const Prescription: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Completed' | 'Cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'doctor' | 'diagnosis'>('date');

  const prescriptions: PrescriptionData[] = [
    {
      id: 1,
      prescriptionNumber: "RX-2024-001",
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      date: "2024-01-15",
      diagnosis: "Hypertension Management",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take in the morning with food"
        },
        {
          name: "Aspirin",
          dosage: "81mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take with water after breakfast"
        }
      ],
      status: "Active",
      refillsRemaining: 2,
      nextRefillDate: "2024-02-15",
      consultationFee: 150
    },
    {
      id: 2,
      prescriptionNumber: "RX-2024-002",
      doctorName: "Dr. Michael Chen",
      specialization: "Dermatologist",
      date: "2024-01-10",
      diagnosis: "Acne Treatment",
      medications: [
        {
          name: "Tretinoin Cream",
          dosage: "0.05%",
          frequency: "Once daily",
          duration: "60 days",
          instructions: "Apply to affected areas at bedtime"
        },
        {
          name: "Benzoyl Peroxide",
          dosage: "5%",
          frequency: "Twice daily",
          duration: "60 days",
          instructions: "Apply in morning and evening"
        }
      ],
      status: "Active",
      refillsRemaining: 1,
      nextRefillDate: "2024-02-10",
      consultationFee: 120
    },
    {
      id: 3,
      prescriptionNumber: "RX-2024-003",
      doctorName: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      date: "2024-01-05",
      diagnosis: "Common Cold",
      medications: [
        {
          name: "Children's Acetaminophen",
          dosage: "160mg/5ml",
          frequency: "Every 6 hours",
          duration: "7 days",
          instructions: "Give with food, do not exceed 4 doses per day"
        }
      ],
      status: "Completed",
      consultationFee: 100
    },
    {
      id: 4,
      prescriptionNumber: "RX-2024-004",
      doctorName: "Dr. David Wilson",
      specialization: "Orthopedist",
      date: "2024-01-02",
      diagnosis: "Knee Pain Management",
      medications: [
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "Three times daily",
          duration: "14 days",
          instructions: "Take with food to reduce stomach irritation"
        },
        {
          name: "Physical Therapy",
          dosage: "N/A",
          frequency: "Twice weekly",
          duration: "4 weeks",
          instructions: "Follow prescribed exercises"
        }
      ],
      status: "Completed",
      consultationFee: 180
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Filter by tab
    let matchesTab = true;
    if (activeTab !== 'all') {
      matchesTab = prescription.status.toLowerCase() === activeTab;
    }
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesTab && matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'doctor':
        return a.doctorName.localeCompare(b.doctorName);
      case 'diagnosis':
        return a.diagnosis.localeCompare(b.diagnosis);
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handleBookConsultation = () => {
    navigate('/patient/doctors');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        {/* Prescriptions Header Card */}
        <section className="mb-8">
          <div className="relative overflow-hidden gradient-bg-primary rounded-3xl p-6 shadow-xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaPills className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 font-secondary">My Prescriptions</h1>
                  <p className="text-emerald-100">Manage your medications and prescription history</p>
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
                    placeholder="Search by doctor, diagnosis, medication, or prescription number..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-lg shadow-lg"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="doctor">Sort by Doctor</option>
                    <option value="diagnosis">Sort by Diagnosis</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons and Stats */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleBookConsultation}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-3 shadow-lg"
                  >
                    <FaPlus className="w-5 h-5" />
                    New Consultation
                  </button>
                  
                  <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/30 flex items-center gap-2 shadow-lg">
                    <FaDownload className="w-4 h-4" />
                    Export All
                  </button>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-white/90 text-sm">
                  <span>Total: {prescriptions.length}</span>
                  <span>•</span>
                  <span>Active: {prescriptions.filter(p => p.status === 'Active').length}</span>
                  <span>•</span>
                  <span>Filtered: {filteredPrescriptions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-2xl w-fit shadow-lg border border-emerald-100">
            {[
              { key: 'active', label: 'Active', count: prescriptions.filter(p => p.status === 'Active').length },
              { key: 'completed', label: 'Completed', count: prescriptions.filter(p => p.status === 'Completed').length },
              { key: 'all', label: 'All', count: prescriptions.length }
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

        {/* Prescriptions List */}
        <div className="space-y-6">
          {filteredPrescriptions.map((prescription, index) => (
            <div 
              key={prescription.id} 
              className="card card-hover p-6 rounded-2xl animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaStethoscope className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-xl">{prescription.doctorName}</h3>
                    <p className="text-emerald-600 font-medium">{prescription.specialization}</p>
                    <p className="text-sm text-gray-500">Prescription #{prescription.prescriptionNumber}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    ${prescription.consultationFee}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{new Date(prescription.date).toLocaleDateString()}</p>
                    <p className="text-xs">Prescribed Date</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaHeart className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{prescription.diagnosis}</p>
                    <p className="text-xs">Diagnosis</p>
                  </div>
                </div>
                
                {prescription.nextRefillDate && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaClock className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">{new Date(prescription.nextRefillDate).toLocaleDateString()}</p>
                      <p className="text-xs">Next Refill</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPills className="w-4 h-4 text-emerald-500" />
                  Medications ({prescription.medications.length})
                </h4>
                <div className="space-y-3">
                  {prescription.medications.map((medication, medIndex) => (
                    <div key={medIndex} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-800">{medication.name}</h5>
                        <span className="text-sm text-emerald-600 font-medium">{medication.dosage}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaClock className="w-3 h-3 text-emerald-500" />
                          <span>{medication.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="w-3 h-3 text-emerald-500" />
                          <span>{medication.duration}</span>
                        </div>
                        {medication.instructions && (
                          <div className="md:col-span-3 mt-2 p-2 bg-white rounded-lg">
                            <p className="text-xs text-gray-500">
                              <strong>Instructions:</strong> {medication.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refill Info */}
              {prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Refill Information</h4>
                  </div>
                  <p className="text-blue-700 text-sm">
                    You have <strong>{prescription.refillsRemaining}</strong> refills remaining. 
                    Next refill available on {new Date(prescription.nextRefillDate!).toLocaleDateString()}.
                  </p>
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
                  Download PDF
                </button>
                {prescription.status === 'Active' && prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                  <button className="btn-secondary flex items-center gap-2">
                    <FaClock className="w-4 h-4" />
                    Request Refill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaPills className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? "No prescriptions match your current filters. Try adjusting your search or filters."
                : `You don't have any ${activeTab} prescriptions at the moment.`
              }
            </p>
            <button 
              onClick={handleBookConsultation}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <FaPlus className="w-4 h-4" />
              Book Consultation
            </button>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-8 card p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Important Medication Safety Tips</h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>• Always take medications exactly as prescribed by your doctor</p>
                <p>• Never share your medications with others</p>
                <p>• Store medications in a cool, dry place away from children</p>
                <p>• Check expiration dates and dispose of expired medications properly</p>
                <p>• Contact your doctor immediately if you experience any side effects</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Prescription