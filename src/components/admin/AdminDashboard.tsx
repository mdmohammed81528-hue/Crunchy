import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  Camera,
  Star,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  AlertTriangle,
  Lock,
  ChevronRight,
  Loader2,
  X,
  Save,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Booking,
  MenuItem,
  BusinessDayHours,
  BlockedDate,
  BlockedSlot,
  GalleryItem,
  CustomerReview,
  RestaurantSettings,
} from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onRefreshPublicData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onRefreshPublicData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'calendar' | 'menu' | 'hours' | 'gallery' | 'reviews' | 'settings'
  >('overview');

  // Overview Data
  const [overview, setOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Bookings Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [bookingFilterDate, setBookingFilterDate] = useState<string>('');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Menu / Services Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Calendar & Blocks Data
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('19:30');
  const [newSlotReason, setNewSlotReason] = useState('');

  // Business Hours Data
  const [hours, setHours] = useState<BusinessDayHours[]>([]);
  const [isSavingHours, setIsSavingHours] = useState(false);

  // Gallery Data
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Food');

  // Reviews Data
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewSource, setNewReviewSource] = useState<'Google Maps' | 'In-Restaurant'>('Google Maps');

  // Settings Data
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password Change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwStatus, setPwStatus] = useState<string | null>(null);

  // Toast / Status Message
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load all admin data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoadingOverview(true);
      const [ov, bkg, mnu, bDates, bSlots, bh, gal, rev, stg] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminBookings(),
        api.getAdminServices(),
        api.getBlockedDates(),
        api.getBlockedSlots(),
        api.getBusinessHours(),
        api.getGallery(),
        api.getReviews(),
        api.getAdminSettings(),
      ]);

      setOverview(ov);
      setBookings(bkg);
      setMenuItems(mnu);
      setBlockedDates(bDates);
      setBlockedSlots(bSlots);
      setHours(bh);
      setGallery(gal);
      setReviews(rev);
      setSettings(stg);
    } catch (err: any) {
      showNotification('Error loading admin data: ' + err.message);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingFilterDate && b.bookingDate !== bookingFilterDate) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.bookingReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Booking Status Update
  const handleUpdateBookingStatus = async (
    id: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      const updated = await api.updateBooking(id, { status: newStatus });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showNotification(`Reservation marked as ${newStatus}`);
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to update status: ' + err.message);
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await api.deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showNotification('Reservation removed');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to delete: ' + err.message);
    }
  };

  // Handle Save Menu Item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name) return;

    try {
      if (editingItem.id) {
        const updated = await api.updateService(editingItem.id, editingItem);
        setMenuItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showNotification('Dish updated successfully');
      } else {
        const created = await api.createService(editingItem);
        setMenuItems((prev) => [...prev, created]);
        showNotification('Dish created successfully');
      }
      setIsMenuModalOpen(false);
      setEditingItem(null);
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to save menu item: ' + err.message);
    }
  };

  // Handle Delete Menu Item
  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.deleteService(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      showNotification('Menu item removed');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to delete: ' + err.message);
    }
  };

  // Block Date
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    try {
      const res = await api.addBlockedDate(newBlockDate, newBlockReason || 'Closed');
      setBlockedDates(res);
      setNewBlockDate('');
      setNewBlockReason('');
      showNotification(`Date ${newBlockDate} blocked`);
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to block date: ' + err.message);
    }
  };

  // Unblock Date
  const handleRemoveBlockedDate = async (id: string) => {
    try {
      await api.removeBlockedDate(id);
      setBlockedDates((prev) => prev.filter((b) => b.id !== id && b.date !== id));
      showNotification('Date unblocked');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed: ' + err.message);
    }
  };

  // Block Slot
  const handleAddBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotTime) return;
    try {
      const res = await api.addBlockedSlot(newSlotDate, newSlotTime, newSlotReason || 'Reserved');
      setBlockedSlots(res);
      setNewSlotDate('');
      setNewSlotReason('');
      showNotification(`Slot ${newSlotTime} blocked on ${newSlotDate}`);
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to block slot: ' + err.message);
    }
  };

  // Unblock Slot
  const handleRemoveBlockedSlot = async (id: string) => {
    try {
      await api.removeBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
      showNotification('Slot reopened');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed: ' + err.message);
    }
  };

  // Save Hours
  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      const updated = await api.updateBusinessHours(hours);
      setHours(updated);
      showNotification('Operating schedule updated');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to save hours: ' + err.message);
    } finally {
      setIsSavingHours(false);
    }
  };

  // Add Gallery Photo
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl && !newGalleryCaption) return;
    try {
      const created = await api.createGalleryItem({
        imageUrl: newGalleryUrl,
        caption: newGalleryCaption || 'Crunchy Bite dish',
        category: newGalleryCategory,
        isFeatured: true,
      });
      setGallery((prev) => [...prev, created]);
      setNewGalleryUrl('');
      setNewGalleryCaption('');
      showNotification('Photo added to gallery');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed to add photo: ' + err.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await api.deleteGalleryItem(id);
      setGallery((prev) => prev.filter((g) => g.id !== id));
      showNotification('Photo removed');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed: ' + err.message);
    }
  };

  // Add Real Review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewContent) return;
    try {
      const created = await api.createReview({
        customerName: newReviewAuthor,
        content: newReviewContent,
        rating: newReviewRating,
        source: newReviewSource,
        isPublished: true,
      });
      setReviews((prev) => [...prev, created]);
      setNewReviewAuthor('');
      setNewReviewContent('');
      showNotification('Customer review logged');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed: ' + err.message);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showNotification('Review deleted');
      onRefreshPublicData();
    } catch (err: any) {
      showNotification('Failed: ' + err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSettingsSuccess(true);
      showNotification('Restaurant settings saved');
      onRefreshPublicData();
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      showNotification('Failed to update settings: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    try {
      await api.adminChangePassword(currentPw, newPw);
      setPwStatus('Password updated successfully');
      setCurrentPw('');
      setNewPw('');
      setTimeout(() => setPwStatus(null), 3000);
    } catch (err: any) {
      setPwStatus('Error: ' + err.message);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: Users },
    { id: 'calendar', label: 'Date & Slot Blocks', icon: Clock },
    { id: 'menu', label: 'Menu CMS', icon: Utensils },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#090a0d] text-stone-200">
      {/* Top Banner / Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl bg-amber-400 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="border-b border-stone-800 bg-[#0d0f14] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold text-sm font-display">
            CB
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-display">
              Crunchy Bite Management
            </h1>
            <p className="text-[11px] text-stone-400 font-mono">
              Wazeerganj, Faizabad · Staff Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 border border-stone-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Navigation Tabs (Horizontal on mobile/tablet, segmented tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-stone-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Today</span>
                <div className="text-2xl font-bold text-amber-400 font-mono-tabular">
                  {overview?.todayCount || 0}
                </div>
                <span className="text-[10px] text-stone-500">Reservations</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Upcoming</span>
                <div className="text-2xl font-bold text-stone-100 font-mono-tabular">
                  {overview?.upcomingCount || 0}
                </div>
                <span className="text-[10px] text-stone-500">Future slots</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Confirmed</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono-tabular">
                  {overview?.confirmedCount || 0}
                </div>
                <span className="text-[10px] text-stone-500">Active</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Pending</span>
                <div className="text-2xl font-bold text-yellow-400 font-mono-tabular">
                  {overview?.pendingCount || 0}
                </div>
                <span className="text-[10px] text-stone-500">Needs review</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Cancelled</span>
                <div className="text-2xl font-bold text-rose-400 font-mono-tabular">
                  {overview?.cancelledCount || 0}
                </div>
                <span className="text-[10px] text-stone-500">Voided</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                <span className="text-xs text-stone-400">Patrons</span>
                <div className="text-2xl font-bold text-amber-300 font-mono-tabular">
                  {overview?.totalCustomers || 0}
                </div>
                <span className="text-[10px] text-stone-500">Unique phones</span>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Bookings List */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-display">
                    Recent Reservations
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View All ({bookings.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 text-center">
                    No reservations placed yet.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-800/80">
                    {bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-200">
                              {b.customerName}
                            </span>
                            <span className="text-stone-500 font-mono text-[11px]">
                              ({b.guestCount} guests)
                            </span>
                          </div>
                          <div className="text-stone-400 flex items-center gap-2 text-[11px] font-mono">
                            <span>{b.bookingDate} at {b.bookingTime}</span>
                            <span>·</span>
                            <span>{b.phone}</span>
                            <span>·</span>
                            <span className="text-amber-400 font-mono">{b.bookingReference}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-950 text-emerald-400'
                                : b.status === 'pending'
                                ? 'bg-amber-950 text-amber-400'
                                : b.status === 'completed'
                                ? 'bg-blue-950 text-blue-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {b.status}
                          </span>

                          {b.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Management Quick Links */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
                <h3 className="text-base font-bold text-white font-display">
                  Quick Controls
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-stone-200">Manage Menu Dishes</span>
                    </div>
                    <span className="text-stone-500 font-mono">{menuItems.length} items</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-stone-200">Block Dates or Slots</span>
                    </div>
                    <span className="text-stone-500 font-mono">{blockedDates.length} blocked</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-stone-200">Customer Reviews</span>
                    </div>
                    <span className="text-stone-500 font-mono">{reviews.length} reviews</span>
                  </button>
                </div>

                {/* Netlify Deployment Section */}
                <div className="pt-3 border-t border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-display">
                      Netlify Deployment ZIP
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Download the pre-compiled production ZIP and drop it directly onto <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">app.netlify.com/drop</a> for instant 10-second hosting!
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <a
                      href="/crunchy-bite-netlify-deploy.zip"
                      download="crunchy-bite-netlify-deploy.zip"
                      className="w-full py-2.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <span>Download Netlify Deploy ZIP (dist)</span>
                    </a>
                    <a
                      href="/crunchy-bite-source.zip"
                      download="crunchy-bite-source.zip"
                      className="w-full py-2 px-3 rounded-lg bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Download Full Source Code ZIP</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or reference..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={bookingFilterDate}
                  onChange={(e) => setBookingFilterDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                {bookingFilterDate && (
                  <button
                    onClick={() => setBookingFilterDate('')}
                    className="text-xs text-stone-400 hover:text-white"
                  >
                    Clear Date
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize font-semibold transition-colors cursor-pointer ${
                      bookingFilterStatus === st
                        ? 'bg-amber-400 text-black'
                        : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4">Special Requests</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-500">
                          No reservations match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-900/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {b.bookingReference}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{b.customerName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{b.phone}</div>
                            {b.email && <div className="text-[11px] text-stone-500">{b.email}</div>}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="text-stone-200">{b.bookingDate}</div>
                            <div className="text-amber-400">{b.bookingTime}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">
                            {b.guestCount}
                          </td>
                          <td className="py-3 px-4 max-w-[200px] truncate text-stone-400">
                            {b.specialRequest || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : b.status === 'completed'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {b.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 text-[11px] font-semibold"
                                title="Confirm booking"
                              >
                                Confirm
                              </button>
                            )}
                            {b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 text-[11px]"
                                title="Mark as completed"
                              >
                                Done
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                className="px-2 py-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 text-[11px]"
                                title="Cancel booking"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1 text-stone-500 hover:text-rose-400"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CALENDAR & SLOT BLOCKS */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Block Entire Date */}
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  Block Full Date
                </h3>
                <p className="text-xs text-stone-400">
                  Prevent all bookings on special holidays, maintenance days, or private events.
                </p>
              </div>

              <form onSubmit={handleAddBlockedDate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Select Date</label>
                  <input
                    type="date"
                    required
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Reason / Notice to Customers</label>
                  <input
                    type="text"
                    placeholder="e.g. Private Hall Event, Renovation..."
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-black text-xs font-bold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Block Entire Date
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-stone-800">
                <h4 className="text-xs font-semibold text-stone-400 uppercase">
                  Currently Blocked Dates ({blockedDates.length})
                </h4>
                {blockedDates.length === 0 ? (
                  <p className="text-xs text-stone-600">No dates blocked.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {blockedDates.map((bd) => (
                      <div
                        key={bd.id}
                        className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-rose-400">{bd.date}</span>
                          <span className="text-stone-400 ml-2">({bd.reason})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveBlockedDate(bd.id)}
                          className="text-stone-500 hover:text-white text-xs underline"
                        >
                          Reopen Date
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Block Individual Time Slot */}
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  Block Individual Time Slot
                </h3>
                <p className="text-xs text-stone-400">
                  Block a specific hour on a specific date when kitchen capacity is capped.
                </p>
              </div>

              <form onSubmit={handleAddBlockedSlot} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-400">Date</label>
                    <input
                      type="date"
                      required
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-stone-400">Slot Time</label>
                    <input
                      type="time"
                      required
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Reservation, Kitchen rush..."
                    value={newSlotReason}
                    onChange={(e) => setNewSlotReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-black text-xs font-bold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Block Slot
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-stone-800">
                <h4 className="text-xs font-semibold text-stone-400 uppercase">
                  Currently Blocked Slots ({blockedSlots.length})
                </h4>
                {blockedSlots.length === 0 ? (
                  <p className="text-xs text-stone-600">No individual slots blocked.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {blockedSlots.map((bs) => (
                      <div
                        key={bs.id}
                        className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-400">{bs.date}</span>
                          <span className="font-mono text-stone-300 ml-2">@ {bs.time}</span>
                          <span className="text-stone-500 ml-2">({bs.reason})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveBlockedSlot(bs.id)}
                          className="text-stone-500 hover:text-white text-xs underline"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MENU / SERVICES CMS */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Menu & Offerings Management
                </h3>
                <p className="text-xs text-stone-400">
                  Add, update, or remove dishes. Set pricing, veg/non-veg status, and featured tags.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    name: '',
                    description: '',
                    price: 150,
                    category: 'Crunchy Specials',
                    isNonVeg: true,
                    isActive: true,
                    isFeatured: false,
                    imageUrl: '',
                  });
                  setIsMenuModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black font-semibold text-xs rounded-lg hover:bg-amber-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            </div>

            {/* Menu Items Table / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400 font-mono">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          item.isNonVeg ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {item.isNonVeg ? 'Non-Veg' : 'Veg'}
                      </span>
                    </div>

                    <div className="text-base font-bold text-white font-display">
                      {item.name}
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-base font-bold text-amber-400 font-mono-tabular">
                      ₹{item.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsMenuModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                        title="Edit dish"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1.5 rounded bg-stone-800 hover:bg-rose-950 hover:text-rose-400 text-stone-400"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Menu Item Edit / Add Modal */}
            {isMenuModalOpen && editingItem && (
              <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsMenuModalOpen(false)}
              >
                <div
                  className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h4 className="text-base font-bold text-white font-display">
                      {editingItem.id ? 'Edit Dish' : 'Add New Dish'}
                    </h4>
                    <button
                      onClick={() => setIsMenuModalOpen(false)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-stone-300 font-semibold">Dish Name *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.name || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-stone-300 font-semibold">Category</label>
                        <input
                          type="text"
                          value={editingItem.category || ''}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, category: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-300 font-semibold">Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={editingItem.price || ''}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, price: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-300 font-semibold">Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.description || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-300 font-semibold">
                        Image URL <span className="text-stone-500">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={editingItem.imageUrl || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, imageUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.isNonVeg !== false}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, isNonVeg: e.target.checked })
                          }
                          className="rounded text-amber-400 focus:ring-0"
                        />
                        <span className="text-stone-300">Non-Vegetarian</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.isFeatured || false}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, isFeatured: e.target.checked })
                          }
                          className="rounded text-amber-400 focus:ring-0"
                        />
                        <span className="text-stone-300">Featured Specialty</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsMenuModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300"
                      >
                        Save Dish
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BUSINESS HOURS */}
        {activeTab === 'hours' && (
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Weekly Operating Schedule
                </h3>
                <p className="text-xs text-stone-400">
                  Configure opening and closing times for each day of the week.
                </p>
              </div>

              <button
                onClick={handleSaveHours}
                disabled={isSavingHours}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black font-bold text-xs rounded-lg hover:bg-amber-300 disabled:opacity-50"
              >
                {isSavingHours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Schedule</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
              {hours.map((day, idx) => (
                <div
                  key={day.dayOfWeek}
                  className="p-3.5 rounded-xl bg-stone-950 border border-stone-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 w-32">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) => {
                        const copy = [...hours];
                        copy[idx].isOpen = e.target.checked;
                        setHours(copy);
                      }}
                      className="rounded text-amber-400"
                    />
                    <span className="font-semibold text-stone-200">{day.dayName}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <input
                      type="time"
                      disabled={!day.isOpen}
                      value={day.openingTime}
                      onChange={(e) => {
                        const copy = [...hours];
                        copy[idx].openingTime = e.target.value;
                        setHours(copy);
                      }}
                      className="px-2.5 py-1.5 rounded bg-stone-900 border border-stone-800 text-white disabled:opacity-30"
                    />
                    <span className="text-stone-500">to</span>
                    <input
                      type="time"
                      disabled={!day.isOpen}
                      value={day.closingTime}
                      onChange={(e) => {
                        const copy = [...hours];
                        copy[idx].closingTime = e.target.value;
                        setHours(copy);
                      }}
                      className="px-2.5 py-1.5 rounded bg-stone-900 border border-stone-800 text-white disabled:opacity-30"
                    />
                  </div>

                  <span
                    className={`text-[11px] font-semibold ${
                      day.isOpen ? 'text-emerald-400' : 'text-stone-600'
                    }`}
                  >
                    {day.isOpen ? 'Open for service' : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Photo Gallery Manager
                </h3>
                <p className="text-xs text-stone-400">
                  Upload or add links to actual photographs of dishes, seating, and kitchen craft.
                </p>
              </div>
            </div>

            {/* Add Photo Form */}
            <form
              onSubmit={handleAddGalleryItem}
              className="p-5 rounded-xl bg-stone-900/40 border border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
            >
              <div className="space-y-1">
                <label className="text-stone-400">Image URL</label>
                <input
                  type="text"
                  placeholder="https://... or upload link"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Caption / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sizzling seekh kebabs on charcoal"
                  value={newGalleryCaption}
                  onChange={(e) => setNewGalleryCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <label className="text-stone-400">Category</label>
                  <select
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Food">Food</option>
                    <option value="Ambiance">Ambiance</option>
                    <option value="Kitchen">Kitchen</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap"
                >
                  Add Photo
                </button>
              </div>
            </form>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2 group relative"
                >
                  <div className="h-32 rounded-lg overflow-hidden bg-stone-950 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-stone-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 truncate font-medium">
                      {item.caption}
                    </span>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display">
                Customer Reviews (Google Maps & Direct)
              </h3>
              <p className="text-xs text-stone-400">
                Log authentic customer feedback from Google Maps to display on the public website.
              </p>
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="p-5 rounded-xl bg-stone-900/40 border border-stone-800 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-stone-400">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohd. Farhan"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-400">Rating (1 to 5)</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400">Review Content</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Paste customer text..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors"
              >
                Log Review
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-200">{r.customerName}</span>
                      <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                      <span className="text-stone-500 font-mono text-[11px]">({r.source})</span>
                    </div>
                    <p className="text-stone-300 italic">"{r.content}"</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="text-stone-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & PASSWORD */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-3xl space-y-8 animate-fade-in">
            {/* General Settings */}
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  Restaurant Information & Rules
                </h3>
                <p className="text-xs text-stone-400">
                  Verified business profile details and table reservation constraints.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Business Name</label>
                    <input
                      type="text"
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-400 font-semibold">Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Phone Number</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Google Maps URL</label>
                    <input
                      type="url"
                      value={settings.mapsUrl}
                      onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-800">
                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Max Guests per Booking</label>
                    <input
                      type="number"
                      value={settings.maxGuestsPerBooking}
                      onChange={(e) =>
                        setSettings({ ...settings, maxGuestsPerBooking: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Max Bookings / Slot</label>
                    <input
                      type="number"
                      value={settings.maxBookingsPerSlot}
                      onChange={(e) =>
                        setSettings({ ...settings, maxBookingsPerSlot: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-semibold">Slot Duration (Min)</label>
                    <input
                      type="number"
                      value={settings.slotDurationMinutes}
                      onChange={(e) =>
                        setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.isBookingEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, isBookingEnabled: e.target.checked })
                      }
                      className="rounded text-amber-400"
                    />
                    <span className="text-stone-300 font-medium">
                      Enable Online Table Reservations
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  {settingsSuccess && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-4 h-4" /> Settings updated successfully
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="ml-auto px-6 py-2.5 bg-amber-400 text-black font-bold text-xs rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-2"
                  >
                    {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Restaurant Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Change Admin Password */}
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  Security: Change Admin Password
                </h3>
                <p className="text-xs text-stone-400">
                  Update your staff portal password using encrypted cryptographic verification.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md text-xs">
                <div className="space-y-1">
                  <label className="text-stone-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-400">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white"
                  />
                </div>

                {pwStatus && (
                  <div
                    className={`p-2.5 rounded text-xs ${
                      pwStatus.startsWith('Error')
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {pwStatus}
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 font-semibold rounded-lg transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
