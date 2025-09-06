import React from 'react';
import { FaRegCalendarCheck, FaShieldAlt, FaUserMd, FaHeadset, FaArrowRight, FaPlay } from 'react-icons/fa';
import doctorHero from '../assets/image.png';
import { useNavigate } from 'react-router-dom';

// Data for the feature items with enhanced styling
const features = [
  { 
    icon: <FaRegCalendarCheck size={28} />, 
    text: "Online Booking",
    description: "Book appointments instantly"
  },
  { 
    icon: <FaShieldAlt size={28} />, 
    text: "100% Private",
    description: "Your data is secure"
  },
  { 
    icon: <FaUserMd size={28} />, 
    text: "Expert & Verified",
    description: "Licensed professionals"
  },
  { 
    icon: <FaHeadset size={28} />, 
    text: "24/7 Support",
    description: "Always here to help"
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/signin');
  };
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-teal-200 rounded-full opacity-15 animate-bounce"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-300 rounded-full opacity-10"></div>
      
      <div className="relative container-padding landing-padding-lg py-16 lg:py-24">
        
        {/* Main Hero Content: Text and Image */}
        <div className="grid lg:grid-cols-2 gap-responsive-lg items-center min-h-[80vh]">
          
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by 10,000+ patients
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              We bring the{' '}
              <span className="gradient-text-emerald">
                clinic
              </span>{' '}
              to your{' '}
              <span className="gradient-text-teal">
                couch.
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              At <span className="font-semibold text-emerald-600">TeleMedicine</span>, we make healthcare simple, accessible, 
              and personal. Our mission is to connect you with trusted doctors and provide the 
              care you need without the wait.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
              <button onClick={handleBookAppointment} className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Book Appointment
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="group inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300">
                <FaPlay className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </button>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-gray-600">Expert Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-gray-600">Availability</div>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="flex justify-center lg:justify-end items-center">
            <div className="relative w-[480px] h-[580px] lg:w-[500px] lg:h-[600px] transform -translate-y-16">
              {/* Irregular Emerald Shape Background */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 opacity-80 shadow-2xl shadow-emerald-500/20 transform -rotate-12 transition-all duration-500"
                  style={{
                    borderRadius: '45% 55% 60% 40% / 70% 50% 50% 30%',
                    filter: 'blur(2px)'
                  }}
                ></div>
                 <div
                  className="absolute w-5/6 h-5/6 bg-gradient-to-tl from-emerald-300 to-teal-300 opacity-60 shadow-xl transform rotate-6"
                  style={{
                    borderRadius: '70% 30% 40% 60% / 60% 70% 30% 40%',
                    filter: 'blur(3px)'
                  }}
                ></div>
              </div>
              
              {/* Doctor Image Container */}
              <div className="relative z-20 flex items-center justify-center h-full">
                <img 
                  src={doctorHero} 
                  alt="Friendly female doctor smiling" 
                  className="w-full max-w-lg h-auto rounded-2xl transform hover:scale-105 transition-transform duration-500 relative z-30" 
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute left-0 top-1/4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-float z-40 transition-all hover:scale-110">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Online Now</span>
                </div>
              </div>
              
              <div className="absolute -right-8 bottom-1/4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-float-delayed z-40 transition-all hover:scale-110">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">4.9★</div>
                  <div className="text-xs text-gray-600">Patient Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Features Section */}
        <div className="mt-24 lg:mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience healthcare like never before with our comprehensive telemedicine solution
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-emerald-100/70"
              >
                <div className="text-emerald-600 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.text}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                
                {/* Hover indicator */}
                <div className="w-0 group-hover:w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 mt-4 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 mb-8">Trusted by leading healthcare organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-md font-medium text-gray-700 hover:opacity-80 transition-opacity">
              Healthcare Alliance
            </div>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-md font-medium text-gray-700 hover:opacity-80 transition-opacity">
              Medical Board Certified
            </div>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-md font-medium text-gray-700 hover:opacity-80 transition-opacity">
              Insurance Partners
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};