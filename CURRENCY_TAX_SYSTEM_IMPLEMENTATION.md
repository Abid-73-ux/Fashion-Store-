# Currency & Dynamic Tax System Implementation Guide

## ✅ Completed Components

### 1. Backend - Store Settings System

**Files Created:**
- `backend/models/StoreSettings.js` - Database model
- `backend/controllers/storeSettingsController.js` - API logic
- `backend/routes/storeSettings.js` - API routes
- `backend/index.js` - Updated to include /api/settings route

**API Endpoints:**
```
GET  /api/settings              - Get current settings
PUT  /api/settings              - Update settings (admin)
POST /api/settings/reset        - Reset to defaults (admin)
```

**Database Table: store_settings**
```
id                      INT (Primary Key)
currency                VARCHAR(10)         default: 'PKR'
currencySymbol          VARCHAR(5)          default: 'Rs'
taxPercentage           DECIMAL(5,2)        default: 0
shippingCost            DECIMAL(10,2)       default: 0
freeShippingThreshold   DECIMAL(10,2)       default: 5000
storeName               VARCHAR(100)        default: 'TAKANJ'
storePhone              VARCHAR(20)
storeEmail              VARCHAR(100)
createdAt               DATETIME
updatedAt               DATETIME
```

### 2. Frontend - Store Settings Service

**File Created:**
- `frontend/assets/js/services/storeSettings.js` - Utility service

**Key Functions:**
```javascript
storeSettings.initialize()                    // Load settings from API
storeSettings.formatCurrency(amount)          // Format with symbol
storeSettings.formatCurrencyDecimal(amount)   // Format with decimals
storeSettings.calculateTax(subtotal)          // Calculate tax
storeSettings.calculateShipping(subtotal)     // Calculate shipping
storeSettings.calculateGrandTotal(...)        // Calculate total
storeSettings.isTaxEnabled()                  // Check if tax enabled
storeSettings.getTaxPercentage()              // Get tax %
storeSettings.getCurrencySymbol()             // Get currency symbol
```

### 3. Updated Frontend Files

**Partially Updated:**
- `frontend/assets/js/checkout.js` - Now uses storeSettings
- `frontend/assets/js/cart.js` - Still needs update (see below)

---

## 📋 Remaining Tasks

### Task 1: Update cart.js

Replace hardcoded values with store settings:

```javascript
// OLD (Line 6-7):
const SHIPPING_COST = 5.00;
const TAX_RATE = 0.10;

// NEW (Line 9):
document.addEventListener('DOMContentLoaded', async () => {
    await storeSettings.initialize();
    loadCart();
    setupEventListeners();
    updateCartBadge();
});
```

Update `updateCartSummary()` function:
```javascript
function updateCartSummary(subtotal) {
    const shipping = storeSettings.calculateShipping(subtotal);
    const tax = storeSettings.calculateTax(subtotal);
    const total = storeSettings.calculateGrandTotal(subtotal, shipping);
    
    document.getElementById('subtotal').textContent = storeSettings.formatCurrency(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : storeSettings.formatCurrency(shipping);
    
    // Show/hide tax based on settings
    const taxRow = document.getElementById('taxRow');
    if (storeSettings.isTaxEnabled()) {
        document.getElementById('tax').textContent = storeSettings.formatCurrency(tax);
        if (taxRow) taxRow.style.display = 'table-row';
    } else {
        if (taxRow) taxRow.style.display = 'none';
    }
    
    document.getElementById('total').textContent = storeSettings.formatCurrency(total);
}
```

### Task 2: Update home.js

Update product price displays:
```javascript
// In createProductCard function, replace:
PKR ${parseFloat(product.price).toFixed(0)}
// WITH:
${storeSettings.formatCurrency(product.price)}
```

### Task 3: Update shop.js

Same as home.js - update all price displays to use:
```javascript
storeSettings.formatCurrency(amount)
```

### Task 4: Update checkout.html

Add script reference at end of <head>:
```html
<script src="assets/js/services/storeSettings.js"></script>
```

