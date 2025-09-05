import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
import { FiSearch, FiStar, FiMapPin, FiClock, FiUser, FiPhone, FiMail, FiCalendar, FiX } from 'react-icons/fi'

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  rating: number;
  experience: number;
  location: string;
  consultationFee: number;
  availability: string;
  image: string;
  isVerified: boolean;
  phone?: string;
  email?: string;
  education?: string;
  description?: string;
  languages?: string[];
}

const DoctorsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      rating: 4.8,
      experience: 12,
      location: "New York, NY",
      consultationFee: 150,
      availability: "Available Now",
      image: "/api/placeholder/150/150",
      isVerified: true,
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@telemedicine.com",
      education: "MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic",
      description: "Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating heart conditions. She specializes in preventive cardiology and heart disease management.",
      languages: ["English", "Spanish"]
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Dermatologist", 
      rating: 4.9,
      experience: 8,
      location: "Los Angeles, CA",
      consultationFee: 120,
      availability: "Available at 2:00 PM",
      image: "/api/placeholder/150/150",
      isVerified: true,
      phone: "+1 (555) 234-5678",
      email: "michael.chen@telemedicine.com",
      education: "MD from UCLA, Dermatology Residency at Stanford",
      description: "Dr. Michael Chen is a skilled dermatologist specializing in skin cancer detection, acne treatment, and cosmetic dermatology procedures.",
      languages: ["English", "Mandarin"]
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      rating: 4.7,
      experience: 15,
      location: "Chicago, IL",
      consultationFee: 100,
      availability: "Available Tomorrow",
      image: "/api/placeholder/150/150",
      isVerified: true,
      phone: "+1 (555) 345-6789",
      email: "emily.rodriguez@telemedicine.com",
      education: "MD from Northwestern University, Pediatrics Residency at Children's Hospital",
      description: "Dr. Emily Rodriguez is a compassionate pediatrician with 15 years of experience caring for children from infancy through adolescence.",
      languages: ["English", "Spanish", "Portuguese"]
    },
    {
      id: 4,
      name: "Dr. David Kumar",
      specialization: "Neurologist",
      rating: 4.8,
      experience: 20,
      location: "Houston, TX",
      consultationFee: 200,
      availability: "Available Now",
      image: "/api/placeholder/150/150",
      isVerified: true,
      phone: "+1 (555) 456-7890",
      email: "david.kumar@telemedicine.com",
      education: "MD from Baylor College of Medicine, Neurology Residency at Johns Hopkins",
      description: "Dr. David Kumar is a renowned neurologist specializing in stroke treatment, epilepsy management, and movement disorders.",
      languages: ["English", "Hindi", "Telugu"]
    }
  ];

  const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'General Medicine'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowProfile(true);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    // Here you would normally make an API call to book the appointment
    alert(`Appointment booked with ${selectedDoctor?.name}!`);
    setShowBookingModal(false);
    setSelectedDoctor(null);
    // Optionally navigate to appointments page
    navigate('/appointments');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-cyan-50 relative poppins">
      <Sidebar />
      <main className="relative z-10 flex-1 p-6 overflow-y-auto">
        <PatientHeader />
        
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Your Doctor</h1>
          
          {/* Search and Filter Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialization..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Specialization Filter */}
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 overflow-hidden hover:transform hover:scale-[1.02]">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    {/* Doctor Image */}
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-10 h-10 text-emerald-600" />
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                        {doctor.isVerified && (
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-emerald-600 font-medium mb-2">{doctor.specialization}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FiStar className="text-yellow-500 w-4 h-4" />
                          <span className="font-medium">{doctor.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-400 w-4 h-4" />
                          <span>{doctor.experience} years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-gray-400 w-4 h-4" />
                          <span>{doctor.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm">
                          <span className="text-gray-600">Consultation Fee:</span>
                          <span className="font-semibold text-gray-800 ml-2 text-lg">${doctor.consultationFee}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                          doctor.availability.includes('Now') 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {doctor.availability}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <button 
                          onClick={() => handleBookAppointment(doctor)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          Book Appointment
                        </button>
                        <button 
                          onClick={() => handleViewProfile(doctor)}
                          className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:border-emerald-300 hover:text-emerald-600"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Doctor Profile Modal */}
      {showProfile && selectedDoctor && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 from-opacity-10 via-transparent to-green-50 to-opacity-10 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-85 backdrop-blur-3xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white border-opacity-60 relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-emerald-50 before:via-transparent before:to-cyan-50 before:opacity-30 before:pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white from-opacity-20 to-transparent rounded-3xl pointer-events-none"></div>
            <div className="relative p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-800">{selectedDoctor.name}</h2>
                      {selectedDoctor.isVerified && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-emerald-600 font-semibold text-lg">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiStar className="text-yellow-500 w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{selectedDoctor.rating}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiClock className="text-emerald-500 w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{selectedDoctor.experience}</p>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-cyan-500 text-xl">$</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{selectedDoctor.consultationFee}</p>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiPhone className="w-5 h-5" />
                    <span>{selectedDoctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiMail className="w-5 h-5" />
                    <span>{selectedDoctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiMapPin className="w-5 h-5" />
                    <span>{selectedDoctor.location}</span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Education & Qualifications</h3>
                <p className="text-gray-600 leading-relaxed">{selectedDoctor.education}</p>
              </div>

              {/* About */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedDoctor.description}</p>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Languages</h3>
                <div className="flex gap-2">
                  {selectedDoctor.languages?.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    handleBookAppointment(selectedDoctor);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 from-opacity-10 via-transparent to-green-50 to-opacity-10 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-85 backdrop-blur-3xl rounded-3xl max-w-md w-full shadow-2xl border border-white border-opacity-60 relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-emerald-50 before:via-transparent before:to-cyan-50 before:opacity-30 before:pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white from-opacity-20 to-transparent rounded-3xl pointer-events-none"></div>
            <div className="relative p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
                    <p className="text-emerald-600 text-sm">{selectedDoctor.specialization}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Consultation Fee:</span>
                    <p className="font-semibold text-gray-800">${selectedDoctor.consultationFee}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Availability:</span>
                    <p className="font-semibold text-gray-800">{selectedDoctor.availability}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for consultation
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmBooking}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorsList
