import React from 'react';
import { FaApple, FaGooglePlay, FaArrowRight, FaMobile, FaShieldAlt, FaClock } from 'react-icons/fa';

export const CTA: React.FC = () => {
  const features = [
    { icon: <FaMobile />, text: "Mobile-First Design" },
    { icon: <FaShieldAlt />, text: "Secure & Private" },
    { icon: <FaClock />, text: "24/7 Access" }
  ];

  return (
    <section className="section-padding gradient-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full animate-pulse-slow"></div>
      </div>

      <div className="container-padding landing-padding-lg relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6">
              <FaMobile className="mr-2" />
              Mobile App Available
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 font-secondary">
              Health shouldn't be complicated.{' '}
              <span className="text-emerald-200">Let TeleMedicine make it simple.</span>
            </h2>
            
            <p className="text-emerald-100 text-xl mb-8 leading-relaxed max-w-2xl">
              Download our app and get access to quality healthcare, anytime, anywhere. 
              Experience seamless consultations with top doctors at your fingertips.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-6 mb-10 justify-center lg:justify-start">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    {feature.icon}
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button className="group flex items-center justify-center px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                <FaApple className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-lg font-bold">App Store</div>
                </div>
              </button>
              
              <button className="group flex items-center justify-center px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                <FaGooglePlay className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-lg font-bold">Google Play</div>
                </div>
              </button>
            </div>

            {/* Web App CTA */}
            <div className="flex items-center justify-center lg:justify-start">
              <button className="group inline-flex items-center text-white font-semibold hover:text-emerald-200 transition-colors duration-300">
                <span>Or try our web app</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* App Preview/Mockup */}
          <div className="flex justify-center lg:justify-end animate-slide-up">
            <div className="relative">
              {/* Phone mockup background */}
              <div className="w-80 h-96 bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 flex flex-col">
                  {/* App screen content */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg"></div>
                    <div className="text-gray-700 font-bold">TeleMedicine</div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-3"></div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded w-16 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl"></div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-white/20 rounded-full animate-float"></div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 text-center animate-slide-up">
          <p className="text-emerald-100 mb-6">Trusted by healthcare professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-white font-semibold">50k+ Downloads</div>
            <div className="text-white font-semibold">4.9★ Rating</div>
            <div className="text-white font-semibold">HIPAA Compliant</div>
            <div className="text-white font-semibold">ISO Certified</div>
          </div>
        </div>
      </div>
    </section>
  );
};