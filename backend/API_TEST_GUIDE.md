# Phase 2 Backend API - Test Guide

## Server Status

The backend server is running on: `http://localhost:5000`

### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "PostgreSQL"
}
```

---

## Testing Workflow

### Prerequisites
1. Backend server running on port 5000
2. Database connected (PostgreSQL - Neon)
3. User authentication token (JWT)
4. Admin user token for admin endpoints

### Getting an Auth Token

First, register and login to get a token:

```bash
# Create user (if not exists)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```

Save the returned token for use in API tests.

---

## Phase 2 Endpoint Tests

### 1. Create Order - POST /api/v1/orders/create

**Test Case 1: Create COD Order**

```bash
TOKEN="your_auth_token_here"

curl -X POST http://localhost:5000/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "whatsappNumber": "+923001234567",
      "shippingAddress": {
        "street": "123 Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "postalCode": "74000"
      }
    },
    "paymentMethod": "COD",
    "cartItems": [
      {
        "productId": 1,
        "quantity": 1,
        "size": "M",
        "color": "Red"
      }
    ]
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "TAK-20240615-00042",
    "orderNumber": 42,
    "total": 5599.00,
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "createdAt": "2024-06-15T10:30:45Z"
  }
}
```

**Test Case 2: Create Bank Transfer Order (without proof)**

```bash
curl -X POST http://localhost:5000/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "whatsappNumber": "+923009876543",
      "shippingAddress": {
        "street": "456 Oak Avenue",
        "city": "Lahore",
        "state": "Punjab",
        "postalCode": "54000"
      }
    },
    "paymentMethod": "Bank_Transfer",
    "paymentProofId": null,
    "cartItems": [
      {
        "productId": 2,
        "quantity": 2,
        "size": "L",
        "color": "Blue"
      }
    ]
  }'
```

**Test Case 3: Invalid Customer Info (should fail validation)**

```bash
curl -X POST http://localhost:5000/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "firstName": "X",
      "lastName": "Y",
      "email": "invalid-email",
      "whatsappNumber": "1234567890",
      "shippingAddress": {
        "street": "Main St",
        "city": "City",
        "state": "State",
        "postalCode": "123"
      }
    },
    "paymentMethod": "COD",
    "cartItems": []
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Customer information validation failed",
  "error": {
    "firstName": "First name must be 2-50 characters...",
    "email": "Please enter a valid email address",
    "whatsappNumber": "Please enter a valid Pakistan phone number...",
    "postalCode": "Postal code must be 5 digits"
  }
}
```

**Test Case 4: Insufficient Inventory (should fail with 409)**

```bash
curl -X POST http://localhost:5000/api/v1/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike@example.com",
      "whatsappNumber": "+923051234567",
      "shippingAddress": {
        "street": "789 Pine Road",
        "city": "Islamabad",
        "state": "ICT",
        "postalCode": "44000"
      }
    },
    "paymentMethod": "COD",
    "cartItems": [
      {
        "productId": 1,
        "quantity": 10000
      }
    ]
  }'
```

**Expected Response (409):**
```json
{
  "success": false,
  "message": "Insufficient inventory",
  "error": {
    "inventory": "Insufficient stock for Product Name. Available: X, Requested: 10000"
  }
}
```

---

### 2. Get Order - GET /api/v1/orders/:orderId

**Test Case 1: Get Own Order (Customer)**

```bash
ORDERID="TAK-20240615-00042"

curl -X GET http://localhost:5000/api/v1/orders/$ORDERID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "orderId": "TAK-20240615-00042",
    "items": [...],
    "subtotal": 4999.00,
    "tax": 849.83,
    "shipping": 250.00,
    "discount": 0,
    "total": 6099.00,
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "shippingAddress": {...},
    "paymentProof": null,
    "statusHistory": [],
    "createdAt": "2024-06-15T10:30:45Z"
  }
}
```

**Test Case 2: Try to Access Another Customer's Order (should fail with 403)**

```bash
curl -X GET http://localhost:5000/api/v1/orders/TAK-20240615-00042 \
  -H "Authorization: Bearer $OTHER_USER_TOKEN"
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Not authorized",
  "error": {
    "authorization": "You do not have permission to view this order"
  }
}
```

**Test Case 3: Admin Can Access Any Order**

```bash
curl -X GET http://localhost:5000/api/v1/orders/TAK-20240615-00042 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Same as Test Case 1

**Test Case 4: Non-existent Order (should fail with 404)**

```bash
curl -X GET http://localhost:5000/api/v1/orders/TAK-99999999-99999 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Order not found",
  "error": {
    "orderId": "Order not found"
  }
}
```

---

### 3. Upload Payment Proof - POST /api/v1/orders/:orderId/payment-proof

**Prerequisites:**
- Bank transfer order created
- Payment proof image file ready

**Test Case 1: Upload Valid JPG Payment Proof**

```bash
ORDERID="TAK-20240615-00043"

