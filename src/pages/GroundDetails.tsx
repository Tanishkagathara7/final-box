import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Users,
  Car,
  Zap,
  Calendar,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import NewBookingModal from "@/components/NewBookingModal";
import { groundsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isMongoObjectId } from "@/lib/utils";

const GroundDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ground, setGround] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [slotRetryCount, setSlotRetryCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('boxcric_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (id && !isMongoObjectId(id)) {
      toast.error("This ground cannot be booked online.");
      navigate("/");
      return;
    }
    if (id) {
      fetchGroundDetails();
      fetchReviews();
    }
  }, [id]);

  // Sync notifications from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('boxcric_notifications');
        if (saved) {
          setNotifications(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error syncing notifications:', error);
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchGroundDetails = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching ground details for ID:", id);
      
      if (!id || id === "undefined") {
        throw new Error("Invalid ground ID");
      }
      
      const response = await groundsApi.getGround(id);
      console.log("Ground details response:", response);
      
      //@ts-ignore
      if (response.success) {
        //@ts-ignore
        setGround(response.ground);
      } else {
        //@ts-ignore
        throw new Error(response.message || "Failed to fetch ground details");
      }
    } catch (error: any) {
      console.error("Failed to fetch ground details:", error);
      toast.error("Failed to load ground details");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await groundsApi.getReviews(id!, { limit: 5 });
      console.log("Reviews response:", response);
      
      //@ts-ignore
      if (response.success) {
        //@ts-ignore
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const handleBookingCreated = (booking: any) => {
    toast.success("Booking created successfully!");
    
    // Add notification for new booking
    const newNotification = {
      id: booking._id || booking.id || Date.now().toString(),
      status: booking.status || 'pending',
      ground: booking.groundId?.name || ground?.name || 'Unknown Ground',
      date: booking.bookingDate,
      time: booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : 'Time not specified',
      reason: '',
      createdAt: new Date().toISOString(),
      isLocal: true,
    };
    
    // Store notification in localStorage for the Index page to pick up
    const existingNotifications = JSON.parse(localStorage.getItem('boxcric_notifications') || '[]');
    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem('boxcric_notifications', JSON.stringify(updatedNotifications));
    
    navigate(`/booking/${booking._id}`);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('boxcric_notifications');
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a ground");
      return;
    }
    setSelectedTimeSlot(timeSlot);
    setIsBookingModalOpen(true);
  };

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (!ground?.images?.length) return;

    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === ground.images.length - 1 ? 0 : prev + 1,
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? ground.images.length - 1 : prev - 1,
      );
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Floodlights: <Zap className="w-4 h-4" />,
      Parking: <Car className="w-4 h-4" />,
      Washroom: <span>🚿</span>,
      "Changing Room": <span>👕</span>,
      "AC Changing Room": <span>❄️👕</span>,
      "Drinking Water": <span>💧</span>,
      "First Aid": <span>🏥</span>,
      "Equipment Rental": <span>🏏</span>,
      Cafeteria: <span>☕</span>,
      Scoreboard: <span>📊</span>,
      Referee: <span>👨‍⚖️</span>,
    };
    return iconMap[amenity] || <span>✨</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar 
          notifications={notifications}
          showNotifDropdown={showNotifDropdown}
          setShowNotifDropdown={setShowNotifDropdown}
          clearNotifications={clearNotifications}
        />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-cricket-green border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar 
          notifications={notifications}
          showNotifDropdown={showNotifDropdown}
          setShowNotifDropdown={setShowNotifDropdown}
          clearNotifications={clearNotifications}
        />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ground Not Found
            </h1>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure ground has required properties with fallbacks
  const safeGround = {
    _id: ground._id || id || "unknown",
    name: ground.name || "Unknown Ground",
    description: ground.description || "No description available",
    location: ground.location || { address: "Address not available" },
    price: ground.price || { perHour: 0, discount: 0 },
    images: ground.images || [],
    amenities: ground.amenities || [],
    features: ground.features || { pitchType: "Unknown", capacity: 0, lighting: false, parking: false },
    rating: ground.rating || { average: 0, count: 0 },
    owner: ground.owner || { name: "Unknown", contact: "N/A", email: "N/A", verified: false },
    totalBookings: ground.totalBookings || 0,
    isVerified: ground.isVerified || false,
    policies: ground.policies || { cancellation: "Standard policy", rules: [] },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar 
        notifications={notifications}
        showNotifDropdown={showNotifDropdown}
        setShowNotifDropdown={setShowNotifDropdown}
        clearNotifications={clearNotifications}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Heart
                className={cn(
                  "w-4 h-4 mr-2",
                  isFavorite && "fill-red-500 text-red-500",
                )}
              />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={
                    safeGround.images[currentImageIndex]?.url || 
                    safeGround.images[currentImageIndex] || 
                    "/placeholder.svg"
                  }
                  alt={safeGround.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Navigation */}
              {safeGround.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ›
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {safeGround.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-all",
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Ground Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {safeGround.name}
                  </h1>
                  <div className="flex items-center space-x-1 text-gray-600 mb-3">
                    <MapPin className="w-5 h-5" />
                    <span>{safeGround.location.address}</span>
                    {ground.distance && (
                      <span className="text-cricket-green font-medium">
                        • {ground.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {safeGround.rating.average}
                      </span>
                      <span className="text-gray-600">
                        ({safeGround.rating.count} reviews)
                      </span>
                    </div>
                    {safeGround.isVerified && (
                      <Badge className="bg-cricket-green text-white">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {Array.isArray(safeGround.price?.ranges) && safeGround.price.ranges.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-cricket-green">
                        Starting from ₹{Math.min(...safeGround.price.ranges.map(r => r.perHour))}/hr
                      </div>
                      <div className="text-sm text-gray-600">
                        View all pricing options below
                      </div>
                    </div>
                  ) : (
                    <div className="text-base text-gray-500">No price slots set</div>
                  )}
                  {safeGround.price.discount > 0 && (
                    <div className="text-sm text-green-600">
                      {safeGround.price.discount}% discount available
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {safeGround.description}
              </p>
            </div>

            {/* Pricing Section */}
            {Array.isArray(safeGround.price?.ranges) && safeGround.price.ranges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>💰</span>
                    <span>Pricing Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safeGround.price.ranges.map((range, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-700">
                            {range.start} - {range.end}
                          </span>
                          <Badge variant="outline" className="text-cricket-green border-cricket-green">
                            {index === 0 ? 'Peak Hours' : 'Off-Peak Hours'}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-cricket-green">
                          ₹{range.perHour}/hr
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {range.start === '06:00' && range.end === '18:00' ? 'Day time slots' : 'Evening/Night slots'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {safeGround.price.discount > 0 && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🎉</span>
                        <span className="font-medium text-green-800">
                          {safeGround.price.discount}% discount available on advance bookings
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Details Tabs */}
            <Tabs defaultValue="amenities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="amenities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {safeGround.amenities.map(
                        (amenity: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ground Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Pitch Type:</span>
                        <div className="font-medium">
                          {safeGround.features.pitchType}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Capacity:</span>
                        <div className="font-medium">
                          {safeGround.features.capacity} players
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Night Lighting:</span>
                        <div className="font-medium">
                          {safeGround.features.lighting
                            ? "Available"
                            : "Not available"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Parking:</span>
                        <div className="font-medium">
                          {safeGround.features.parking
                            ? "Available"
                            : "Not available"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="policies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Policies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Cancellation Policy</h4>
                      <p className="text-gray-700 text-sm">
                        {safeGround.policies.cancellation}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Ground Rules</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {safeGround.policies.rules.map(
                          (rule: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="text-cricket-green">•</span>
                              <span>{rule}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300",
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">
                                {review.userId?.name || "Anonymous"}
                              </span>
                              <span className="text-sm text-gray-600">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-cricket-green" />
                  <span>Book This Ground</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  {Array.isArray(safeGround.price?.ranges) && safeGround.price.ranges.length > 0 ? (
                    <>
                      <div className="space-y-1 mb-2">
                        {safeGround.price.ranges.map((range, idx) => (
                          <div key={idx} className="text-base font-semibold text-cricket-green">
                            {range.start} - {range.end}: ₹{range.perHour}/hr
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-base text-gray-500">No price slots set</div>
                  )}
                </div>

                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-cricket-green hover:bg-cricket-green/90"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? "Book Now" : "Login to Book"}
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  Free cancellation up to 4 hours before booking
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Ground Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600">Owner:</span>
                  <div className="font-medium">{safeGround.owner.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium">{safeGround.owner.contact}</div>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium">{safeGround.owner.email}</div>
                </div>
                {safeGround.owner.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    Verified Owner
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span className="font-medium">{safeGround.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating:</span>
                  <span className="font-medium">{safeGround.rating.average}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        ground={safeGround}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
};

export default GroundDetails;
