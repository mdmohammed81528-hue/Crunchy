import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: 'admin';
  createdAt: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceId?: string;
  serviceName?: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm
  guestCount: number;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDayHours {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;
  isOpen: boolean;
  openingTime: string; // "11:30"
  closingTime: string; // "23:30"
  breaks: Array<{ start: string; end: string; reason?: string }>;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
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
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  reviewDate: string;
  content: string;
  source: 'Google Maps' | 'In-Restaurant' | 'Direct Customer';
  isPublished: boolean;
  createdAt: string;
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
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  settings: RestaurantSettings;
  businessHours: BusinessDayHours[];
  blockedDates: BlockedDate[];
  blockedSlots: BlockedSlot[];
  services: MenuItem[];
  bookings: Booking[];
  gallery: GalleryItem[];
  reviews: CustomerReview[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'restaurant_db.json');

// Password hashing utilities using Node.js crypto
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

const defaultAdminPassword = hashPassword('CrunchyBite@2026');

const initialDb: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_1',
      username: 'admin',
      name: 'Restaurant Manager',
      passwordHash: defaultAdminPassword.hash,
      salt: defaultAdminPassword.salt,
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ],
  settings: {
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
    updatedAt: new Date().toISOString(),
  },
  businessHours: [
    { id: 'bh_0', dayOfWeek: 0, dayName: 'Sunday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_1', dayOfWeek: 1, dayName: 'Monday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_2', dayOfWeek: 2, dayName: 'Tuesday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_3', dayOfWeek: 3, dayName: 'Wednesday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_4', dayOfWeek: 4, dayName: 'Thursday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_5', dayOfWeek: 5, dayName: 'Friday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
    { id: 'bh_6', dayOfWeek: 6, dayName: 'Saturday', isOpen: true, openingTime: '11:30', closingTime: '23:30', breaks: [] },
  ],
  blockedDates: [],
  blockedSlots: [],
  services: [
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  bookings: [
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
  ],
  gallery: [
    {
      id: 'gal_1',
      imageUrl: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Crisp golden chicken fillets with house dips',
      category: 'Food',
      sortOrder: 1,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal_2',
      imageUrl: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Tender seasoned drumsticks fried to supreme crunch',
      category: 'Food',
      sortOrder: 2,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal_3',
      imageUrl: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Freshly prepared non-veg skewers and tandoori grills',
      category: 'Kitchen',
      sortOrder: 3,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal_4',
      imageUrl: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Warm, inviting dining room ambiance for families & friends',
      category: 'Ambiance',
      sortOrder: 4,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal_5',
      imageUrl: 'https://images.pexels.com/photos/2232433/pexels-photo-2232433.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Crispy pepper chicken wings tossed in spice crunch',
      category: 'Food',
      sortOrder: 5,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal_6',
      imageUrl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Succulent chicken seekh kebabs with fresh lemon & mint dip',
      category: 'Food',
      sortOrder: 6,
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
  ],
  reviews: [
    {
      id: 'rev_1',
      customerName: 'Rohit K.',
      rating: 5,
      reviewDate: '2026-09-18',
      content: 'Crispy chicken is truly flavorful and piping hot. Great location right in front of Marwari Bhavan in Wazeerganj!',
      source: 'Google Maps',
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rev_2',
      customerName: 'Vikram S.',
      rating: 5,
      reviewDate: '2026-09-22',
      content: 'Fresh crunch, juicy meat inside, and friendly staff. One of the best quick bite non-veg spots in Faizabad.',
      source: 'Google Maps',
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...initialDb,
          ...parsed,
          settings: { ...initialDb.settings, ...parsed.settings },
        };
      }
    } catch (err) {
      console.error('[DB] Failed to read database, initializing default:', err);
    }

    this.saveImmediate(initialDb);
    return JSON.parse(JSON.stringify(initialDb));
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      this.saveImmediate(this.data);
    } catch (err) {
      console.error('[DB] Save error:', err);
    } finally {
      this.isSaving = false;
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
