import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaFilter, 
  FaCalendar, 
  FaUser,
  FaEye,
  FaFileAlt,
  FaVideo,
  FaClock,
  FaStethoscope,
  FaDownload,
  FaPrint,
  FaStar,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import DoctorSidebar from "../../Components/DoctorSidebar";

interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  consultationType: 'video' | 'in-person' | 'phone';
  date: string;
  duration: number;
  diagnosis: string;
  prescription?: string;
  notes: string;
  rating?: number;
  status: 'completed' | 'scheduled' | 'cancelled';
  followUpRequired: boolean;
  nextAppointment?: string;
}

const ConsultationHistory: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchQuery, dateFilter, typeFilter]);

  const fetchConsultationHistory = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.get('http://localhost:3000/api/doctors/consultation-history', {
      //   withCredentials: true,
      // });
      
      // Mock data for demonstration
      const mockData: Consultation[] = [
        {
          id: '1',
          patientName: 'John Doe',
          patientId: 'p1',
          patientAge: 35,
          consultationType: 'video',
          date: '2024-01-15T10:30:00Z',
          duration: 30,
          diagnosis: 'Common Cold',
          prescription: 'Amoxicillin 500mg, Ibuprofen 400mg',
          notes: 'Patient presented with cold symptoms. Prescribed antibiotics and pain relief.',
          rating: 5,
          status: 'completed',
          followUpRequired: true,
          nextAppointment: '2024-01-22T10:30:00Z'
        },
        {
          id: '2',
          patientName: 'Jane Smith',
          patientId: 'p2',
          patientAge: 28,
          consultationType: 'in-person',
          date: '2024-01-14T14:00:00Z',
          duration: 45,
          diagnosis: 'Hypertension Follow-up',
          prescription: 'Metformin 500mg',
          notes: 'Blood pressure stable. Continue current medication.',
          rating: 4,
          status: 'completed',
          followUpRequired: true,
          nextAppointment: '2024-02-14T14:00:00Z'
        },
        {
          id: '3',
          patientName: 'Bob Johnson',
          patientId: 'p3',
          patientAge: 42,
          consultationType: 'video',
          date: '2024-01-13T09:15:00Z',
          duration: 25,
          diagnosis: 'Annual Check-up',
          notes: 'Routine annual health check. All parameters normal.',
          status: 'completed',
          followUpRequired: false,
          rating: 5
        },
        {
          id: '4',
          patientName: 'Alice Brown',
          patientId: 'p4',
          patientAge: 31,
          consultationType: 'phone',
          date: '2024-01-12T16:30:00Z',
          duration: 15,
          diagnosis: 'Prescription Refill',
          prescription: 'Birth Control Pills',
          notes: 'Routine prescription refill. No issues reported.',
          status: 'completed',
          followUpRequired: false,
          rating: 4
        },
        {
          id: '5',
          patientName: 'Mike Wilson',
          patientId: 'p5',
          patientAge: 55,
          consultationType: 'video',
          date: '2024-01-11T11:00:00Z',
          duration: 40,
          diagnosis: 'Diabetes Management',
          prescription: 'Insulin adjustment',
          notes: 'Adjusted insulin dosage based on recent blood sugar readings.',
          status: 'completed',
          followUpRequired: true,
          nextAppointment: '2024-01-25T11:00:00Z',
          rating: 5
        }
      ];
      
      setConsultations(mockData);
    } catch (error) {
      console.error('Failed to fetch consultation history:', error);
      setConsultations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = consultations.filter(consultation => {
      const matchesSearch = consultation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           consultation.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDate = true;
      const consultationDate = new Date(consultation.date);
      const now = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = consultationDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = consultationDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = consultationDate >= monthAgo;
      }
      
      const matchesType = typeFilter === 'all' || consultation.consultationType === typeFilter;
      
      return matchesSearch && matchesDate && matchesType;
    });

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredConsultations(filtered);
    setCurrentPage(1);
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FaVideo className="w-4 h-4" />;
      case 'phone':
        return <FaClock className="w-4 h-4" />;
      case 'in-person':
        return <FaStethoscope className="w-4 h-4" />;
      default:
        return <FaStethoscope className="w-4 h-4" />;
    }
  };

  const getConsultationTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'phone':
        return 'bg-green-100 text-green-800';
      case 'in-person':
        return 'bg-purple-100 text-purple-800';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Pagination
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsultations = filteredConsultations.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DoctorSidebar />
      <main className="lg:ml-80 px-4 lg:px-8 xl:px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-secondary">Consultation History</h1>
          <p className="text-gray-600">Review your past consultations and patient interactions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search consultations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="video">Video Call</option>
                <option value="in-person">In-Person</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-emerald-50 rounded-xl px-4 py-3">
              <span className="text-emerald-700 font-medium">
                {filteredConsultations.length} consultation{filteredConsultations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Consultations List */}
          <div className="xl:col-span-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading consultations...</p>
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <FaStethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No consultations found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentConsultations.map((consultation, index) => (
                    <div 
                      key={consultation.id} 
                        className={`bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer animate-fade-scale ${
                        selectedConsultation?.id === consultation.id ? 'ring-2 ring-emerald-500' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedConsultation(consultation)}
                    >
                      {/* Consultation Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                            <FaUser className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{consultation.patientName}</h3>
                            <p className="text-sm text-gray-500">{consultation.patientAge} years</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{formatDate(consultation.date)}</p>
                          <p className="text-sm text-gray-500">{formatTime(consultation.date)}</p>
                        </div>
                      </div>

                      {/* Consultation Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getConsultationTypeColor(consultation.consultationType)}`}>
                            {getConsultationTypeIcon(consultation.consultationType)}
                            {consultation.consultationType.charAt(0).toUpperCase() + consultation.consultationType.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{consultation.duration} minutes</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-1">Diagnosis</h4>
                        <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                      </div>

                      {consultation.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-600">Patient Rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(consultation.rating)}
                          </div>
                        </div>
                      )}

                      {consultation.followUpRequired && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <p className="text-sm text-yellow-800 font-medium">Follow-up required</p>
                          {consultation.nextAppointment && (
                            <p className="text-xs text-yellow-700">
                              Next: {formatDate(consultation.nextAppointment)} at {formatTime(consultation.nextAppointment)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 bg-white rounded-3xl shadow-lg p-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Consultation Details Panel */}
          <div className="space-y-6">
            {selectedConsultation ? (
              <>
                {/* Consultation Info */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Consultation Details</h3>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <FaPrint className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient</p>
                      <p className="font-medium">{selectedConsultation.patientName} ({selectedConsultation.patientAge} years)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{formatDate(selectedConsultation.date)} at {formatTime(selectedConsultation.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getConsultationTypeColor(selectedConsultation.consultationType)}`}>
                        {getConsultationTypeIcon(selectedConsultation.consultationType)}
                        {selectedConsultation.consultationType.charAt(0).toUpperCase() + selectedConsultation.consultationType.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{selectedConsultation.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diagnosis</p>
                      <p className="font-medium">{selectedConsultation.diagnosis}</p>
                    </div>
                    {selectedConsultation.prescription && (
                      <div>
                        <p className="text-sm text-gray-500">Prescription</p>
                        <p className="font-medium">{selectedConsultation.prescription}</p>
                      </div>
                    )}
                    {selectedConsultation.rating && (
                      <div>
                        <p className="text-sm text-gray-500">Patient Rating</p>
                        <div className="flex items-center gap-1">
                          {renderStars(selectedConsultation.rating)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Clinical Notes</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedConsultation.notes}</p>
                  </div>
                </div>

                {/* Follow-up */}
                {selectedConsultation.followUpRequired && (
                  <div className="bg-white rounded-3xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Follow-up</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-yellow-800 font-medium mb-2">Follow-up required</p>
                      {selectedConsultation.nextAppointment ? (
                        <p className="text-yellow-700 text-sm">
                          Next appointment: {formatDate(selectedConsultation.nextAppointment)} at {formatTime(selectedConsultation.nextAppointment)}
                        </p>
                      ) : (
                        <p className="text-yellow-700 text-sm">Follow-up appointment needs to be scheduled</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2">
                      <FaVideo className="w-4 h-4" />
                      Schedule Follow-up
                    </button>
                    <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 flex items-center gap-2">
                      <FaFileAlt className="w-4 h-4" />
                      Edit Notes
                    </button>
                    <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2">
                      <FaUser className="w-4 h-4" />
                      View Patient Profile
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                <FaStethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Consultation</h3>
                <p className="text-gray-500 text-sm">Click on a consultation to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultationHistory;
