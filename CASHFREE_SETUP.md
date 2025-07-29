# Cashfree Payment Gateway Setup

## Environment Variables Setup

### 1. Create `.env` file in the server directory:

```bash
# Cashfree Payment Gateway Configuration
CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here
CASHFREE_API_URL=https://api.cashfree.com/pg

# Optional: Use sandbox/test mode
# CASHFREE_MODE=test

# Other environment variables
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Get Cashfree Credentials:

1. **Sign up for Cashfree Account:**
   - Go to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchant/sign-up)
   - Complete the registration process

2. **Get API Credentials:**
   - Login to your Cashfree Merchant Dashboard
   - Go to **Settings** → **API Keys**
   - Copy your **App ID** and **Secret Key**

3. **Environment Setup:**
   - **Production**: Use production credentials
   - **Testing**: Set `CASHFREE_MODE=test` to use sandbox environment

### 3. Test Configuration:

Run the test script to verify your setup:

```bash
node test-cashfree-setup.js
```

## Payment Flow

### 1. Booking Creation
- User creates a booking
- System validates booking details
- Booking is saved with "pending" status

### 2. Payment Initiation
- User clicks "Pay Now"
- System creates Cashfree order
- User is redirected to Cashfree payment page

### 3. Payment Processing
- User completes payment on Cashfree
- Cashfree sends webhook notification
- System updates booking status to "confirmed"

### 4. Payment Verification
- System verifies payment with Cashfree
- Booking is confirmed
- User receives confirmation

## API Endpoints

### Payment Order Creation
```
POST /api/payments/create-order
Content-Type: application/json
Authorization: Bearer <token>

{
  "bookingId": "booking_id_here"
}
```

### Payment Verification
```
POST /api/payments/verify-payment
Content-Type: application/json
Authorization: Bearer <token>

{
  "order_id": "cashfree_order_id",
  "payment_session_id": "payment_session_id",
  "bookingId": "booking_id"
}
```

### Test Cashfree Connection
```
GET /api/payments/test-cashfree
```

## Error Handling

### Common Issues:

1. **Authentication Failed**
   - Check if credentials are correct
   - Verify environment variables are set
   - Ensure you're using the right environment (sandbox/production)

2. **Invalid Order Amount**
   - Amount must be at least ₹1 (100 paise)
   - Check booking pricing calculation

3. **Booking Not Found**
   - Verify booking ID is correct
   - Check if booking belongs to the authenticated user

## Security Considerations

1. **Environment Variables**
   - Never commit credentials to version control
   - Use `.env` file for local development
   - Use secure environment variables in production

2. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS in production
   - Validate webhook data

3. **Payment Verification**
   - Always verify payments server-side
   - Don't rely on client-side payment status
   - Use Cashfree's verification API

## Testing

### Development Testing:
```bash
# Test with mock payments (no credentials needed)
npm run dev

# Test with real Cashfree (credentials required)
CASHFREE_APP_ID=your_app_id CASHFREE_SECRET_KEY=your_secret_key npm run dev
```

### Production Testing:
```bash
# Test with sandbox credentials
CASHFREE_MODE=test npm start

# Test with production credentials
npm start
```

## Troubleshooting

### Payment Creation Fails:
1. Check server logs for error details
2. Verify Cashfree credentials
3. Test Cashfree connection: `GET /api/payments/test-cashfree`
4. Check booking exists and belongs to user

### Payment Verification Fails:
1. Check webhook configuration
2. Verify payment session ID
3. Check Cashfree order status
4. Review server logs for verification errors

### Environment Issues:
1. Restart server after changing environment variables
2. Check `.env` file format
3. Verify variable names are correct
4. Ensure no spaces around `=` in `.env` file 