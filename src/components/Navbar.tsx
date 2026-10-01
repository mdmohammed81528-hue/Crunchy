import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Lock, Calendar } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  phone: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenAdmin, phone }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Hours & Location', href: '#location' },
    { label: 'Reviews', href: '#reviews' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 border-b ${
        isScrolled
          ? 'bg-[#0b0c0e]/95 backdrop-blur-md border-[#232730] shadow-lg'
          : 'bg-[#0b0c0e]/80 backdrop-blur-sm border-[#1c1f26]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly 3-Zone Contract: Brand Wordmark | 4-6 Nav Links | 1-2 Primary Actions */}
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Crunchy Bite
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-amber-400 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white px-3 py-2 border border-stone-800 rounded-lg transition-colors whitespace-nowrap"
              title="Call restaurant directly"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>{phone}</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Table</span>
            </button>

            {/* Admin Management Entrance */}
            <button
              onClick={onOpenAdmin}
              className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-900 rounded-lg transition-colors"
              title="Staff Portal / Admin Dashboard"
              aria-label="Staff Portal"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1014] border-b border-stone-800 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-stone-200 hover:text-amber-400 py-2 border-b border-stone-800/60"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-sm font-medium text-amber-400 py-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {phone}</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
