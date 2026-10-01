import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { Utensils, Edit3, Flame } from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  onOpenBookingWithService?: (service: MenuItem) => void;
  onOpenAdmin?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  onOpenBookingWithService,
  onOpenAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <section id="menu" className="py-20 md:py-28 bg-[#0e1014] border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Kitchen Specialties & Selections
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display">
              Menu & Offerings
            </h2>
            <p className="text-sm sm:text-base text-stone-400 max-w-xl">
              Freshly prepared non-vegetarian dishes, crispy poultry cuts, charcoal grills, and quick accompaniments.
            </p>
          </div>

          {/* Admin Management Hint */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900/60"
              title="Restaurant Owner: Update prices or add new items"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Owner: Edit Menu CMS</span>
            </button>
          </div>
        </div>

        {/* Category Tabs (Functional Segmented Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-xl bg-stone-900/30 border border-stone-800">
            <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <div className="text-lg font-semibold text-stone-300">No items in this category</div>
            <p className="text-xs text-stone-500 mt-1">
              The restaurant owner can add new dishes anytime via the Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-stone-900/40 border border-stone-800 hover:border-stone-700 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Row: Veg/Non-Veg icon and Category label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Standard Indian Veg/Non-Veg Symbol */}
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          item.isNonVeg ? 'border-rose-600' : 'border-emerald-600'
                        }`}
                        title={item.isNonVeg ? 'Non-Vegetarian' : 'Vegetarian'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isNonVeg ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        />
                      </span>

                      <span className="text-xs text-stone-400 font-medium">
                        {item.category}
                      </span>
                    </div>

                    {item.isFeatured && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <Flame className="w-3 h-3" />
                        <span>Specialty</span>
                      </span>
                    )}
                  </div>

                  {/* Item Image with reliable fallback */}
                  <div className="relative h-44 rounded-lg overflow-hidden bg-stone-900 border border-stone-800/80">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800'
                      }
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed">
                      {item.description || 'Prepared fresh upon order with authentic seasonings.'}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between">
                  <div className="text-lg font-bold text-amber-400 font-mono-tabular">
                    ₹{item.price}
                  </div>

                  {onOpenBookingWithService && (
                    <button
                      onClick={() => onOpenBookingWithService(item)}
                      className="text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Reserve with this item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Note */}
        <div className="mt-12 text-center text-xs text-stone-500 max-w-xl mx-auto">
          <span>* Menu items, seasonal batches, and prices are subject to kitchen availability. Restaurant staff can modify live menu offerings at any time via the staff dashboard.</span>
        </div>
      </div>
    </section>
  );
};
