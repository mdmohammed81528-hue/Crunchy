/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  RestaurantSettings,
  BusinessDayHours,
  MenuItem,
  GalleryItem,
  CustomerReview,
} from './types';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { MenuSection } from './components/MenuSection';
import { GallerySection } from './components/GallerySection';
import { BookingSystem } from './components/BookingSystem';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Public Data State
  const [settings, setSettings] = useState<RestaurantSettings>({
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
  });

  const [businessHours, setBusinessHours] = useState<BusinessDayHours[]>([]);
  const [services, setServices] = useState<MenuItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin View State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Service pre-selected from menu to pass to booking
  const [preSelectedService, setPreSelectedService] = useState<MenuItem | null>(null);

  // Load public data
  const loadPublicData = async () => {
    try {
      const [stg, bh, srv, gal, rev] = await Promise.all([
        api.getSettings().catch(() => settings),
        api.getBusinessHours().catch(() => []),
        api.getServices().catch(() => []),
        api.getGallery().catch(() => []),
        api.getReviews().catch(() => []),
      ]);

      if (stg) setSettings(stg);
      if (bh && bh.length > 0) setBusinessHours(bh);
      if (srv) setServices(srv);
      if (gal) setGallery(gal);
      if (rev) setReviews(rev);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();

    // Check existing admin token
    const token = localStorage.getItem('crunchy_admin_token');
    if (token) {
      api
        .adminMe()
        .then(() => {
          setIsAdminLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('crunchy_admin_token');
          setIsAdminLoggedIn(false);
        });
    }

    // Check URL query for ?admin
    if (window.location.search.includes('admin')) {
      if (token) {
        setShowAdminDashboard(true);
      } else {
        setIsAdminModalOpen(true);
      }
    }
  }, []);

  const handleOpenBooking = () => {
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBookingWithService = (service: MenuItem) => {
    setPreSelectedService(service);
    handleOpenBooking();
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setShowAdminDashboard(true);
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminDashboard(true);
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setIsAdminLoggedIn(false);
    setShowAdminDashboard(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] flex flex-col items-center justify-center space-y-4 text-stone-300">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-sm font-display tracking-wider">
          Loading Crunchy Bite Taste The Crunch...
        </p>
      </div>
    );
  }

  // If in Admin Dashboard mode
  if (showAdminDashboard && isAdminLoggedIn) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onRefreshPublicData={loadPublicData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-stone-200 selection:bg-amber-400 selection:text-black">
      {/* Navigation Top Bar Contract */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={handleOpenAdmin}
        phone={settings.phone}
      />

      {/* Main Content */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          settings={settings}
          businessHours={businessHours}
          onOpenBooking={handleOpenBooking}
        />

        {/* 2. About Section */}
        <About />

        {/* 3. Menu / Offerings CMS-backed Section */}
        <MenuSection
          items={services}
          onOpenBookingWithService={handleOpenBookingWithService}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* 4. Photo Gallery */}
        <GallerySection
          items={gallery}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* 5. Real Booking System with Live Slot Logic */}
        <BookingSystem
          settings={settings}
          services={services}
          preSelectedService={preSelectedService}
          onClearPreSelectedService={() => setPreSelectedService(null)}
        />

        {/* 6. Customer Reviews */}
        <ReviewsSection
          reviews={reviews}
          mapsUrl={settings.mapsUrl}
        />

        {/* 7. Contact, Hours & Map Location */}
        <ContactSection
          settings={settings}
          businessHours={businessHours}
          onOpenBooking={handleOpenBooking}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Sticky Mobile Bottom Bar (<= 15% Viewport Cap) */}
      <MobileBottomBar
        phone={settings.phone}
        mapsUrl={settings.mapsUrl}
        onOpenBooking={handleOpenBooking}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
