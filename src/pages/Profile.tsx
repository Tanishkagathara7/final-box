import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingData {
  _id: string;
  bookingId: string;
  groundId: {
    _id: string;
    name: string;
    location: {
      address: string;
    };
  };
  bookingDate: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  playerDetails: {
    teamName?: string;
    playerCount: number;
    contactPerson: {
      name: string;
      phone: string;
      email: string;
    };
    requirements?: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  pricing: {
    baseAmount: number;
    discount: number;
    taxes: number;
    totalAmount: number;
    currency: string;
  };
  createdAt: string;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated]);

  const fetchUserBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response: any = await bookingsApi.getMyBookings();
      //@ts-ignore
      if (response.success) {
        //@ts-ignore
        setBookings(response.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const getStatusColor = (status: BookingData["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} to ${timeSlot.endTime}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Please login to view your profile
              </h3>
              <p className="text-gray-600 mb-4">
                You need to be logged in to access your profile and bookings.
              </p>
              <Button 
                className="bg-cricket-green hover:bg-cricket-green/90"
                onClick={() => navigate("/")}
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-cricket rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <p className="text-gray-600">Cricket Enthusiast</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{user?.phone}</span>
                </div>
                {user?.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{user.location.cityName}, {user.location.state}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  //@ts-ignore
                  <span>Member since {formatDate(user?.createdAt || new Date().toISOString())}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Bookings
                    </span>
                    <Badge variant="secondary">{bookings.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Active Bookings
                    </span>
                    <Badge variant="secondary">
                      {bookings.filter(b => b.status === "confirmed" || b.status === "pending").length}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                  onClick={() => navigate("/")}
                >
                  Book New Ground
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Bookings
                  </h2>
                  <Button 
                    className="bg-cricket-green hover:bg-cricket-green/90"
                    onClick={() => navigate("/")}
                  >
                    Book New Ground
                  </Button>
                </div>

                {isLoadingBookings ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : bookings.filter(b => b.groundId).length > 0 ? (
                  <div className="space-y-4">
                    {bookings.filter(b => b.groundId).map((booking) => (
                      <Card key={booking._id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {booking.groundId ? booking.groundId.name : "Unknown Ground"}
                                </h3>
                                <Badge
                                  className={getStatusColor(booking.status)}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(booking.bookingDate)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(booking.timeSlot)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{booking.playerDetails.playerCount} players</span>
                                </div>
                              </div>

                              {booking.playerDetails.teamName && (
                                <div className="mt-2 text-sm text-gray-600">
                                  Team: {booking.playerDetails.teamName}
                                </div>
                              )}

                              <div className="mt-3 text-sm text-gray-600">
                                Booked on {formatDate(booking.createdAt)}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-bold text-cricket-green">
                                ₹{booking.pricing.totalAmount}
                              </div>
                              <div className="text-sm text-gray-600">
                                Total Amount
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/booking/${booking._id}`)}
                            >
                              View Details
                            </Button>
                            {booking.status === "confirmed" && (
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            )}
                            {booking.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No bookings yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start exploring cricket grounds and make your first
                        booking!
                      </p>
                      <Button 
                        className="bg-cricket-green hover:bg-cricket-green/90"
                        onClick={() => navigate("/")}
                      >
                        Explore Grounds
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Favorite Grounds
                  </h2>
                </div>

                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add cricket grounds to your favorites for quick access.
                    </p>
                    <Button
                      variant="outline"
                      className="text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                      onClick={() => navigate("/")}
                    >
                      Browse Grounds
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Booking confirmations</span>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ground recommendations</span>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Promotional offers</span>
                        <Button variant="outline" size="sm">
                          Disable
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Location sharing</span>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Profile visibility</span>
                        <Button variant="outline" size="sm">
                          Public
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

