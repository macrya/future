# API Usage Examples

## Complete Workflow Examples

### Customer Journey: Create and Track a Delivery

#### 1. Register as Customer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "phone": "+254712345678",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Create a Delivery Request
```bash
curl -X POST http://localhost:3000/api/deliveries \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress": "Nairobi CBD, Kenya",
    "pickupLatitude": -1.286389,
    "pickupLongitude": 36.817223,
    "pickupContactName": "John Doe",
    "pickupContactPhone": "+254712345678",
    "deliveryAddress": "Westlands, Nairobi",
    "deliveryLatitude": -1.268436,
    "deliveryLongitude": 36.808678,
    "deliveryContactName": "Jane Smith",
    "deliveryContactPhone": "+254787654321",
    "packageDescription": "Electronics",
    "packageWeight": 2.5,
    "packageValue": 5000
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "delivery-uuid",
    "customerId": "customer-uuid",
    "pickupAddress": "Nairobi CBD, Kenya",
    "deliveryAddress": "Westlands, Nairobi",
    "status": "PENDING",
    "distance": 5234.56,
    "estimatedDuration": 900,
    "estimatedCost": 250,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. Initiate M-Pesa Payment
```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery-uuid",
    "method": "MPESA",
    "phoneNumber": "+254712345678"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "deliveryId": "delivery-uuid",
    "amount": 250,
    "method": "MPESA",
    "status": "PROCESSING",
    "mpesaCheckoutRequestId": "ws_CO_15012024103045678",
    "message": "Please check your phone to complete payment"
  }
}
```

#### 4. Track Delivery (WebSocket)
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');

  // Subscribe to delivery updates
  socket.emit('delivery:track', {
    deliveryId: 'delivery-uuid'
  });
});

socket.on('delivery:update', (data) => {
  console.log('Delivery update:', data);
  // { status: 'DRIVER_ASSIGNED', timestamp: ... }
});

socket.on('driver:location:update', (data) => {
  console.log('Driver location:', data);
  // { latitude: -1.286389, longitude: 36.817223 }
});
```

### Driver Journey: Accept and Complete Delivery

#### 1. Register as Driver
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "phone": "+254798765432",
    "password": "SecurePass123",
    "firstName": "Mike",
    "lastName": "Driver",
    "role": "DRIVER"
  }'
```

#### 2. Complete Driver Profile
```bash
curl -X POST http://localhost:3000/api/drivers/register \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "MOTORCYCLE",
    "vehicleModel": "Honda CB 150",
    "vehiclePlate": "KAA 123B",
    "licenseNumber": "DL12345678",
    "bankAccount": "1234567890"
  }'
```

#### 3. Go Online
```bash
curl -X PATCH http://localhost:3000/api/drivers/DRIVER_ID/status \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ONLINE"
  }'
```

#### 4. Update Location (via WebSocket)
```javascript
socket.emit('driver:register', {
  driverId: 'driver-uuid'
});

// Update location every 5 seconds
setInterval(() => {
  socket.emit('driver:location', {
    driverId: 'driver-uuid',
    latitude: getCurrentLatitude(),
    longitude: getCurrentLongitude()
  });
}, 5000);
```

#### 5. Accept Delivery (via WebSocket)
```javascript
socket.on('delivery:request', (data) => {
  console.log('New delivery request:', data);

  // Accept delivery
  socket.emit('delivery:response', {
    deliveryId: data.deliveryId,
    driverId: 'driver-uuid',
    accepted: true
  });
});
```

#### 6. Update Delivery Status
```bash
# Arrived at pickup
curl -X PATCH http://localhost:3000/api/deliveries/DELIVERY_ID/status \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DRIVER_ARRIVED"
  }'

# Picked up package
curl -X PATCH http://localhost:3000/api/deliveries/DELIVERY_ID/status \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PICKED_UP",
    "notes": "Package collected from sender"
  }'

# In transit
curl -X PATCH http://localhost:3000/api/deliveries/DELIVERY_ID/status \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT"
  }'

# Delivered
curl -X PATCH http://localhost:3000/api/deliveries/DELIVERY_ID/status \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED",
    "notes": "Package delivered successfully"
  }'
```

#### 7. Confirm Cash Payment (if cash on delivery)
```bash
curl -X POST http://localhost:3000/api/payments/cash/confirm \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery-uuid"
  }'
```

#### 8. Check Earnings
```bash
curl -X GET http://localhost:3000/api/drivers/DRIVER_ID/stats \
  -H "Authorization: Bearer DRIVER_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "rating": 4.8,
    "totalDeliveries": 150,
    "completedDeliveries": 148,
    "totalEarnings": 45000,
    "pendingEarnings": 3200
  }
}
```

## Testing M-Pesa Integration (Sandbox)

### Test Phone Numbers
- **Test Number**: 254708374149 (Safaricom sandbox)
- **Test PIN**: Any 4-digit PIN works in sandbox

### Initiate STK Push
```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery-uuid",
    "method": "MPESA",
    "phoneNumber": "254708374149"
  }'
```

### Simulate Payment
In sandbox mode, you'll receive a simulated STK push. Enter any PIN to complete the transaction.

## Testing Card Payment (Stripe)

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0027 6000 3184

### Initiate Card Payment
```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery-uuid",
    "method": "CARD"
  }'
```

Response includes `clientSecret` for Stripe payment element.

## Admin Operations

### Approve Driver
```bash
curl -X POST http://localhost:3000/api/drivers/DRIVER_ID/approve \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Manually Assign Driver
```bash
curl -X POST http://localhost:3000/api/deliveries/DELIVERY_ID/assign \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "driver-uuid"
  }'
```

### View All Active Deliveries
```bash
curl -X GET http://localhost:3000/api/deliveries \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

## Utility Endpoints

### Get Nearby Drivers
```bash
curl -X GET "http://localhost:3000/api/drivers/nearby?latitude=-1.286389&longitude=36.817223&radius=5000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Estimate Delivery Price
```bash
curl -X GET "http://localhost:3000/api/deliveries/estimate?pickupLat=-1.286389&pickupLng=36.817223&deliveryLat=-1.268436&deliveryLng=36.808678" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "surgeFactor": 1.0,
    "message": "Normal pricing"
  }
}
```

## Error Handling Examples

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "\"email\" must be a valid email, \"password\" length must be at least 8 characters long"
}
```

### Resource Not Found
```json
{
  "success": false,
  "message": "Delivery not found"
}
```

### Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

## WebSocket Connection Health

### Ping-Pong
```javascript
socket.on('connect', () => {
  setInterval(() => {
    socket.emit('ping');
  }, 30000);
});

socket.on('pong', () => {
  console.log('Connection alive');
});
```

## Common Workflows

### Cancel Delivery
```bash
curl -X POST http://localhost:3000/api/deliveries/DELIVERY_ID/cancel \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refund Payment (Admin)
```bash
curl -X POST http://localhost:3000/api/payments/refund \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryId": "delivery-uuid"
  }'
```

### Refresh Access Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

**For Postman Collection**: Import the provided `postman_collection.json` file for easy testing.