curl -X POST http://localhost:5000/api/v1/orders/$ORDERID/payment-proof \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/payment_proof.jpg"
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully",
  "data": {
    "paymentProofId": 1,
    "fileName": "order_1_1718464245000_a1b2c3d4e5f6g7h8.jpg",
    "fileSize": 245678,
    "fileUrl": "/files/uploads/payment_proofs/order_1_1718464245000_a1b2c3d4e5f6g7h8.jpg",
    "thumbnailUrl": "/files/uploads/payment_proofs/order_1_1718464245000_a1b2c3d4e5f6g7h8.jpg",
    "uploadedAt": "2024-06-15T10:35:00Z"
  }
}
```

**Test Case 2: Upload PNG Payment Proof**

```bash
curl -X POST http://localhost:5000/api/v1/orders/$ORDERID/payment-proof \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/payment_proof.png"
```

**Expected Response (201):** Same structure as JPG

**Test Case 3: Try to Upload Invalid File Type (should fail with 400)**

```bash
curl -X POST http://localhost:5000/api/v1/orders/$ORDERID/payment-proof \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "File validation failed",
  "error": {
    "file": "File type not allowed. Please upload JPG, PNG, or WebP images only"
  }
}
```

**Test Case 4: Try to Upload File > 5MB (should fail with 400)**

```bash
# Create a large file
dd if=/dev/zero of=large_file.jpg bs=1M count=10

curl -X POST http://localhost:5000/api/v1/orders/$ORDERID/payment-proof \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large_file.jpg"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "File validation failed",
  "error": {
    "file": "File size must not exceed 5MB (current: 10.00MB)"
  }
}
```

**Test Case 5: Upload to COD Order (should fail with 400)**

```bash
curl -X POST http://localhost:5000/api/v1/orders/TAK-20240615-00042/payment-proof \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@payment_proof.jpg"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid payment method",
  "error": {
    "paymentMethod": "This order does not require payment proof"
  }
}
```

---

### 4. Verify Payment (Admin) - POST /api/v1/admin/orders/:orderId/verify-payment

**Prerequisites:**
- Bank transfer order with uploaded payment proof
- Admin user token

**Test Case 1: Admin Approves Payment**

```bash
ADMIN_TOKEN="admin_auth_token_here"
ORDERID="TAK-20240615-00043"

curl -X POST http://localhost:5000/api/v1/admin/orders/$ORDERID/verify-payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approve"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment approved successfully",
  "data": {
    "orderId": "TAK-20240615-00043",
    "paymentStatus": "verified",
    "orderStatus": "confirmed",
    "decision": "approve",
    "verifiedAt": "2024-06-15T10:40:00Z"
  }
}
```

**Test Case 2: Admin Rejects Payment with Reason**

```bash
curl -X POST http://localhost:5000/api/v1/admin/orders/$ORDERID/verify-payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "reject",
    "reason": "Payment amount does not match order total"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment rejected successfully",
  "data": {
    "orderId": "TAK-20240615-00043",
    "paymentStatus": "failed",
    "orderStatus": "pending",
    "decision": "reject",
    "verifiedAt": "2024-06-15T10:42:00Z"
  }
}
```

**Test Case 3: Non-admin User Tries to Verify (should fail with 403)**

```bash
curl -X POST http://localhost:5000/api/v1/admin/orders/$ORDERID/verify-payment \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approve"
  }'
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

**Test Case 4: Reject Without Reason (should fail with 400)**

```bash
curl -X POST http://localhost:5000/api/v1/admin/orders/$ORDERID/verify-payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "reject"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Rejection reason required",
  "error": {
    "reason": "Please provide a reason for rejection"
  }
}
```

---

### 5. Update Order Status (Admin) - PUT /api/v1/admin/orders/:orderId/status

**Prerequisites:**
- Confirmed order
- Admin user token

**Test Case 1: Update to Processing**

```bash
ADMIN_TOKEN="admin_auth_token_here"
ORDERID="TAK-20240615-00043"

curl -X PUT http://localhost:5000/api/v1/admin/orders/$ORDERID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "processing",
    "reason": "Order has been packed"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "TAK-20240615-00043",
    "oldStatus": "confirmed",
    "newStatus": "processing",
    "trackingNumber": null,
    "updatedAt": "2024-06-15T10:45:00Z"
  }
}
```

**Test Case 2: Update to Shipped (with Tracking Number)**

```bash
curl -X PUT http://localhost:5000/api/v1/admin/orders/$ORDERID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "shipped",
    "trackingNumber": "TRK-2024-0615-123456",
    "reason": "Shipped via TCS"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "TAK-20240615-00043",
    "oldStatus": "processing",
    "newStatus": "shipped",
    "trackingNumber": "TRK-2024-0615-123456",
    "updatedAt": "2024-06-15T10:50:00Z"
  }
}
```

**Test Case 3: Update to Shipped Without Tracking Number (should fail with 400)**

```bash
curl -X PUT http://localhost:5000/api/v1/admin/orders/$ORDERID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "shipped"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Tracking number required",
  "error": {
    "trackingNumber": "Tracking number is required when marking order as shipped"
  }
}
```

