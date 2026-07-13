/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Departments from './components/Departments';
import WhyChooseUs from './components/WhyChooseUs';
import Team from './components/Team';
import References from './components/References';
import ContactSection from './components/ContactSection';
import PortalModal from './components/PortalModal';
import Footer from './components/Footer';

export default function App() {
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const handleBookConsultation = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('set-contact-tab', { detail: 'rdv' }));
    }
  };

  const handleExploreServices = () => {
    const departmentsSection = document.getElementById('departments');
    if (departmentsSection) {
      departmentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col justify-between overflow-x-hidden">
      {/* Navigation bar */}
      <Navbar
        onOpenPortal={() => setIsPortalOpen(true)}
        onBookConsultation={handleBookConsultation}
      />

      {/* Main landing sections */}
      <main className="flex-grow">
        {/* Cinematic Header & Value Proposition */}
        <Hero
          onBookConsultation={handleBookConsultation}
          onExploreServices={handleExploreServices}
        />

        {/* Dynamic Trust Stats Rows */}
        <Stats />

        {/* About: Vision collage & interactive timeline */}
        <About />

        {/* Specialty Divisions / Departments */}
        <Departments />

        {/* Why choose us branding values section */}
        <WhyChooseUs />

        {/* Managing associates team list */}
        <Team />

        {/* Trust logos and Sector references with filters */}
        <References />

        {/* Dual-tab contact & RDV Booking forms */}
        <ContactSection />
      </main>

      {/* Corporate footer */}
      <Footer />

      {/* Collaborative interior staff/client portal modal */}
      <PortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />
    </div>
  );
}

