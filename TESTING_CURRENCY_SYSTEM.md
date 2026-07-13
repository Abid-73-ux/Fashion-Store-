# Testing the Currency System - Quick Guide

## Prerequisites
- ✅ Backend running on `http://127.0.0.1:5000`
- ✅ Database table `store_settings` created (optional - backend will create via Sequelize)
- ✅ Frontend running on `http://127.0.0.1:5500`

---

## STEP 1: Check Backend Status

**In Terminal**:
```bash
cd backend
npm start
```

**Expected Output**:
```
✅ Server running on http://localhost:5000
📝 Database: MySQL
🔗 Host: localhost:3306/takanj
✅ MySQL Database connected successfully
✅ Database models synchronized
```

---

## STEP 2: Test Settings API

**In Browser** or **Postman**:
```
GET http://127.0.0.1:5000/api/settings
```

**Expected Response** (Status 200):
```json
{
  "data": {
    "id": 1,
    "currency": "PKR",
    "currencySymbol": "Rs",
    "taxPercentage": 0,
    "shippingCost": 250,
    "freeShippingThreshold": 5000,
    "storeName": "TAKANJ",
    "storePhone": null,
    "storeEmail": null,
    "createdAt": "2026-07-11T...",
    "updatedAt": "2026-07-11T..."
  }
}
```

If you get an error, it means the API is working but the table doesn't have data. Run this SQL:
```sql
INSERT INTO store_settings (currency, currencySymbol, taxPercentage, shippingCost, freeShippingThreshold, storeName)
VALUES ('PKR', 'Rs', 0, 250, 5000, 'TAKANJ');
```

---

## STEP 3: Test Frontend Pages

### **IMPORTANT: Do Ctrl+F5 (Hard Refresh) Before Testing Each Page**

### 3.1 Home Page
**URL**: `http://127.0.0.1:5500/index.html`

**Check**:
- ✅ Featured Products section - prices show as "Rs 2,499" or "Rs X,XXX"
- ✅ New Arrivals section - prices display correctly
- ✅ No "PKR" or "$" symbols visible
- ✅ Sale products show old price struck through

**Expected**: Featured products with prices like "Rs 2,499"

---

### 3.2 Shop Page
**URL**: `http://127.0.0.1:5500/shop.html`

**Check**:
- ✅ Product cards show prices as "Rs X,XXX"
- ✅ Filter by category works
- ✅ Filter by size/color works
- ✅ Sort by price works
- ✅ Price displays update after filtering

**Test Adding Product to Cart**:
1. Click "Add to Cart" on any product
2. Toast message appears: "Product added to cart!"
3. Cart badge updates

**Expected**: All product prices formatted as "Rs X,XXX"

---

### 3.3 Cart Page
**URL**: `http://127.0.0.1:5500/cart.html`

**Precondition**: Cart must have items (add from shop.html)

**Check Order Summary**:
```
Subtotal          Rs X,XXX
Shipping          Rs XXX (or "Free" if above threshold)
Tax (10%)         Rs XXX    ← Only shows if tax % > 0
Discount          -Rs XXX   ← Shows only if coupon applied
────────────────────────
Total             Rs X,XXX
```

**Special Cases**:
1. **Tax = 0%**: Tax row should NOT appear
2. **Shipping Threshold**: If subtotal > 5000, shipping should be "Free"
3. **Coupon**: Apply valid coupon code (e.g., "SAVE10", "WELCOME")

**Test Coupon**:
1. Enter coupon code: `WELCOME` (should be 5% off)
2. Click "Apply"
3. Green message: "Coupon applied! 5% off"
4. Discount row appears with "- Rs XXX"
5. Total recalculates

**Expected**: All amounts in "Rs X,XXX" format, tax row conditional

---

### 3.4 Checkout Page
**URL**: `http://127.0.0.1:5500/checkout.html`

**Precondition**: Cart must have items

**Step 1 - Shipping**:
- ✅ Form has 9 fields (first name, last name, email, phone, address, apartment, city, state, zip)
- ✅ All fields required
- ✅ "Continue to Review" button moves to step 2

**Step 2 - Review Order**:
- ✅ Items show with "Rs X,XXX" prices
- ✅ Order summary shows:
  - Subtotal: "Rs X,XXX"
  - Shipping: "Rs XXX" or "Free"
  - Tax: (conditional) "Rs XXX"
  - Grand Total: "Rs X,XXX"
- ✅ "Continue to Payment" button moves to step 3

