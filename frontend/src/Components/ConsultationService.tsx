import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaFemale, FaBaby, FaSpa, FaBrain, FaCalendarCheck } from 'react-icons/fa';

const services = [
  {
    title: "General Health Evaluation",
    description: "Comprehensive checkups and preventive care for optimal health",
    icon: <FaHeartbeat />,
    color: "from-red-400 to-pink-500"
  },
  {
    title: "Women's Health & Wellness",
    description: "Specialized care addressing women's unique healthcare needs",
    icon: <FaFemale />,
    color: "from-purple-400 to-pink-500"
  },
  {
    title: "Pediatric & Child Care",
    description: "Expert care for children's health, growth, and development",
    icon: <FaBaby />,
    color: "from-blue-400 to-cyan-500"
  },
  {
    title: "Skin & Dermatology Care",
    description: "Professional treatment for skin conditions and cosmetic concerns",
    icon: <FaSpa />,
    color: "from-green-400 to-emerald-500"
  },
  {
    title: "Mental Health & Behavioral",
    description: "Compassionate support for mental wellness and behavioral health",
    icon: <FaBrain />,
    color: "from-indigo-400 to-purple-500"
  },
  {
    title: "Chronic Disease Management",
    description: "Ongoing care and monitoring for long-term health conditions",
    icon: <FaCalendarCheck />,
    color: "from-orange-400 to-red-500"
  }
];

export const ConsultationService: React.FC = () => {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    navigate('/signin');
  };
  return (
    <section id="services" className="section-padding gradient-bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse-slow"></div>
      </div>

      <div className="container-padding landing-padding-lg relative">
        <div className="text-center mb-16 animate-slide-down">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-secondary">
            Our Consultation Services
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            Experience comprehensive healthcare with our range of specialized medical services, 
            all accessible from the comfort of your home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-lg hover:bg-white transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl border border-white/20 animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br bg-emerald-500 text-white mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {service.description}
              </p>

              {/* Hover indicator */}
              <div className="flex items-center text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-slide-up">
          <p className="text-emerald-100 text-lg mb-6">
            Ready to get started with professional healthcare?
          </p>
          <button onClick={handleBookConsultation} className="px-8 py-4 bg-white transition ease-in-out cursor-pointer transform hover:scale-105 duration-500 font-semibold rounded-xl border-2 border-emerald-200 hover:border-white text-emerald-600 hover:text-white hover:bg-emerald-700/10">
            Book Your Consultation
          </button>
        </div>
      </div>
    </section>
  );
};