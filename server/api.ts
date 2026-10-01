import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  db,
  verifyPassword,
  hashPassword,
} from './db.ts';
import type {
  Booking,
  MenuItem,
  BusinessDayHours,
  CustomerReview,
  GalleryItem,
} from './db.ts';

export const apiRouter = express.Router();

// In-memory active session tokens mapped to user ID
const activeSessions = new Map<string, { userId: string; username: string; expiresAt: number }>();

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}

// Admin Auth Middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  cleanExpiredSessions();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  (req as any).user = session;
  next();
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

// 1. Restaurant Settings & Info
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const data = db.get();
  res.json({
    businessName: data.settings.businessName,
    tagline: data.settings.tagline,
    businessType: data.settings.businessType,
    address: data.settings.address,
    phone: data.settings.phone,
    mapsUrl: data.settings.mapsUrl,
    openingHoursText: data.settings.openingHoursText,
    isBookingEnabled: data.settings.isBookingEnabled,
    slotDurationMinutes: data.settings.slotDurationMinutes,
    maxGuestsPerBooking: data.settings.maxGuestsPerBooking,
    advanceBookingDays: data.settings.advanceBookingDays,
  });
});

// 2. Business Hours
apiRouter.get('/business-hours', (_req: Request, res: Response) => {
  const data = db.get();
  res.json(data.businessHours);
});

// 3. Menu / Services
apiRouter.get('/services', (_req: Request, res: Response) => {
  const data = db.get();
  const activeItems = data.services
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(activeItems);
});

// 4. Photo Gallery
apiRouter.get('/gallery', (_req: Request, res: Response) => {
  const data = db.get();
  const sorted = [...data.gallery].sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(sorted);
});

// 5. Customer Reviews (Admin-managed real reviews)
apiRouter.get('/reviews', (_req: Request, res: Response) => {
  const data = db.get();
  const published = data.reviews.filter((r) => r.isPublished);
  res.json(published);
});

// 6. Time Slot & Availability Checker
apiRouter.get('/availability', (req: Request, res: Response) => {
  const dateStr = String(req.query.date || '').trim();
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Valid date parameter (YYYY-MM-DD) is required.' });
  }

  const data = db.get();
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Past date check
  if (targetDate < today) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: 'Date has already passed',
      slots: [],
    });
  }

  // Advance days check
  const maxDays = data.settings.advanceBookingDays || 30;
  const maxDate = new Date(today.getTime() + maxDays * 24 * 60 * 60 * 1000);
  if (targetDate > maxDate) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: `Bookings can only be placed up to ${maxDays} days in advance.`,
      slots: [],
    });
  }

  // Blocked date check
  const isDateBlocked = data.blockedDates.find((b) => b.date === dateStr);
  if (isDateBlocked) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: isDateBlocked.reason || 'Restaurant is closed for private event / maintenance',
      slots: [],
    });
  }

  // Find business hours for target day of week
  const dayOfWeek = targetDate.getDay();
  const daySchedule = data.businessHours.find((b) => b.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: `Restaurant is closed on ${daySchedule ? daySchedule.dayName : 'this day'}`,
      slots: [],
    });
  }

  // Generate slots between openingTime and closingTime
  const [openHour, openMin] = daySchedule.openingTime.split(':').map(Number);
  const [closeHour, closeMin] = daySchedule.closingTime.split(':').map(Number);
  const slotDuration = data.settings.slotDurationMinutes || 60;
  const maxPerSlot = data.settings.maxBookingsPerSlot || 6;

  const slots: Array<{
    time: string;
    label: string;
    isAvailable: boolean;
    remainingCapacity: number;
    reason?: string;
  }> = [];

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Filter blocked slots for this date
  const blockedForDate = new Set(
    data.blockedSlots.filter((bs) => bs.date === dateStr).map((bs) => bs.time)
  );

  // Existing confirmed or pending bookings for this date
  const existingBookings = data.bookings.filter(
    (b) => b.bookingDate === dateStr && b.status !== 'cancelled'
  );

  const isToday = targetDate.getTime() === today.getTime();
  const currentNowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  while (currentMinutes + slotDuration <= closeMinutes) {
    const slotHour = Math.floor(currentMinutes / 60);
    const slotMinute = currentMinutes % 60;
    const timeKey = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;

    // Format human-friendly label (e.g. 11:30 AM)
    const period = slotHour >= 12 ? 'PM' : 'AM';
    const displayHour = slotHour % 12 === 0 ? 12 : slotHour % 12;
    const displayLabel = `${displayHour}:${String(slotMinute).padStart(2, '0')} ${period}`;

    // Check if slot has passed for today
    let isAvailable = true;
    let reason = '';

    if (isToday && currentMinutes < currentNowMinutes + 30) {
      // Must book at least 30 min in advance today
      isAvailable = false;
      reason = 'Slot passed or too short notice';
    }

    // Check if within break
    if (daySchedule.breaks && daySchedule.breaks.length > 0) {
      for (const brk of daySchedule.breaks) {
        const [bStartH, bStartM] = brk.start.split(':').map(Number);
        const [bEndH, bEndM] = brk.end.split(':').map(Number);
        const bStart = bStartH * 60 + bStartM;
        const bEnd = bEndH * 60 + bEndM;
        if (currentMinutes >= bStart && currentMinutes < bEnd) {
          isAvailable = false;
          reason = brk.reason || 'Kitchen prep break';
          break;
        }
      }
    }

    // Check if manually blocked slot
    if (blockedForDate.has(timeKey)) {
      isAvailable = false;
      reason = 'Slot unavailable / reserved';
    }

    // Check capacity
    const bookedCount = existingBookings.filter((b) => b.bookingTime === timeKey).length;
    const remaining = Math.max(0, maxPerSlot - bookedCount);

    if (remaining <= 0) {
      isAvailable = false;
      reason = 'Fully booked';
    }

    slots.push({
      time: timeKey,
      label: displayLabel,
      isAvailable,
      remainingCapacity: remaining,
      reason: reason || undefined,
    });

    currentMinutes += slotDuration;
  }

  res.json({
    date: dateStr,
    isOpen: true,
    dayName: daySchedule.dayName,
    openingTime: daySchedule.openingTime,
    closingTime: daySchedule.closingTime,
    slots,
  });
});

