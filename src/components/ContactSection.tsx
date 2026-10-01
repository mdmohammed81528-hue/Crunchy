import React from 'react';
import { MapPin, Phone, Clock, Navigation, Calendar, ExternalLink } from 'lucide-react';
import { RestaurantSettings, BusinessDayHours } from '../types';

interface ContactSectionProps {
  settings: RestaurantSettings;
  businessHours: BusinessDayHours[];
  onOpenBooking: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  businessHours,
  onOpenBooking,
}) => {
  return (
    <section id="location" className="py-20 md:py-28 bg-[#0b0c0e] border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Visit & Contact
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display">
            Find Crunchy Bite
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto">
            Conveniently positioned in front of Marwari Bhavan in Wazeerganj, Faizabad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white font-display">
                  {settings.businessName}
                </h3>
                <p className="text-xs font-medium text-amber-400 tracking-wider uppercase">
                  {settings.businessType}
                </p>
              </div>

              <div className="space-y-4 text-sm text-stone-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold uppercase block">
                      Physical Address
                    </span>
                    <span className="font-medium text-stone-200 leading-snug">
                      {settings.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold uppercase block">
                      Telephone / Reservation Desk
                    </span>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="font-bold text-amber-400 hover:text-amber-300 text-base font-mono-tabular"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold uppercase block">
                      General Operating Hours
                    </span>
                    <span className="font-medium text-stone-200">
                      {settings.openingHoursText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-400 text-black font-semibold text-xs sm:text-sm hover:bg-amber-300 transition-colors shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>

                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-stone-800 text-white font-semibold text-xs sm:text-sm hover:bg-stone-700 border border-stone-700 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Get Directions</span>
                </a>

                <button
                  onClick={onOpenBooking}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-stone-900 text-amber-400 border border-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-800 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Table</span>
                </button>
              </div>
            </div>

            {/* Operating Schedule Table */}
            <div className="p-5 rounded-xl bg-stone-900/40 border border-stone-800 space-y-3">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Full Weekly Schedule
              </h4>
              <div className="divide-y divide-stone-800/80 text-xs">
                {businessHours.map((bh) => (
                  <div key={bh.dayOfWeek} className="py-2 flex items-center justify-between">
                    <span className="text-stone-300 font-medium">{bh.dayName}</span>
                    <span className="font-mono text-stone-400">
                      {bh.isOpen ? `${bh.openingTime} – ${bh.closingTime}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Card / Embed */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-stone-200">
                    Google Maps Location
                  </span>
                </div>
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
                >
                  <span>Open in Maps App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Map presentation container */}
              <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex flex-col items-center justify-center p-6 text-center group">
                <div className="space-y-4 max-w-sm">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-display">
                      Crunchy Bite Taste The Crunch
                    </div>
                    <div className="text-xs text-stone-400 mt-1 leading-relaxed">
                      In front of Marwari Bhavan, Wazeerganj, Faizabad, Uttar Pradesh 224001, India
                    </div>
                  </div>
                  <div className="pt-2">
                    <a
                      href={settings.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/10"
                    >
                      <span>Navigate via Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-stone-500 pt-1">
                Landmark: Directly opposite Marwari Bhavan in Wazeerganj. Parking available nearby.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
