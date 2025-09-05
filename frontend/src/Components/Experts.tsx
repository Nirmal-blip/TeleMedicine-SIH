import React from 'react';
import { FaStar, FaUserMd, FaCertificate, FaVideo } from 'react-icons/fa';
import doc1 from '../assets/image.png';
import doc2 from '../assets/image1.jpg';
import doc3 from '../assets/image2.jpg';

const doctors = [
  { 
    name: "Dr. Evelyn Reed", 
    specialty: "Cardiologist", 
    img: doc1,
    experience: "15+ years",
    rating: 4.9,
    patients: "2,500+",
    description: "Specialized in heart health and cardiovascular diseases with extensive experience in telemedicine consultations.",
    specializations: ["Heart Disease", "Hypertension", "Cardiac Surgery"]
  },
  { 
    name: "Dr. Marcus Chen", 
    specialty: "Dermatologist", 
    img: doc2,
    experience: "12+ years",
    rating: 4.8,
    patients: "1,800+",
    description: "Expert in skin conditions, cosmetic dermatology, and advanced dermatological treatments for all age groups.",
    specializations: ["Acne Treatment", "Skin Cancer", "Cosmetic Dermatology"]
  },
  { 
    name: "Dr. Olivia Grant", 
    specialty: "Pediatrician", 
    img: doc3,
    experience: "10+ years",
    rating: 4.9,
    patients: "3,200+",
    description: "Dedicated pediatrician focusing on child development, preventive care, and family-centered healthcare approaches.",
    specializations: ["Child Development", "Vaccinations", "Behavioral Health"]
  },
];

export const Experts: React.FC = () => {
  return (
    <section id="doctors" className="section-padding bg-gradient-to-br from-emerald-50 to-white">
      <div className="container-padding landing-padding-lg">
        <div className="text-center mb-20 animate-slide-down">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-secondary">
            Experts Who Care, Not Just Consult
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Meet our team of highly qualified and compassionate doctors who are dedicated 
            to providing personalized healthcare with the highest standards of excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive-lg">
          {doctors.map((doctor, index) => (
            <div 
              key={index} 
              className="group card card-hover p-8 text-center relative overflow-hidden animate-fade-scale"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full transform translate-x-10 -translate-y-10 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              
              {/* Doctor Image */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300 relative">
                  <img 
                    src={doctor.img} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-2 right-1/2 transform translate-x-16 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Doctor Info */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                {doctor.name}
              </h3>
              
              <div className="flex items-center justify-center mb-4">
                <FaUserMd className="text-emerald-500 mr-2" />
                <p className="text-emerald-600 font-semibold text-lg">{doctor.specialty}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 font-medium">{doctor.rating}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="font-bold text-emerald-600">{doctor.experience}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Patients</div>
                  <div className="font-bold text-emerald-600">{doctor.patients}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {doctor.description}
              </p>

              {/* Specializations */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Specializations:</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {doctor.specializations.map((spec, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 animate-slide-up">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto border border-emerald-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find the Right Specialist?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              We have a network of over 500+ verified doctors across all specialties. 
              Let us help you find the perfect match for your healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Browse All Specialists
              </button>
              <button className="btn-secondary">
                Get Doctor Recommendation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};