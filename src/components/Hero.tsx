import React, { useMemo } from 'react';
import { Calendar, Utensils, Phone, Navigation, Clock, MapPin } from 'lucide-react';
import { RestaurantSettings, BusinessDayHours } from '../types';

interface HeroProps {
  settings: RestaurantSettings;
  businessHours: BusinessDayHours[];
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, businessHours, onOpenBooking }) => {
  // Compute open status based on current time
  const statusInfo = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = businessHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!todaySchedule || !todaySchedule.isOpen) {
      return { isOpen: false, text: 'Closed today' };
    }

    const [openH, openM] = todaySchedule.openingTime.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.closingTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return {
        isOpen: true,
        text: `Open now until ${todaySchedule.closingTime === '23:30' ? '11:30 PM' : todaySchedule.closingTime}`,
      };
    } else if (currentMinutes < openMinutes) {
      return {
        isOpen: false,
        text: `Opens at ${todaySchedule.openingTime === '11:30' ? '11:30 AM' : todaySchedule.openingTime}`,
      };
    } else {
      return { isOpen: false, text: 'Closed for tonight' };
    }
  }, [businessHours]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#13151a] via-[#0d0f12] to-[#0b0c0e]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed metadata separator without pill chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-400">
              <span className="font-semibold text-amber-400 tracking-wider uppercase">
                {settings.businessType || 'Non-Vegetarian Restaurant'}
              </span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusInfo.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-stone-300 font-medium">{statusInfo.text}</span>
              </div>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-stone-400">Wazeerganj, Faizabad</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-display leading-[1.05] text-balance">
                Taste The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Crunch.</span>
              </h1>
              <p className="text-xl sm:text-2xl font-medium text-stone-300 tracking-wide font-display">
                {settings.businessName}
              </p>
            </div>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-300 max-w-xl leading-relaxed">
              Serving freshly prepared crispy chicken bites, authentic charcoal tandoori grills, and savory quick bites. Crafted for food lovers seeking genuine crunch, robust flavors, and warm hospitality in the heart of Faizabad.
            </p>

            {/* Location & Quick Details Callout */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-2 max-w-xl">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-400">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Operating Hours: {settings.openingHoursText}</span>
              </div>
            </div>

            {/* Action CTA Cluster */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Table</span>
              </button>

              <a
                href="#menu"
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-lg transition-colors whitespace-nowrap"
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>View Menu</span>
              </a>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white border border-stone-800 rounded-lg hover:border-stone-700 transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Now</span>
              </a>

              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white border border-stone-800 rounded-lg hover:border-stone-700 transition-colors whitespace-nowrap"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right Column: Culinary Presentation Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
                {/* Culinary Badge */}
                <div className="space-y-1 border-b border-stone-800 pb-4">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                    Culinary Spotlight
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display">
                    Signature Crunch & Sizzle
                  </h2>
                  <p className="text-xs text-stone-400">
                    Prepared hot and crisp on order
                  </p>
                </div>

                {/* High-res food image showcase */}
                <div className="relative h-72 sm:h-80 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner group">
                  <img
                    src="https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=1000"
                    alt="Signature Crunchy Bite Crispy Chicken Platter"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle contrast gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider font-mono">
                          Signature Dish
                        </span>
                        <div className="text-lg font-bold text-white font-display">
                          Golden Crispy Chicken Platter
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-amber-400 text-black font-bold font-mono text-xs shadow-md">
                        ₹180 onwards
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Experience Highlights */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800/80">
                    <div className="text-xs text-stone-400">Dine-in Experience</div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">AC Family Dining</div>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800/80">
                    <div className="text-xs text-stone-400">Takeaway & Quick Bite</div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">Fast Packaging</div>
                  </div>
                </div>

                {/* Direct reservation teaser */}
                <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                  <span>Planning a group dinner?</span>
                  <button
                    onClick={onOpenBooking}
                    className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
                  >
                    Reserve slots ahead →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
