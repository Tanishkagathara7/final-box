import express from "express";
import crypto from "crypto";
import { authMiddleware } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import Ground from "../models/Ground.js";

// NOTE: For development, we use placeholder HTTPS URLs since Cashfree requires HTTPS
// In production, these will be your actual domain URLs

// Cashfree credentials
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "10273687cc0f80bdee21e4c30d68637201";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_09c55cbdb72bc613fbf861ab777f8b7b_2bcc3b72";
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || "https://api.cashfree.com/pg"; // Production API
const CASHFREE_SANDBOX_URL = "https://sandbox.cashfree.com/pg"; // Sandbox API
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_TEST_MODE = process.env.CASHFREE_MODE === 'test' || IS_DEVELOPMENT;

const router = express.Router();

// Test Cashfree connection
router.get("/test-cashfree", async (req, res) => {
  try {
    console.log("Testing Cashfree connection...");
    console.log("Keys:", { 
      appId: CASHFREE_APP_ID ? "Present" : "Missing",
      secretKey: CASHFREE_SECRET_KEY ? "Present" : "Missing"
    });
    
    // Test API connection by making a simple request
    const apiUrl = IS_TEST_MODE ? CASHFREE_SANDBOX_URL : CASHFREE_API_URL;
    const response = await fetch(`${apiUrl}/orders`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log("Cashfree connection successful");
      res.json({
        success: true,
        message: "Cashfree connection successful",
        appId: CASHFREE_APP_ID,
        apiUrl: CASHFREE_API_URL
      });
    } else {
      throw new Error(`Cashfree API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Cashfree test failed:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: "Cashfree connection failed",
      error: error.message
    });
  }
});

/**
 * Create a Cashfree order
 */
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.userId;
    
    console.log("Payment order creation request:", { bookingId, userId });
    
    if (!bookingId || bookingId === "undefined") {
      console.log("Invalid booking ID:", bookingId);
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    // Find the booking in MongoDB
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId 
    }).populate("groundId", "name location price features");

    console.log("Booking found:", !!booking);
    if (booking) {
      console.log("Booking details:", {
        bookingId: booking.bookingId,
        status: booking.status,
        pricing: booking.pricing,
        groundId: booking.groundId
      });
    }

    if (!booking) {
      console.error("Booking not found for bookingId:", bookingId);
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    // Calculate amount in paise (Cashfree needs amount in smallest unit)
    const totalAmount = booking.pricing?.totalAmount || 500;
    const amountPaise = Math.round(totalAmount * 100);

    console.log("Amount calculation:", { totalAmount, amountPaise });

    if (!amountPaise || amountPaise < 100) {
      console.error("Invalid amount (must be >= 100 paise):", amountPaise);
      return res.status(400).json({ 
        success: false, 
        message: "Booking amount must be at least ₹1" 
      });
    }

    // Create Cashfree order
    const orderData = {
      order_id: `order_${booking._id}_${Date.now()}`,
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_name: booking.playerDetails?.contactPerson?.name || "Customer",
        customer_phone: booking.playerDetails?.contactPerson?.phone || "",
        customer_email: booking.playerDetails?.contactPerson?.email || "customer@example.com"
      },
      order_meta: {
        return_url: IS_DEVELOPMENT 
          ? "https://example.com/payment/callback" // Placeholder for development
          : `${req.protocol}://${req.get('host')}/payment/callback?booking_id=${booking._id}`,
        notify_url: IS_DEVELOPMENT 
          ? "https://example.com/payment/webhook" // Placeholder for development
          : `${req.protocol}://${req.get('host')}/api/payments/webhook`,
        payment_methods: "cc,dc,nb,upi,paylater,emi"
      }
    };

    console.log("Creating Cashfree order with:", orderData);
    console.log("Test mode:", IS_TEST_MODE);

    const apiUrl = IS_TEST_MODE ? CASHFREE_SANDBOX_URL : CASHFREE_API_URL;
    console.log("Using API URL:", apiUrl);
    const response = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Cashfree API error: ${response.status}`);
    }

    const order = await response.json();
    console.log("Cashfree order created:", order.order_id);
    console.log("Full Cashfree response:", JSON.stringify(order, null, 2));

    // Update booking with payment order details
    booking.payment = {
      ...booking.payment,
      cashfreeOrderId: order.order_id,
      status: "pending"
    };
    await booking.save();

    console.log("Booking updated with payment details");

    res.json({
      success: true,
      order: {
        id: order.order_id,
        amount: order.order_amount,
        currency: order.order_currency,
        payment_session_id: order.payment_session_id,
        order_status: order.order_status,
        payment_url: order.payment_link || (IS_TEST_MODE 
          ? `https://sandbox.cashfree.com/pg/view/${order.payment_session_id}`
          : `https://payments.cashfree.com/pg/view/${order.payment_session_id}`),
      },
      appId: CASHFREE_APP_ID,
      apiUrl: CASHFREE_API_URL
    });
  } catch (error) {
    console.error('Cashfree order creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create Cashfree order." 
    });
  }
});

