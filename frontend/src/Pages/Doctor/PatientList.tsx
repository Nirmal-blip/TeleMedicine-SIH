import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaFilter, 
  FaUser, 
  FaCalendar, 
  FaPhone, 
  FaEnvelope,
  FaEye,
  FaVideo,
  FaSort,
  FaUserCircle,
  FaMapMarkerAlt
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";

interface Patient {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: string;
  lastVisit?: string;
  status: 'active' | 'inactive' | 'pending';
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchQuery, statusFilter, sortBy]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${(import.meta as any).env.VITE_BACKEND_URL}/api/patients`, {
        withCredentials: true,
      });
      
      // Transform database patients to match frontend interface
      const transformedPatients: Patient[] = response.data.map((patient: any) => ({
        id: patient._id,
        fullname: patient.fullname || patient.name || 'Unknown Patient',
        email: patient.email || 'No email provided',
        phone: patient.phone || patient.phoneNumber || undefined,
        age: patient.age || undefined,
        gender: patient.gender || undefined,
        address: patient.address || undefined,
        lastVisit: patient.lastVisit || patient.updatedAt || patient.createdAt || new Date().toISOString().split('T')[0],
        status: patient.isActive !== false ? 'active' : 'inactive'
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort patients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullname.localeCompare(b.fullname);
        case 'date':
          return new Date(b.lastVisit || '').getTime() - new Date(a.lastVisit || '').getTime();
        case 'age':
          return (b.age || 0) - (a.age || 0);
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Patient List</h1>
          <p className="text-gray-600">Manage and monitor your patients</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Last Visit</option>
                <option value="age">Sort by Age</option>
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

        {/* Patient Cards */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <FaUserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <div 
                key={patient.id} 
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-fade-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Patient Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{patient.fullname}</h3>
                      <p className="text-sm text-gray-500">{patient.age ? `${patient.age} years` : 'Age not specified'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>

                {/* Patient Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 text-blue-500" />
                    <span>{patient.email}</span>
                  </div>
                  {patient.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <FaPhone className="w-4 h-4 text-green-500" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  )}
                  {patient.lastVisit && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <FaCalendar className="w-4 h-4 text-purple-500" />
                      <span>Last visit: {formatDate(patient.lastVisit)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2 text-sm font-medium">
                    <FaEye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 flex items-center justify-center gap-2 text-sm font-medium">
                    <FaVideo className="w-4 h-4" />
                    Consult
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;
