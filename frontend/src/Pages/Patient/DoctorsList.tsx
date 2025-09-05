import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
import { FiSearch, FiStar, FiMapPin, FiClock, FiUser } from 'react-icons/fi'

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
}

const DoctorsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

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
      isVerified: true
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
      isVerified: true
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
      isVerified: true
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
      isVerified: true
    }
  ];

  const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'General Medicine'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

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
              <div key={doctor.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 overflow-hidden">
                <div className="p-6">
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
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-500" />
                          <span>{doctor.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock className="text-gray-400" />
                          <span>{doctor.experience} years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMapPin className="text-gray-400" />
                          <span>{doctor.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Consultation Fee:</span>
                          <span className="font-semibold text-gray-800 ml-1">${doctor.consultationFee}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doctor.availability.includes('Now') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctor.availability}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md">
                          Book Appointment
                        </button>
                        <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300">
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
    </div>
  )
}

export default DoctorsList
