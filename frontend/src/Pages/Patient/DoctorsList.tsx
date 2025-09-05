import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        <PatientHeader />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaStethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">Find a Doctor</h1>
              <p className="text-gray-600">Connect with certified healthcare professionals</p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
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
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="fee">Sort by Fee</option>
              </select>
              
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredDoctors.map((doctor, index) => (
            <div 
              key={doctor.id} 
              className={`card card-hover rounded-2xl animate-fade-scale ${
                viewMode === 'list' ? 'p-6 flex items-center gap-6' : 'p-6'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl items-center justify-center text-white font-bold text-lg hidden">
                          {doctor.name.charAt(0)}
                        </div>
                        {doctor.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{doctor.name}</h3>
                        <p className="text-emerald-600 font-medium">{doctor.specialization}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(doctor.rating)}
                          <span className="text-sm text-gray-500 ml-1">({doctor.rating})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaClock className="w-4 h-4 text-emerald-500" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaUser className="w-4 h-4 text-emerald-500" />
                      <span>{doctor.totalPatients.toLocaleString()} patients</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaMapPin className="w-4 h-4 text-emerald-500" />
                      <span>{doctor.hospital}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaCalendar className="w-4 h-4 text-emerald-500" />
                      <span className={doctor.availability.includes('Today') ? 'text-emerald-600 font-medium' : ''}>
                        {doctor.availability}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{doctor.bio}</p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-emerald-600">
                      ${doctor.consultationFee}
                    </div>
                    <div className="text-sm text-gray-500">
                      Next: {doctor.nextAvailable}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                      <FaCalendar className="w-4 h-4" />
                      Book Appointment
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                      <FaVideo className="w-4 h-4" />
                      Video Call
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="relative">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl items-center justify-center text-white font-bold text-xl hidden">
                      {doctor.name.charAt(0)}
                    </div>
                    {doctor.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-xl">{doctor.name}</h3>
                        <p className="text-emerald-600 font-medium">{doctor.specialization}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(doctor.rating)}
                          <span className="text-sm text-gray-500 ml-1">({doctor.rating}) • {doctor.experience} years</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">${doctor.consultationFee}</div>
                        <div className="text-sm text-gray-500">{doctor.totalPatients.toLocaleString()} patients</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <FaMapPin className="w-4 h-4 text-emerald-500" />
                        <span>{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar className="w-4 h-4 text-emerald-500" />
                        <span className={doctor.availability.includes('Today') ? 'text-emerald-600 font-medium' : ''}>
                          {doctor.availability}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{doctor.bio}</p>
                    
                    <div className="flex gap-3">
                      <button className="btn-primary flex items-center gap-2">
                        <FaCalendar className="w-4 h-4" />
                        Book Appointment
                      </button>
                      <button className="btn-secondary flex items-center gap-2">
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
      </main>
    </div>
  )
}

export default DoctorsList