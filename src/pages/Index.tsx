import { useState, useEffect, useMemo } from "react";
import { MapPin, Zap, Star, Clock, Sparkles, Search, Play, Trophy, Users, Shield, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";


import Footer from "@/components/Footer";
import LocationSelector from "@/components/LocationSelector";
import GroundCard from "@/components/GroundCard";
import FilterPanel from "@/components/FilterPanel";
import NewBookingModal from "@/components/NewBookingModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities";
import { groundsApi } from "@/lib/api";
import type { FilterOptions } from "@/components/FilterPanel";
import { calculateDistance } from "@/lib/cities";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isMongoObjectId } from "@/lib/utils";
import { bookingsApi } from "@/lib/api";

// Demo data for testimonials
const testimonials = [
  {
    name: "Amit Sharma",
    city: "Mumbai",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "Booking a ground was super easy and the facilities were top-notch! Highly recommend BoxCric to all cricket lovers.",
  },
  {
    name: "Priya Verma",
    city: "Delhi",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "Loved the instant confirmation and the variety of grounds available. The support team was very helpful!",
  },
  {
    name: "Rahul Singh",
    city: "Bangalore",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
    review: "The best platform for booking cricket grounds. The reviews and ratings helped me pick the perfect pitch.",
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    review: "Great experience! The booking process was smooth and the ground was exactly as described.",
  },
];

// Demo data for recent bookings
const recentBookings = [
  "Amit booked Marine Drive Arena, Mumbai",
  "Priya booked Andheri Sports Complex, Mumbai",
  "Rahul booked Powai Cricket Club, Mumbai",
  "Sneha booked Delhi Cricket Stadium, Delhi",
  "Vikram booked Eden Gardens, Kolkata",
  "Anjali booked Chinnaswamy Stadium, Bangalore",
  "Rohit booked Rajiv Gandhi Stadium, Hyderabad",
];

