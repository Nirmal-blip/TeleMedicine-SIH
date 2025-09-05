import React from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaStethoscope, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaApple,
  FaGooglePlay,
  FaArrowUp
} from 'react-icons/fa';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Our Mission", href: "#mission" },
        { name: "Careers", href: "#careers" },
        { name: "Press Kit", href: "#press" },
        { name: "Blog", href: "#blog" }
      ]
    },
    {
      title: "Services",
      links: [
        { name: "Video Consultations", href: "#services" },
        { name: "Prescription Services", href: "#prescriptions" },
        { name: "Health Records", href: "#records" },
        { name: "Emergency Care", href: "#emergency" },
        { name: "Specialist Referrals", href: "#specialists" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Contact Support", href: "#contact" },
        { name: "Live Chat", href: "#chat" },
        { name: "FAQs", href: "#faq" },
        { name: "Technical Support", href: "#tech-support" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" },
        { name: "HIPAA Compliance", href: "#hipaa" },
        { name: "Cookie Policy", href: "#cookies" },
        { name: "Accessibility", href: "#accessibility" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, href: "#", label: "Facebook" },
    { icon: <FaTwitter />, href: "#", label: "Twitter" },
    { icon: <FaInstagram />, href: "#", label: "Instagram" },
    { icon: <FaLinkedin />, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-400 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-400 rounded-full animate-float-delayed"></div>
      </div>

      <div className="container-padding landing-padding-lg relative">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <FaStethoscope className="text-white text-2xl" />
                </div>
                <span className="text-3xl font-bold gradient-text-primary font-secondary">
                  TeleMedicine
                </span>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Revolutionizing healthcare through technology. Connect with qualified doctors, 
                get expert medical advice, and manage your health - all from the comfort of your home.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <FaPhone className="mr-3 text-emerald-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaEnvelope className="mr-3 text-emerald-400" />
                  <span>support@telemedicine.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaMapMarkerAlt className="mr-3 text-emerald-400" />
                  <span>San Francisco, CA 94102</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-700 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-500 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-bold text-white mb-4">{section.title}</h4>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 block"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="mt-16 pt-12 border-t border-gray-700">
            <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
              <div className="mb-8 lg:mb-0">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Download Our Mobile App
                </h3>
                <p className="text-gray-300 mb-6 max-w-lg">
                  Access healthcare services on-the-go with our mobile application. 
                  Available on iOS and Android platforms.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#"
                    className="group flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaApple className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </a>
                  
                  <a
                    href="#"
                    className="group flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaGooglePlay className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="max-w-md mx-auto lg:mx-0">
                <h4 className="text-lg font-bold text-white mb-4">Stay Updated</h4>
                <p className="text-gray-300 mb-4">
                  Get health tips and updates delivered to your inbox.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} TeleMedicine. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>🔒 HIPAA Compliant</span>
                <span>🛡️ ISO Certified</span>
                <span>⭐ 4.9 Rating</span>
              </div>
              
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110"
                aria-label="Scroll to top"
              >
                <FaArrowUp />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};