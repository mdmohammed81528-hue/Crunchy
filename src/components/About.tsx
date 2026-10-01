import React from 'react';
import { Drumstick, Users, UtensilsCrossed, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  const highlights = [
    {
      icon: Drumstick,
      title: 'Crispy & Non-Veg Craft',
      description:
        'Specializing in premium non-vegetarian preparations—from batter-crusted crunchy chicken to tender spiced charcoal grills and rolls.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Dine-In & Quick Takeaway',
      description:
        'Whether you seek a relaxed table meal with family or quick bites on the go, our kitchen is geared for swift and consistent food quality.',
    },
    {
      icon: Users,
      title: 'Family & Group Friendly',
      description:
        'Comfortable seating designed to accommodate solo diners, casual student groups, and family gatherings in Wazeerganj, Faizabad.',
    },
    {
      icon: Sparkles,
      title: 'Freshness & Daily Prep',
      description:
        'Every portion is prepared with clean cooking oil, fresh cuts, and balanced spice marinades without compromise on hygiene.',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-[#0b0c0e] border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            The Dining Experience
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display text-balance">
            Casual Comfort Meets Uncompromising Crunch
          </h2>
          <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
            Located right in front of Marwari Bhavan in Wazeerganj, Faizabad, <span className="text-amber-400 font-semibold">Crunchy Bite Taste The Crunch</span> was created for patrons who crave bold flavors, hot crisp textures, and genuine non-vegetarian dining.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/40 transition-colors group space-y-4"
              >
                <div className="w-12 h-12 rounded-lg bg-stone-800/70 border border-stone-700/60 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="text-xs font-mono text-stone-600">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual Photo Showcase Row */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-800 shadow-xl group">
            <img
              src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Crunchy Bite Dining Atmosphere"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                Dine-In Space
              </span>
              <div className="text-base font-bold text-white font-display">
                Inviting Dining Room in Wazeerganj
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Family tables and comfortable booths for an enjoyable meal.
              </p>
            </div>
          </div>

          <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-800 shadow-xl group">
            <img
              src="https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Tandoori and Charcoal Grills"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                Kitchen Craft
              </span>
              <div className="text-base font-bold text-white font-display">
                Charcoal Roasts & Sizzling Skewers
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Spiced cuts roasted to smoky tenderness over glowing coals.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/80 to-stone-950 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white font-display">
              Visiting Crunchy Bite Today?
            </h3>
            <p className="text-sm text-stone-400">
              Kitchen is fired from 11:30 AM to 11:30 PM. Walk-ins welcome, or reserve your table in advance.
            </p>
          </div>
          <a
            href="#booking"
            className="px-6 py-3 text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-md"
          >
            Check Available Slots
          </a>
        </div>
      </div>
    </section>
  );
};
