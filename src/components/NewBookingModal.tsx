import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, MapPin, DollarSign, Star } from "lucide-react";
import { format } from "date-fns";
import { groundsApi, bookingsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PaymentModal from "@/components/PaymentModal";
import { isMongoObjectId } from "@/lib/utils";

interface Ground {
  _id: string;
  name: string;
  location: { address: string };
  price: {
    ranges: {
      start: string;
      end: string;
      perHour: number;
    }[];
    currency: string;
    discount?: number;
  };
  features: { capacity: number };
}

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ground: Ground | null;
  onBookingCreated: (booking: any) => void;
}

interface TimeSlot {
  slot: string;
  label: string;
  isAvailable: boolean;
}

const ALL_24H_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const start = `${i.toString().padStart(2, "0")}:00`;
  const end = `${((i + 1) % 24).toString().padStart(2, "0")}:00`;
  const label =
    format(new Date(2000, 0, 1, i, 0), "hh:mm a") +
    " - " +
    format(new Date(2000, 0, 1, (i + 1) % 24, 0), "hh:mm a");
  return { slot: `${start}-${end}`, label };
});

const NewBookingModal: React.FC<NewBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  ground, 
  onBookingCreated 
}) => {
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedStartSlotObj, setSelectedStartSlotObj] = useState<TimeSlot | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [playerCount, setPlayerCount] = useState("");
  const [teamName, setTeamName] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Generate next 7 days for quick date selection
  const getQuickDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE");
  };

  useEffect(() => {
    if (user) {
      setContactName(user.name || "");
      setContactPhone(user.phone || "");
      setContactEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (ground && selectedDate) {
      fetchAvailability();
    }
  }, [ground, selectedDate]);

  const fetchAvailability = async () => {
    if (!ground || !selectedDate) return;
    setIsLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await groundsApi.getAvailability(ground._id, dateStr);
      let bookedSlots: string[] = [];
      if (response.data && response.data.success && response.data.availability) {
        bookedSlots = response.data.availability.bookedSlots || [];
      }
      
      const now = new Date();
      const isSelectedToday = format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
      
      setAvailableSlots(
        ALL_24H_SLOTS.map((slot) => {
          const slotHour = parseInt(slot.slot.split(":")[0], 10);
          const isPast = isSelectedToday && slotHour <= now.getHours();
          const isBooked = bookedSlots.includes(slot.slot);
          return {
            ...slot,
            isAvailable: !isPast && !isBooked,
          };
        })
      );
    } catch (e) {
      setAvailableSlots(
        ALL_24H_SLOTS.map((slot) => ({ ...slot, isAvailable: true }))
      );
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Helper to get available end times for a given start slot object
  const getAvailableEndTimes = (startSlotObj: TimeSlot | null) => {
    if (!startSlotObj) return [];
    const startIdx = availableSlots.findIndex(s => s.slot === startSlotObj.slot);
    if (startIdx === -1) return [];
    const maxDuration = 6;
    const endTimes: { value: string; label: string; duration: number }[] = [];
    
    // Get all booked time ranges for overlap checking
    const bookedRanges = availableSlots
      .filter(slot => !slot.isAvailable)
      .map(slot => {
        const [start, end] = slot.slot.split('-');
        return {
          start: new Date(`2000-01-01 ${start}`),
          end: new Date(`2000-01-01 ${end}`)
        };
      });
    
    const startTimeDate = new Date(`2000-01-01 ${startSlotObj.slot.split('-')[0]}`);
    
    for (let dur = 1; dur <= maxDuration; dur++) {
      const endIdx = startIdx + dur;
      if (endIdx > availableSlots.length) break;
      
      const endSlot = availableSlots[endIdx - 1];
      const endTimeDate = new Date(`2000-01-01 ${endSlot.slot.split('-')[1]}`);
      
      // Check if this time range overlaps with any booked range
      let hasOverlap = false;
      for (const bookedRange of bookedRanges) {
        if (startTimeDate < bookedRange.end && endTimeDate > bookedRange.start) {
          hasOverlap = true;
          break;
        }
      }
      
      if (hasOverlap) break;
      
      // Also check if all intermediate slots are available
      let allAvailable = true;
      for (let i = startIdx; i < endIdx; i++) {
        if (!availableSlots[i] || !availableSlots[i].isAvailable) {
          allAvailable = false;
          break;
        }
      }
      
      if (allAvailable) {
        endTimes.push({
          value: endSlot.slot.split('-')[1],
          label: endSlot.label.split(' - ')[1],
          duration: dur,
        });
      } else {
        break;
      }
    }
    return endTimes;
  };

  // Helper to find the price range for a given hour
  const findRangeForHour = (hour: number, ranges: { start: string; end: string; perHour: number }[]) => {
    for (const range of ranges) {
      const start = parseInt(range.start.split(':')[0], 10);
      const end = parseInt(range.end.split(':')[0], 10);
      if (start < end) {
        // e.g., 06:00-18:00
        if (hour >= start && hour < end) return range;
      } else {
        // e.g., 18:00-06:00 (overnight)
        if (hour >= start || hour < end) return range;
      }
    }
    return null;
  };

  // Helper to calculate total price and breakdown for the selected range
  const calculateTotalPriceAndBreakdown = () => {
    if (!selectedStartSlotObj || !selectedEndTime || !ground) return { total: 0, breakdown: [] };
    const startHour = parseInt(selectedStartSlotObj.slot.split(':')[0], 10);
    const endHour = parseInt(selectedEndTime.split(':')[0], 10);
    let total = 0;
    let hour = startHour;
    const breakdown: { hour: string; rate: number | string; type: string }[] = [];
    while (hour !== endHour) {
      const range = findRangeForHour(hour, ground.price.ranges);
      let rate = range ? range.perHour : 'Not set';
      let type = range ? `${range.start} - ${range.end}` : 'No Range';
      breakdown.push({
        hour: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1) % 24 === 0 ? '00' : (hour + 1).toString().padStart(2, '0')}:00`,
        rate,
        type
      });
      if (typeof rate === 'number') total += rate;
      hour = (hour + 1) % 24;
      if (hour === startHour) break;
    }
    return { total, breakdown };
  };

  const handleBook = async () => {
    if (!ground || !selectedDate || !selectedStartSlotObj || !selectedEndTime || !playerCount || !contactName || !contactPhone) return;
    if (!user) {
      toast.error("Please login to create a booking");
      return;
    }
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (!healthResponse.ok) throw new Error('Server not responding');
    } catch {
      toast.error("Server is not running. Please start the server first.");
      return;
    }
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const bookingData = {
      groundId: ground._id,
      bookingDate: formattedDate,
      timeSlot: `${selectedStartSlotObj.slot.split('-')[0]}-${selectedEndTime}`, // Format as HH:MM-HH:MM
      playerDetails: {
        teamName: teamName || undefined,
        playerCount: parseInt(playerCount),
        contactPerson: {
          name: contactName,
          phone: contactPhone,
          email: contactEmail || undefined,
        },
      },
      requirements: undefined,
    };
    
    try {
      console.log("Sending booking data:", bookingData);
      const response = await bookingsApi.createBooking(bookingData);
      console.log("Booking response:", response);
      if (response && (response as any).success) {
        toast.success("Booking created! Please complete payment to confirm.");
        setCreatedBooking((response as any).booking);
        setIsPaymentModalOpen(true);
      } else {
        throw new Error((response as any)?.message || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      let errorMessage = "Failed to create booking. Please try again.";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.message) errorMessage = error.message;
      toast.error(errorMessage);
    }
  };

  const handlePaymentSuccess = (booking: any) => {
    toast.success("Payment successful! Your booking is confirmed.");
    onBookingCreated(booking);
    onClose();
    setIsPaymentModalOpen(false);
    setCreatedBooking(null);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setCreatedBooking(null);
    // Don't close the booking modal if payment is cancelled
  };

  if (!ground) return null;

  if (!isMongoObjectId(ground._id)) {
    return <div className="p-6 text-center text-red-600">This ground cannot be booked online.</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl w-full rounded-3xl p-0 overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50"
      >
        <DialogDescription className="sr-only">
          Book a cricket ground slot by selecting date, time, and providing contact details.
        </DialogDescription>
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              Book {ground.name}
            </DialogTitle>
            <div className="text-green-100 mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {ground.location.address}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {Array.isArray(ground?.price?.ranges) && ground.price.ranges.length > 0
                  ? ground.price.ranges.map((r, i) => (
                      <span key={i} className="mr-2">{r.start}-{r.end}: ₹{r.perHour}/hr</span>
                    ))
                  : 'No price ranges set'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Max {ground.features.capacity}
              </span>
            </div>
          </DialogHeader>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {getQuickDates().map((date, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedStartSlotObj(null);
                    setSelectedEndTime("");
                  }}
                  className={`p-3 rounded-xl text-center transition-all duration-200 ${
                    selectedDate && isSameDay(date, selectedDate)
                      ? "bg-green-600 text-white shadow-lg scale-105"
                      : "bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  <div className="text-xs font-medium">{getDateLabel(date)}</div>
                  <div className="text-lg font-bold">{format(date, "d")}</div>
                  <div className="text-xs opacity-75">{format(date, "MMM")}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Select Time Range</h3>
            </div>
            
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Loading available slots...</span>
              </div>
            ) : availableSlots.filter((s) => s.isAvailable).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No available slots for this day</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <select
                    className="p-3 rounded-xl border border-gray-200 text-gray-700"
                    value={selectedStartSlotObj ? selectedStartSlotObj.slot : ""}
                    onChange={e => {
                      const slotObj = availableSlots.find(s => s.slot === e.target.value);
                      setSelectedStartSlotObj(slotObj || null);
                      setSelectedEndTime("");
                    }}
                  >
                    <option value="">Select Start Time</option>
                    {availableSlots.filter(s => s.isAvailable).map(slot => (
                      <option key={slot.slot} value={slot.slot}>
                        {slot.label.split(' - ')[0]}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-3 rounded-xl border border-gray-200 text-gray-700"
                    value={selectedEndTime}
                    onChange={e => setSelectedEndTime(e.target.value)}
                    disabled={!selectedStartSlotObj}
                  >
                    <option value="">Select End Time</option>
                    {getAvailableEndTimes(selectedStartSlotObj).map(end => (
                      <option key={end.value} value={end.value}>
                        {end.label} ({end.duration} hr{end.duration > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedStartSlotObj && selectedEndTime && (
                  <div className="text-sm text-gray-600">
                    Duration: {((parseInt(selectedEndTime.split(':')[0], 10) - parseInt(selectedStartSlotObj.slot.split(':')[0], 10) + 24) % 24)} hour(s)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Team Name (Optional)
              </Label>
              <Input
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Number of Players *
              </Label>
              <Input
                type="number"
                min={1}
                max={ground.features.capacity}
                placeholder="Enter number of players"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Contact Person Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  placeholder="Contact person name"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl h-12 bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  type="tel"
                  placeholder="Contact phone number"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl h-12 bg-white"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Email Address (Optional)
                </Label>
                <Input
                  type="email"
                  placeholder="Contact email address"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl h-12 bg-white"
                />
              </div>
            </div>
          </div>

          {selectedDate && selectedStartSlotObj && selectedEndTime && playerCount && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedStartSlotObj.slot.split('-')[0]} - {selectedEndTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-medium">{playerCount} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">
                    {Array.isArray(ground?.price?.ranges) && ground.price.ranges.length > 0
                      ? ground.price.ranges.map((r, i) => (
                          <span key={i} className="mr-2">{r.start}-{r.end}: ₹{r.perHour}/hr</span>
                        ))
                      : 'No price ranges set'}
                  </span>
                </div>
                {/* Price breakdown */}
                <div className="mt-2">
                  <div className="font-semibold mb-1">Breakdown:</div>
                  <ul className="text-xs bg-white rounded-lg p-2 border border-blue-100">
                    {calculateTotalPriceAndBreakdown().breakdown.length === 0 ? (
                      <li>No hours selected.</li>
                    ) : (
                      calculateTotalPriceAndBreakdown().breakdown.map((b, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{b.hour} ({b.type})</span>
                          <span>{typeof b.rate === 'number' ? `₹${b.rate}` : b.rate}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="border-t border-blue-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">₹{calculateTotalPriceAndBreakdown().total}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={!selectedDate || !selectedStartSlotObj || !selectedEndTime || !playerCount || !contactName || !contactPhone}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {!selectedDate || !selectedStartSlotObj || !selectedEndTime || !playerCount || !contactName || !contactPhone 
                ? "Complete Details to Book" 
                : "Proceed to Payment"
              }
            </Button>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          booking={createdBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;