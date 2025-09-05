import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComments, FaUserMd, FaPrescription, FaArrowRight } from 'react-icons/fa';

const steps = [
  { 
    title: "Select What's on Your Mind", 
    description: "Choose from a wide range of symptoms or health concerns with our intuitive interface.",
    icon: <FaSearch />,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    title: "Talk Directly, No Wait Time", 
    description: "Connect with a doctor instantly through our secure video consultation platform.",
    icon: <FaComments />,
    color: "from-green-500 to-emerald-500"
  },
  { 
    title: "Connect with Right Doctor", 
    description: "Our AI matches you with the best specialist based on your symptoms and preferences.",
    icon: <FaUserMd />,
    color: "from-purple-500 to-pink-500"
  },
  { 
    title: "Get Prescription Instantly", 
    description: "Receive your e-prescription and treatment plan directly through our secure app.",
    icon: <FaPrescription />,
    color: "from-orange-500 to-red-500"
  },
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const handleStartConsultation = () => {
    navigate('/signin');
  };
  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-padding landing-padding-lg">
        <div className="text-center mb-20 animate-slide-down">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-secondary">
            How TeleMedicine Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get quality healthcare in just 4 simple steps. Our streamlined process ensures 
            you receive the care you need quickly and efficiently.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-4 gap-responsive">
            {steps.map((step, index) => (
              <div key={index} className="relative group animate-fade-scale" style={{ animationDelay: `${index * 0.2}s` }}>
                {/* Step Number & Icon */}
                <div className="flex flex-col items-center mb-8">
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-all duration-300 mb-4 z-10`}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-10 -right-4 text-emerald-400 animate-pulse">
                      <FaArrowRight size={20} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="card card-hover py-10 px-8 h-[18rem] text-center ">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stack */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative animate-fade-scale" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card card-hover p-8">
                <div className="flex items-start space-x-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xl shadow-lg relative`}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connection Line for Mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-emerald-200"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 animate-slide-up">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Experience Healthcare Differently?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Join thousands of patients who have discovered a better way to access quality healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleStartConsultation} className="btn-primary">
                Start Your Consultation
              </button>
              <button className="btn-secondary">
                Learn More About Our Process
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};