import React, { useState } from 'react'
import Sidebar from '../../Components/Sidebar'
import PatientHeader from '../../Components/PatientHeader'
import { FaHospital, FaMapPin, FaPhone, FaClock, FaStar, FaAmbulance, FaSearch, FaFilter, FaHeart, FaStethoscope, FaUserMd, FaCar } from 'react-icons/fa'

interface Hospital {
  id: number;
  name: string;
  type: 'General' | 'Specialty' | 'Emergency';
  distance: number;
  rating: number;
  address: string;
  phone: string;
  emergency: boolean;
  specialties: string[];
  availability: string;
  image: string;
}

const PatientSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  const hospitals: Hospital[] = [
    {
      id: 1,
      name: "City General Hospital",
      type: "General",
      distance: 2.5,
      rating: 4.8,
      address: "123 Main Street, Downtown",
      phone: "+1 (555) 123-4567",
      emergency: true,
      specialties: ["Emergency", "Cardiology", "Surgery"],
      availability: "24/7",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd36d4d35?w=300&h=200&fit=crop&auto=format"
    },
    {
      id: 2,
      name: "Heart Care Center",
      type: "Specialty",
      distance: 5.2,
      rating: 4.9,
      address: "456 Health Avenue, Medical District",
      phone: "+1 (555) 234-5678",
      emergency: false,
      specialties: ["Cardiology", "Cardiac Surgery"],
      availability: "Mon-Fri 8AM-6PM",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=200&fit=crop&auto=format"
    },
    {
      id: 3,
      name: "Emergency Medical Center",
      type: "Emergency",
      distance: 1.8,
      rating: 4.7,
      address: "789 Emergency Lane, Central",
      phone: "+1 (555) 911-0000",
      emergency: true,
      specialties: ["Emergency", "Trauma", "Critical Care"],
      availability: "24/7",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd36d4d35?w=300&h=200&fit=crop&auto=format"
    },
    {
      id: 4,
      name: "Children's Medical Center",
      type: "Specialty",
      distance: 7.1,
      rating: 4.9,
      address: "321 Kids Street, Family District",
      phone: "+1 (555) 345-6789",
      emergency: true,
      specialties: ["Pediatrics", "Child Surgery", "Emergency"],
      availability: "24/7",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=200&fit=crop&auto=format"
    },
    {
      id: 5,
      name: "Orthopedic Institute",
      type: "Specialty",
      distance: 4.3,
      rating: 4.6,
      address: "654 Bone Street, Sports District",
      phone: "+1 (555) 456-7890",
      emergency: false,
      specialties: ["Orthopedics", "Sports Medicine", "Physical Therapy"],
      availability: "Mon-Sat 7AM-8PM",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd36d4d35?w=300&h=200&fit=crop&auto=format"
    },
    {
      id: 6,
      name: "Mental Health Clinic",
      type: "Specialty",
      distance: 3.7,
      rating: 4.5,
      address: "987 Wellness Way, Peace District",
      phone: "+1 (555) 567-8901",
      emergency: false,
      specialties: ["Psychiatry", "Psychology", "Counseling"],
      availability: "Mon-Fri 9AM-5PM",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=200&fit=crop&auto=format"
    }
  ];

  const filteredHospitals = hospitals
    .filter(hospital => 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(hospital => 
      filterType === 'all' || hospital.type.toLowerCase() === filterType.toLowerCase()
    )
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'rating') return b.rating - a.rating;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Specialty':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'General':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <PatientHeader />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <FaHospital className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-secondary">Nearby Hospitals</h1>
              <p className="text-gray-600">Find trusted healthcare facilities and emergency services</p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 mb-6 animate-fade-scale">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FaAmbulance className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">Emergency Services</h3>
                <p className="text-gray-600">For immediate medical assistance</p>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2">
                  <FaPhone className="w-4 h-4" />
                  Call 911
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <FaAmbulance className="w-4 h-4" />
                  Request Ambulance
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="specialty">Specialty</option>
                <option value="emergency">Emergency</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital, index) => (
            <div 
              key={hospital.id} 
              className="card card-hover rounded-2xl overflow-hidden animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hospital Image */}
              <div className="relative h-48 bg-gradient-to-r from-emerald-500 to-teal-500">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(hospital.type)}`}>
                    {hospital.type}
                  </span>
                </div>
                {hospital.emergency && (
                  <div className="absolute top-4 left-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <FaAmbulance className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-xl mb-1">{hospital.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(hospital.rating)}
                      <span className="text-sm text-gray-500 ml-1">({hospital.rating})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">{hospital.distance} km</div>
                    <div className="text-sm text-gray-500">Distance</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{hospital.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{hospital.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaClock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{hospital.availability}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                    <FaCar className="w-4 h-4" />
                    Get Directions
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <FaPhone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHospital className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hospitals found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria to find more healthcare facilities.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Health Tips */}
        <div className="mt-8 card p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Health Tips</h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>• Keep emergency contact numbers saved in your phone</p>
                <p>• Know the location of the nearest hospital to your home and workplace</p>
                <p>• Always carry your medical ID and insurance information</p>
                <p>• For non-emergency situations, consider telemedicine consultations first</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatientSupport