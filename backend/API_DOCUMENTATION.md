# TAKANJ Fashion Store - API Documentation
## Complete Checkout & Payment Verification System

---

## Table of Contents
1. [Authentication](#authentication)
2. [Order Endpoints](#order-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)

---

## Authentication

All API requests require JWT token authentication (except login).

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Login Endpoint
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "firstName": "Ali",
      "lastName": "Ahmad",
      "role": "customer"
    }
  }
}
```

---

## Order Endpoints

### 1. Create Order
**Create a new order with validation and inventory checking**

```http
POST /api/v1/orders/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 5,
      "productName": "Premium Shirt",
      "size": "M",
      "color": "Blue",
      "quantity": 2,
      "price": 1500
    }
  ],
  "paymentMethod": "COD",
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Karachi",
    "state": "Sindh",
    "postalCode": "75000"
  },
  "couponCode": "SAVE10",
  "subtotal": 3000,
  "tax": 300,
  "shipping": 200,
  "discount": 0,
  "total": 3500
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "orderId": "ORD-202607-42",
    "customerId": 1,
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "subtotal": 3000,
    "tax": 300,
    "shipping": 200,
    "discount": 0,
    "total": 3500,
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Karachi",
      "state": "Sindh",
      "postalCode": "75000"
    },
    "items": [
      {
        "id": 1,
        "productId": 5,
        "productName": "Premium Shirt",
        "size": "M",
        "color": "Blue",
        "quantity": 2,
        "price": 1500,
        "lineTotal": 3000
      }
    ],
    "createdAt": "2026-07-22T10:30:00Z",
    "updatedAt": "2026-07-22T10:30:00Z"
  }
}
```

**Response (400 Bad Request - Validation Error)**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "firstName": "Must be 2-50 characters",
    "email": "Invalid email format",
    "whatsappNumber": "Must be Pakistani format: 0300XXXXXXX or +923001234567"
  }
}
```

**Response (409 Conflict - Insufficient Stock)**:
```json
{
  "success": false,
  "error": "Insufficient inventory",
  "details": {
    "productId": 5,
    "requested": 10,
    "available": 5
  }
}
```

---

### 2. Get Order Details
**Retrieve complete order information**

```http
GET /api/v1/orders/:orderId
Authorization: Bearer <token>
```

**URL Parameters**:
- `orderId` (integer, required): Numeric order ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "orderId": "ORD-202607-42",
    "customerId": 1,
    "customerName": "Ali Ahmad",
    "customerEmail": "ali@example.com",
    "customerPhone": "03001234567",
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "total": 3500,
    "shippingAddress": {
      "street": "123 Main Street",
      "city": "Karachi",
      "state": "Sindh",
      "postalCode": "75000"
    },
    "items": [
      {
        "productId": 5,
        "productName": "Premium Shirt",
        "size": "M",
        "quantity": 2,
        "price": 1500,
        "lineTotal": 3000
      }
    ],
    "paymentProof": {
      "id": 10,
      "orderId": 42,
      "filePath": "/uploads/payment_proofs/order_42_1626945000.jpg",
      "fileName": "payment_proof.jpg",
      "fileSize": 245678,
      "uploadedAt": "2026-07-22T10:45:00Z",
      "verifiedAt": null,
      "verifiedBy": null
    },
    "statusHistory": [
      {
        "id": 1,
        "orderId": 42,
        "oldStatus": null,
        "newStatus": "pending",
        "changedBy": null,
        "reason": "Order created",
        "createdAt": "2026-07-22T10:30:00Z"
      }
    ],
    "createdAt": "2026-07-22T10:30:00Z",
    "updatedAt": "2026-07-22T10:30:00Z"
  }
}
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "You do not have permission to view this order"
}
```

---

### 3. Upload Payment Proof
**Upload payment proof for bank transfer orders**

```http
POST /api/v1/orders/:orderId/payment-proof
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Parameters**:
- `paymentProof` (file, required): Image file (JPG, PNG, WebP)
  - Accepted MIME types: image/jpeg, image/png, image/webp
  - Maximum size: 5MB
  - Magic byte validation enforced

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "orderId": 42,
    "filePath": "/uploads/payment_proofs/order_42_1626945000.jpg",
    "fileName": "payment_proof.jpg",
    "fileSize": 245678,
    "mimeType": "image/jpeg",
    "thumbnailPath": "/uploads/payment_proofs/thumbnails/order_42_thumb.jpg",
    "uploadedAt": "2026-07-22T10:45:00Z",
    "verifiedAt": null,
    "verifiedBy": null
  }
}
```

**Response (400 Bad Request - Invalid File)**:
```json
{
  "success": false,
  "error": "Invalid file type",
  "details": "Only JPG, PNG, and WebP files are accepted"
}
```

**Response (413 Payload Too Large)**:
```json
{
  "success": false,
  "error": "File too large",
  "details": "Maximum file size is 5MB"
}
```

---

## Admin Endpoints

### 1. Get Pending Verification Orders
**List all orders pending bank transfer payment verification**

```http
GET /api/v1/admin/orders/pending-verification
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `status` (string, optional): Filter by status (pending, verified, failed)
- `paymentMethod` (string, optional): Filter by method (Bank_Transfer, COD)
- `customerName` (string, optional): Search by customer name
- `startDate` (string, optional): ISO date format (2026-07-22)
- `endDate` (string, optional): ISO date format
- `sortBy` (string, optional): Sort field (createdAt, total, default: createdAt)
- `sortOrder` (string, optional): ASC or DESC (default: DESC)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "orderId": "ORD-202607-42",
        "customerId": 1,
        "customerName": "Ali Ahmad",
        "customerEmail": "ali@example.com",
        "total": 3500,
        "paymentMethod": "Bank_Transfer",
        "paymentStatus": "pending",
        "createdAt": "2026-07-22T10:30:00Z",
        "paymentProof": {
          "id": 10,
          "filePath": "/uploads/payment_proofs/order_42_1626945000.jpg",
          "uploadedAt": "2026-07-22T10:45:00Z",
          "thumbnailPath": "/uploads/payment_proofs/thumbnails/order_42_thumb.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 45,
      "totalPages": 3
    },
    "stats": {
      "pendingCount": 45,
      "verifiedCount": 120,
      "failedCount": 8
    }
  }
}
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

