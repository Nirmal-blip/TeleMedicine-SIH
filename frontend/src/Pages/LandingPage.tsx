import React from 'react';
import Navbar from '../Components/Navbar';
import { Home } from '../Components/Home';
import { About } from '../Components/About';
import { ConsultationService } from '../Components/ConsultationService';
import { HowItWorks } from '../Components/HowItWorks';
import { Experts } from '../Components/Experts';
import { Testimonials } from '../Components/Testimonials';
import { FAQ } from '../Components/FAQ';
import { CTA } from '../Components/CTA';
import { Footer } from '../Components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20"> {/* Add top padding to account for fixed navbar */}
        <section id="home">
          <Home />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="services">
          <ConsultationService />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="doctors">
          <Experts />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="faq">
          <FAQ />
        </section>
        <section id="cta">
          <CTA />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;