Add tax row ID if missing:
```html
<tr id="taxRow">
    <td>Tax</td>
    <td id="tax">₨ 0</td>
</tr>
```

### Task 5: Update cart.html

Same as checkout.html - add storeSettings.js script reference

### Task 6: Create Admin Settings Page

Create: `frontend/admin/store-settings.html`

```html
<div class="admin-wrapper">
    <aside class="admin-sidebar">
        <!-- Include navigation with "Store Settings" menu item -->
    </aside>
    
    <main class="admin-content">
        <div class="container-fluid">
            <h1>Store Settings</h1>
            
            <form id="settingsForm" class="mt-4">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label>Currency</label>
                            <input type="text" id="currency" class="form-control" value="PKR" readonly>
                        </div>
                        
                        <div class="form-group mb-3">
                            <label>Currency Symbol</label>
                            <input type="text" id="currencySymbol" class="form-control" value="Rs">
                        </div>
                        
                        <div class="form-group mb-3">
                            <label>Tax Percentage (%)</label>
                            <input type="number" id="taxPercentage" class="form-control" min="0" max="100" step="0.01" value="0">
                            <small class="text-muted">Set to 0 to disable tax</small>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label>Shipping Cost</label>
                            <input type="number" id="shippingCost" class="form-control" min="0" step="0.01" value="0">
                        </div>
                        
                        <div class="form-group mb-3">
                            <label>Free Shipping Threshold</label>
                            <input type="number" id="freeShippingThreshold" class="form-control" min="0" step="0.01" value="5000">
                            <small class="text-muted">Orders above this amount get free shipping</small>
                        </div>
                        
                        <div class="form-group mb-3">
                            <label>Store Name</label>
                            <input type="text" id="storeName" class="form-control" value="TAKANJ">
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label>Store Phone</label>
                            <input type="tel" id="storePhone" class="form-control">
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label>Store Email</label>
                            <input type="email" id="storeEmail" class="form-control">
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                    <button type="reset" class="btn btn-secondary ms-2">Reset Form</button>
                </div>
            </form>
        </div>
    </main>
</div>

<script>
// Load settings
async function loadSettings() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/settings');
        const data = await response.json();
        const settings = data.data;
        
        document.getElementById('currency').value = settings.currency;
        document.getElementById('currencySymbol').value = settings.currencySymbol;
        document.getElementById('taxPercentage').value = settings.taxPercentage;
        document.getElementById('shippingCost').value = settings.shippingCost;
        document.getElementById('freeShippingThreshold').value = settings.freeShippingThreshold;
        document.getElementById('storeName').value = settings.storeName;
        document.getElementById('storePhone').value = settings.storePhone || '';
        document.getElementById('storeEmail').value = settings.storeEmail || '';
    } catch (error) {
        console.error('Error loading settings:', error);
        Toast.error('Failed to load settings');
    }
}

// Save settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('http://127.0.0.1:5000/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currencySymbol: document.getElementById('currencySymbol').value,
                taxPercentage: parseFloat(document.getElementById('taxPercentage').value),
                shippingCost: parseFloat(document.getElementById('shippingCost').value),
                freeShippingThreshold: parseFloat(document.getElementById('freeShippingThreshold').value),
                storeName: document.getElementById('storeName').value,
                storePhone: document.getElementById('storePhone').value,
                storeEmail: document.getElementById('storeEmail').value
            })
        });
        
        const data = await response.json();
        if (data.success) {
            Toast.success('Settings saved successfully!');
        } else {
            Toast.error(data.message);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        Toast.error('Failed to save settings');
    }
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
</script>
```

### Task 7: Update Product Display Pages

Files to update (replace all price displays):
- `frontend/index.html` - home page
- `frontend/shop.html` - shop page
- `frontend/product.html` - product details
- `frontend/checkout.html` - order summary
- `frontend/cart.html` - cart summary

**Pattern:**
Replace: `PKR ${amount}` or `₨${amount}`  
With: `${storeSettings.formatCurrency(amount)}`

### Task 8: Add Script References

