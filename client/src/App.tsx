/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Departments from './components/Departments';
import WhyChooseUs from './components/WhyChooseUs';
import References from './components/References';
import JobApplication from './components/JobApplication';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';

export default function App() {
  const [showLogin, setShowLogin] = useState(() => window.location.hash === '#login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === '1') {
      localStorage.removeItem('rm_admin_token');
      window.history.replaceState({}, '', window.location.pathname);
      window.location.hash = 'login';
      setShowLogin(true);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setShowLogin(window.location.hash === '#login');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleOpenLogin = () => {
    window.location.hash = 'login';
    setShowLogin(true);
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    setShowLogin(false);
  };

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

  if (showLogin) {
    return <LoginPage onBackToHome={handleBackToHome} />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col justify-between overflow-x-hidden">
      {/* Navigation bar */}
      <Navbar
        onBookConsultation={handleBookConsultation}
        onOpenLogin={handleOpenLogin}
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

        {/* Trust logos and Sector references with filters */}
        <References />

        {/* Job Application Form */}
        <JobApplication />

        {/* Dual-tab contact & RDV Booking forms */}
        <ContactSection />
      </main>

      {/* Corporate footer */}
      <Footer onOpenLogin={handleOpenLogin} />
    </div>
  );
}

