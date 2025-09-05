import React, { useState } from 'react';
import { FaPlus, FaMinus, FaQuestionCircle, FaShieldAlt, FaDollarSign, FaUserMd, FaClock } from 'react-icons/fa';

const faqData = [
  {
    question: "How do I book an online consultation?",
    answer: "You can book a consultation by clicking the 'Book an Appointment' button, choosing a doctor and a time slot that suits you. The entire process takes less than five minutes. We offer real-time availability, instant confirmation, and flexible scheduling options including same-day appointments.",
    icon: <FaClock />,
    category: "Booking"
  },
  {
    question: "Are the doctors on this platform certified?",
    answer: "Absolutely. All doctors on our platform are board-certified, have undergone a rigorous vetting process, and are highly experienced in their respective fields. We verify medical licenses, check credentials, and ensure continuous professional development for all our healthcare providers.",
    icon: <FaUserMd />,
    category: "Doctors"
  },
  {
    question: "What is the cost for an online consultation?",
    answer: "The cost varies depending on the doctor's specialty and consultation type. All prices are transparently displayed on the doctor's profile before you book. We offer competitive rates, insurance integration, and flexible payment options including HSA/FSA acceptance.",
    icon: <FaDollarSign />,
    category: "Pricing"
  },
  {
    question: "Is my personal information kept private?",
    answer: "Yes, we use industry-standard encryption and are fully HIPAA compliant. Your privacy and the security of your data are our top priorities. We employ end-to-end encryption, secure data storage, and strict access controls to protect your medical information.",
    icon: <FaShieldAlt />,
    category: "Security"
  },
  {
    question: "What technology do I need for video consultations?",
    answer: "You only need a device with a camera and microphone (smartphone, tablet, or computer) and a stable internet connection. Our platform works on all modern browsers without requiring any downloads or special software installations.",
    icon: <FaQuestionCircle />,
    category: "Technology"
  },
  {
    question: "Can I get prescriptions through telemedicine?",
    answer: "Yes, our licensed doctors can prescribe medications when medically appropriate. E-prescriptions are sent directly to your preferred pharmacy, and we maintain detailed records of all prescriptions for your healthcare continuity.",
    icon: <FaUserMd />,
    category: "Prescriptions"
  }
];

const FAQItem: React.FC<{ item: typeof faqData[0], index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="card mb-4 overflow-hidden animate-fade-scale"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-start text-left hover:bg-emerald-50 transition-all duration-300 group"
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            {item.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-emerald-600 mb-1">{item.category}</div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
              {item.question}
            </h3>
          </div>
        </div>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ml-4 transition-all duration-300 ${
          isOpen 
            ? 'bg-emerald-500 text-white rotate-180' 
            : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
        }`}>
          {isOpen ? <FaMinus size={14} /> : <FaPlus size={14} />}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          <div className="pl-14">
            <p className="text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="section-padding bg-gradient-to-br from-emerald-50 to-white">
      <div className="container-padding landing-padding-lg">
        <div className="text-center mb-20 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6">
            <FaQuestionCircle className="text-white text-2xl" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-secondary">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions about our telemedicine services? Find answers to the most common 
            questions our patients ask about online consultations and healthcare delivery.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqData.map((item, index) => (
            <FAQItem key={index} item={item} index={index} />
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="mt-20 animate-slide-up">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-emerald-100 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Our friendly support team is available 24/7 to help you with any questions 
              or concerns about our telemedicine services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Contact Support Team
              </button>
              <button className="btn-secondary">
                Schedule a Demo Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};