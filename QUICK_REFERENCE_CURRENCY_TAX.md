# Quick Reference - Currency & Tax System

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup
```sql
-- Copy & paste into MySQL
CREATE TABLE store_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency VARCHAR(10) DEFAULT 'PKR',
  currencySymbol VARCHAR(5) DEFAULT 'Rs',
  taxPercentage DECIMAL(5, 2) DEFAULT 0,
  shippingCost DECIMAL(10, 2) DEFAULT 0,
  freeShippingThreshold DECIMAL(10, 2) DEFAULT 5000,
  storeName VARCHAR(100),
  storePhone VARCHAR(20),
  storeEmail VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO store_settings (currency, currencySymbol, taxPercentage, shippingCost, freeShippingThreshold, storeName)
VALUES ('PKR', 'Rs', 0, 0, 5000, 'TAKANJ');
```

### Step 2: Test Backend API
```bash
curl http://127.0.0.1:5000/api/settings
```

Expected response:
```json
{
  "success": true,
  "data": {
    "currency": "PKR",
    "currencySymbol": "Rs",
    "taxPercentage": 0,
    "shippingCost": 0,
    "freeShippingThreshold": 5000,
    "storeName": "TAKANJ"
  }
}
```

### Step 3: Hard Refresh Browser
```
Ctrl+F5
```

### Step 4: Test Checkout Page
- Go to checkout.html
- Verify prices show "Rs" symbol
- Verify calculations are correct

---

## 📱 Using storeSettings in Your Code

### Format Currency
```javascript
// Initialize once per page load
await storeSettings.initialize();

// Use anywhere
const price = storeSettings.formatCurrency(2499);
console.log(price); // Output: "Rs 2,499"
```

### Calculate Tax
```javascript
const subtotal = 10000;
const tax = storeSettings.calculateTax(subtotal);
console.log(tax); // Tax based on configured %
```

### Calculate Shipping
```javascript
const subtotal = 3000;
const shipping = storeSettings.calculateShipping(subtotal);
// If subtotal < freeShippingThreshold: returns shippingCost
// If subtotal >= freeShippingThreshold: returns 0 (free)
```

### Calculate Grand Total
```javascript
const total = storeSettings.calculateGrandTotal(
  subtotal,  // required
  shipping,  // optional, calculated if not provided
  discount,  // optional, default 0
  coupon     // optional, default 0
);
```

### Check if Tax is Enabled
```javascript
if (storeSettings.isTaxEnabled()) {
  // Show tax row
} else {
  // Hide tax row
}
```

---

## 📋 What Gets Formatted

### ❌ Before Implementation
```
Price: PKR 2499
Tax (hardcoded 10%): ₨234
Shipping (hardcoded $10): ₨165
```

### ✅ After Implementation
```
Price: Rs 2,499
Tax (dynamic 0%): Hidden (when tax = 0%)
Shipping (dynamic, free above 5000): Free
```

---

## 🎯 Common Tasks

### Add to Your Page
```html
<!-- Add these scripts in <head> or before closing </body> -->
<script src="assets/js/services/storeSettings.js"></script>
```

### Format All Prices
```javascript
// Instead of:
<span>${price}</span>

// Use:
<span>${storeSettings.formatCurrency(price)}</span>
```

### Update Checkout Summary
```javascript
function updateSummary(subtotal) {
  const shipping = storeSettings.calculateShipping(subtotal);
  const tax = storeSettings.calculateTax(subtotal);
  const total = storeSettings.calculateGrandTotal(subtotal, shipping);
  
  document.getElementById('subtotal').textContent = storeSettings.formatCurrency(subtotal);
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping);
  document.getElementById('tax').textContent = storeSettings.formatCurrency(tax);
  document.getElementById('total').textContent = storeSettings.formatCurrency(total);
}
```

---

## 🔧 Change Settings via API

### Update Tax to 17%
```bash
curl -X PUT http://127.0.0.1:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "taxPercentage": 17,
    "currencySymbol": "Rs"
  }'
```

### Update Shipping
```bash
curl -X PUT http://127.0.0.1:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "shippingCost": 250,
    "freeShippingThreshold": 5000
  }'
```

### Reset to Defaults
```bash
curl -X POST http://127.0.0.1:5000/api/settings/reset
```

---

## 📊 API Endpoints

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| GET | /api/settings | Get current settings | No |
| PUT | /api/settings | Update settings | Admin |
| POST | /api/settings/reset | Reset to defaults | Admin |

---

## ✅ Verification Checklist

- [ ] Database table created
- [ ] `GET /api/settings` returns data
- [ ] storeSettings.js loads in browser
- [ ] Prices show "Rs" symbol
- [ ] Calculations are correct
- [ ] Tax hides when percentage = 0%
- [ ] Free shipping works above threshold
- [ ] Admin can update settings
- [ ] Changes take effect immediately

---

## 🐛 Troubleshooting

### Prices Not Showing?
1. Check browser console for errors
2. Make sure storeSettings.js is loaded
3. Call `await storeSettings.initialize()` first

### Tax Not Calculating?
1. Check if `taxPercentage` > 0 in database
2. Verify `storeSettings.calculateTax()` is called
3. Make sure value is a decimal, not percentage string

### Shipping Always Free?
1. Check if subtotal < freeShippingThreshold
2. Verify `shippingCost` > 0
3. Make sure `freeShippingThreshold` is set correctly

### Settings Not Updating?
1. Verify API endpoint working: `curl http://127.0.0.1:5000/api/settings`
2. Check database was updated
3. Hard refresh browser to clear cache

---

## 💡 Pro Tips

1. **Initialize Once Per Page**
   ```javascript
   // Do this in DOMContentLoaded
   await storeSettings.initialize();
   ```

2. **Use Consistent Formatting**
   ```javascript
   // Always use this for prices
   storeSettings.formatCurrency(amount)
   ```

3. **Check Tax Before Showing**
   ```javascript
   if (storeSettings.isTaxEnabled()) {
     // Show tax row
   }
   ```

4. **Free Shipping Display**
   ```javascript
   shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping)
   ```

---

## 📚 Complete Example

```javascript
// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await storeSettings.initialize();
  
  // Calculate totals
  const subtotal = 10000;
  const shipping = storeSettings.calculateShipping(subtotal);
  const tax = storeSettings.calculateTax(subtotal);
  const total = storeSettings.calculateGrandTotal(subtotal, shipping);
  
  // Display
  console.log(`Subtotal: ${storeSettings.formatCurrency(subtotal)}`);
  console.log(`Shipping: ${shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping)}`);
  console.log(`Tax: ${storeSettings.formatCurrency(tax)}`);
  console.log(`Total: ${storeSettings.formatCurrency(total)}`);
  
  // Output:
  // Subtotal: Rs 10,000
  // Shipping: Free
  // Tax: Rs 0
  // Total: Rs 10,000
});
```

---

## 🎉 Success!

You now have:
- ✅ PKR currency formatting
- ✅ Dynamic tax system
- ✅ Smart shipping
- ✅ Admin-editable settings
- ✅ Zero hardcoded values

**Happy coding!** 🚀