/**
 * Verify Cashfree payment and mark booking as confirmed
 */
router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const {
      order_id,
      payment_session_id,
      bookingId,
    } = req.body;

    const userId = req.userId;
    if (!bookingId || bookingId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    // Verify payment with Cashfree
    const apiUrl = IS_TEST_MODE ? CASHFREE_SANDBOX_URL : CASHFREE_API_URL;
    const response = await fetch(`${apiUrl}/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cashfree verification error:", errorText);
      throw new Error(`Failed to verify payment with Cashfree: ${response.status} - ${errorText}`);
    }

    const paymentDetails = await response.json();
    
    // Check if payment is successful
    if (paymentDetails.order_status === 'PAID') {
      // Payment is successful, proceed with booking confirmation
    } else if (paymentDetails.order_status === 'ACTIVE') {
      // Payment is still pending
      return res.status(200).json({
        success: false,
        message: "Payment pending",
        status: "pending"
      });
    } else if (paymentDetails.order_status === 'EXPIRED' || paymentDetails.order_status === 'FAILED') {
      return res.status(400).json({
        success: false,
        message: `Payment ${paymentDetails.order_status.toLowerCase()}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Find the booking in MongoDB
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId 
    }).populate("groundId", "name location price features");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking with payment details
    booking.payment = {
      cashfreeOrderId: order_id,
      cashfreePaymentSessionId: payment_session_id,
      status: "completed",
      paidAt: new Date(),
      paymentDetails: paymentDetails
    };
    booking.status = "confirmed";
    booking.confirmation = {
      confirmedAt: new Date(),
      confirmationCode: `BC${Date.now().toString().slice(-6)}`,
      confirmedBy: "system"
    };

    await booking.save();

    res.json({
      success: true,
      message: "Payment verified and booking confirmed!",
      booking: booking.toObject(),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
});

/**
 * Handle payment failure
 */
router.post("/payment-failed", authMiddleware, async (req, res) => {
  try {
    const { bookingId, order_id, error } = req.body;
    const userId = req.userId;
    if (!bookingId || bookingId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId 
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.payment = {
      ...booking.payment,
      cashfreeOrderId: order_id,
      status: "failed"
    };
    booking.status = "cancelled";
    booking.cancellation = {
      cancelledBy: "system",
      cancelledAt: new Date(),
      reason: "Payment failed"
    };

    await booking.save();

    res.json({
      success: true,
      message: "Payment failure recorded",
      booking: booking.toObject(),
    });
  } catch (error) {
    console.error("Payment failure handling error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment failure",
    });
  }
});

/**
 * Webhook handler for Cashfree payment notifications
 */
router.post("/webhook", async (req, res) => {
  try {
    const { order_id, order_amount, order_currency, order_status, payment_session_id } = req.body;
    
    console.log("Cashfree webhook received:", { order_id, order_status });
    
    // Find booking by order_id
    const booking = await Booking.findOne({ 
      "payment.cashfreeOrderId": order_id 
    });
    
    if (!booking) {
      console.error("Booking not found for order_id:", order_id);
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (order_status === 'PAID') {
      booking.payment.status = "completed";
      booking.payment.paidAt = new Date();
      booking.status = "confirmed";
      booking.confirmation = {
        confirmedAt: new Date(),
        confirmationCode: `BC${Date.now().toString().slice(-6)}`,
        confirmedBy: "system"
      };
    } else if (order_status === 'EXPIRED' || order_status === 'FAILED') {
      booking.payment.status = "failed";
      booking.status = "cancelled";
      booking.cancellation = {
        cancelledBy: "system",
        cancelledAt: new Date(),
        reason: `Payment ${order_status.toLowerCase()}`
      };
    }
    
    await booking.save();
    console.log("Booking updated via webhook:", booking.bookingId);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

export default router;