# Payment Verification Integration - Testing Guide

## Quick Start Testing

### 1. Setup
1. Ensure backend is running (`npm start` in `/backend` directory)
2. Open browser DevTools (F12)
3. Go to admin dashboard: `http://localhost:3000/frontend/admin/dashboard.html` (or your frontend URL)
4. Login with admin credentials

### 2. Visual Verification

#### Check Sidebar Menu Item
```
✓ Navigate to admin dashboard
✓ Look for "Payment Verification" under "Management" section
✓ Icon should be: ◉ (check-circle)
✓ Badge should appear if pending orders exist
```

#### Check Badge Display
```
✓ Navigate to any admin page (orders, customers, etc.)
✓ Look for badge next to "Payment Verification" menu item
✓ Format should be: a number (e.g., "5")
✓ Badge should hide when count is 0
```

#### Check Page Updates
```
✓ Go to Dashboard
  - Check stat card "Pending Payments" 
  - Should show: #pendingPaymentsCount element value

✓ Go to Payment Verification page
  - Check page header badge "Pending: X"
  - Check stat card "Pending Verification"
  - Both should match the sidebar badge count
```

### 3. Functionality Testing

#### Test Polling (30-second updates)
```
Steps:
1. Open DevTools > Console
2. Note the current badge count
3. Wait for 30 seconds
4. Check if badge updates (if new orders are added)

Expected: Badge updates automatically without page refresh
```

#### Test Manual Refresh
```
Steps:
1. Open Payment Verification page
2. Approve or reject an order
3. Modal closes
4. Badge should update immediately (within 1 second)
5. Page data should refresh

Expected: Badge updates immediately after action
```

#### Test Tab Visibility
```
Steps:
1. Open DevTools > Console
2. Note badge and time
3. Switch to another browser tab
4. Wait 60 seconds
5. Return to admin tab
6. Check if badge updated

Expected: 
- Badge stops updating when tab is hidden
- Badge resumes updating when tab is visible
- No wasted API calls when tab is hidden
```

### 4. API Call Verification

#### Monitor Network Traffic
```
Steps:
1. Open DevTools > Network tab
2. Filter by "Fetch/XHR"
3. Watch for requests to `/v1/admin/orders/pending-verification`
4. Requests should occur every ~30 seconds

Expected:
- Regular GET requests to API endpoint
- Status code: 200 OK
- Response contains pending orders count
- Authorization header is present
```

#### Inspect Request Details
```
In Network tab, click on request:
- URL: http://localhost:{port}/api/v1/admin/orders/pending-verification?page=1&limit=1
- Method: GET
- Headers: 
  * Authorization: Bearer {token}
  * Content-Type: application/json
- Status: 200
```

#### Inspect Response
```json
{
  "success": true,
  "data": {
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 1
    },
    "orders": [...]
  }
}
```

### 5. Console Logging

#### Check Console Output
```
In DevTools > Console, you should see:
✓ "Toast module loaded successfully"
✓ No errors about missing admin-common.js
✓ No CORS errors for API calls
✓ Auth messages if debugging enabled
```

#### Enable Debug Logging
Add this to console to enable detailed logging:
```javascript
// Add this to admin-common.js before production:
const DEBUG = true;  // Set to false in production

if (DEBUG) {
    console.log('AdminCommon: Polling started');
    console.log('AdminCommon: Updated pending count to', count);
}
```

### 6. Error Scenarios

#### Test API Failure
```
Steps:
1. Open DevTools > Network
2. Go to "Network Conditions" tab
3. Check "Offline"
4. Wait 30 seconds
5. Uncheck "Offline"

Expected:
- Badge doesn't update while offline
- Badge updates again when online
- No error messages shown to user
- Error logged in console
```

#### Test Invalid Token
```
Steps:
1. Open DevTools > Console
2. Run: localStorage.removeItem('auth-token')
3. Wait 30 seconds for next poll
4. Or manually trigger: AdminCommon.updateCount()

Expected:
- API returns 401 Unauthorized
- Redirect to login page
- Or gracefully handle without polling
```

#### Test Slow API
```
Steps:
1. DevTools > Network > Throttling (set to "Slow 3G")
2. Wait for requests
3. Check if badge still updates (may take longer)

Expected:
- No timeout errors
- Badge eventually updates
- UI remains responsive
```

### 7. Cross-Page Testing

