import React from 'react';
import { FaHeart, FaUsers, FaAward, FaGlobe } from 'react-icons/fa';

export const About: React.FC = () => {
  const stats = [
    { icon: <FaUsers />, number: "10,000+", label: "Patients Served" },
    { icon: <FaHeart />, number: "500+", label: "Expert Doctors" },
    { icon: <FaAward />, number: "4.9★", label: "Average Rating" },
    { icon: <FaGlobe />, number: "24/7", label: "Global Support" },
  ];

  return (
    <section id="about" className="section-padding bg-gradient-to-br from-white to-emerald-50">
      <div className="container-padding landing-padding-lg">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <FaHeart className="mr-2" />
              About TeleMedicine
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-secondary">
              Revolutionizing Healthcare Through Technology
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Founded with a vision to make quality healthcare accessible to everyone, 
              TeleMedicine bridges the gap between patients and healthcare providers through 
              innovative technology and compassionate care.
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our platform connects patients with board-certified doctors, enabling 
              secure video consultations, instant prescriptions, and comprehensive 
              health management - all from the comfort of your home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary">
                Learn More About Us
              </button>
              <button className="btn-secondary">
                Our Mission
              </button>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="animate-slide-up">
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};