// 7. Create Customer Table Reservation / Booking
apiRouter.post('/bookings', (req: Request, res: Response) => {
  const data = db.get();

  if (!data.settings.isBookingEnabled) {
    return res.status(400).json({ error: 'Online reservations are temporarily paused by management.' });
  }

  const {
    customerName,
    phone,
    email,
    serviceId,
    bookingDate,
    bookingTime,
    guestCount,
    specialRequest,
  } = req.body;

  // Validation
  const cleanName = String(customerName || '').trim();
  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid customer name (at least 2 characters).' });
  }

  const cleanPhone = String(phone || '').trim().replace(/\s+/g, '');
  if (!cleanPhone || cleanPhone.length < 10 || !/^[+]?[\d-]{10,15}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile phone number.' });
  }

  let cleanEmail: string | undefined = undefined;
  if (email && String(email).trim().length > 0) {
    cleanEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
  }

  const cleanDate = String(bookingDate || '').trim();
  if (!cleanDate || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return res.status(400).json({ error: 'Please select a valid booking date.' });
  }

  const cleanTime = String(bookingTime || '').trim();
  if (!cleanTime || !/^\d{2}:\d{2}$/.test(cleanTime)) {
    return res.status(400).json({ error: 'Please select a valid booking time.' });
  }

  const guests = parseInt(String(guestCount), 10);
  const maxGuests = data.settings.maxGuestsPerBooking || 12;
  if (isNaN(guests) || guests < 1 || guests > maxGuests) {
    return res.status(400).json({ error: `Guest count must be between 1 and ${maxGuests}.` });
  }

  // Check date is not in past
  const targetDate = new Date(`${cleanDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (targetDate < today) {
    return res.status(400).json({ error: 'Cannot book for a past date.' });
  }

  // Check date is not blocked
  const isDateBlocked = data.blockedDates.find((b) => b.date === cleanDate);
  if (isDateBlocked) {
    return res.status(400).json({ error: `The restaurant is closed on this date (${isDateBlocked.reason}).` });
  }

  // Check business hours
  const daySchedule = data.businessHours.find((b) => b.dayOfWeek === targetDate.getDay());
  if (!daySchedule || !daySchedule.isOpen) {
    return res.status(400).json({ error: `The restaurant is closed on ${daySchedule ? daySchedule.dayName : 'this day'}.` });
  }

  // Check within hours
  const [bHour, bMin] = cleanTime.split(':').map(Number);
  const bTotalMin = bHour * 60 + bMin;
  const [opH, opM] = daySchedule.openingTime.split(':').map(Number);
  const [clH, clM] = daySchedule.closingTime.split(':').map(Number);

  if (bTotalMin < opH * 60 + opM || bTotalMin >= clH * 60 + clM) {
    return res.status(400).json({ error: `Selected time is outside operating hours (${daySchedule.openingTime} - ${daySchedule.closingTime}).` });
  }

  // Check blocked slot
  const isSlotBlocked = data.blockedSlots.find((bs) => bs.date === cleanDate && bs.time === cleanTime);
  if (isSlotBlocked) {
    return res.status(400).json({ error: 'This time slot is unavailable.' });
  }

  // Check slot capacity
  const existingForSlot = data.bookings.filter(
    (b) => b.bookingDate === cleanDate && b.bookingTime === cleanTime && b.status !== 'cancelled'
  );
  if (existingForSlot.length >= (data.settings.maxBookingsPerSlot || 6)) {
    return res.status(400).json({ error: 'This time slot is completely booked. Please choose another time.' });
  }

  // Prevent duplicate booking by same phone on same date & time
  const duplicate = existingForSlot.find((b) => b.phone.replace(/\s+/g, '') === cleanPhone);
  if (duplicate) {
    return res.status(400).json({ error: 'A booking already exists for this phone number at the selected time.' });
  }

  // Identify service/menu reference if selected
  let serviceName = 'Dine-In Table Reservation';
  if (serviceId) {
    const srv = data.services.find((s) => s.id === serviceId);
    if (srv) {
      serviceName = `${srv.name} (Special Order)`;
    }
  }

  // Generate Reference: CB-YYYYMMDD-XXXX
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const dateFormatted = cleanDate.replace(/-/g, '').slice(2);
  const bookingReference = `CB-${dateFormatted}-${randCode}`;

  const newBooking: Booking = {
    id: `bkg_${Date.now()}_${randCode}`,
    bookingReference,
    customerName: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    serviceId: serviceId || undefined,
    serviceName,
    bookingDate: cleanDate,
    bookingTime: cleanTime,
    guestCount: guests,
    specialRequest: specialRequest ? String(specialRequest).trim().slice(0, 300) : undefined,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.bookings.unshift(newBooking);
  db.save();

  res.status(201).json({
    success: true,
    booking: newBooking,
    restaurant: {
      name: data.settings.businessName,
      address: data.settings.address,
      phone: data.settings.phone,
      mapsUrl: data.settings.mapsUrl,
    },
    message: 'Booking confirmed successfully!',
  });
});

// 8. Lookup Booking by Reference
apiRouter.get('/bookings/lookup/:reference', (req: Request, res: Response) => {
  const ref = String(req.params.reference || '').trim().toUpperCase();
  const data = db.get();
  const booking = data.bookings.find((b) => b.bookingReference.toUpperCase() === ref);

  if (!booking) {
    return res.status(404).json({ error: 'No reservation found with this booking reference.' });
  }

  res.json({
    booking,
    restaurant: {
      name: data.settings.businessName,
      address: data.settings.address,
      phone: data.settings.phone,
      mapsUrl: data.settings.mapsUrl,
    },
  });
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const data = db.get();
  const user = data.users.find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase().trim()
  );

  if (!user || !verifyPassword(String(password), user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  // Generate 64-char crypto session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeSessions.set(token, {
    userId: user.id,
    username: user.username,
    expiresAt,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  });
});

apiRouter.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
  const session = (req as any).user;
  const data = db.get();
  const user = data.users.find((u) => u.id === session.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });
});

apiRouter.post('/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.post('/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const session = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const data = db.get();
  const user = data.users.find((u) => u.id === session.userId);

  if (!user || !verifyPassword(String(currentPassword), user.salt, user.passwordHash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const { salt, hash } = hashPassword(String(newPassword));
  user.salt = salt;
  user.passwordHash = hash;
  db.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & BOOKINGS MANAGEMENT
// -------------------------------------------------------------

apiRouter.get('/admin/overview', requireAdmin, (_req: Request, res: Response) => {
  const data = db.get();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayBookings = data.bookings.filter((b) => b.bookingDate === todayStr);
  const upcomingBookings = data.bookings.filter((b) => b.bookingDate >= todayStr && b.status !== 'cancelled');
  const pendingBookings = data.bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = data.bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = data.bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = data.bookings.filter((b) => b.status === 'cancelled');

  // Unique customer count
  const uniquePhones = new Set(data.bookings.map((b) => b.phone.replace(/\s+/g, '')));

  res.json({
    todayCount: todayBookings.length,
    upcomingCount: upcomingBookings.length,
    pendingCount: pendingBookings.length,
    confirmedCount: confirmedBookings.length,
    completedCount: completedBookings.length,
    cancelledCount: cancelledBookings.length,
    totalBookings: data.bookings.length,
    totalCustomers: uniquePhones.size,
    recentBookings: data.bookings.slice(0, 8),
  });
});

// View all bookings with search and filter
apiRouter.get('/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  const data = db.get();
  let result = [...data.bookings];

  const { date, status, search } = req.query;

  if (date) {
    result = result.filter((b) => b.bookingDate === String(date));
  }

  if (status && status !== 'all') {
    result = result.filter((b) => b.status === String(status));
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (b) =>
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.bookingReference.toLowerCase().includes(q) ||
        (b.email && b.email.toLowerCase().includes(q))
    );
  }

  // Sort: descending by bookingDate and bookingTime
  result.sort((a, b) => {
    const dtA = `${a.bookingDate}T${a.bookingTime}`;
    const dtB = `${b.bookingDate}T${b.bookingTime}`;
    return dtB.localeCompare(dtA);
  });

  res.json(result);
});

// Update booking status or notes
apiRouter.patch('/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const booking = data.bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const { status, notes, guestCount, bookingDate, bookingTime } = req.body;

  if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    booking.status = status;
  }
  if (notes !== undefined) {
    booking.notes = String(notes);
  }
  if (guestCount !== undefined) {
    booking.guestCount = parseInt(guestCount, 10) || booking.guestCount;
  }
  if (bookingDate) booking.bookingDate = bookingDate;
  if (bookingTime) booking.bookingTime = bookingTime;

  booking.updatedAt = new Date().toISOString();
  db.save();

  res.json(booking);
});

// Delete booking
apiRouter.delete('/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const index = data.bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  data.bookings.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Booking removed successfully.' });
});

// -------------------------------------------------------------
// ADMIN BUSINESS HOURS & CALENDAR BLOCKS
// -------------------------------------------------------------

apiRouter.put('/admin/business-hours', requireAdmin, (req: Request, res: Response) => {
  const { hours } = req.body;
  if (!Array.isArray(hours)) {
    return res.status(400).json({ error: 'Expected array of business hours.' });
  }

  const data = db.get();
  data.businessHours = hours.map((h: BusinessDayHours) => ({
    id: h.id || `bh_${h.dayOfWeek}`,
    dayOfWeek: h.dayOfWeek,
    dayName: h.dayName,
    isOpen: Boolean(h.isOpen),
    openingTime: h.openingTime || '11:30',
    closingTime: h.closingTime || '23:30',
    breaks: Array.isArray(h.breaks) ? h.breaks : [],
  }));

  db.save();
  res.json(data.businessHours);
});

apiRouter.get('/admin/blocked-dates', requireAdmin, (_req: Request, res: Response) => {
  const data = db.get();
  res.json(data.blockedDates);
});

apiRouter.post('/admin/blocked-dates', requireAdmin, (req: Request, res: Response) => {
  const { date, reason } = req.body;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) is required.' });
  }

  const data = db.get();
  const existing = data.blockedDates.find((b) => b.date === date);
  if (existing) {
    existing.reason = reason || 'Closed';
  } else {
    data.blockedDates.push({
      id: `bd_${Date.now()}`,
      date,
      reason: reason || 'Closed / Maintenance',
      createdAt: new Date().toISOString(),
    });
  }

  db.save();
  res.json(data.blockedDates);
});

apiRouter.delete('/admin/blocked-dates/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.blockedDates = data.blockedDates.filter((b) => b.id !== id && b.date !== id);
  db.save();
  res.json({ success: true, message: 'Date reopened.' });
});

apiRouter.get('/admin/blocked-slots', requireAdmin, (_req: Request, res: Response) => {
  const data = db.get();
  res.json(data.blockedSlots);
});

apiRouter.post('/admin/blocked-slots', requireAdmin, (req: Request, res: Response) => {
  const { date, time, reason } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required.' });
  }

  const data = db.get();
  const existing = data.blockedSlots.find((b) => b.date === date && b.time === time);
  if (existing) {
    existing.reason = reason || 'Reserved';
  } else {
    data.blockedSlots.push({
      id: `bs_${Date.now()}`,
      date,
      time,
      reason: reason || 'Temporarily reserved',
      createdAt: new Date().toISOString(),
    });
  }

  db.save();
  res.json(data.blockedSlots);
});

apiRouter.delete('/admin/blocked-slots/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.blockedSlots = data.blockedSlots.filter((b) => b.id !== id);
  db.save();
  res.json({ success: true, message: 'Slot unblocked.' });
});

// -------------------------------------------------------------
// ADMIN MENU / SERVICES MANAGEMENT (FULL CMS)
// -------------------------------------------------------------

apiRouter.get('/admin/services', requireAdmin, (_req: Request, res: Response) => {
  const data = db.get();
  res.json(data.services);
});

apiRouter.post('/admin/services', requireAdmin, (req: Request, res: Response) => {
  const { name, description, price, category, isNonVeg, isActive, isFeatured, imageUrl } = req.body;

  if (!name || String(name).trim().length === 0) {
    return res.status(400).json({ error: 'Item name is required.' });
  }

  const data = db.get();
  const newItem: MenuItem = {
    id: `srv_${Date.now()}`,
    name: String(name).trim(),
    description: String(description || '').trim(),
    price: Number(price) || 0,
    category: String(category || 'General').trim(),
    isNonVeg: isNonVeg !== undefined ? Boolean(isNonVeg) : true,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    isFeatured: Boolean(isFeatured),
    imageUrl: imageUrl ? String(imageUrl).trim() : '',
    sortOrder: data.services.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.services.push(newItem);
  db.save();
  res.status(201).json(newItem);
});

apiRouter.put('/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const item = data.services.find((s) => s.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const { name, description, price, category, isNonVeg, isActive, isFeatured, imageUrl, sortOrder } = req.body;

  if (name !== undefined) item.name = String(name).trim();
  if (description !== undefined) item.description = String(description).trim();
  if (price !== undefined) item.price = Number(price);
  if (category !== undefined) item.category = String(category).trim();
  if (isNonVeg !== undefined) item.isNonVeg = Boolean(isNonVeg);
  if (isActive !== undefined) item.isActive = Boolean(isActive);
  if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);
  if (imageUrl !== undefined) item.imageUrl = String(imageUrl).trim();
  if (sortOrder !== undefined) item.sortOrder = Number(sortOrder);

  item.updatedAt = new Date().toISOString();
  db.save();
  res.json(item);
});

apiRouter.delete('/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const index = data.services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  data.services.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Item deleted.' });
});

// -------------------------------------------------------------
// ADMIN GALLERY MANAGEMENT
// -------------------------------------------------------------

apiRouter.post('/admin/gallery', requireAdmin, (req: Request, res: Response) => {
  const { imageUrl, caption, category, isFeatured } = req.body;
  if (!imageUrl && !caption) {
    return res.status(400).json({ error: 'Image URL or caption required.' });
  }

  const data = db.get();
  const newItem: GalleryItem = {
    id: `gal_${Date.now()}`,
    imageUrl: String(imageUrl || '').trim(),
    caption: String(caption || '').trim(),
    category: category ? String(category).trim() : 'Food',
    sortOrder: data.gallery.length + 1,
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString(),
  };

  data.gallery.push(newItem);
  db.save();
  res.status(201).json(newItem);
});

apiRouter.put('/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const item = data.gallery.find((g) => g.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  const { imageUrl, caption, category, isFeatured, sortOrder } = req.body;
  if (imageUrl !== undefined) item.imageUrl = String(imageUrl).trim();
  if (caption !== undefined) item.caption = String(caption).trim();
  if (category !== undefined) item.category = String(category).trim();
  if (isFeatured !== undefined) item.isFeatured = Boolean(isFeatured);
  if (sortOrder !== undefined) item.sortOrder = Number(sortOrder);

  db.save();
  res.json(item);
});

apiRouter.delete('/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.gallery = data.gallery.filter((g) => g.id !== id);
  db.save();
  res.json({ success: true, message: 'Gallery item removed.' });
});

// -------------------------------------------------------------
// ADMIN REVIEWS MANAGEMENT (Real Reviews)
// -------------------------------------------------------------

apiRouter.post('/admin/reviews', requireAdmin, (req: Request, res: Response) => {
  const { customerName, rating, reviewDate, content, source, isPublished } = req.body;
  if (!customerName || !content) {
    return res.status(400).json({ error: 'Customer name and review content are required.' });
  }

  const data = db.get();
  const newRev: CustomerReview = {
    id: `rev_${Date.now()}`,
    customerName: String(customerName).trim(),
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    reviewDate: reviewDate || new Date().toISOString().split('T')[0],
    content: String(content).trim(),
    source: source || 'Google Maps',
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    createdAt: new Date().toISOString(),
  };

  data.reviews.push(newRev);
  db.save();
  res.status(201).json(newRev);
});

apiRouter.put('/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  const rev = data.reviews.find((r) => r.id === id);

  if (!rev) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  const { customerName, rating, reviewDate, content, source, isPublished } = req.body;
  if (customerName !== undefined) rev.customerName = String(customerName).trim();
  if (rating !== undefined) rev.rating = Math.max(1, Math.min(5, Number(rating)));
  if (reviewDate !== undefined) rev.reviewDate = reviewDate;
  if (content !== undefined) rev.content = String(content).trim();
  if (source !== undefined) rev.source = source;
  if (isPublished !== undefined) rev.isPublished = Boolean(isPublished);

  db.save();
  res.json(rev);
});

apiRouter.delete('/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.reviews = data.reviews.filter((r) => r.id !== id);
  db.save();
  res.json({ success: true, message: 'Review removed.' });
});

// -------------------------------------------------------------
// ADMIN SETTINGS
// -------------------------------------------------------------

apiRouter.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  const data = db.get();
  res.json(data.settings);
});

apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const data = db.get();
  const {
    businessName,
    tagline,
    businessType,
    address,
    phone,
    mapsUrl,
    openingHoursText,
    slotDurationMinutes,
    maxBookingsPerSlot,
    maxGuestsPerBooking,
    advanceBookingDays,
    isBookingEnabled,
  } = req.body;

  if (businessName !== undefined) data.settings.businessName = String(businessName).trim();
  if (tagline !== undefined) data.settings.tagline = String(tagline).trim();
  if (businessType !== undefined) data.settings.businessType = String(businessType).trim();
  if (address !== undefined) data.settings.address = String(address).trim();
  if (phone !== undefined) data.settings.phone = String(phone).trim();
  if (mapsUrl !== undefined) data.settings.mapsUrl = String(mapsUrl).trim();
  if (openingHoursText !== undefined) data.settings.openingHoursText = String(openingHoursText).trim();
  if (slotDurationMinutes !== undefined) data.settings.slotDurationMinutes = Number(slotDurationMinutes);
  if (maxBookingsPerSlot !== undefined) data.settings.maxBookingsPerSlot = Number(maxBookingsPerSlot);
  if (maxGuestsPerBooking !== undefined) data.settings.maxGuestsPerBooking = Number(maxGuestsPerBooking);
  if (advanceBookingDays !== undefined) data.settings.advanceBookingDays = Number(advanceBookingDays);
  if (isBookingEnabled !== undefined) data.settings.isBookingEnabled = Boolean(isBookingEnabled);

  data.settings.updatedAt = new Date().toISOString();
  db.save();

  res.json(data.settings);
});
