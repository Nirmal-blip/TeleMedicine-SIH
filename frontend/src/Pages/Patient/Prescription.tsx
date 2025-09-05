import React, { useState } from 'react'
import Sidebar from "../../Components/Sidebar"
import PatientHeader from '../../Components/PatientHeader'
import { FiFileText, FiCalendar, FiUser, FiDownload, FiEye, FiFilter, FiSearch, FiPackage } from 'react-icons/fi'

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
          instructions: "Take with food to avoid stomach upset"
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
      diagnosis: "Eczema Treatment",
      medications: [
        {
          name: "Hydrocortisone Cream",
          dosage: "1%",
          frequency: "Twice daily",
          duration: "14 days",
          instructions: "Apply thin layer to affected areas"
        }
      ],
      status: "Completed",
      consultationFee: 120
    },
    {
      id: 3,
      prescriptionNumber: "RX-2024-003",
      doctorName: "Dr. Emily Rodriguez",
      specialization: "General Medicine",
      date: "2024-01-20",
      diagnosis: "Bacterial Infection",
      medications: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "Three times daily",
          duration: "7 days",
          instructions: "Take with food. Complete full course"
        }
      ],
      status: "Active",
      refillsRemaining: 0,
      consultationFee: 100
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'active') return prescription.status === 'Active' && matchesSearch;
    if (activeTab === 'completed') return prescription.status === 'Completed' && matchesSearch;
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
              <p className="text-gray-600">Track your medications and prescription history</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors">
                <FiFilter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                <FiDownload className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Prescriptions</h3>
                  <p className="text-3xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">
                    {prescriptions.filter(p => p.status === 'Active').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <FiPackage className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    {prescriptions.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Records</h3>
                  <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">{prescriptions.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                  <FiUser className="w-7 h-7 text-white" />
                </div>
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
                  placeholder="Search prescriptions..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'active'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'completed'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-6">
            {filteredPrescriptions.map(prescription => (
              <div key={prescription.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <FiFileText className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{prescription.prescriptionNumber}</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                            {prescription.status}
                          </div>
                        </div>
                        <p className="text-emerald-600 font-medium mb-1">{prescription.doctorName}</p>
                        <p className="text-gray-600 text-sm">{prescription.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-gray-600 text-sm mb-1">Date: {new Date(prescription.date).toLocaleDateString()}</p>
                      {prescription.refillsRemaining !== undefined && (
                        <p className="text-gray-600 text-sm">Refills: {prescription.refillsRemaining}</p>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                    <p className="text-gray-700">{prescription.diagnosis}</p>
                  </div>

                  {/* Medications */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Medications</h4>
                    <div className="space-y-3">
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <p className="font-semibold text-gray-800">{medication.name}</p>
                              <p className="text-sm text-gray-600">{medication.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Frequency</p>
                              <p className="font-medium text-gray-800">{medication.frequency}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Duration</p>
                              <p className="font-medium text-gray-800">{medication.duration}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Instructions</p>
                              <p className="font-medium text-gray-800 text-sm">{medication.instructions || 'As prescribed'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2">
                      <FiEye />
                      View Details
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                      <FiDownload />
                      Download PDF
                    </button>
                    {prescription.status === 'Active' && prescription.refillsRemaining && prescription.refillsRemaining > 0 && (
                      <button className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-all duration-300">
                        Request Refill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPrescriptions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
              <p className="text-gray-600 mb-6">You don't have any {activeTab} prescriptions</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Prescription