Add to `<head>` of all pages that display prices:
```html
<script src="assets/js/services/storeSettings.js"></script>
```

Order matters - add AFTER all other scripts:
```html
<script src="assets/js/auth.js"></script>
<script src="assets/js/services/productService.js"></script>
<script src="assets/js/services/storeSettings.js"></script>
<script src="assets/js/home.js"></script>
```

---

## 🔧 Implementation Checklist

### Backend (✅ DONE)
- [x] Create StoreSettings model
- [x] Create storeSettingsController
- [x] Create storeSettings routes
- [x] Update backend/index.js

### Frontend Utilities (✅ DONE)
- [x] Create storeSettings service
- [x] Implement formatCurrency()
- [x] Implement calculateTax()
- [x] Implement calculateShipping()
- [x] Implement calculateGrandTotal()

### Frontend Updates (⏳ PENDING)
- [ ] Update cart.js - replace TAX_RATE, SHIPPING_COST
- [ ] Update home.js - update price displays
- [ ] Update shop.js - update price displays
- [ ] Update product.html - update price displays
- [ ] Update checkout.html - verify tax row ID, add script
- [ ] Update cart.html - add script reference
- [ ] Create admin/store-settings.html
- [ ] Add script references to all pages
- [ ] Test on all pages

---

## 📝 Usage Examples

### In checkout.js (Already Updated)
```javascript
// Initialize on page load
await storeSettings.initialize();

// Format prices
document.getElementById('price').textContent = storeSettings.formatCurrency(2499);

// Calculate totals
const tax = storeSettings.calculateTax(subtotal);
const shipping = storeSettings.calculateShipping(subtotal);
const total = storeSettings.calculateGrandTotal(subtotal, shipping);

// Check if tax is enabled
if (storeSettings.isTaxEnabled()) {
    // show tax
}
```

### In HTML templates
```html
<!-- Display price -->
<p>Price: ${storeSettings.formatCurrency(product.price)}</p>

<!-- Display total -->
<h3>Total: ${storeSettings.formatCurrency(total)}</h3>
```

---

## 🚀 How It Works

1. **Page loads** → storeSettings.initialize() fetches settings from API
2. **Settings cached** in storeSettings.settings object
3. **Price displays** use storeSettings.formatCurrency()
4. **Calculations** use storeSettings.calculate*() functions
5. **Admin changes settings** → All pages use new values immediately

---

## 💾 Database Migration

Run this SQL to create the table:
```sql
CREATE TABLE store_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency VARCHAR(10) DEFAULT 'PKR',
  currencySymbol VARCHAR(5) DEFAULT 'Rs',
  taxPercentage DECIMAL(5, 2) DEFAULT 0,
  shippingCost DECIMAL(10, 2) DEFAULT 0,
  freeShippingThreshold DECIMAL(10, 2) DEFAULT 5000,
  storeName VARCHAR(100) DEFAULT 'TAKANJ',
  storePhone VARCHAR(20),
  storeEmail VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default record
INSERT INTO store_settings (currency, currencySymbol, taxPercentage, shippingCost, freeShippingThreshold, storeName)
VALUES ('PKR', 'Rs', 0, 0, 5000, 'TAKANJ');
```

---

## ✅ Testing Checklist

- [ ] API returns correct settings (GET /api/settings)
- [ ] Prices display with "Rs" symbol
- [ ] Checkout shows dynamic tax
- [ ] Cart shows dynamic shipping
- [ ] Tax hides when percentage is 0
- [ ] Free shipping works above threshold
- [ ] Admin can update settings
- [ ] Changes take effect immediately
- [ ] All pages use correct currency
- [ ] No hardcoded values in frontend

---

## 🎉 Benefits

✅ **No Hardcoded Values** - All configurable  
✅ **Dynamic Currency** - Change anytime  
✅ **Flexible Tax** - 0% to 100%, or disable  
✅ **Smart Shipping** - Threshold-based  
✅ **Admin Control** - No code changes needed  
✅ **Reusable** - Same functions everywhere  
✅ **Maintainable** - Single source of truth  

