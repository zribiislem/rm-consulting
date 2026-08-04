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
import JoinUsHero from './components/JoinUsHero';
import JobApplication from './components/JobApplication';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import JobOffersPage from './components/JobOffersPage';
import JobOfferDetailPage from './components/JobOfferDetailPage';

type Route =
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'offers' }
  | { name: 'offer-detail'; offerId: string }
  | { name: 'postuler' };

const parseHash = (): Route => {
  const hash = window.location.hash || '';
  if (hash === '#login') return { name: 'login' };
  if (hash.startsWith('#/offres/')) {
    return { name: 'offer-detail', offerId: hash.slice('#/offres/'.length).split('?')[0] };
  }
  if (hash.startsWith('#/offres')) return { name: 'offers' };
  if (hash.startsWith('#/postuler') || hash.startsWith('#job-application')) return { name: 'postuler' };
  return { name: 'home' };
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === '1') {
      localStorage.removeItem('rm_admin_token');
      window.history.replaceState({}, '', window.location.pathname);
      window.location.hash = 'login';
      setRoute({ name: 'login' });
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Remonte en haut de page lors d'un changement de page (offres, détail, login, postuler)
  useEffect(() => {
    if (route.name === 'offers' || route.name === 'offer-detail' || route.name === 'login' || route.name === 'postuler') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [route]);

  // Ancres "recrutement" (#job-application) : redirige vers la page de candidature
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#job-application')) {
      window.location.hash = hash.replace('#job-application', '#/postuler');
      setRoute({ name: 'postuler' });
    }
  }, []);

  const handleOpenLogin = () => {
    window.location.hash = 'login';
    setRoute({ name: 'login' });
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    setRoute({ name: 'home' });
  };

  const handleBookConsultation = () => {
    if (route.name !== 'home') {
      window.location.hash = '#contact';
      setRoute({ name: 'home' });
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('set-contact-tab', { detail: 'rdv' }));
      }, 200);
      return;
    }
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

  if (route.name === 'login') {
    return <LoginPage onBackToHome={handleBackToHome} />;
  }

  if (route.name === 'offers') {
    return <JobOffersPage />;
  }

  if (route.name === 'offer-detail') {
    return <JobOfferDetailPage offerId={route.offerId} />;
  }

  if (route.name === 'postuler') {
    return <JobApplication />;
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

        {/* Rejoignez notre équipe — le bouton "Voir plus" ouvre la page de candidature */}
        <JoinUsHero
          onViewMore={() => {
            window.location.hash = '/postuler';
            setRoute({ name: 'postuler' });
          }}
        />

        {/* Dual-tab contact & RDV Booking forms */}
        <ContactSection />
      </main>

      {/* Corporate footer */}
      <Footer onOpenLogin={handleOpenLogin} />
    </div>
  );
}