**Step 3 - Payment**:
- ✅ Payment methods available: Card, Bank Transfer, COD
- ✅ Card payment form shows 4 fields
- ✅ Select payment method
- ✅ "Place Order" button creates order

**Expected**: All monetary values formatted as "Rs X,XXX"

---

## STEP 4: Verify Currency Formatting

**Correct Format**: `Rs 2,499`
**Incorrect Formats**:
- ❌ `PKR 2,499`
- ❌ `₨2499` (no space)
- ❌ `Rs2,499.00` (extra decimals)
- ❌ `$ 2,499`

**If seeing wrong format**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check console for errors (F12 → Console tab)

---

## STEP 5: Check Console for Errors

**Open Developer Tools** (F12)

**Console Tab** - should show:
```
✅ Store settings loaded: {currency: "PKR", currencySymbol: "Rs", ...}
```

**Red errors**? Common issues:
- ❌ `storeSettings is not defined` → storeSettings.js not loaded (check HTML script tags)
- ❌ `Cannot fetch settings` → Backend not running on 127.0.0.1:5000
- ❌ `CORS error` → Backend not configured for browser origin

---

## STEP 6: Test Tax Percentage Conditional Display

**Current Settings** (from API):
- taxPercentage: 0

**Expected**: Tax row NOT visible on Cart/Checkout

**To Test with Tax**:
1. Update database:
   ```sql
   UPDATE store_settings SET taxPercentage = 10 WHERE id = 1;
   ```
2. Hard refresh pages (Ctrl+F5)
3. Tax row should NOW appear in Order Summary
4. Example: Subtotal Rs 10,000 → Tax = Rs 1,000

---

## STEP 7: Test Shipping Threshold

**Current Settings**:
- shippingCost: 250
- freeShippingThreshold: 5000

**Test Scenarios**:
1. **Subtotal Rs 4,000** (below threshold):
   - Shipping should show: "Rs 250"

2. **Subtotal Rs 5,000+** (at or above threshold):
   - Shipping should show: "Free"

**To Test Different Threshold**:
```sql
UPDATE store_settings SET freeShippingThreshold = 2000 WHERE id = 1;
```

---

## STEP 8: Verify All Pages Integrated

| Page | Currency Format | Updated |
|------|-----------------|---------|
| Home (index.html) | Rs X,XXX | ✅ |
| Shop (shop.html) | Rs X,XXX | ✅ |
| Cart (cart.html) | Rs X,XXX | ✅ |
| Checkout (checkout.html) | Rs X,XXX | ✅ |
| Product Detail | - | (Optional) |
| Order History | - | (Optional) |

---

## TROUBLESHOOTING

### Issue: Prices Still Show "PKR" or "$"
**Solution**:
1. Hard refresh (Ctrl+F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check console (F12) for errors
4. Verify storeSettings.js script tag exists in HTML

### Issue: Tax Row Always Visible Even When taxPercentage = 0
**Solution**:
1. Hard refresh page
2. Check console for: `✅ Store settings loaded`
3. Verify API returns taxPercentage: 0

### Issue: Shipping Always Shows "Free"
**Solution**:
1. Check if subtotal is truly below threshold
2. Verify API response: `freeShippingThreshold: 5000`
3. Hard refresh page

### Issue: Cannot Connect to Backend API
**Solution**:
1. Check backend is running: `npm start` in /backend
2. Use `127.0.0.1` NOT `localhost`
3. Check console for CORS errors
4. Verify backend .env has correct database credentials

---

## QUICK REFERENCE: API ENDPOINTS

```
GET /api/settings
- Returns current store settings
- Used by storeSettings.js on page load

PUT /api/settings
- Updates store settings (for admin panel)
- Body: { currency, currencySymbol, taxPercentage, etc. }

POST /api/settings/reset
- Resets to defaults
```

---

## SUCCESS CRITERIA ✅

- [x] Backend starts without errors
- [x] API GET /api/settings returns 200 with JSON
- [x] Home page products show "Rs X,XXX"
- [x] Shop page products show "Rs X,XXX"
- [x] Cart shows "Rs X,XXX" format
- [x] Checkout shows "Rs X,XXX" format
- [x] Tax row conditionally hides when tax% = 0
- [x] Shipping conditionally shows "Free" above threshold
- [x] Coupon discounts formatted as "- Rs XXX"
- [x] No hardcoded TAX_RATE or SHIPPING_COST variables
- [x] All pages initialized with storeSettings
- [x] Console shows "✅ Store settings loaded"

---

**Estimated Time to Complete Testing**: 15-20 minutes

Good luck! 🚀
