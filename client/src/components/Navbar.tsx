import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Building, HelpCircle, Phone, FileText, Users, Calendar } from 'lucide-react';

interface NavbarProps {
  onOpenPortal: () => void;
  onBookConsultation: () => void;
}

export default function Navbar({ onOpenPortal, onBookConsultation }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'À propos', href: '#about', action: 'about' },
    { name: 'Départements', href: '#departments', action: 'departments' },
    { name: 'Équipe', href: '#team', action: 'team' },
    { name: 'Relation Client', href: '#references', action: 'references' },
    { name: 'Contact', href: '#contact', action: 'contact' },
    { name: 'Rendez-vous', href: '#contact', action: 'rdv' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.action === 'rdv') {
      e.preventDefault();
      onBookConsultation();
    } else if (link.action === 'contact') {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('set-contact-tab', { detail: 'message' }));
      }
    }
  };

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-outline-variant/30'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              RM
            </div>
            <span
              id="logo-text"
              className={`font-display text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-primary' : 'text-white'
              }`}
            >
              RM Consulting
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`font-sans font-medium text-sm transition-colors duration-200 ${
                  isScrolled
                    ? 'text-on-surface-variant hover:text-primary'
                    : 'text-white hover:text-secondary-fixed'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={onOpenPortal}
              className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${
                isScrolled
                  ? 'border-primary/20 text-primary hover:bg-primary/5'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              Espace Interne
            </button>
            <button
              onClick={onBookConsultation}
              className="bg-secondary text-white px-5 py-2.5 rounded-lg font-sans font-semibold text-sm hover:bg-secondary/90 shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              Prendre RDV
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={onOpenPortal}
              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border ${
                isScrolled
                  ? 'border-primary/20 text-primary'
                  : 'border-white/30 text-white'
              }`}
            >
              Portail
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-primary hover:bg-black/5' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity animate-fade-in md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-2xl p-6 transition-transform duration-300 ease-out transform md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              RM
            </div>
            <span className="font-display font-bold text-lg text-primary">RM Consulting</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleLinkClick(e, link);
              }}
              className="font-sans font-medium text-lg text-gray-800 hover:text-primary hover:translate-x-1 transition-all py-2"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenPortal();
            }}
            className="w-full text-center border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Espace Interne Collaborateur
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onBookConsultation();
            }}
            className="w-full bg-secondary text-white text-center py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Prendre Rendez-vous
          </button>
        </div>
      </div>
    </>
  );
}
