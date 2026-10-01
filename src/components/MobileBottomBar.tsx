import React from 'react';
import { Phone, Navigation, Calendar } from 'lucide-react';

interface MobileBottomBarProps {
  phone: string;
  mapsUrl: string;
  onOpenBooking: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  phone,
  mapsUrl,
  onOpenBooking,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c0d10]/95 backdrop-blur-md border-t border-stone-800 px-3 py-2.5 shadow-2xl max-h-[64px]">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Call Button */}
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs font-semibold active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-amber-400" />
          <span>Call</span>
        </a>

        {/* Directions Button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-xs font-semibold active:scale-95 transition-transform"
        >
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>Directions</span>
        </a>

        {/* Primary Reserve Button */}
        <button
          onClick={onOpenBooking}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 text-black text-xs font-bold shadow-md active:scale-95 transition-transform"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Table</span>
        </button>
      </div>
    </div>
  );
};
