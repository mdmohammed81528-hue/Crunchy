import React from 'react';
import { Lock, Phone, MapPin, ExternalLink } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface FooterProps {
  settings: RestaurantSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  return (
    <footer className="bg-[#08090b] border-t border-stone-850 pt-16 pb-28 md:pb-16 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <span className="text-xl font-bold text-white font-display">
              Crunchy Bite
            </span>
            <div className="text-xs text-amber-400 font-semibold tracking-wide">
              {settings.tagline}
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Non-vegetarian restaurant serving freshly prepared crunchy bites, skewers, tandoori grills, and rolls in Wazeerganj, Faizabad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">
                  About the Restaurant
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-400 transition-colors">
                  Menu & Offerings
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-400 transition-colors">
                  Food & Dining Gallery
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-amber-400 transition-colors">
                  Table Reservations
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-amber-400 transition-colors">
                  Hours & Directions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
              Location & Contact
            </div>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:underline"
                >
                  <span>Google Maps Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Link & Netlify Download */}
        <div className="pt-8 border-t border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/crunchy-bite-netlify-deploy.zip"
              download="crunchy-bite-netlify-deploy.zip"
              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors bg-stone-900 px-2.5 py-1 rounded border border-stone-800"
              title="Download compiled files ready to drop on Netlify"
            >
              <span>Download Netlify Deploy ZIP (dist)</span>
            </a>
            <a
              href="/crunchy-bite-source.zip"
              download="crunchy-bite-source.zip"
              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors bg-stone-900 px-2.5 py-1 rounded border border-stone-800"
              title="Download full project source code"
            >
              <span>Source ZIP</span>
            </a>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-stone-500 hover:text-amber-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