### 2. Verify Payment
**Approve or reject bank transfer payment**

```http
POST /api/v1/admin/orders/:orderId/verify-payment
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "decision": "approve",
  "reason": null
}
```

OR (for rejection):
```json
{
  "decision": "reject",
  "reason": "Account number does not match bank details"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "orderId": "ORD-202607-42",
    "paymentStatus": "verified",
    "orderStatus": "confirmed",
    "verifiedAt": "2026-07-22T10:50:00Z",
    "verifiedBy": 5,
    "paymentProof": {
      "id": 10,
      "verifiedAt": "2026-07-22T10:50:00Z",
      "verifiedBy": 5
    }
  }
}
```

**Response (400 - Invalid Decision)**:
```json
{
  "success": false,
  "error": "Invalid decision",
  "details": "Decision must be 'approve' or 'reject'"
}
```

**Response (409 - Invalid Status Transition)**:
```json
{
  "success": false,
  "error": "Invalid status transition",
  "details": "Order payment is already verified"
}
```

---

### 3. Update Order Status
**Update order status and tracking information**

```http
PUT /api/v1/admin/orders/:orderId/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "TRK123456789",
  "carrier": "TCS",
  "reason": "Ready for shipment"
}
```

**Valid Status Transitions**:
- pending → confirmed
- confirmed → processing
- processing → shipped (requires trackingNumber)
- shipped → delivered
- Any status → cancelled

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 42,
    "orderId": "ORD-202607-42",
    "orderStatus": "shipped",
    "trackingNumber": "TRK123456789",
    "carrier": "TCS",
    "updatedAt": "2026-07-22T11:00:00Z",
    "statusChange": {
      "id": 2,
      "oldStatus": "processing",
      "newStatus": "shipped",
      "changedBy": 5,
      "reason": "Ready for shipment",
      "createdAt": "2026-07-22T11:00:00Z"
    }
  }
}
```

**Response (400 - Missing Tracking)**:
```json
{
  "success": false,
  "error": "Tracking number required",
  "details": "Shipped status requires tracking number"
}
```

---

## Error Handling

### Standard Error Response
All errors follow this format:

```json
{
  "success": false,
  "error": "Error title",
  "details": "Detailed error message or object",
  "code": "ERROR_CODE",
  "timestamp": "2026-07-22T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Order successfully created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Admin-only endpoint, customer access |
| 404 | Not Found | Order doesn't exist |
| 409 | Conflict | Insufficient stock |
| 413 | Payload Too Large | File > 5MB |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /orders/create | 10 | 1 hour |
| POST /orders/:id/payment-proof | 5 | 1 hour |
| GET /admin/orders/* | 60 | 1 hour |
| POST /admin/orders/*/verify-payment | 30 | 1 hour |

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1626948600
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 3600
}
```

---

## Webhooks

### Payment Verification Webhook
Sent to configured webhook URL when payment is verified/rejected.

**Webhook Event**:
```json
{
  "event": "payment.verified",
  "timestamp": "2026-07-22T10:50:00Z",
  "data": {
    "orderId": 42,
    "orderNumber": "ORD-202607-42",
    "decision": "approve",
    "amount": 3500,
    "adminId": 5,
    "verifiedAt": "2026-07-22T10:50:00Z"
  }
}
```

**Webhook Retry Policy**:
- 3 retry attempts
- Exponential backoff (5s, 25s, 125s)
- Signature validation with HMAC-SHA256

---

## Examples

### Complete COD Order Flow
```bash
# 1. Login
curl -X POST https://api.takanj.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password"}'

# 2. Create order
curl -X POST https://api.takanj.com/api/v1/orders/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [...],
    "paymentMethod": "COD",
    "total": 3500
  }'

# 3. Retrieve order
curl https://api.takanj.com/api/v1/orders/42 \
  -H "Authorization: Bearer <token>"
```

### Bank Transfer with Payment Proof Flow
```bash
# 1-2. (Same as above, but paymentMethod: "Bank_Transfer")

# 3. Upload payment proof
curl -X POST https://api.takanj.com/api/v1/orders/42/payment-proof \
  -H "Authorization: Bearer <token>" \
  -F "paymentProof=@payment_proof.jpg"

# 4. Admin verifies payment
curl -X POST https://api.takanj.com/api/v1/admin/orders/42/verify-payment \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve"}'

# 5. Admin updates status
curl -X PUT https://api.takanj.com/api/v1/admin/orders/42/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "shipped",
    "trackingNumber": "TRK123456789"
  }'
```

---

## Support

For API issues:
- Email: support@takanj.com
- Documentation: https://docs.takanj.com
- Status Page: https://status.takanj.com

