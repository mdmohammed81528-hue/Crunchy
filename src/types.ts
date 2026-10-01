export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isNonVeg: boolean;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  sortOrder: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceId?: string;
  serviceName?: string;
  bookingDate: string;
  bookingTime: string;
  guestCount: number;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDayHours {
  id: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  breaks: Array<{ start: string; end: string; reason?: string }>;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  time: string;
  reason: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category?: string;
  sortOrder: number;
  isFeatured: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  reviewDate: string;
  content: string;
  source: 'Google Maps' | 'In-Restaurant' | 'Direct Customer';
  isPublished: boolean;
}

export interface RestaurantSettings {
  businessName: string;
  tagline: string;
  businessType: string;
  address: string;
  phone: string;
  mapsUrl: string;
  openingHoursText: string;
  slotDurationMinutes: number;
  maxBookingsPerSlot: number;
  maxGuestsPerBooking: number;
  advanceBookingDays: number;
  isBookingEnabled: boolean;
}

export interface TimeSlot {
  time: string;
  label: string;
  isAvailable: boolean;
  remainingCapacity: number;
  reason?: string;
}

export interface AvailabilityResponse {
  date: string;
  isOpen: boolean;
  reason?: string;
  dayName?: string;
  openingTime?: string;
  closingTime?: string;
  slots: TimeSlot[];
}
