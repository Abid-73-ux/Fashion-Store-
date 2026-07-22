# Payment Verification Integration - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Dashboard Pages                        │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │  Dashboard   │   Orders     │  Customers   │  ... (7 more)   │
│  └──────────────┴──────────────┴──────────────┘                 │
│           │                │                │                   │
│           └────────────────┼────────────────┘                   │
│                            │                                    │
│         All Load admin-common.js                                │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              AdminCommon Module (admin-common.js)               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Polling System (30 second interval)                     │ │
│  │  • Badge Update Logic                                      │ │
│  │  • Visibility Detection (tab hidden/visible)              │ │
│  │  • Error Handling & Retry                                 │ │
│  │  • Authentication Verification                            │ │
│  │  • Public API Methods                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼ Every 30 Seconds
┌─────────────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  GET /api/v1/admin/orders/pending-verification            │ │
│  │  Headers: Authorization: Bearer {admin-token}             │ │
│  │  Query: ?page=1&limit=1                                   │ │
│  │                                                             │ │
│  │  Response:                                                 │ │
│  │  {                                                         │ │
│  │    success: true,                                          │ │
│  │    data: {                                                 │ │
│  │      pagination: { total: 5, page: 1, limit: 1 },         │ │
│  │      orders: [...]                                         │ │
│  │    }                                                       │ │
│  │  }                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Database Query (Order Model)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SELECT COUNT(*) FROM orders                              │ │
│  │  WHERE paymentStatus = 'pending'                          │ │
│  │  AND paymentMethod = 'Bank_Transfer'                      │ │
│  │                                                             │ │
│  │  Returns: Total pending count                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   Page Load Event                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            admin-common.js Script Loads                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         AdminCommon.init() Called Automatically                │
│         (if .admin-wrapper element exists)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         Check: Auth.isAdmin() returns true?                    │
│              │                                                  │
│         YES  │  NO                                             │
│              ▼                                                  │
│         START POLLING         Stop & Return false              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│      First API Call: Fetch Pending Count                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌────────────┐  ┌──────────────┐
            │  Success   │  │   Failure    │
            └──────┬─────┘  └──────┬───────┘
                   │               │
                   ▼               ▼
          ┌─────────────────┐ ┌──────────────┐
          │ Parse Response  │ │ Log Error    │
          │ Get Count: 5    │ │ Retry Later  │
          └────────┬────────┘ └──────┬───────┘
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
         ┌──────────────────────────────────┐
         │  Update All Badge Elements:      │
         │  • #paymentVerificationBadge: 5 │
         │  • #pendingPaymentsCount: 5     │
         │  • #pendingCount: 5             │
         │  • #pendingBadge: "Pending: 5"  │
         └──────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────┐
         │  Start 30 Second Timer           │
         │  setInterval(..., 30000)         │
         └──────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │ Every 30 sec   │
                    │ Or Manual Call │
                    └───────┬────────┘
                            │
                            ▼
         ┌──────────────────────────────────┐
         │  Repeat: API Call & Update       │
         │  (Cycle continues...)            │
         └──────────────────────────────────┘
```

## UI Component Integration

```
Sidebar Navigation:
┌─────────────────────────────────────┐
│     Main                            │
│     ├─ Dashboard                    │
│     ├─ E-Commerce                   │
│     │  ├─ Products                  │
│     │  ├─ Categories                │
│     │  ├─ Orders                    │
│     │  ├─ Customers                 │
│     │  └─ Reviews                   │
│     ├─ Management                   │
│     │  ├─ Inventory                 │
│     │  ├─ Coupons                   │
│     │  ├─ Payment Verification ◄── Menu Item
│     │  │  └─ Badge: [5]             │ ◄── Badge
│     │  └─ Analytics                 │
│     └─ System                       │
└─────────────────────────────────────┘

Dashboard Stats:
┌──────────────────────────────────────────────────┐
│  Total Revenue        Total Orders               │
│  ────────────────────────────────────────────── │
│  Total Customers      Total Products             │
│                                                  │
│  Pending Orders  Delivered  Low Stock  PENDING   │
│  ────────────────────────────────────────────── │
│  0               0           0        5 ◄────── Stat
│                                   (Updated)     │
└──────────────────────────────────────────────────┘

Payment Verification Page:
┌──────────────────────────────────────────────────┐
│ Payment Verification  Pending: 5 ◄── Badge      │
│ ────────────────────────────────────────────── │
│                                                  │
│ Pending Verification: 5 ◄─── Stat              │
│ Verified: 2           Failed: 1                 │
└──────────────────────────────────────────────────┘
```

## Event Flow

```
Browser Events
     │
     ├─► DOMContentLoaded
     │   └─► AdminCommon.init()
     │       ├─► Auth.isAdmin()
     │       └─► startPendingPaymentPolling()
     │
     ├─► visibilitychange (Tab Hidden)
     │   └─► stopPolling()
     │       └─► clearInterval(pollIntervalId)
     │
     ├─► visibilitychange (Tab Visible)
     │   └─► resumePolling()
     │       └─► startPendingPaymentPolling()
     │
     ├─► beforeunload (Page Unload)
     │   └─► stopPolling()
     │
     └─► Custom Events (from Payment Verification page)
         └─► AdminCommon.forceUpdate()
             └─► updatePendingPaymentCount() [immediate]
```

## Badge Update Cascade

```
API Response Received
        │
        ▼
Parse Response
        │
        ▼
Extract Count (5)
        │
        ▼
Update Badges:
        │
        ├─► document.getElementById('paymentVerificationBadge')
        │   └─► textContent = 5
        │   └─► style.display = 'inline-block'
        │
        ├─► document.getElementById('pendingPaymentsCount')
        │   └─► textContent = 5
        │
        ├─► document.getElementById('pendingBadge')
        │   └─► textContent = 'Pending: 5'
        │
        └─► document.getElementById('pendingCount')
            └─► textContent = 5