// Helper to merge and deduplicate notifications by id and status
function mergeNotifications(oldNotifs: any[], newNotifs: any[]) {
  const map = new Map();
  
  // Process old notifications first
  oldNotifs.forEach(n => {
    const key = n.id + '-' + n.status;
    map.set(key, n);
  });
  
  // Process new notifications, overwriting old ones if they have the same key
  newNotifs.forEach(n => {
    const key = n.id + '-' + n.status;
    // If this notification exists in the database, remove the isLocal flag
    if (map.has(key) && map.get(key).isLocal) {
      n.isLocal = false;
    }
    map.set(key, n);
  });
  
  return Array.from(map.values());
}

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedGround, setSelectedGround] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [grounds, setGrounds] = useState<any[]>([]);
  const [isLoadingGrounds, setIsLoadingGrounds] = useState(false);
  const [heroStats, setHeroStats] = useState({ grounds: 0, players: 0, bookings: 0 });

  // State for testimonials carousel
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('boxcric_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Auto-advance testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const defaultFilters: FilterOptions = {
    priceRange: [500, 2000],
    distance: 25,
    amenities: [],
    pitchType: "all",
    lighting: false,
    parking: false,
    rating: 0,
    availability: "all",
  };

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setHeroStats({
          grounds: Math.floor(500 * progress),
          players: Math.floor(50000 * progress),
          bookings: Math.floor(10000 * progress),
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
    };

    animateStats();
  }, []);

  // Add loading state for initial page load
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Test API connection on mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("🧪 Testing API connection...");
        const response = await fetch("http://localhost:3001/api/test");
        const data = await response.json();
        console.log("✅ API Test Result:", data);
      } catch (error) {
        console.error("❌ API Test Failed:", error);
      }
    };
    testAPI();
  }, []);

  // Auto-open location selector on first visit
  useEffect(() => {
    if (!selectedCity) {
      const timer = setTimeout(() => {
        setIsLocationSelectorOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCity]);

  // Add smooth scroll behavior
  useEffect(() => {
    const smoothScroll = (e: any) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  // Fetch grounds when city or filters change
  useEffect(() => {
    if (selectedCity) {
      fetchGrounds();
    }
  }, [selectedCity, searchQuery, filters]);

  // Restore selected city from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("boxcric_selected_city");
    if (savedCity) {
      setSelectedCity(JSON.parse(savedCity));
    }
  }, []);

  // Fetch user booking notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchNotifications = async () => {
      try {
        const res = await bookingsApi.getMyBookings();
        console.log('Notifications API response:', res);
        
        // Handle different response structures
        let bookings = [];
        if (res.data && res.data.success && Array.isArray(res.data.bookings)) {
          bookings = res.data.bookings;
        } else if (res.data && res.data.success && Array.isArray(res.data.bookings)) {
          bookings = res.data.bookings;
        } else if (Array.isArray(res.data)) {
          bookings = res.data;
        }
        
        if (bookings.length > 0) {
          const newNotifs = bookings
            .filter(b => ["pending", "confirmed", "cancelled", "completed"].includes(b.status))
            .map(b => ({
              id: b._id || b.id,
              status: b.status,
              ground: b.groundId?.name || b.groundId || 'Unknown Ground',
              date: b.bookingDate,
              time: b.timeSlot ? `${b.timeSlot.startTime} - ${b.timeSlot.endTime}` : 'Time not specified',
              reason: b.cancellation?.reason || '',
              createdAt: b.createdAt || new Date().toISOString(),
            }));
          
          setNotifications(prevNotifs => {
            // Keep any local notifications (newly created) and merge with API notifications
            const localNotifs = prevNotifs.filter(n => n.isLocal);
            const merged = mergeNotifications([...localNotifs, ...newNotifs], []);
            localStorage.setItem('boxcric_notifications', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('boxcric_notifications');
  };

  const fetchGrounds = async () => {
    if (!selectedCity) return;

    try {
      setIsLoadingGrounds(true);
      console.log(
        "🔍 Fetching grounds for city:",
        selectedCity.name,
        selectedCity.id,
      );

      const params: any = {
        cityId: selectedCity.id,
        page: 1,
        limit: 20,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filters.priceRange[0] !== 500 || filters.priceRange[1] !== 2000) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      if (filters.amenities.length > 0) {
        params.amenities = filters.amenities;
      }

      if (filters.pitchType !== "all") {
        params.pitchType = filters.pitchType;
      }

      if (filters.lighting) {
        params.lighting = true;
      }

      if (filters.parking) {
        params.parking = true;
      }

      if (filters.rating > 0) {
        params.minRating = filters.rating;
      }

      if (filters.distance < 25) {
        params.maxDistance = filters.distance;
        params.lat = selectedCity.latitude;
        params.lng = selectedCity.longitude;
      }

      console.log("📡 API Request params:", params);
      const response = await groundsApi.getGrounds(params) as any;
      console.log("📥 API Response:", response);

      if (response.success) {
        console.log("✅ Found grounds:", response.grounds?.length);
        setGrounds(response.grounds || []);
      } else {
        console.log("❌ API returned error:", response.message);
        setGrounds([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch grounds:", error);
      toast.error("Failed to load grounds. Please try again.");
      setGrounds([]);
    } finally {
      setIsLoadingGrounds(false);
    }
  };

  // Replace displayGrounds with only real MongoDB grounds
  const realGrounds = useMemo(() => grounds.filter(g => isMongoObjectId(g._id)), [grounds]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    localStorage.setItem("boxcric_selected_city", JSON.stringify(city));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleBookGround = (groundId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a ground");
      return;
    }
    if (!isMongoObjectId(groundId)) {
      toast.error("This ground cannot be booked online.");
      return;
    }
    const ground = grounds.find((g) => g._id === groundId);
    if (ground) {
      setSelectedGround(ground);
      setIsBookingModalOpen(true);
    }
  };

  const handleViewDetails = (groundId: string) => {
    console.log("View details clicked for ground ID:", groundId);
    console.log("Ground data:", realGrounds.find(g => g._id === groundId));
    navigate(`/ground/${groundId}`);
  };

  const handleBookingCreated = (booking: any) => {
    toast.success("Booking created successfully!");
    
    // Add notification for new booking
    const newNotification = {
      id: booking._id || booking.id || Date.now().toString(),
      status: booking.status || 'pending', // Use actual booking status
      ground: booking.groundId?.name || selectedGround?.name || 'Unknown Ground',
      date: booking.bookingDate,
      time: booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : 'Time not specified',
      reason: '',
      createdAt: new Date().toISOString(),
      isLocal: true, // Mark as local notification
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('boxcric_notifications', JSON.stringify(updated));
      return updated;
    });
    
    navigate(`/booking/${booking._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      {/* Page Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cricket-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading BoxCric</h2>
            <p className="text-gray-600">Finding the best cricket grounds for you...</p>
          </div>
        </div>
      )}

      <Navbar
        selectedCity={selectedCity?.name}
        onCitySelect={() => setIsLocationSelectorOpen(true)}
        onSearch={handleSearch}
        onFilterToggle={() => setIsFilterPanelOpen(true)}
        notifications={notifications}
        showNotifDropdown={showNotifDropdown}
        setShowNotifDropdown={setShowNotifDropdown}
        clearNotifications={clearNotifications}
      />

      {/* Enhanced Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-green/20 via-transparent to-sky-blue/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2322c55e%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>
        
        {/* Animated Cricket Elements */}
        <div className="absolute top-10 left-2 animate-float hidden sm:block">
          <div className="w-12 h-12 bg-cricket-green/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🏏</span>
          </div>
        </div>
        <div className="absolute top-32 right-4 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 bg-cricket-yellow/20 rounded-full flex items-center justify-center">
            <span className="text-lg">⚾</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/4 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 bg-sky-blue/20 rounded-full flex items-center justify-center">
            <span className="text-base">🏟️</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Heading */}
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-cricket opacity-20 blur-3xl rounded-full"></div>
            <h1 className="relative text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-gray-900 mb-4 sm:mb-6 leading-tight">
              Book Your Perfect{" "}
              <span className="text-transparent bg-gradient-to-r from-cricket-green via-cricket-yellow to-sky-blue bg-clip-text animate-pulse">
                Cricket Ground
              </span>
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              Discover amazing box cricket grounds near you. From premium facilities to budget-friendly options, 
              find the perfect pitch for your game in just a few clicks.
            </p>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 max-w-4xl mx-auto px-4">
            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-cricket-green/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-cricket-green" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{heroStats.grounds}+</h3>
                <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Premium Cricket Grounds</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-cricket-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-cricket-yellow" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{heroStats.players}+</h3>
                <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Happy Players</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105 xs:col-span-2 sm:col-span-1">
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-sky-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-sky-blue" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{heroStats.bookings}+</h3>
                <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Successful Bookings</p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0 px-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cricket-green" />
              <span>100% Secure Booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cricket-green" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-cricket-green" />
              <span>Verified Grounds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Bookings Ticker */}
      <div className="w-full bg-white/80 border-y border-gray-100 py-2 overflow-hidden">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto px-2 animate-marquee whitespace-nowrap text-sm text-gray-700 font-medium">
          <Sparkles className="w-4 h-4 text-cricket-green mr-2" />
          {recentBookings.map((booking, i) => (
            <span key={i} className="mx-4 inline-block hover:text-cricket-green transition-colors cursor-pointer">
              {booking}
            </span>
          ))}
        </div>
      </div>

      {/* Grounds Listing */}
      {selectedCity && (
        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Cricket Grounds in {selectedCity.name}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {realGrounds.length} amazing grounds available for booking
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {Object.values(filters).some((value, index) =>
                  index === 0
                    ? (value as [number, number])[0] !== 500 ||
                      (value as [number, number])[1] !== 2000
                    : index === 1
                      ? value !== 25
                      : index === 2
                        ? (value as string[]).length > 0
                        : index === 3
                          ? value !== "all"
                          : index >= 4 && index <= 5
                            ? value === true
                            : index === 6
                              ? value > 0
                              : value !== "all",
                ) && (
                  <Badge variant="secondary" className="text-sm">
                    Filters Applied
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex items-center space-x-2 py-2 px-4 h-10 sm:h-11"
                >
                  <span className="text-sm sm:text-base">Filters</span>
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ ...filters, priceRange: [500, 1000] })
                }
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.priceRange[1] <= 1000 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Budget Friendly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, lighting: true })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.lighting &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Night Games
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, rating: 4.5 })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.rating >= 4.5 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Highly Rated
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, distance: 5 })}
                className={cn(
                  "text-xs sm:text-sm py-2 px-3 h-9 sm:h-10",
                  filters.distance <= 5 &&
                    "bg-cricket-green/10 border-cricket-green text-cricket-green",
                )}
              >
                Nearby
              </Button>
            </div>

            {/* Grounds Grid */}
            {isLoadingGrounds ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 sm:h-52 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : realGrounds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {realGrounds.map((ground) => (
                  <GroundCard
                    key={ground._id}
                    ground={ground}
                    onBook={handleBookGround}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">
                  No grounds found
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto">
                  {selectedCity
                    ? `No cricket grounds found in ${selectedCity.name}. Try adjusting your filters.`
                    : "Select a city to discover amazing cricket grounds near you."}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearFilters}
                  className="text-cricket-green border-cricket-green hover:bg-cricket-green/10 py-2 px-6 h-10 sm:h-11"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Book your cricket ground in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Search & Select</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Find cricket grounds near you, filter by location, price, and amenities to find the perfect match.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Choose Time Slot</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Pick your preferred date and time slot from the available options. Real-time availability updates.
              </p>
            </div>
            
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Book & Play</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Complete your payment securely and get instant confirmation. Show up and enjoy your game!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose BoxCric?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              We're committed to making cricket ground booking simple, secure, and enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Book your slot instantly with real-time availability</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Verified Grounds</h3>
              <p className="text-gray-600 text-xs sm:text-sm">All grounds are verified for quality and safety</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Multiple secure payment options available</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Round-the-clock customer support for any queries</p>
            </div>
          </div>
        </div>
      </section>



      {/* Location Prompt */}
      {!selectedCity && (
        <section className="py-8 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-cricket-green/5 border border-cricket-green/20 rounded-full px-6 py-3">
              <MapPin className="w-5 h-5 text-cricket-green animate-pulse" />
              <span className="text-cricket-green font-medium">
                Select your city to discover nearby cricket grounds
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-cricket-green to-green-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-green-100 mb-8">
              Get notified about new grounds, special offers, and cricket events in your area
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/20 focus:outline-none"
              />
              <Button className="bg-white text-cricket-green hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
            <p className="text-green-100 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get the BoxCric App
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Download our mobile app for the best booking experience. Get instant notifications, 
                  manage your bookings, and discover new grounds on the go.
                </p>
                
                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Instant booking & notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Offline ground information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cricket-green/10 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-cricket-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">GPS navigation to grounds</span>
                  </div>
                </div>

                {/* App Store Badges */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="#" className="inline-block">
                    <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="inline-block">
                    <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">GET IT ON</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* App Mockup */}
              <div className="relative">
                <div className="relative mx-auto lg:mx-0 w-80 h-96 bg-gradient-to-br from-cricket-green to-green-600 rounded-3xl shadow-2xl p-8">
                  <div className="bg-white rounded-2xl h-full p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cricket-green rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">BC</span>
                        </div>
                        <span className="font-semibold text-gray-900">BoxCric</span>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Marine Drive Arena</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.8</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Premium cricket ground with floodlights</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cricket-green font-semibold">₹1,200/hr</span>
                          <Button size="sm" className="bg-cricket-green text-white">
                            Book Now
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Andheri Sports Complex</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.6</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Professional pitch with parking</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cricket-green font-semibold">₹800/hr</span>
                          <Button size="sm" className="bg-cricket-green text-white">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Components */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
      />

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        ground={selectedGround}
        onBookingCreated={handleBookingCreated}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-cricket-green hover:bg-cricket-green/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default Index;

