import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  MapPin,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { MenuItem, TimeSlot, Booking, RestaurantSettings } from '../types';

interface BookingSystemProps {
  settings: RestaurantSettings;
  services: MenuItem[];
  preSelectedService?: MenuItem | null;
  onClearPreSelectedService?: () => void;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  settings,
  services,
  preSelectedService,
  onClearPreSelectedService,
}) => {
  // Tab: 'book' | 'lookup'
  const [activeTab, setActiveTab] = useState<'book' | 'lookup'>('book');

  // Step state (1 to 6)
  // Step 1: Type / Service
  // Step 2: Date
  // Step 3: Slot
  // Step 4: Customer Details
  // Step 5: Review & Confirm
  // Step 6: Confirmation Screen
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState<string>('');

  // Slots Loading & Data
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsData, setSlotsData] = useState<TimeSlot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Lookup State
  const [lookupRef, setLookupRef] = useState<string>('');
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Initialize booking date to today or tomorrow
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setBookingDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Sync pre-selected service from menu if passed
  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
      setStep(2); // advance to date selection
    }
  }, [preSelectedService]);

  // Load slots whenever date changes
  useEffect(() => {
    if (!bookingDate) return;
    let isCurrent = true;

    async function fetchSlots() {
      setIsLoadingSlots(true);
      setSlotsError(null);
      setSelectedTime('');

      try {
        const res = await api.checkAvailability(bookingDate);
        if (!isCurrent) return;

        if (!res.isOpen) {
          setSlotsError(res.reason || 'Restaurant is closed on this date.');
          setSlotsData([]);
        } else {
          setSlotsData(res.slots || []);
        }
      } catch (err: any) {
        if (!isCurrent) return;
        setSlotsError(err.message || 'Unable to check slot availability.');
        setSlotsData([]);
      } finally {
        if (isCurrent) setIsLoadingSlots(false);
      }
    }

    fetchSlots();

    return () => {
      isCurrent = false;
    };
  }, [bookingDate]);

  // Handle final booking submission
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.createBooking({
        customerName,
        phone,
        email: email || undefined,
        serviceId: selectedServiceId || undefined,
        bookingDate,
        bookingTime: selectedTime,
        guestCount,
        specialRequest: specialRequest || undefined,
      });

      setConfirmedBooking(res.booking);
      setStep(6); // Step 6 is confirmed screen
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while placing the reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lookup existing booking
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await api.lookupBooking(lookupRef.trim());
      setLookupResult(res.booking);
    } catch (err: any) {
      setLookupError(err.message || 'No reservation found for this reference.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedServiceId('');
    setSelectedTime('');
    setConfirmedBooking(null);
    setSubmitError(null);
    if (onClearPreSelectedService) onClearPreSelectedService();
  };

  // Calculate min & max date for date picker
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (settings.advanceBookingDays || 30));
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const selectedServiceObj = services.find((s) => s.id === selectedServiceId);

  return (
    <section id="booking" className="py-20 md:py-28 bg-[#0c0d10] border-t border-stone-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Table Reservations & Dine-in
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display">
            Book Your Table
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto">
            Real-time table booking with instant confirmation. Operating daily 11:30 AM to 11:30 PM.
          </p>

          {/* Tab Switcher: Book a Table vs Lookup */}
          <div className="inline-flex p-1 bg-stone-900 border border-stone-800 rounded-xl mt-4">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Reserve a Table
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'lookup'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Find Existing Reservation
            </button>
          </div>
        </div>

        {/* LOOKUP TAB */}
        {activeTab === 'lookup' && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-bold text-white text-center font-display">
                Check Reservation Status
              </h3>
              <p className="text-xs text-stone-400 text-center">
                Enter your unique Booking Reference (e.g., CB-260930-8472) provided at the time of reservation.
              </p>

              <form onSubmit={handleLookup} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CB-260930-8472"
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={isLookingUp || !lookupRef.trim()}
                  className="px-5 py-2.5 rounded-lg bg-amber-400 text-black font-semibold text-xs sm:text-sm hover:bg-amber-300 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </form>

              {lookupError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResult && (
                <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4 animate-fade-in mt-6">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                    <div>
                      <div className="text-xs text-stone-500 font-mono">Reference ID</div>
                      <div className="text-sm font-bold text-amber-400 font-mono">
                        {lookupResult.bookingReference}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold capitalize ${
                        lookupResult.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : lookupResult.status === 'pending'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : lookupResult.status === 'completed'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {lookupResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 block">Customer Name</span>
                      <span className="font-semibold text-stone-200">{lookupResult.customerName}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Party Size</span>
                      <span className="font-semibold text-stone-200">{lookupResult.guestCount} Guests</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Date</span>
                      <span className="font-semibold text-stone-200">{lookupResult.bookingDate}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Reserved Slot</span>
                      <span className="font-semibold text-stone-200">{lookupResult.bookingTime}</span>
                    </div>
                  </div>

                  {lookupResult.specialRequest && (
                    <div className="text-xs pt-2 border-t border-stone-800 text-stone-400">
                      <span className="text-stone-500">Note: </span>
                      {lookupResult.specialRequest}
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Questions? Call {settings.phone}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKING FLOW */}
        {activeTab === 'book' && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
            {/* Step Progress Tracker */}
            {step < 6 && (
              <div className="flex items-center justify-between border-b border-stone-800 pb-5 text-xs">
                {[
                  { num: 1, label: 'Experience' },
                  { num: 2, label: 'Date' },
                  { num: 3, label: 'Time Slot' },
                  { num: 4, label: 'Details' },
                  { num: 5, label: 'Confirm' },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`flex items-center gap-1.5 font-medium ${
                      step === s.num
                        ? 'text-amber-400'
                        : step > s.num
                        ? 'text-stone-300'
                        : 'text-stone-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                        step === s.num
                          ? 'bg-amber-400 text-black font-bold'
                          : step > s.num
                          ? 'bg-stone-800 text-stone-200'
                          : 'bg-stone-900 text-stone-600'
                      }`}
                    >
                      {s.num}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1: Booking Type / Experience */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    Select Reservation Type
                  </h3>
                  <p className="text-xs text-stone-400">
                    Choose standard dine-in or pre-select a specialty package.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Dine-In */}
                  <div
                    onClick={() => setSelectedServiceId('')}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      selectedServiceId === ''
                        ? 'border-amber-400 bg-amber-400/5'
                        : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-amber-400 font-medium">Standard</span>
                    </div>
                    <div className="text-base font-bold text-white font-display">
                      Standard Dine-In Table
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Reserve a table for your group; order freshly from the regular menu on arrival.
                    </p>
                  </div>

                  {/* Pre-select from menu items */}
                  {services
                    .filter((s) => s.isFeatured)
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedServiceId(item.id)}
                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                          selectedServiceId === item.id
                            ? 'border-amber-400 bg-amber-400/5'
                            : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            ₹{item.price}
                          </span>
                        </div>
                        <div className="text-base font-bold text-white font-display">
                          {item.name}
                        </div>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                          {item.description || 'Pre-order priority preparation for table arrival.'}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm rounded-lg hover:bg-amber-300 transition-colors"
                  >
                    <span>Continue to Date</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Date */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    Select Reservation Date
                  </h3>
                  <p className="text-xs text-stone-400">
                    Bookings are open daily up to {settings.advanceBookingDays || 30} days in advance.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                    <label className="text-xs font-medium text-stone-400 block">
                      Choose Date
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      max={maxDateStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {slotsError && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{slotsError}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-4 py-2.5 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    disabled={!bookingDate || Boolean(slotsError)}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm rounded-lg hover:bg-amber-300 disabled:opacity-40 transition-colors"
                  >
                    <span>View Available Slots</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Time Slot Selection */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    Select Available Time Slot
                  </h3>
                  <p className="text-xs text-stone-400">
                    Showing real-time kitchen and seating availability for {bookingDate}.
                  </p>
                </div>

                {isLoadingSlots ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs text-stone-400">Checking slot availability...</span>
                  </div>
                ) : slotsData.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400">
                    No available time slots found for this date. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slotsData.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-3.5 rounded-xl border text-center transition-all ${
                          !slot.isAvailable
                            ? 'border-stone-850 bg-stone-950/40 text-stone-600 cursor-not-allowed opacity-50'
                            : selectedTime === slot.time
                            ? 'border-amber-400 bg-amber-400 text-black font-bold shadow-md'
                            : 'border-stone-800 bg-stone-950/80 text-stone-200 hover:border-amber-400/50 hover:bg-stone-900 cursor-pointer'
                        }`}
                      >
                        <div className="text-sm font-semibold font-mono-tabular">
                          {slot.label}
                        </div>
                        <div
                          className={`text-[10px] mt-1 ${
                            selectedTime === slot.time
                              ? 'text-black/80 font-medium'
                              : slot.isAvailable
                              ? 'text-emerald-400'
                              : 'text-stone-500'
                          }`}
                        >
                          {slot.isAvailable ? `${slot.remainingCapacity} seats left` : (slot.reason || 'Booked')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-4 py-2.5 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change Date</span>
                  </button>

                  <button
                    onClick={() => setStep(4)}
                    disabled={!selectedTime}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm rounded-lg hover:bg-amber-300 disabled:opacity-40 transition-colors"
                  >
                    <span>Enter Guest Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Customer Details & Guest Count */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    Customer Information
                  </h3>
                  <p className="text-xs text-stone-400">
                    Enter the primary contact name and phone number for booking notification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400 font-mono-tabular"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Email Address <span className="text-stone-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Guests Stepper */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-300">
                      Number of Guests (1 to {settings.maxGuestsPerBooking || 12})
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-800 rounded-lg bg-stone-950 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          className="px-4 py-2 text-stone-300 hover:bg-stone-800 transition-colors font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="px-5 py-2 text-sm font-bold text-amber-400 font-mono">
                          {guestCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setGuestCount(Math.min(settings.maxGuestsPerBooking || 12, guestCount + 1))
                          }
                          className="px-4 py-2 text-stone-300 hover:bg-stone-800 transition-colors font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-stone-400">
                        {guestCount === 1 ? 'Solo Dining' : guestCount <= 4 ? 'Table for Small Group' : 'Family / Party Table'}
                      </span>
                    </div>
                  </div>

                  {/* Special Request */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-300">
                      Special Requests / Dietary Notes <span className="text-stone-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={300}
                      placeholder="e.g. Birthday celebration, window seat preference, extra spicy chicken..."
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-4 py-2.5 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change Time</span>
                  </button>

                  <button
                    onClick={() => setStep(5)}
                    disabled={!customerName.trim() || phone.trim().length < 10}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm rounded-lg hover:bg-amber-300 disabled:opacity-40 transition-colors"
                  >
                    <span>Review Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Booking Summary & Final Confirmation */}
            {step === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    Review Reservation Summary
                  </h3>
                  <p className="text-xs text-stone-400">
                    Please confirm your details before locking in the table reservation.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-stone-500 block">Restaurant</span>
                      <span className="font-bold text-stone-200 text-sm">{settings.businessName}</span>
                      <span className="text-stone-400 block text-[11px]">{settings.address}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 block">Service / Package</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {selectedServiceObj ? selectedServiceObj.name : 'Standard Dine-In Table'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 block">Date & Time</span>
                      <span className="font-bold text-stone-200 text-sm">
                        {bookingDate} at {selectedTime}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 block">Guest Count</span>
                      <span className="font-bold text-stone-200 text-sm">
                        {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 block">Customer Name</span>
                      <span className="font-semibold text-stone-300">{customerName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 block">Phone Contact</span>
                      <span className="font-semibold text-stone-300 font-mono">{phone}</span>
                    </div>

                    {email && (
                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-stone-500 block">Email Confirmation</span>
                        <span className="font-semibold text-stone-300">{email}</span>
                      </div>
                    )}

                    {specialRequest && (
                      <div className="space-y-1 sm:col-span-2 pt-2 border-t border-stone-800">
                        <span className="text-stone-500 block">Special Request</span>
                        <span className="text-stone-300 italic">{specialRequest}</span>
                      </div>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-4 py-2.5 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-black font-bold text-sm rounded-lg hover:bg-amber-300 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Reserve Table</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Booking Confirmed Screen */}
            {step === 6 && confirmedBooking && (
              <div className="text-center space-y-6 animate-fade-in py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    Booking Confirmed!
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400">
                    Your table at Crunchy Bite Taste The Crunch is reserved.
                  </p>
                </div>

                {/* Reference Banner */}
                <div className="max-w-md mx-auto p-4 rounded-xl bg-stone-950 border border-amber-500/40 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[11px] text-stone-500 font-mono block">
                      Booking Reference ID
                    </span>
                    <span className="text-lg font-bold text-amber-400 font-mono tracking-wider">
                      {confirmedBooking.bookingReference}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyReference(confirmedBooking.bookingReference)}
                    className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="Copy reference code"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Details Card */}
                <div className="max-w-md mx-auto p-5 rounded-xl bg-stone-950 border border-stone-800 text-left space-y-3 text-xs">
                  <div className="flex justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-stone-500">Reserved For</span>
                    <span className="font-semibold text-stone-200">{confirmedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-stone-500">Date</span>
                    <span className="font-semibold text-stone-200">{confirmedBooking.bookingDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-stone-500">Time</span>
                    <span className="font-semibold text-stone-200">{confirmedBooking.bookingTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-stone-500">Party</span>
                    <span className="font-semibold text-stone-200">{confirmedBooking.guestCount} Guests</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800/80 pb-2">
                    <span className="text-stone-500">Location</span>
                    <span className="font-semibold text-stone-200 text-right max-w-[200px]">
                      In front of Marwari Bhavan, Wazeerganj, Faizabad
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-500">Phone</span>
                    <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-amber-400 hover:underline">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={settings.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Call Restaurant</span>
                  </a>

                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
                  >
                    Make Another Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
