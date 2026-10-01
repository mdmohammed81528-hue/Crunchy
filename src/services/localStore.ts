import {
  RestaurantSettings,
  BusinessDayHours,
  MenuItem,
  GalleryItem,
  CustomerReview,
  Booking,
  BlockedDate,
  BlockedSlot,
  AvailabilityResponse,
} from '../types';

const INITIAL_SETTINGS: RestaurantSettings = {
  businessName: 'Crunchy Bite Taste The Crunch',
  tagline: 'Taste The Crunch',
  businessType: 'Non-Vegetarian Restaurant',
  address: 'In front of Marwari Bhavan, Wazeerganj, Faizabad, Uttar Pradesh 224001, India',
  phone: '+91 99367 22297',
  mapsUrl: 'https://maps.app.goo.gl/S1BfvnVBSyAgzyW56',
  openingHoursText: 'Monday–Sunday: 11:30 AM – 11:30 PM',
  slotDurationMinutes: 60,
  maxBookingsPerSlot: 6,
  maxGuestsPerBooking: 12,
  advanceBookingDays: 30,
  isBookingEnabled: true,
};

const INITIAL_HOURS: BusinessDayHours[] = [
  { id: 'bh_0', dayOfWeek: 0, dayName: 'Sunday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_1', dayOfWeek: 1, dayName: 'Monday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_2', dayOfWeek: 2, dayName: 'Tuesday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_3', dayOfWeek: 3, dayName: 'Wednesday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_4', dayOfWeek: 4, dayName: 'Thursday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_5', dayOfWeek: 5, dayName: 'Friday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  { id: 'bh_6', dayOfWeek: 6, dayName: 'Saturday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
];

const INITIAL_SERVICES: MenuItem[] = [
  {
    id: 'srv_1',
    name: 'Crunchy Spiced Chicken Fillets',
    description: 'Signature crispy golden chicken fillets coated in spiced crunchy batter, served with house garlic mayonnaise and lemon slice.',
    price: 180,
    category: 'Crunchy Specials',
    isNonVeg: true,
    isActive: true,
    isFeatured: true,
    imageUrl: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 1,
  },
  {
    id: 'srv_2',
    name: 'Golden Crispy Drumsticks (2 pcs)',
    description: 'Double seasoned tender chicken drumsticks with supreme crunch and juicy core, served hot with seasoned dip.',
    price: 220,
    category: 'Crunchy Specials',
    isNonVeg: true,
    isActive: true,
    isFeatured: true,
    imageUrl: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 2,
  },
  {
    id: 'srv_3',
    name: 'Crispy Pepper Chicken Wings (6 pcs)',
    description: 'Succulent chicken wings tossed in crushed black pepper crunch crust, fried to golden perfection.',
    price: 240,
    category: 'Crunchy Specials',
    isNonVeg: true,
    isActive: true,
    isFeatured: true,
    imageUrl: 'https://images.pexels.com/photos/2232433/pexels-photo-2232433.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 3,
  },
  {
    id: 'srv_4',
    name: 'Tandoori Roast Chicken (Half)',
    description: 'Slow roasted in traditional spices, juicy roasted chicken served with mint chutney and fresh sliced rings.',
    price: 260,
    category: 'Tandoor & Grills',
    isNonVeg: true,
    isActive: true,
    isFeatured: true,
    imageUrl: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 4,
  },
  {
    id: 'srv_5',
    name: 'Smoky Chicken Seekh Kebab (4 pcs)',
    description: 'Charred minced chicken skewers with fresh mint, ginger, green chilies, and aromatic roasted garam masala.',
    price: 190,
    category: 'Tandoor & Grills',
    isNonVeg: true,
    isActive: true,
    isFeatured: false,
    imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 5,
  },
  {
    id: 'srv_6',
    name: 'Crunchy Chicken Wrap / Roll',
    description: 'Crispy fried chicken strips, pickled red onions, and tangy sauce rolled in warm handcrafted flatbread.',
    price: 130,
    category: 'Rolls & Quick Bites',
    isNonVeg: true,
    isActive: true,
    isFeatured: true,
    imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 6,
  },
  {
    id: 'srv_7',
    name: 'Seasoned Crinkle Cut Fries',
    description: 'Crisp golden potato crinkle fries with house herb seasoning and dip.',
    price: 90,
    category: 'Sides & Coolers',
    isNonVeg: false,
    isActive: true,
    isFeatured: false,
    imageUrl: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 7,
  },
  {
    id: 'srv_8',
    name: 'Fresh Mint Lime Cooler',
    description: 'Chilled refreshing lime soda infused with crushed garden mint and rock salt.',
    price: 60,
    category: 'Sides & Coolers',
    isNonVeg: false,
    isActive: true,
    isFeatured: false,
    imageUrl: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=800',
    sortOrder: 8,
  },
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    imageUrl: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Crisp golden chicken fillets with house dips',
    category: 'Food',
    sortOrder: 1,
    isFeatured: true,
  },
  {
    id: 'gal_2',
    imageUrl: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Tender seasoned drumsticks fried to supreme crunch',
    category: 'Food',
    sortOrder: 2,
    isFeatured: true,
  },
  {
    id: 'gal_3',
    imageUrl: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Freshly prepared non-veg skewers and tandoori grills',
    category: 'Kitchen',
    sortOrder: 3,
    isFeatured: true,
  },
  {
    id: 'gal_4',
    imageUrl: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Warm, inviting dining room ambiance for families & friends',
    category: 'Ambiance',
    sortOrder: 4,
    isFeatured: true,
  },
  {
    id: 'gal_5',
    imageUrl: 'https://images.pexels.com/photos/2232433/pexels-photo-2232433.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Crispy pepper chicken wings tossed in spice crunch',
    category: 'Food',
    sortOrder: 5,
    isFeatured: true,
  },
  {
    id: 'gal_6',
    imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Succulent chicken seekh kebabs with fresh lemon & mint dip',
    category: 'Food',
    sortOrder: 6,
    isFeatured: true,
  },
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev_1',
    customerName: 'Rohit K.',
    rating: 5,
    reviewDate: '2026-09-18',
    content: 'Crispy chicken is truly flavorful and piping hot. Great location right in front of Marwari Bhavan in Wazeerganj!',
    source: 'Google Maps',
    isPublished: true,
  },
  {
    id: 'rev_2',
    customerName: 'Vikram S.',
    rating: 5,
    reviewDate: '2026-09-22',
    content: 'Fresh crunch, juicy meat inside, and friendly staff. One of the best quick bite non-veg spots in Faizabad.',
    source: 'Google Maps',
    isPublished: true,
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`cb_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`cb_${key}`, JSON.stringify(val));
  } catch {}
}

export const localStore = {
  getSettings: (): RestaurantSettings => getStored('settings', INITIAL_SETTINGS),
  setSettings: (s: RestaurantSettings) => setStored('settings', s),

  getHours: (): BusinessDayHours[] => getStored('hours', INITIAL_HOURS),
  setHours: (h: BusinessDayHours[]) => setStored('hours', h),

  getServices: (): MenuItem[] => getStored('services', INITIAL_SERVICES),
  setServices: (s: MenuItem[]) => setStored('services', s),

  getGallery: (): GalleryItem[] => getStored('gallery', INITIAL_GALLERY),
  setGallery: (g: GalleryItem[]) => setStored('gallery', g),

  getReviews: (): CustomerReview[] => getStored('reviews', INITIAL_REVIEWS),
  setReviews: (r: CustomerReview[]) => setStored('reviews', r),

  getBookings: (): Booking[] =>
    getStored('bookings', [
      {
        id: 'bkg_sample_1',
        bookingReference: 'CB-2609-8472',
        customerName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        email: 'aarav.sharma@example.com',
        serviceId: 'srv_1',
        serviceName: 'Dine-In Table Reservation',
        bookingDate: '2026-10-02',
        bookingTime: '19:30',
        guestCount: 4,
        specialRequest: 'Window booth or quiet corner if available',
        status: 'confirmed',
        notes: 'Family dining',
        createdAt: '2026-09-30T04:00:00.000Z',
        updatedAt: '2026-09-30T04:15:00.000Z',
      },
    ]),
  setBookings: (b: Booking[]) => setStored('bookings', b),

  getBlockedDates: (): BlockedDate[] => getStored('blocked_dates', []),
  setBlockedDates: (bd: BlockedDate[]) => setStored('blocked_dates', bd),

  getBlockedSlots: (): BlockedSlot[] => getStored('blocked_slots', []),
  setBlockedSlots: (bs: BlockedSlot[]) => setStored('blocked_slots', bs),

  checkAvailability: (dateStr: string): AvailabilityResponse => {
    const hours = localStore.getHours();
    const blockedDates = localStore.getBlockedDates();
    const blockedSlots = localStore.getBlockedSlots();
    const bookings = localStore.getBookings();
    const settings = localStore.getSettings();

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = targetDate.getDay();
    const daySchedule = hours.find((h) => h.dayOfWeek === dayOfWeek);

    if (blockedDates.some((b) => b.date === dateStr)) {
      return { date: dateStr, isOpen: false, reason: 'Closed for private event', slots: [] };
    }

    if (!daySchedule || !daySchedule.isOpen) {
      return { date: dateStr, isOpen: false, reason: 'Closed on this day', slots: [] };
    }

    const [opH, opM] = daySchedule.openingTime.split(':').map(Number);
    const [clH, clM] = daySchedule.closingTime.split(':').map(Number);
    const slotDuration = settings.slotDurationMinutes || 60;
    const maxPerSlot = settings.maxBookingsPerSlot || 6;

    let curMin = opH * 60 + opM;
    const endMin = clH * 60 + clM;
    const slots = [];

    const existing = bookings.filter((b) => b.bookingDate === dateStr && b.status !== 'cancelled');
    const blockedSlotTimes = new Set(
      blockedSlots.filter((bs) => bs.date === dateStr).map((bs) => bs.time)
    );

    while (curMin + slotDuration <= endMin) {
      const h = Math.floor(curMin / 60);
      const m = curMin % 60;
      const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const label = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${period}`;

      const bookedCount = existing.filter((b) => b.bookingTime === timeKey).length;
      const isBlocked = blockedSlotTimes.has(timeKey);
      const isAvailable = !isBlocked && bookedCount < maxPerSlot;

      slots.push({
        time: timeKey,
        label,
        isAvailable,
        remainingCapacity: Math.max(0, maxPerSlot - bookedCount),
        reason: isBlocked ? 'Reserved' : bookedCount >= maxPerSlot ? 'Fully booked' : undefined,
      });

      curMin += slotDuration;
    }

    return {
      date: dateStr,
      isOpen: true,
      dayName: daySchedule.dayName,
      openingTime: daySchedule.openingTime,
      closingTime: daySchedule.closingTime,
      slots,
    };
  },

  createBooking: (data: any): Booking => {
    const bookings = localStore.getBookings();
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = data.bookingDate.replace(/-/g, '').slice(2);
    const bookingReference = `CB-${dateFormatted}-${randCode}`;

    const newBooking: Booking = {
      id: `bkg_${Date.now()}_${randCode}`,
      bookingReference,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      serviceId: data.serviceId,
      serviceName: data.serviceId ? 'Special Order Dine-In' : 'Dine-In Table Reservation',
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      guestCount: data.guestCount,
      specialRequest: data.specialRequest,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    localStore.setBookings(bookings);
    return newBooking;
  },
};
