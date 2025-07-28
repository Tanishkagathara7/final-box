import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  Star,
  Shield,
  CreditCard,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import PaymentModal from "@/components/PaymentModal";
import { bookingsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (id) {
      fetchBookingDetails();
    }
  }, [id, isAuthenticated]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsApi.getBooking(id!);
      if (response.success) {
        setBooking(response.booking);
      }
    } catch (error: any) {
      console.error("Failed to fetch booking details:", error);
      toast.error("Failed to load booking details");
      navigate("/profile/bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    try {
      const response = await bookingsApi.updateBookingStatus(booking._id, {
        status: "cancelled",
        reason: "User cancellation",
      });
      if (response.success) {
        toast.success("Booking cancelled successfully");
        setBooking((prev: any) => ({ ...prev, status: "cancelled" }));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
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
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Defensive helpers for deeply nested fields
  const ground =
    booking?.groundId && typeof booking.groundId === "object"
      ? booking.groundId
      : booking?.ground || {};

  const playerDetails = booking?.playerDetails || {};
  const contactPerson = playerDetails.contactPerson || {};

  // Defensive for pricing and payment
  const pricing = booking?.pricing || {};
  const payment = booking?.payment || { status: "pending" };

  // Auto-open payment modal if payment is pending
  useEffect(() => {
    if (
      booking &&
      (payment.status === "pending" || (!payment && booking.status === "pending"))
    ) {
      setIsPaymentModalOpen(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-cricket-green border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Not Found
            </h1>
            <Button onClick={() => navigate("/profile/bookings")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile/bookings")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings</span>
          </Button>

          <Badge className={getStatusColor(booking.status)} variant="secondary">
            {booking.status
              ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
              : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-cricket-green" />
                  <span>Booking Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {ground?.name || "Unknown Ground"}
                    </h2>
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{ground?.location?.address || ""}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Booking ID</div>
                    <div className="font-mono font-semibold">
                      {booking.bookingId || booking._id}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-cricket-green" />
                    <div>
                      <div className="text-sm text-gray-600">Date</div>
                      <div className="font-medium">
                        {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-cricket-green" />
                    <div>
                      <div className="text-sm text-gray-600">Time</div>
                      <div className="font-medium">
                        {booking.timeSlot?.startTime
                          ? booking.timeSlot.startTime +
                            " - " +
                            booking.timeSlot.endTime
                          : booking.timeSlot || ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-cricket-green" />
                    <div>
                      <div className="text-sm text-gray-600">Players</div>
                      <div className="font-medium">
                        {playerDetails?.playerCount || ""}
                      </div>
                    </div>
                  </div>
                </div>

                {playerDetails?.teamName && (
                  <div>
                    <div className="text-sm text-gray-600">Team Name</div>
                    <div className="font-medium">
                      {playerDetails.teamName}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Person</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">
                      {contactPerson?.name || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{contactPerson?.phone || ""}</span>
                  </div>
                  {contactPerson?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span>{contactPerson.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ground Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ground Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      ground?.images && ground.images.length > 0
                        ? ground.images[0].url
                        : "/placeholder.svg"
                    }
                    alt={ground?.name || "Ground"}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {ground?.rating?.average || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({ground?.rating?.count || 0} reviews)
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        Pitch: {ground?.features?.pitchType || "N/A"}
                      </div>
                      <div>
                        Capacity: {ground?.features?.capacity || "N/A"} players
                      </div>
                      {ground?.features?.lighting && (
                        <div>✅ Night lighting available</div>
                      )}
                      {ground?.features?.parking && (
                        <div>✅ Parking available</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-cricket-green" />
                  <span>Payment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base Amount</span>
                  <span>₹{pricing.baseAmount || booking.amount || ""}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>₹{pricing.taxes || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-cricket-green">
                    ₹{pricing.totalAmount || booking.amount || ""}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Payment Status
                  </div>
                  <Badge
                    className={
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {payment.status
                      ? payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)
                      : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {booking.status === "pending" &&
                    payment.status === "pending" && (
                      <Button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full bg-cricket-green hover:bg-cricket-green/90"
                      >
                        Complete Payment
                      </Button>
                    )}

                  {(booking.status === "pending" ||
                    booking.status === "confirmed") && (
                    <Button
                      variant="outline"
                      onClick={handleCancelBooking}
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel Booking
                    </Button>
                  )}

                  {booking.status === "completed" && !booking.feedback && (
                    <Button variant="outline" className="w-full">
                      Rate & Review
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/ground/${ground?._id || ""}`)}
                    className="w-full"
                  >
                    View Ground Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Code */}
            {booking.confirmation?.confirmationCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Confirmation Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-cricket-green">
                      {booking.confirmation.confirmationCode}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Show this code at the ground
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={booking}
        onPaymentSuccess={() => {
          setBooking((prev: any) => ({
            ...prev,
            status: "confirmed",
            payment: { ...prev.payment, status: "completed" },
          }));
        }}
      />
    </div>
  );
};

export default BookingDetails;