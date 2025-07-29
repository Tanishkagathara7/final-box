import { useState, useEffect, useCallback, useMemo } from "react";
import { CreditCard, Shield, Clock, MapPin, Calendar, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { paymentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Declare Cashfree types
declare global {
  interface Window {
    Cashfree: any;
  }
}

interface Booking {
  _id?: string; // MongoDB ID
  id: string; // Legacy ID for compatibility
  bookingId: string;
  groundId?: any;
  ground?: any;
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
    };
  };
  pricing?: {
    baseAmount?: number;
    discount?: number;
    taxes?: number;
    totalAmount?: number;
    duration?: number;
  };
  amount?: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess: (booking: Booking) => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced dynamic amount calculation
  const bookingData = useMemo(() => {
    if (!booking) return null;

    const ground =
      (booking.groundId && typeof booking.groundId === "object"
        ? booking.groundId
        : booking.ground) || {};

    let firstImage = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
    if (
      ground.images &&
      Array.isArray(ground.images) &&
      ground.images.length > 0
    ) {
      const imgItem = ground.images[0];
      if (typeof imgItem === "string") {
        firstImage = imgItem.startsWith('http') ? imgItem : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
      } else if (imgItem && typeof imgItem === "object" && "url" in imgItem) {
        firstImage = imgItem.url && imgItem.url.startsWith('http') ? imgItem.url : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
      }
    }

    const address =
      ground?.location?.address ||
      (ground?.location ? ground.location : "") ||
      "No address available";

    // --- Dynamic baseAmount calculation ---
    let baseAmount = booking?.pricing?.baseAmount ?? 0;
    let perHour = ground?.price?.perHour || 0;
    let duration = booking?.timeSlot?.duration || 1;
    // If price ranges exist, pick the correct perHour based on startTime
    if (Array.isArray(ground?.price?.ranges) && ground.price.ranges.length > 0 && booking?.timeSlot?.startTime) {
      const slot = ground.price.ranges.find(r => r.start === booking.timeSlot.startTime);
      if (slot) {
        perHour = slot.perHour;
      } else {
        perHour = ground.price.ranges[0].perHour;
      }
    }
    if (!baseAmount || baseAmount === 0) {
      baseAmount = perHour * duration;
    }

    const discount = booking?.pricing?.discount ?? 0;
    // --- Dynamic taxes and totalAmount calculation ---
    let taxes = booking?.pricing?.taxes ?? 0;
    if (!taxes && baseAmount > 0) {
      taxes = Math.round((baseAmount - discount) * 0.02);
    }
    let totalAmount = booking?.pricing?.totalAmount ?? 0;
    if (!totalAmount && baseAmount > 0) {
      totalAmount = (baseAmount - discount) + taxes;
    }

    return {
      ground,
      firstImage,
      address,
      baseAmount,
      discount,
      taxes,
      totalAmount,
      duration,
    };
  }, [booking]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!booking || !user || !bookingData) return;

    try {
      setIsProcessing(true);

      // Create order on backend
      const orderResponse = await paymentsApi.createOrder({
        bookingId: booking._id || booking.id,
      });

      console.log("Order response:", orderResponse);

      if (!(orderResponse as any)?.success) {
        throw new Error((orderResponse as any)?.message || "Failed to create order");
      }

      const { order, appId } = orderResponse as any;
      console.log("Order details:", order);
      console.log("Payment URL:", order.payment_url);

      if (!appId) {
        throw new Error("Payment app ID missing from server response.");
      }

      // Use Cashfree SDK for checkout
      if (typeof window.Cashfree !== 'undefined') {
        const cashfree = window.Cashfree({
          mode: order.mode || "production"
        });
        
        const checkoutOptions = {
          paymentSessionId: order.payment_session_id,
          redirectTarget: "_self"
        };
        
        console.log("Opening Cashfree checkout with:", checkoutOptions);
        cashfree.checkout(checkoutOptions);
      } else {
        // Fallback to direct redirect if SDK not loaded
        const cashfreeUrl = order.payment_url || `https://payments.cashfree.com/pg/view/${order.payment_session_id}`;
        window.location.href = cashfreeUrl;
      }

      // Poll for payment completion
      const checkPaymentStatus = async () => {
        try {
          const verifyResponse = await paymentsApi.verifyPayment({
            order_id: order.id,
            payment_session_id: order.payment_session_id,
            bookingId: booking._id || booking.id,
          });

          if ((verifyResponse as any)?.success) {
            toast.success("Payment successful! Booking confirmed.");
            onPaymentSuccess(booking);
            onClose();
            return true;
          }
        } catch (error) {
          // Don't log errors for pending payments - this is normal
          return false;
        }
        return false;
      };

      // Wait 5 seconds before starting to check payment status
      setTimeout(() => {
        // Check payment status every 5 seconds
        const interval = setInterval(async () => {
          const isCompleted = await checkPaymentStatus();
          if (isCompleted) {
            clearInterval(interval);
            setIsProcessing(false);
          }
        }, 5000);

        // Stop checking after 15 minutes
        setTimeout(() => {
          clearInterval(interval);
          setIsProcessing(false);
          toast.error("Payment timeout. Please try again.");
        }, 900000); // 15 minutes
      }, 5000); // Wait 5 seconds before first check

    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  }, [booking, user, bookingData, onPaymentSuccess, onClose]);

  if (!booking || !bookingData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="payment-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-cricket-green">
            Complete Your Payment
          </DialogTitle>
          <DialogDescription id="payment-description" className="sr-only">
            Complete your payment securely via Cashfree payment gateway
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={bookingData.firstImage}
                  alt={bookingData.ground?.name || "Ground"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {bookingData.ground?.name || "Ground"}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">{bookingData.address}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(booking.bookingDate)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {booking.playerDetails.playerCount} players
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Base Amount</span>
                <span>{formatCurrency(bookingData.baseAmount)}</span>
              </div>
              {bookingData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(bookingData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Convenience Fee (2%)</span>
                <span>{formatCurrency(bookingData.taxes)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold text-cricket-green">
                <span>Total Amount</span>
                <span>{formatCurrency(bookingData.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-800 mb-1">Secure Payment</div>
                <div className="text-sm text-green-700">
                  Your payment is protected by 256-bit SSL encryption and processed securely through Cashfree.
                  All major payment methods are supported.
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || bookingData.totalAmount <= 0}
              className="w-full bg-gradient-to-r from-cricket-green to-green-600 hover:from-cricket-green/90 hover:to-green-600/90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Redirecting to Payment Gateway...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6" />
                  <span>Pay {formatCurrency(bookingData.totalAmount)}</span>
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>This booking will expire in 15 minutes if not paid</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;