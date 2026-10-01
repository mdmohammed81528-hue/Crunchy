import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../types';
import { Camera, X, Image as ImageIcon, Plus } from 'lucide-react';

interface GallerySectionProps {
  items: GalleryItem[];
  onOpenAdmin?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items, onOpenAdmin }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((it) => it.category === activeCategory);
  }, [items, activeCategory]);

  return (
    <section id="gallery" className="py-20 md:py-28 bg-[#0b0c0e] border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Visual Impressions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display">
              Restaurant & Food Gallery
            </h2>
            <p className="text-sm sm:text-base text-stone-400 max-w-xl">
              Glimpse into our dining atmosphere, kitchen craft, and signature crispy non-veg dishes.
            </p>
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900/60 whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Owner: Upload Real Photos</span>
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeCategory === c
                    ? 'bg-amber-400 text-black'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative h-64 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 cursor-pointer shadow-md hover:border-amber-500/50 transition-all"
            >
              {photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900">
                  <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-stone-300 font-display">
                    Crunchy Bite Moments
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {photo.caption}
                  </div>
                </div>
              )}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-4">
                <p className="text-xs font-medium text-stone-200 line-clamp-2">
                  {photo.caption}
                </p>
                {photo.category && (
                  <span className="text-[10px] text-amber-400 font-mono mt-1">
                    {photo.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-sm font-semibold text-stone-200">
                  {selectedPhoto.caption}
                </span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] flex items-center justify-center bg-black/60 rounded-xl overflow-hidden">
                {selectedPhoto.imageUrl ? (
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.caption}
                    className="max-h-[65vh] w-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <ImageIcon className="w-12 h-12 text-stone-600 mx-auto" />
                    <p className="text-sm text-stone-400">{selectedPhoto.caption}</p>
                    <p className="text-xs text-stone-600">
                      Real photo asset placeholder. Real images can be uploaded anytime via staff portal.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
