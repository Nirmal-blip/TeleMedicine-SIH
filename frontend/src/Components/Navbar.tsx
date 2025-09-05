import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaStethoscope, FaArrowRight } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'services', 'doctors', 'testimonials', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Doctors', href: '#doctors', id: 'doctors' },
    { label: 'FAQ', href: '#faq', id: 'faq' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-emerald-100' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <nav className="container-padding landing-padding">
        <div className="flex justify-between items-center py-4 lg:py-6">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaStethoscope className="text-white text-xl" />
            </div>
            <span className="text-2xl lg:text-3xl font-bold gradient-text-primary font-secondary">
              TeleMedicine
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 font-medium transition-all duration-300 rounded-lg relative group ${
                  activeSection === item.id
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button className="hidden lg:flex items-center btn-primary group">
              <span>Book Appointment</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2 border-t border-gray-100">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full btn-primary justify-center"
              >
                <span>Book Appointment</span>
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;