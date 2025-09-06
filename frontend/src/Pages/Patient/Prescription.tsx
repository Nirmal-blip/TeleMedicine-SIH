import React, { useState } from 'react'
import Sidebar from "../../Components/Sidebar"
import { FaFileExport, FaCalendar, FaUser, FaDownload, FaEye, FaFilter, FaSearch, FaClock, FaCheckCircle, FaExclamationTriangle, FaPills, FaStethoscope, FaHeart, FaFileAlt } from 'react-icons/fa'
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
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');

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
    const matchesTab = activeTab === 'all' || prescription.status.toLowerCase() === activeTab;
    const matchesSearch = prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaFileAlt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">My Prescriptions</h1>
              <p className="text-gray-600">Manage your medications and prescriptions</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search prescriptions by doctor, diagnosis, or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: 'active', label: 'Active', count: prescriptions.filter(p => p.status === 'Active').length },
              { key: 'completed', label: 'Completed', count: prescriptions.filter(p => p.status === 'Completed').length },
              { key: 'all', label: 'All', count: prescriptions.length }
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
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileAlt className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
            <p className="text-gray-600 mb-6">You don't have any {activeTab} prescriptions at the moment.</p>
            <button className="btn-primary">
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