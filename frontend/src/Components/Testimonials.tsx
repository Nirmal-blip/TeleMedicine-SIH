import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQuoteLeft, FaStar, FaHeart } from 'react-icons/fa';

const testimonials = [
  {
    name: "Sarah L.",
    role: "Working Mother",
    quote: "The consultation was seamless and the doctor was incredibly empathetic. I got my prescription within minutes. It felt like the future of healthcare.",
    rating: 5,
    service: "General Consultation",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face&auto=format"
  },
  {
    name: "David Chen",
    role: "Software Engineer", 
    quote: "As someone with a busy schedule, TeleMedicine is a lifesaver. No more waiting rooms. Just quality care right from my home. Highly recommend!",
    rating: 5,
    service: "Dermatology",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format"
  },
  {
    name: "Maria G.",
    role: "Retired Teacher",
    quote: "I was hesitant about online consultations, but the experience was fantastic. The platform is user-friendly and the doctors are top-notch.",
    rating: 5,
    service: "Cardiology",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format"
  }
];

export const Testimonials: React.FC = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/signin');
  };
  return (
    <section className="section-padding bg-gradient-to-br from-white to-emerald-50">
      <div className="container-padding landing-padding-lg">
        <div className="text-center mb-20 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6">
            <FaHeart className="text-white text-2xl" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-secondary">
            Stories from Our Patients
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how we've transformed healthcare experiences and made a difference in thousands of lives 
            across the globe with our compassionate, accessible medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-responsive-lg">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group card card-hover p-8 text-left relative overflow-hidden animate-fade-scale"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-emerald-200 group-hover:text-emerald-300 transition-colors duration-300">
                <FaQuoteLeft size={24} />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-1 mr-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">• {testimonial.service}</span>
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 font-medium italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200 mr-4 group-hover:border-emerald-300 transition-colors duration-300">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackDiv = e.currentTarget.parentElement?.querySelector('div');
                      if (fallbackDiv && fallbackDiv instanceof HTMLElement) {
                        fallbackDiv.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 items-center justify-center text-white font-bold text-lg hidden">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-20 animate-slide-up">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-emerald-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  10,000+
                </div>
                <div className="text-gray-600 font-medium">Happy Patients</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  4.9/5
                </div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  500+
                </div>
                <div className="text-gray-600 font-medium">Expert Doctors</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-gray-600 font-medium">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-slide-up">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Our Community of Satisfied Patients?
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Experience the same level of care and satisfaction that thousands of patients trust every day.
          </p>
          <button onClick={handleStartJourney} className="btn-primary">
            Start Your Health Journey Today
          </button>
        </div>
      </div>
    </section>
  );
};