#### Test Badge Sync Across Pages
```
Steps:
1. Open Dashboard (in one window/tab)
2. Open Payment Verification (in another window)
3. Approve an order in Payment Verification tab
4. Check Dashboard tab badge updates

Expected:
- Both pages show same badge count
- Updates happen independently in each tab
```

#### Test on Different Admin Pages
```
Test menu badge appears on:
☑ Dashboard
☑ Orders
☑ Customers
☑ Products
☑ Categories
☑ Reviews
☑ Inventory
☑ Coupons
☑ Analytics

Expected: Badge visible on all pages with consistent count
```

### 8. Authentication Testing

#### Test Non-Admin Access
```
Steps:
1. Logout from admin account
2. Login as regular user
3. Try to access /admin/payment-verification.html

Expected:
- Should be redirected to login
- Or see "Access denied" message
```

#### Test Token Expiry
```
Steps:
1. Login as admin
2. Open DevTools > Application > LocalStorage
3. Note the auth-token expiry time
4. Wait for token to expire
5. Try to navigate to Payment Verification

Expected:
- Should redirect to login
- Session should be reset
```

### 9. Browser Compatibility Testing

#### Test on Different Browsers
```
Browsers to test:
☑ Chrome (latest)
☑ Firefox (latest)
☑ Safari (latest)
☑ Edge (latest)

Expected: Works consistently across all browsers
```

#### Test on Mobile
```
Steps:
1. Open DevTools > Device Toolbar
2. Select iPhone 12 or similar
3. Navigate admin pages
4. Check badge visibility
5. Check touch interactions

Expected:
- Badge visible on mobile
- No layout issues
- Touch interactions work properly
```

### 10. Performance Testing

#### Check Memory Usage
```
Steps:
1. DevTools > Performance tab
2. Take memory snapshot
3. Wait 2 minutes (4 poll cycles)
4. Take another snapshot
5. Compare memory usage

Expected:
- Memory usage should remain stable
- No memory leaks
- < 1MB increase over 2 minutes
```

#### Check CPU Impact
```
Steps:
1. DevTools > Performance tab
2. Record while polling happens
3. Analyze CPU usage

Expected:
- Minimal CPU spike during API call
- < 50ms processing time
- Smooth frame rate (60 FPS when idle)
```

## Automated Testing

### Jest Test Example
```javascript
// admin-common.test.js
describe('AdminCommon Polling', () => {
  test('should update badge count', async () => {
    AdminCommon.init();
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(document.getElementById('paymentVerificationBadge').textContent).toBeDefined();
  });

  test('should stop polling when visibility hidden', () => {
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    // Assert polling stopped
  });
});
```

## Troubleshooting Table

| Issue | Cause | Solution |
|-------|-------|----------|
| Badge not showing | Count is 0 | Add test data with pending orders |
| Badge shows stale count | Polling stopped | Check console for errors |
| Badge not updating | API down | Check backend is running |
| Menu item missing | Not authenticated | Login with admin account |
| CORS error | Backend CORS config | Check backend CORS headers |
| High memory usage | Memory leak | Check for stopped timers |

## Regression Testing Checklist

Before deploying to production:

- [ ] All 10 admin pages load without errors
- [ ] Badge visible on all pages
- [ ] Badge count matches API response
- [ ] Polling starts within 1 second of page load
- [ ] Polling stops when tab is hidden
- [ ] Polling resumes when tab returns
- [ ] Badge updates every ~30 seconds
- [ ] Manual refresh works after order action
- [ ] Logout clears authentication
- [ ] Re-login restarts polling
- [ ] No console errors
- [ ] No network errors
- [ ] No memory leaks over 5 minutes
- [ ] Works on mobile devices
- [ ] Works on all major browsers

## Success Criteria

✅ Integration is successful when:

1. **Visual**: Badge appears on sidebar showing pending count
2. **Functional**: Badge updates every 30 seconds via polling
3. **Responsive**: Badge updates immediately after order verification
4. **Resilient**: Badge handles API failures gracefully
5. **Performant**: No memory leaks or high CPU usage
6. **Secure**: Only admins can access, proper authentication enforced
7. **Compatible**: Works on all major browsers and devices

## Contact Support

For issues or questions about the implementation:
1. Check console for error messages
2. Review network requests in DevTools
3. Verify backend API is responding correctly
4. Check authentication token is valid
5. Review logs in backend server