(If count = 0)
        │
        └─► Hide Badge (display = 'none')
```

## Polling State Machine

```
                    ┌─────────────────┐
                    │   Initialized   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Auth Check     │
                    └────────┬────────┘
                      NO ◄───┴───► YES
                      │           │
                      ▼           ▼
                   IDLE      ┌──────────────┐
                             │ Polling      │
                             │ Active       │
                             └──────┬───────┘
                                    │
                        ┌───────────┼───────────┐
                        │           │           │
                  Tab Hidden   30 Sec Tick  Unload
                        │           │           │
                        ▼           ▼           ▼
                    ┌──────────────────────────────┐
                    │  Tab Hidden / Paused         │
                    │  (Stop Polling)              │
                    └──────┬───────────────────────┘
                           │
                  ┌─────────┘
                  │ Tab Visible
                  ▼
            ┌──────────────┐
            │ Resume       │
            │ Polling      │
            └──────┬───────┘
                   │
                   ▼
            Polling Active (again)
```

## Authentication Flow

```
Page Load
    │
    ▼
Load Scripts:
    ├─ config.js (API config)
    ├─ auth.js (Auth module)
    ├─ admin-common.js (Polling)
    └─ Other admin modules
    │
    ▼
AdminCommon.init() Called
    │
    ▼
Check Auth:
    │
    ├─ Call Auth.isAdmin()
    │   └─ Check localStorage('auth-token')
    │       └─ If token exists → TRUE
    │       └─ If no token → FALSE
    │
    ├─► If FALSE → Return, don't poll
    │
    └─► If TRUE → Continue
        │
        ▼
    Start Polling:
        ├─ Include token in header
        │   Authorization: Bearer {token}
        │
        ├─ API Response:
        │   ├─ 200 OK → Continue polling
        │   ├─ 401 Unauthorized → Token invalid
        │   │   └─ Redirect to login
        │   └─ Other error → Log, continue polling
        │
        └─ Continue every 30 seconds

On Token Expiry:
    ├─ API returns 401
    ├─ Stop polling
    ├─ Call Auth.logout()
    └─ Redirect to login page
```

## Performance Timeline

```
Time    Action                          API Calls
────────────────────────────────────────────────
0s      Page Load                       —
        └─ AdminCommon.init()
        └─ Initial API call             ✓ (1)
        └─ Badge Updated
        └─ Polling started

5s      User browsing                   —

10s     User browsing                   —

15s     User browsing                   —

20s     User browsing                   —

25s     User browsing                   —

30s     Polling interval                ✓ (2)
        └─ API call
        └─ Badge Updated

35s     User browsing                   —

...     (Continues every 30s)

60s     Polling interval                ✓ (3)
        └─ API call
        └─ Badge Updated
```

## Error Handling Flow

```
API Call Initiated
        │
        ├─► Network Error
        │   └─► Catch error
        │   └─► Log to console
        │   └─► Retain last known count
        │   └─► Continue polling
        │
        ├─► 401 Unauthorized
        │   └─► Token invalid/expired
        │   └─► Stop polling
        │   └─► Redirect to login
        │
        ├─► 403 Forbidden
        │   └─► No permissions
        │   └─► Stop polling
        │   └─► Show error message
        │
        ├─► 500 Server Error
        │   └─► Backend issue
        │   └─► Log error
        │   └─► Retain last count
        │   └─► Continue polling
        │
        ├─► Timeout
        │   └─► No response in time
        │   └─► Retry next cycle
        │   └─► Retain last count
        │
        └─► Invalid Response
            └─► Parse error
            └─► Log error
            └─► Retain last count
            └─► Continue polling
```

## Component Dependencies

```
Payment Verification UI
        │
        ├─► adminCommon.js
        │   ├─► auth.js (Auth.isAdmin(), Auth.logout())
        │   ├─► config.js (API_CONFIG.getEndpoint())
        │   └─► localStorage (auth-token)
        │
        ├─► Payment Verification Page
        │   ├─► orderDetailModal.js
        │   ├─► paymentProofLightbox.js
        │   └─► toast.js (Toast notifications)
        │
        └─► Backend API
            ├─► /api/v1/admin/orders/pending-verification
            ├─► Order Model
            └─► Database
```

## Deployment Architecture

```
Production Setup:
┌─────────────────────────────────────────────────┐
│  Frontend (Static Files)                        │
│  ├─ admin/*.html                                │
│  ├─ assets/js/admin-common.js (NEW)             │
│  ├─ assets/js/auth.js                           │
│  ├─ assets/js/config.js                         │
│  └─ assets/css/*.css                            │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend (Node.js/Express)                      │
│  ├─ routes/orders.js                            │
│  ├─ controllers/orderController.js              │
│  │  └─ getPendingVerificationOrders()           │
│  ├─ middleware/auth.js                          │
│  └─ models/Order.js                             │
└──────────────────┬──────────────────────────────┘
                   │ SQL Query
                   ▼
┌─────────────────────────────────────────────────┐
│  Database (MySQL/PostgreSQL)                    │
│  ├─ orders table                                │
│  │  ├─ id                                       │
│  │  ├─ paymentStatus ('pending', etc.)          │
│  │  ├─ paymentMethod ('Bank_Transfer', etc.)    │
│  │  └─ ...                                      │
│  └─ (Query optimized with indexes)              │
└─────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Scalable polling system
- ✅ Minimal API overhead
- ✅ Robust error handling
- ✅ Secure authentication
- ✅ Cross-page consistency
- ✅ Efficient resource usage
