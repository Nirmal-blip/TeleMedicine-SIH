import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import { FaSearch, FaFilter, FaStar, FaClock, FaVideo, FaMapPin, FaCalendar, FaUser, FaStethoscope, FaHeart, FaPhone, FaEnvelope, FaUserMd } from 'react-icons/fa'

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  totalPatients: number;
  consultationFee: number;
  availability: string;
  nextAvailable: string;
  languages: string[];
  education: string;
  hospital: string;
  image: string;
  bio: string;
  isOnline: boolean;
}

const DoctorsList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize search from URL parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlSpecialization = searchParams.get('specialization');
    
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    
    if (urlSpecialization) {
      setSelectedSpecialization(urlSpecialization);
    }
  }, [searchParams]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      experience: 12,
      rating: 4.9,
      totalPatients: 1250,
      consultationFee: 150,
      availability: "Available Today",
      nextAvailable: "2:00 PM",
      languages: ["English", "Spanish"],
      education: "MD, Harvard Medical School",
      hospital: "City General Hospital",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Specialized in cardiovascular diseases with over 12 years of experience.",
      isOnline: true
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Dermatologist",
      experience: 8,
      rating: 4.8,
      totalPatients: 890,
      consultationFee: 120,
      availability: "Available Tomorrow",
      nextAvailable: "10:00 AM",
      languages: ["English", "Mandarin"],
      education: "MD, Stanford University",
      hospital: "Skin Care Clinic",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Expert in dermatology and cosmetic procedures.",
      isOnline: false
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrician",
      experience: 15,
      rating: 4.9,
      totalPatients: 2100,
      consultationFee: 100,
      availability: "Available Today",
      nextAvailable: "3:30 PM",
      languages: ["English", "Spanish", "French"],
      education: "MD, Johns Hopkins University",
      hospital: "Children's Medical Center",
      image: "https://images.unsplash.com/photo-1594824373639-9b5b4b8b8b8b?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Dedicated to providing exceptional care for children of all ages.",
      isOnline: true
    },
    {
      id: 4,
      name: "Dr. David Wilson",
      specialization: "Orthopedist",
      experience: 20,
      rating: 4.7,
      totalPatients: 1800,
      consultationFee: 180,
      availability: "Available Tomorrow",
      nextAvailable: "11:00 AM",
      languages: ["English"],
      education: "MD, Mayo Clinic",
      hospital: "Orthopedic Center",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Specialized in joint replacement and sports medicine.",
      isOnline: false
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      specialization: "Psychiatrist",
      experience: 10,
      rating: 4.8,
      totalPatients: 950,
      consultationFee: 200,
      availability: "Available Today",
      nextAvailable: "4:00 PM",
      languages: ["English", "German"],
      education: "MD, Columbia University",
      hospital: "Mental Health Institute",
      image: "https://images.unsplash.com/photo-1594824373639-9b5b4b8b8b8b?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Expert in mental health and behavioral therapy.",
      isOnline: true
    },
    {
      id: 6,
      name: "Dr. James Brown",
      specialization: "Neurologist",
      experience: 18,
      rating: 4.9,
      totalPatients: 1600,
      consultationFee: 220,
      availability: "Available Tomorrow",
      nextAvailable: "9:00 AM",
      languages: ["English", "Italian"],
      education: "MD, University of California",
      hospital: "Neurological Institute",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face&auto=format",
      bio: "Specialized in neurological disorders and brain health.",
      isOnline: false
    }
  ];

  const specializations = ['all', ...Array.from(new Set(doctors.map(d => d.specialization)))];

  const filteredDoctors = doctors
    .filter(doctor => 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(doctor => 
      selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
      return 0;
    });

  const openDoctorModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const closeDoctorModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        {/* Find a Doctor Header Card */}
        <section className="mb-8">
          <div className="relative overflow-hidden gradient-bg-primary rounded-3xl p-6 shadow-xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaStethoscope className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 font-secondary">Find a Doctor</h1>
                  <p className="text-emerald-100">Search and connect with certified healthcare professionals</p>
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
                    placeholder="Search by doctor name, specialization, or hospital..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-lg shadow-lg"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
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
                    className="px-4 py-4 rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 shadow-lg"
                  >
                    <option value="rating">Sort by Rating</option>
                    <option value="experience">Sort by Experience</option>
                    <option value="fee">Sort by Fee</option>
                  </select>
                </div>
              </div>

              {/* View Mode and Quick Specializations */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Quick Specializations */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-white/80 text-sm font-medium">Quick:</span>
                  {['Cardiologist', 'Dermatologist', 'Pediatrician'].map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialization(specialty)}
                      className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/20"
                    >
                      {specialty}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/20'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/20'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-6'}>
          {filteredDoctors.map((doctor, index) => (
            <div 
              key={doctor.id} 
              className={`card card-hover rounded-2xl animate-fade-scale cursor-pointer transition-all duration-300 hover:scale-105 ${
                viewMode === 'list' ? 'p-6 flex items-start gap-6' : 'p-6'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openDoctorModal(doctor)}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block mb-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-xl object-cover mx-auto shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl items-center justify-center text-white font-bold text-lg hidden mx-auto shadow-md">
                        {doctor.name.charAt(0)}
                      </div>
                      {doctor.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white">
                          <div className="w-full h-full rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{doctor.name}</h3>
                    <p className="text-emerald-600 font-medium text-base mb-2">{doctor.specialization}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {renderStars(doctor.rating)}
                      <span className="text-xs text-gray-600 ml-1">({doctor.rating})</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-emerald-50 rounded-lg">
                        <div className="font-medium text-gray-700">{doctor.experience}y exp</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="font-medium text-gray-700">{doctor.totalPatients.toLocaleString()} pts</div>
                      </div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-600">{doctor.hospital}</span>
                    </div>
                    
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <span className={`text-xs font-medium ${
                        doctor.availability.includes('Today') ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {doctor.availability}
                      </span>
                    </div>
                  </div>

                  {/* <p className="text-gray-600 text-xs mb-4 leading-relaxed text-center px-1 line-clamp-2">{doctor.bio}</p> */}

                  <div className="text-center mb-4">
                    <div className="text-xl font-bold text-emerald-600 mb-1">
                      ${doctor.consultationFee}
                    </div>
                
                  </div>

                  <div className="space-y-2">
                    <button className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm font-medium">
                      <FaCalendar className="w-4 h-4" />
                      Book Now
                    </button>
                    <button className="w-full btn-secondary flex items-center justify-center gap-2 py-2 text-sm font-medium">
                      <FaVideo className="w-4 h-4" />
                      Video Call
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl items-center justify-center text-white font-bold text-xl hidden shadow-md">
                      {doctor.name.charAt(0)}
                    </div>
                    {doctor.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white">
                        <div className="w-full h-full rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-xl mb-1">{doctor.name}</h3>
                        <p className="text-emerald-600 font-semibold text-base mb-1">{doctor.specialization}</p>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(doctor.rating)}
                          <span className="text-xs text-gray-600 ml-1">({doctor.rating})</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{doctor.experience}y exp</span>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">${doctor.consultationFee}</div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {doctor.totalPatients.toLocaleString()} patients
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-xs">
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <FaMapPin className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-700">{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                        <FaCalendar className="w-3 h-3 text-green-600" />
                        <span className={`${
                          doctor.availability.includes('Today') ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {doctor.availability} - {doctor.nextAvailable}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-4 leading-relaxed line-clamp-2">{doctor.bio}</p>
                    
                    <div className="flex gap-3">
                      <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium">
                        <FaCalendar className="w-4 h-4" />
                        Book Now
                      </button>
                      <button className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium">
                        <FaVideo className="w-4 h-4" />
                        Video Call
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStethoscope className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria to find more doctors.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Doctor Details Modal */}
        {isModalOpen && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeDoctorModal}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-scale">
              {/* Close Button */}
              <button
                onClick={closeDoctorModal}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>

              {/* Header Section */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl p-4 text-white">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-24 h-24 bg-white/20 rounded-2xl items-center justify-center text-white font-bold text-2xl hidden shadow-lg border-4 border-white/20">
                      {selectedDoctor.name.charAt(0)}
                    </div>
                    {selectedDoctor.isOnline && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-white shadow-lg">
                        <div className="w-full h-full rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold ">{selectedDoctor.name}</h2>
                    <p className="text-emerald-100 text-xl font-semibold ">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-3">
                      {renderStars(selectedDoctor.rating)}
                      <span className="text-white/90 font-medium">({selectedDoctor.rating})</span>
                      <span className="text-white/70">•</span>
                      <span className="text-white/90">{selectedDoctor.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Bio */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedDoctor.bio}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                      <FaClock className="w-6 h-6 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Experience</div>
                        <div className="text-gray-600">{selectedDoctor.experience} years</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <FaUser className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Patients Treated</div>
                        <div className="text-gray-600">{selectedDoctor.totalPatients.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <FaStethoscope className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Education</div>
                        <div className="text-gray-600">{selectedDoctor.education}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <FaMapPin className="w-6 h-6 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Hospital</div>
                        <div className="text-gray-600">{selectedDoctor.hospital}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <FaCalendar className="w-6 h-6 text-green-600" />
                      <div>
                        {/* <div className="font-semibold text-gray-800">Availability</div> */}
                        <div className={`font-medium ${
                          selectedDoctor.availability.includes('Today') ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {selectedDoctor.availability}
                        </div>
                        <div className="text-sm text-gray-500">Next: {selectedDoctor.nextAvailable}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
                      <span className="w-6 h-6 text-yellow-600 font-bold text-md">$</span>
                      <div>
                        <div className="font-semibold text-gray-800">Consultation Fee</div>
                        <div className="text-xl font-bold text-emerald-600">${selectedDoctor.consultationFee}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button className="flex-1 btn-primary flex items-center justify-center gap-3 py-2 text-md font-semibold">
                    <FaCalendar className="w-4 h-4" />
                    Book Appointment
                  </button>
                  <button className="flex-1 btn-secondary flex items-center justify-center gap-3 py-2 text-md font-semibold">
                    <FaVideo className="w-6 h-6" />
                    Video Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DoctorsList