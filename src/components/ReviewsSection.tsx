import React from 'react';
import { CustomerReview } from '../types';
import { Star, MessageSquareQuote, ExternalLink } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  mapsUrl: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, mapsUrl }) => {
  return (
    <section id="reviews" className="py-20 md:py-28 bg-[#0e1014] border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Guest Feedback
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display">
              Verified Patron Impressions
            </h2>
            <p className="text-sm sm:text-base text-stone-400 max-w-xl">
              Authentic customer remarks from Google Maps and in-restaurant visits.
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white hover:border-amber-400/50 transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <span>Review Us on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-xl bg-stone-900/40 border border-stone-800">
            <MessageSquareQuote className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <div className="text-base font-semibold text-stone-300">
              No public reviews logged yet
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Be among the first to review Crunchy Bite on Google Maps or visit our Wazeerganj location.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-xl bg-stone-900/40 border border-stone-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-stone-300 leading-relaxed italic">
                    "{rev.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-300">{rev.customerName}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span>{rev.source}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rev.reviewDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