**Test Case 4: Cancel Order (Restores Inventory)**

```bash
# Create a new order first for cancellation testing
# ...then use orderId to cancel

curl -X PUT http://localhost:5000/api/v1/admin/orders/TAK-20240615-00044/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "cancelled",
    "reason": "Customer requested cancellation"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "TAK-20240615-00044",
    "oldStatus": "confirmed",
    "newStatus": "cancelled",
    "trackingNumber": null,
    "updatedAt": "2024-06-15T10:55:00Z"
  }
}
```

**Test Case 5: Invalid Status Transition (should fail with 400)**

```bash
# Try to go from 'delivered' back to 'processing'
curl -X PUT http://localhost:5000/api/v1/admin/orders/TAK-20240615-00045/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "processing"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid status transition",
  "error": {
    "statusTransition": "Cannot transition from delivered to processing"
  }
}
```

---

### 6. Get Pending Verification Orders (Admin) - GET /api/v1/admin/orders/pending-verification

**Prerequisites:**
- Multiple bank transfer orders in pending status
- Admin user token

**Test Case 1: Get All Pending Orders (Default)**

```bash
ADMIN_TOKEN="admin_auth_token_here"

curl -X GET "http://localhost:5000/api/v1/admin/orders/pending-verification" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Pending verification orders retrieved successfully",
  "data": {
    "orders": [
      {
        "orderId": "TAK-20240615-00043",
        "customerName": "Jane Smith",
        "customerEmail": "jane.smith@example.com",
        "customerPhone": "+923009876543",
        "total": 6499.00,
        "paymentMethod": "Bank_Transfer",
        "paymentStatus": "pending",
        "orderStatus": "pending",
        "paymentProof": {
          "fileName": "order_2_1718464300000_b2c3d4e5f6g7h8i9.jpg",
          "fileUrl": "/files/uploads/payment_proofs/...",
          "thumbnailUrl": "/files/uploads/payment_proofs/...",
          "uploadedAt": "2024-06-15T10:36:00Z"
        },
        "createdAt": "2024-06-15T10:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

**Test Case 2: Filter by Customer Name**

```bash
curl -X GET "http://localhost:5000/api/v1/admin/orders/pending-verification?customerName=Jane" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Filtered list with only matching customers

**Test Case 3: Pagination**

```bash
curl -X GET "http://localhost:5000/api/v1/admin/orders/pending-verification?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** First 10 orders with pagination metadata

**Test Case 4: Date Range Filter**

```bash
curl -X GET "http://localhost:5000/api/v1/admin/orders/pending-verification?startDate=2024-06-01&endDate=2024-06-30" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):** Orders created between specified dates

**Test Case 5: Non-admin User Access (should fail with 403)**

```bash
curl -X GET "http://localhost:5000/api/v1/admin/orders/pending-verification" \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

---

## Error Response Summary

| Status | Scenario | Example |
|--------|----------|---------|
| 201 | Successful creation | Order created, file uploaded |
| 200 | Successful retrieval/update | Get order, verify payment, update status |
| 400 | Validation failed | Invalid email, file type, missing fields |
| 403 | Not authorized | Non-admin accessing admin endpoint |
| 404 | Resource not found | Order ID doesn't exist |
| 409 | Conflict | Insufficient inventory |
| 500 | Server error | Database error, unexpected error |

---

## Quick Test Script

Create a file `test_api.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000"
USER_TOKEN="your_token_here"
ADMIN_TOKEN="your_admin_token_here"

echo "Testing Phase 2 Backend API..."

# Test 1: Health Check
echo -e "\n1. Health Check"
curl -s $BASE_URL/api/health | json_pp

# Test 2: Get Pending Orders (Admin)
echo -e "\n2. Get Pending Verification Orders"
curl -s "$BASE_URL/api/v1/admin/orders/pending-verification" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | json_pp

echo -e "\n✅ Tests completed!"
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Performance Testing

### Load Test: Concurrent Order Creation

```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 -p order_payload.json \
  -T application/json \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/orders/create
```

### Load Test: Concurrent Payment Uploads

```bash
# Simulate 50 concurrent file uploads
for i in {1..50}; do
  curl -X POST "http://localhost:5000/api/v1/orders/TAK-20240615-00043/payment-proof" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@payment_proof.jpg" &
done
wait
```

---

## Troubleshooting

### Issue: "Order not found" when it exists
- Verify you're using the full `orderId` (e.g., `TAK-20240615-00042`), not the database ID

### Issue: File upload fails with wrong MIME type
- Ensure file is a valid image (JPG, PNG, WebP)
- Use actual image files, not renamed files
- Check file magic bytes are correct

### Issue: Inventory check fails unexpectedly
- Verify product exists with `productId`
- Check product stock quantity
- Use `SELECT FOR UPDATE` lock to prevent race conditions

### Issue: Status transition not allowed
- Check valid transitions table in documentation
- Verify current order status
- Some transitions require additional data (e.g., tracking for shipped)

---

**Last Updated:** 2024-06-15
**Status:** Ready for Testing ✅
