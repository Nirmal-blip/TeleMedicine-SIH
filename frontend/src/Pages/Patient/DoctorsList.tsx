import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import AppointmentBooking from '../../Components/AppointmentBooking'
import { FaSearch, FaFilter, FaStar, FaClock, FaVideo, FaMapPin, FaCalendar, FaUser, FaStethoscope, FaHeart, FaPhone, FaEnvelope, FaUserMd } from 'react-icons/fa'
import axios from 'axios'
import { getNotificationService } from '../../utils/real-time-notifications'
import { VideoCallService, initializeVideoCallService } from '../../utils/video-call'

interface Doctor {
  _id: string;
  doctorId: string;
  fullname: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  location: string;
  medicalRegNo: string;
  specialization: string;
  password?: string;
  profileImage?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  about?: string;
  rating?: number;
  totalRatings?: number;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Frontend display fields (computed)
  id: string;
  name: string;
  totalPatients: number;
  languages: string[];
  education: string;
  hospital: string;
  image: string;
  bio: string;
}

const DoctorsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'rating' | 'fee'>('rating');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Extract specialization from URL if provided
  useEffect(() => {
    const urlSpecialization = searchParams.get('specialization');
    if (urlSpecialization) {
      setSelectedSpecialization(urlSpecialization);
    }
  }, [searchParams]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [videoCallService, setVideoCallService] = useState<VideoCallService | null>(null);
  const [isCallingDoctor, setIsCallingDoctor] = useState<string | null>(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'requesting' | 'waiting' | 'accepted' | 'rejected'>('idle');

  useEffect(() => {
    fetchDoctors();
    initializeVideoCall();
    
    // Cleanup
    return () => {
      if (videoCallService) {
        videoCallService.disconnect();
      }
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      let patientId: string | null = null;
      
      // Try to get patient ID from localStorage/sessionStorage first
      const storedPatientId = localStorage.getItem('patientId') || sessionStorage.getItem('patientId') || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      console.log('🔥 PATIENT: Trying stored patient ID:', storedPatientId);
      
      if (storedPatientId) {
        patientId = storedPatientId;
      } else {
        // Fallback: try API
        try {
          const response = await axios.get('https://telemedicine-sih-8i5h.onrender.com/api/patients/me', {
            withCredentials: true
          });
          patientId = response.data._id || response.data.id;
          console.log('🔥 PATIENT: Got patient ID from API:', patientId);
        } catch (apiError) {
          console.log('🔥 PATIENT: API failed, using test patient ID');
          // For testing: use a hardcoded patient ID
          patientId = '68bb0972d6ac0c5ddcba5ec8'; // Prithviraj Verma's MongoDB ObjectId
        }
      }
      
      if (!patientId) {
        console.error('❌ PATIENT: No patient ID found');
        return;
      }
      
      console.log('🔥 PATIENT: Initializing video call service with ID:', patientId);
      const service = initializeVideoCallService(patientId, 'patient');
      setVideoCallService(service);
      
      // Set up event listeners
      service.onCallRequestSent((data) => {
        console.log('🔥 PATIENT: Call request sent:', data);
        setCallStatus('waiting');
      });
      
      service.onCallAccepted((data) => {
        console.log('🔥 PATIENT: Call accepted:', data);
        setCallStatus('accepted');
        setShowVideoCallModal(false);
        // Navigate to video call page
        navigate(`/patient/video-call/${data.callId}`);
      });
      
      service.onCallRejected((data) => {
        console.log('🔥 PATIENT: Call rejected:', data);
        setCallStatus('rejected');
        setTimeout(() => {
          setShowVideoCallModal(false);
          setCallStatus('idle');
          setIsCallingDoctor(null);
        }, 3000);
      });
      
      service.onCallError((data) => {
        console.error('🔥 PATIENT: Call error:', data);
        // Don't show alert for minor errors, just log them
        setCallStatus('idle');
        setShowVideoCallModal(false);
        setIsCallingDoctor(null);
      });
      
    } catch (error) {
      console.error('Failed to initialize video call service:', error);
    }
  };


  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://telemedicine-sih-8i5h.onrender.com/api/doctors', {
        withCredentials: true
      });
      
      // Transform the database doctors to match frontend interface
      const transformedDoctors: Doctor[] = response.data.map((doctor: any, index: number) => ({
        // Keep all original schema fields
        _id: doctor._id,
        doctorId: doctor.doctorId,
        fullname: doctor.fullname,
        email: doctor.email,
        phone: doctor.phone,
        dateOfBirth: doctor.dateOfBirth,
        gender: doctor.gender,
        location: doctor.location,
        medicalRegNo: doctor.medicalRegNo,
        specialization: doctor.specialization,
        profileImage: doctor.profileImage,
        qualification: doctor.qualification,
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee || 100,
        about: doctor.about,
        rating: doctor.rating || 4.5,
        totalRatings: doctor.totalRatings || 0,
        isVerified: doctor.isVerified || false,
        lastLogin: doctor.lastLogin,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
        // Computed frontend display fields
        id: doctor._id,
        name: doctor.fullname,
        totalPatients: doctor.totalRatings || 0,
        languages: ["English"], // Default for now
        education: doctor.qualification || "Medical Degree",
        hospital: doctor.location || "Medical Center",
        image: doctor.profileImage || `user1.jpg`,
        bio: doctor.about || `Experienced ${doctor.specialization} with ${doctor.experience || 0} years of practice.`
      }));
      
      setDoctors(transformedDoctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const getDoctorImageId = (index: number) => {
    const imageIds = [
      '559839734-2b71ea197ec2',
      '612349317150-e413f6a5b16d',
      '594824373639-9b5b4b8b8b8b',
      '1582750433-7c75a6da9b21',
      '1559757148-5c350d0d426c'
    ];
    return imageIds[index % imageIds.length];
  };

  // Add loading and error handling to the JSX
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar />
        <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Doctors</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchDoctors}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const specializations = ['all', ...Array.from(new Set(doctors.map(d => d.specialization)))];

  const filteredDoctors = doctors
    .filter(doctor => 
      doctor.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(doctor => 
      selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'fee') return (a.consultationFee || 0) - (b.consultationFee || 0);
      if (sortBy === 'name') return a.fullname.localeCompare(b.fullname);
      return 0;
    });

  const openModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const openBookingModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleBookingSuccess = (appointmentId: string) => {
    alert(`Appointment booked successfully! Appointment ID: ${appointmentId}`);
    // You could navigate to appointments page or show a success message
  };

  const startVideoCall = async (doctor: Doctor) => {
    if (!videoCallService) {
      alert('Video call service not initialized. Please refresh the page.');
      return;
    }

    try {
      setIsCallingDoctor(doctor.doctorId);
      setSelectedDoctor(doctor);
      setCallStatus('requesting');
      setShowVideoCallModal(true);
      
      // Get current user info
      const response = await axios.get('https://telemedicine-sih-8i5h.onrender.com/api/auth/me', {
        withCredentials: true
      });
      console.log(response)
      
      const patientName = response.data.user.fullname || 'Patient';
      console.log('🔥 PATIENT: Starting video call with doctor:', doctor.fullname);
      console.log('🔥 PATIENT: Patient name:', patientName);

      // First, create an immediate consultation appointment
      try {
        const patientResponse = await axios.get('https://telemedicine-sih-8i5h.onrender.com/api/patients/me', {
          withCredentials: true
        });
        
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

        const appointmentResponse = await axios.post('https://telemedicine-sih-8i5h.onrender.com/api/appointments', {
          doctor: doctor.doctorId,
          patient: patientResponse.data.patientId,
          date: currentDate,
          time: currentTime,
          reason: 'Immediate Video Consultation',
          status: 'Confirmed'
        }, {
          withCredentials: true
        });

        console.log('🔥 PATIENT: Immediate consultation booked:', appointmentResponse.data);
        
        // Store appointment data for reference
        localStorage.setItem('activeAppointment', JSON.stringify({
          appointmentId: appointmentResponse.data._id,
          doctorId: doctor.doctorId,
          doctorName: doctor.fullname,
        }));
        
      } catch (appointmentError) {
        console.error('Failed to create appointment:', appointmentError);
        // Continue with video call even if appointment creation fails
      }
      
      // Request video call
      console.log('🔥 PATIENT: About to request video call with doctor:', {
        doctorId: doctor._id,
        doctorName: doctor.fullname,
        patientName: patientName,
        specialization: doctor.specialization
      });
      
      console.log('🔥 PATIENT: Video call service status:', {
        service: !!videoCallService,
        connected: videoCallService?.isServiceConnected()
      });
      
      if (!videoCallService) {
        alert('Video call service not initialized! Please refresh the page.');
        return;
      }
      
      if (!videoCallService.isServiceConnected()) {
        alert('Video call service not connected! Please check your internet connection.');
        return;
      }
      
      const callResult = videoCallService.requestVideoCall({
        doctorId: doctor._id,
        doctorName: doctor.fullname,
        patientName: patientName,
        specialization: doctor.specialization
      });
      
      console.log('🔥 PATIENT: Video call request result:', callResult);
      
      if (callResult) {
        alert(`Video call request sent to Dr. ${doctor.fullname}! Call ID: ${callResult}`);
      } else {
        alert('Failed to send video call request!');
      }
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call. Please try again.');
      setCallStatus('idle');
      setShowVideoCallModal(false);
      setIsCallingDoctor(null);
    }
  };

  const cancelVideoCall = () => {
    setShowVideoCallModal(false);
    setCallStatus('idle');
    setIsCallingDoctor(null);
    setSelectedDoctor(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        <div className="">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
          <p className="text-gray-600 mb-8">Connect with verified healthcare professionals</p>

          {/* Search and Filter Section */}
          <div className="bg-emerald-100/30 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 z-50 transform -translate-y-1/2 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search by doctor name, specialization, or hospital..."
                  className="bg-transparent w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-300 text-gray-800 placeholder-emerald-500 outline-emerald-700 transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all duration-300 shadow-lg"
              >
                <FaFilter />
                Filters
              </button>
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Specialization Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
                  </div>
              
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="rating">Highest Rated</option>
                      <option value="experience">Most Experience</option>
                      <option value="fee">Lowest Fee</option>
                      <option value="name">Name (A-Z)</option>
              </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600">
                      Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
            </div>
          </div>
              </div>
            )}
        </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                    className="w-full h-64 object-cover"
                  />
                  </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.fullname}</h3>
                  <p className="text-emerald-600 font-medium mb-2">{doctor.specialization}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="text-sm font-medium">{doctor.rating || 4.5}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="text-gray-400" />
                      <span className="text-sm text-gray-600">{doctor.totalRatings || 0}+ ratings</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <FaStethoscope className="text-gray-400" />
                      <span className="text-sm text-gray-600">{doctor.experience || 0} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapPin className="text-gray-400" />
                      <span className="text-sm text-gray-600">{doctor.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">₹{doctor.consultationFee || 100}</span>
                        <span className="text-sm text-gray-500"> /consultation</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startVideoCall(doctor)}
                        disabled={isCallingDoctor === doctor.doctorId}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        <FaVideo className="text-xs" />
                        {isCallingDoctor === doctor.doctorId ? 'Calling...' : 'Start Video Call'}
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
          {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-16">
              <FaUserMd className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>

        {/* Doctor Detail Modal */}
        {isModalOpen && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Profile</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedDoctor.fullname}</h3>
                    <p className="text-emerald-600 font-medium mb-2">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        <span className="font-medium">{selectedDoctor.rating || 4.5}</span>
                      </div>
                      <span className="text-gray-600">{selectedDoctor.totalRatings || 0}+ ratings</span>
                    </div>
                    <p className="text-gray-600">{selectedDoctor.qualification || 'Medical Degree'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                    <p className="text-gray-600">{selectedDoctor.experience || 0} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Location</h4>
                    <p className="text-gray-600">{selectedDoctor.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Medical Reg. No.</h4>
                    <p className="text-gray-600">{selectedDoctor.medicalRegNo}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Consultation Fee</h4>
                    <p className="text-emerald-600 font-bold text-xl">₹{selectedDoctor.consultationFee || 100}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                  <p className="text-gray-600">{selectedDoctor.about || `Experienced ${selectedDoctor.specialization} specialist.`}</p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      closeModal();
                      openBookingModal(selectedDoctor);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300"
                  >
                    <FaVideo />
                    Book Video Consultation
                  </button>
                  <button 
                    onClick={() => {
                      closeModal();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                  >
                    <FaPhone />
                    Contact Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Booking Modal */}
        {isBookingModalOpen && selectedDoctor && (
          <AppointmentBooking
            doctor={selectedDoctor}
            isOpen={isBookingModalOpen}
            onClose={closeBookingModal}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {/* Video Call Modal */}
        {showVideoCallModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
              <div className="mb-4">
                <img 
                  src={selectedDoctor.image} 
                  alt={selectedDoctor.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedDoctor.fullname}</h3>
                <p className="text-emerald-600 font-medium">{selectedDoctor.specialization}</p>
              </div>

              {callStatus === 'requesting' && (
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Sending call request...</p>
                </div>
              )}

              {callStatus === 'waiting' && (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="animate-pulse bg-blue-600 rounded-full h-4 w-4 mx-1"></div>
                    <div className="animate-pulse bg-blue-600 rounded-full h-4 w-4 mx-1" style={{animationDelay: '0.2s'}}></div>
                    <div className="animate-pulse bg-blue-600 rounded-full h-4 w-4 mx-1" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <p className="text-gray-800 font-medium">Calling Dr. {selectedDoctor.fullname}...</p>
                  <p className="text-gray-600 text-sm mt-2">Waiting for the doctor to respond</p>
                </div>
              )}

              {callStatus === 'accepted' && (
                <div className="mb-6">
                  <div className="text-green-600 text-4xl mb-4">✅</div>
                  <p className="text-green-600 font-medium">Call Accepted!</p>
                  <p className="text-gray-600 text-sm">Joining video call...</p>
                </div>
              )}

              {callStatus === 'rejected' && (
                <div className="mb-6">
                  <div className="text-red-600 text-4xl mb-4">❌</div>
                  <p className="text-red-600 font-medium">Call Declined</p>
                  <p className="text-gray-600 text-sm">Dr. {selectedDoctor.fullname} is not available right now</p>
                  <p className="text-gray-500 text-xs mt-2">Try booking an appointment instead</p>
                </div>
              )}

              <div className="flex gap-3">
                {callStatus === 'waiting' && (
                  <button
                    onClick={cancelVideoCall}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel Call
                  </button>
                )}
                
                {(callStatus === 'rejected' || callStatus === 'requesting') && (
                  <>
                    <button
                      onClick={cancelVideoCall}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                    >
                      Close
                    </button>
                    {callStatus === 'rejected' && (
            <button 
              onClick={() => {
                          cancelVideoCall();
                          openBookingModal(selectedDoctor);
              }}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300"
            >
                        Book Appointment
            </button>
                    )}
                  </>
                )}
              </div>

              {callStatus === 'waiting' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> The doctor will receive a notification and can join the call
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DoctorsList;