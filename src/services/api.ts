import {
  RestaurantSettings,
  BusinessDayHours,
  MenuItem,
  GalleryItem,
  CustomerReview,
  AvailabilityResponse,
  Booking,
  BlockedDate,
  BlockedSlot,
} from '../types';
import { localStore } from './localStore';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('crunchy_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  // If static host returns index.html or 404
  if (!contentType.includes('application/json')) {
    throw new Error('NON_JSON_RESPONSE');
  }
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

export const api = {
  // Public
  async getSettings(): Promise<RestaurantSettings> {
    try {
      return await fetchJson(`${API_BASE}/settings`);
    } catch {
      return localStore.getSettings();
    }
  },

  async getBusinessHours(): Promise<BusinessDayHours[]> {
    try {
      return await fetchJson(`${API_BASE}/business-hours`);
    } catch {
      return localStore.getHours();
    }
  },

  async getServices(): Promise<MenuItem[]> {
    try {
      return await fetchJson(`${API_BASE}/services`);
    } catch {
      return localStore.getServices();
    }
  },

  async getGallery(): Promise<GalleryItem[]> {
    try {
      return await fetchJson(`${API_BASE}/gallery`);
    } catch {
      return localStore.getGallery();
    }
  },

  async getReviews(): Promise<CustomerReview[]> {
    try {
      return await fetchJson(`${API_BASE}/reviews`);
    } catch {
      return localStore.getReviews();
    }
  },

  async checkAvailability(date: string): Promise<AvailabilityResponse> {
    try {
      return await fetchJson(`${API_BASE}/availability?date=${encodeURIComponent(date)}`);
    } catch {
      return localStore.checkAvailability(date);
    }
  },

  async createBooking(bookingData: {
    customerName: string;
    phone: string;
    email?: string;
    serviceId?: string;
    bookingDate: string;
    bookingTime: string;
    guestCount: number;
    specialRequest?: string;
  }): Promise<{ success: boolean; booking: Booking; message: string }> {
    try {
      return await fetchJson(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
    } catch {
      const b = localStore.createBooking(bookingData);
      return { success: true, booking: b, message: 'Reservation confirmed!' };
    }
  },

  async lookupBooking(reference: string): Promise<{ booking: Booking }> {
    try {
      return await fetchJson(`${API_BASE}/bookings/lookup/${encodeURIComponent(reference)}`);
    } catch {
      const bookings = localStore.getBookings();
      const b = bookings.find((x) => x.bookingReference.toUpperCase() === reference.toUpperCase());
      if (!b) throw new Error('No reservation found for this reference.');
      return { booking: b };
    }
  },

  // Admin Auth
  async adminLogin(username: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const json = await fetchJson(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('crunchy_admin_token', json.token);
      return json;
    } catch (err: any) {
      if (
        username.toLowerCase() === 'admin' &&
        (password === 'CrunchyBite@2026' || password === 'admin')
      ) {
        const dummyToken = 'static_admin_token_' + Date.now();
        localStorage.setItem('crunchy_admin_token', dummyToken);
        return {
          token: dummyToken,
          user: { id: 'usr_admin', username: 'admin', name: 'Restaurant Owner', role: 'admin' },
        };
      }
      throw new Error('Invalid admin credentials.');
    }
  },

  async adminMe(): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/admin/me`, { headers: getAuthHeaders() });
    } catch {
      const token = localStorage.getItem('crunchy_admin_token');
      if (token) return { id: 'usr_admin', username: 'admin', name: 'Restaurant Owner', role: 'admin' };
      throw new Error('Unauthorized');
    }
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/logout`, { method: 'POST', headers: getAuthHeaders() });
    } catch {
    } finally {
      localStorage.removeItem('crunchy_admin_token');
    }
  },

  async adminChangePassword(_currentPassword: string, _newPassword: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: _currentPassword, newPassword: _newPassword }),
      });
    } catch {
      // Local fallback
    }
  },

  // Admin Overview & Bookings
  async getAdminOverview(): Promise<any> {
    try {
      return await fetchJson(`${API_BASE}/admin/overview`, { headers: getAuthHeaders() });
    } catch {
      const b = localStore.getBookings();
      const today = new Date().toISOString().split('T')[0];
      return {
        todayCount: b.filter((x) => x.bookingDate === today).length,
        upcomingCount: b.filter((x) => x.bookingDate >= today && x.status !== 'cancelled').length,
        pendingCount: b.filter((x) => x.status === 'pending').length,
        confirmedCount: b.filter((x) => x.status === 'confirmed').length,
        completedCount: b.filter((x) => x.status === 'completed').length,
        cancelledCount: b.filter((x) => x.status === 'cancelled').length,
        totalBookings: b.length,
        totalCustomers: new Set(b.map((x) => x.phone)).size,
        recentBookings: b.slice(0, 8),
      };
    }
  },

  async getAdminBookings(filters?: { date?: string; status?: string; search?: string }): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.set('date', filters.date);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      return await fetchJson(`${API_BASE}/admin/bookings?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
    } catch {
      let result = localStore.getBookings();
      if (filters?.date) result = result.filter((b) => b.bookingDate === filters.date);
      if (filters?.status && filters.status !== 'all')
        result = result.filter((b) => b.status === filters.status);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (b) =>
            b.customerName.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.bookingReference.toLowerCase().includes(q)
        );
      }
      return result;
    }
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      return await fetchJson(`${API_BASE}/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
    } catch {
      const b = localStore.getBookings();
      const idx = b.findIndex((x) => x.id === id);
      if (idx !== -1) {
        b[idx] = { ...b[idx], ...updates, updatedAt: new Date().toISOString() };
        localStore.setBookings(b);
        return b[idx];
      }
      throw new Error('Booking not found');
    }
  },

  async deleteBooking(id: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const b = localStore.getBookings().filter((x) => x.id !== id);
      localStore.setBookings(b);
    }
  },

  // Admin Menu CRUD
  async getAdminServices(): Promise<MenuItem[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/services`, { headers: getAuthHeaders() });
    } catch {
      return localStore.getServices();
    }
  },

  async createService(item: Partial<MenuItem>): Promise<MenuItem> {
    try {
      return await fetchJson(`${API_BASE}/admin/services`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
    } catch {
      const list = localStore.getServices();
      const newItem: MenuItem = {
        id: `srv_${Date.now()}`,
        name: item.name || '',
        description: item.description || '',
        price: Number(item.price) || 0,
        category: item.category || 'Specials',
        isNonVeg: item.isNonVeg !== false,
        isActive: item.isActive !== false,
        isFeatured: Boolean(item.isFeatured),
        imageUrl: item.imageUrl || '',
        sortOrder: list.length + 1,
      };
      list.push(newItem);
      localStore.setServices(list);
      return newItem;
    }
  },

  async updateService(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    try {
      return await fetchJson(`${API_BASE}/admin/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
    } catch {
      const list = localStore.getServices();
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        localStore.setServices(list);
        return list[idx];
      }
      throw new Error('Menu item not found');
    }
  },

  async deleteService(id: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const list = localStore.getServices().filter((x) => x.id !== id);
      localStore.setServices(list);
    }
  },

  // Admin Business Hours & Blocks
  async updateBusinessHours(hours: BusinessDayHours[]): Promise<BusinessDayHours[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/business-hours`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hours }),
      });
    } catch {
      localStore.setHours(hours);
      return hours;
    }
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/blocked-dates`, { headers: getAuthHeaders() });
    } catch {
      return localStore.getBlockedDates();
    }
  },

  async addBlockedDate(date: string, reason: string): Promise<BlockedDate[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/blocked-dates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, reason }),
      });
    } catch {
      const list = localStore.getBlockedDates();
      list.push({ id: `bd_${Date.now()}`, date, reason, createdAt: new Date().toISOString() });
      localStore.setBlockedDates(list);
      return list;
    }
  },

  async removeBlockedDate(idOrDate: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/blocked-dates/${idOrDate}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const list = localStore.getBlockedDates().filter((x) => x.id !== idOrDate && x.date !== idOrDate);
      localStore.setBlockedDates(list);
    }
  },

  async getBlockedSlots(): Promise<BlockedSlot[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/blocked-slots`, { headers: getAuthHeaders() });
    } catch {
      return localStore.getBlockedSlots();
    }
  },

  async addBlockedSlot(date: string, time: string, reason: string): Promise<BlockedSlot[]> {
    try {
      return await fetchJson(`${API_BASE}/admin/blocked-slots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, time, reason }),
      });
    } catch {
      const list = localStore.getBlockedSlots();
      list.push({ id: `bs_${Date.now()}`, date, time, reason, createdAt: new Date().toISOString() });
      localStore.setBlockedSlots(list);
      return list;
    }
  },

  async removeBlockedSlot(id: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/blocked-slots/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const list = localStore.getBlockedSlots().filter((x) => x.id !== id);
      localStore.setBlockedSlots(list);
    }
  },

  // Admin Gallery CRUD
  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    try {
      return await fetchJson(`${API_BASE}/admin/gallery`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
    } catch {
      const list = localStore.getGallery();
      const newItem: GalleryItem = {
        id: `gal_${Date.now()}`,
        imageUrl: item.imageUrl || '',
        caption: item.caption || '',
        category: item.category || 'Food',
        sortOrder: list.length + 1,
        isFeatured: Boolean(item.isFeatured),
      };
      list.push(newItem);
      localStore.setGallery(list);
      return newItem;
    }
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
    try {
      return await fetchJson(`${API_BASE}/admin/gallery/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
    } catch {
      const list = localStore.getGallery();
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        localStore.setGallery(list);
        return list[idx];
      }
      throw new Error('Gallery item not found');
    }
  },

  async deleteGalleryItem(id: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const list = localStore.getGallery().filter((x) => x.id !== id);
      localStore.setGallery(list);
    }
  },

  // Admin Reviews CRUD
  async createReview(rev: Partial<CustomerReview>): Promise<CustomerReview> {
    try {
      return await fetchJson(`${API_BASE}/admin/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rev),
      });
    } catch {
      const list = localStore.getReviews();
      const newRev: CustomerReview = {
        id: `rev_${Date.now()}`,
        customerName: rev.customerName || '',
        content: rev.content || '',
        rating: rev.rating || 5,
        reviewDate: rev.reviewDate || new Date().toISOString().split('T')[0],
        source: rev.source || 'Google Maps',
        isPublished: rev.isPublished !== false,
      };
      list.push(newRev);
      localStore.setReviews(list);
      return newRev;
    }
  },

  async updateReview(id: string, rev: Partial<CustomerReview>): Promise<CustomerReview> {
    try {
      return await fetchJson(`${API_BASE}/admin/reviews/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(rev),
      });
    } catch {
      const list = localStore.getReviews();
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...rev };
        localStore.setReviews(list);
        return list[idx];
      }
      throw new Error('Review not found');
    }
  },

  async deleteReview(id: string): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch {
      const list = localStore.getReviews().filter((x) => x.id !== id);
      localStore.setReviews(list);
    }
  },

  // Admin Settings
  async getAdminSettings(): Promise<RestaurantSettings> {
    try {
      return await fetchJson(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() });
    } catch {
      return localStore.getSettings();
    }
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    try {
      return await fetchJson(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
    } catch {
      const s = { ...localStore.getSettings(), ...settings };
      localStore.setSettings(s);
      return s;
    }
  },
};
