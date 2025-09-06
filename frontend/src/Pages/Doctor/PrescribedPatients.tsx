import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaFilter, 
  FaPills, 
  FaCalendar, 
  FaUser,
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaDownload,
  FaPrint
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'pending';
  refillsRemaining: number;
  totalRefills: number;
}

interface PrescribedPatient {
  id: string;
  name: string;
  email: string;
  age: number;
  prescriptions: Prescription[];
  lastPrescriptionDate: string;
  activePrescriptions: number;
}

const PrescribedPatients: React.FC = () => {
  const [patients, setPatients] = useState<PrescribedPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PrescribedPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<PrescribedPatient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPrescribedPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery, statusFilter]);

  const fetchPrescribedPatients = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.get('http://localhost:3000/api/doctors/prescribed-patients', {
      //   withCredentials: true,
      // });
      
      // Mock data for demonstration
      const mockData: PrescribedPatient[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          age: 35,
          lastPrescriptionDate: '2024-01-15',
          activePrescriptions: 2,
          prescriptions: [
            {
              id: 'p1',
              patientName: 'John Doe',
              patientId: '1',
              medicine: 'Amoxicillin 500mg',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '7 days',
              instructions: 'Take with food',
              prescribedDate: '2024-01-15',
              status: 'active',
              refillsRemaining: 2,
              totalRefills: 3
            },
            {
              id: 'p2',
              patientName: 'John Doe',
              patientId: '1',
              medicine: 'Ibuprofen 400mg',
              dosage: '400mg',
              frequency: 'As needed',
              duration: '14 days',
              instructions: 'For pain relief',
              prescribedDate: '2024-01-15',
              status: 'active',
              refillsRemaining: 1,
              totalRefills: 2
            }
          ]
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          age: 28,
          lastPrescriptionDate: '2024-01-10',
          activePrescriptions: 1,
          prescriptions: [
            {
              id: 'p3',
              patientName: 'Jane Smith',
              patientId: '2',
              medicine: 'Metformin 500mg',
              dosage: '500mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take with breakfast',
              prescribedDate: '2024-01-10',
              status: 'active',
              refillsRemaining: 5,
              totalRefills: 6
            }
          ]
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@email.com',
          age: 42,
          lastPrescriptionDate: '2023-12-20',
          activePrescriptions: 0,
          prescriptions: [
            {
              id: 'p4',
              patientName: 'Bob Johnson',
              patientId: '3',
              medicine: 'Lisinopril 10mg',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take in morning',
              prescribedDate: '2023-12-20',
              status: 'completed',
              refillsRemaining: 0,
              totalRefills: 3
            }
          ]
        }
      ];
      
      setPatients(mockData);
    } catch (error) {
      console.error('Failed to fetch prescribed patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = patient.activePrescriptions > 0;
      } else if (statusFilter === 'completed') {
        matchesStatus = patient.activePrescriptions === 0;
      }
      
      return matchesSearch && matchesStatus;
    });

    setFilteredPatients(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'completed':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'pending':
        return <FaClock className="w-4 h-4" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Prescribed Patients</h1>
          <p className="text-gray-600">Monitor patients with active prescriptions and medication compliance</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Patients</option>
                <option value="active">Active Prescriptions</option>
                <option value="completed">Completed Prescriptions</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-emerald-50 rounded-xl px-4 py-3">
              <span className="text-emerald-700 font-medium">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Patients List */}
          <div className="xl:col-span-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <FaPills className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No patients found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer animate-fade-scale ${
                      selectedPatient?.id === patient.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    {/* Patient Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <FaUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{patient.name}</h3>
                          <p className="text-sm text-gray-500">{patient.age} years • {patient.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <FaPills className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-blue-600">{patient.activePrescriptions}</span>
                          <span className="text-sm text-gray-600">active</span>
                        </div>
                        <p className="text-xs text-gray-500">Last: {formatDate(patient.lastPrescriptionDate)}</p>
                      </div>
                    </div>

                    {/* Prescriptions Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patient.prescriptions.slice(0, 2).map((prescription) => (
                        <div key={prescription.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800 text-sm">{prescription.medicine}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(prescription.status)}`}>
                              {getStatusIcon(prescription.status)}
                              {prescription.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{prescription.dosage} • {prescription.frequency}</p>
                          <p className="text-xs text-gray-500">Refills: {prescription.refillsRemaining}/{prescription.totalRefills}</p>
                        </div>
                      ))}
                    </div>

                    {patient.prescriptions.length > 2 && (
                      <p className="text-sm text-blue-600 mt-4 font-medium">
                        +{patient.prescriptions.length - 2} more prescription{patient.prescriptions.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Details Panel */}
          <div className="space-y-6">
            {selectedPatient ? (
              <>
                {/* Patient Info */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Patient Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Prescriptions</p>
                      <p className="font-medium">{selectedPatient.activePrescriptions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Prescription</p>
                      <p className="font-medium">{formatDate(selectedPatient.lastPrescriptionDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">All Prescriptions</h3>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <FaPrint className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedPatient.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-800">{prescription.medicine}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            {prescription.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Dosage</p>
                            <p className="font-medium">{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Frequency</p>
                            <p className="font-medium">{prescription.frequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">{prescription.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Refills</p>
                            <p className="font-medium">{prescription.refillsRemaining}/{prescription.totalRefills}</p>
                          </div>
                        </div>
                        {prescription.instructions && (
                          <div className="mt-3">
                            <p className="text-gray-500 text-sm">Instructions</p>
                            <p className="text-sm">{prescription.instructions}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Prescribed: {formatDate(prescription.prescribedDate)}
                          </p>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-700 transition-colors">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-700 transition-colors">
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2">
                      <FaPills className="w-4 h-4" />
                      New Prescription
                    </button>
                    <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 flex items-center gap-2">
                      <FaCalendar className="w-4 h-4" />
                      Schedule Follow-up
                    </button>
                    <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2">
                      <FaEye className="w-4 h-4" />
                      View Full History
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                <FaPills className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Patient</h3>
                <p className="text-gray-500 text-sm">Click on a patient to view their prescription details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrescribedPatients;
