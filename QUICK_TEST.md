# Admin Dashboard - 5-Minute Quick Test

Follow these steps to verify everything is working:

---

## Test 1: Start Fresh (30 seconds)

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Paste and run:
```javascript
// Clear all test data
Object.keys(localStorage).filter(k => k.startsWith('admin_')).forEach(k => localStorage.removeItem(k));
console.log('✓ Cleared all data');
```

---

## Test 2: Add a Product (1 minute)

1. Go to: **http://localhost:PORT/frontend/admin/products.html**
2. Click **"Add Product"** (top right)
3. Fill form:
   - Name: `Test Shoe`
   - SKU: `TEST-001`
   - Price: `99.99`
   - Stock: `10`
   - Category: `Men`
4. Click **"Save Product"**
5. ✅ **Should see product in table and "Product added!" toast**

---

## Test 3: Check Dashboard (30 seconds)

1. Go to: **http://localhost:PORT/frontend/admin/dashboard.html**
2. Check stat cards show:
   - Total Products: **1**
   - Total Revenue: **$0** (no orders yet)
   - Total Orders: **0**
   - Total Customers: **0**
3. ✅ **Should see your product in "Top Selling Products"**

---

## Test 4: Add an Order (1 minute)

1. Go to DevTools **Console**
2. Paste and run:
```javascript
AdminStorage.addOrder({
  orderId: 'ORD-001',
  customer: 'Test Customer',
  date: '2024-01-15',
  items: 1,
  total: 99.99,
  payment: 'Paid',
  status: 'Pending'
});
console.log('✓ Order added');
```

3. Go to: **http://localhost:PORT/frontend/admin/orders.html**
4. ✅ **Should see stats: Pending: 1, Shipped: 0, Delivered: 0, Cancelled: 0**
5. ✅ **Should see order in table**

---

## Test 5: Update Order Status (30 seconds)

1. On Orders page, find the status dropdown
2. Change from "Pending" to "Delivered"
3. ✅ **Should see toast: "Order status updated to Delivered"**
4. ✅ **Stats should update: Pending: 0, Delivered: 1**

---

## Test 6: Test Data Persistence (30 seconds)

1. Refresh the page (F5)
2. ✅ **Order should still show as "Delivered"**
3. ✅ **Stats should still show: Delivered: 1**
4. Go back to Dashboard (F5)
5. ✅ **Dashboard should still show: Total Orders: 1, Total Products: 1**

---

## Test 7: Add Category (30 seconds)

1. Go to: **http://localhost:PORT/frontend/admin/categories.html**
2. Click **"Add Category"**
3. Enter: `Test Category`
4. ✅ **Should see category card appear**
5. ✅ **Should see toast: "Category added successfully"**

---

## Test 8: Delete Category (30 seconds)

1. Click **"Delete"** on the category card
2. Confirm deletion
3. ✅ **Category should disappear**
4. ✅ **Should see toast: "Category deleted successfully"**
5. Refresh page - ✅ **Should stay deleted**

---

## Test 9: Add Coupon (30 seconds)

1. Go to: **http://localhost:PORT/frontend/admin/coupons.html**
2. Click **"Create Coupon"**
3. Enter code: `TEST20`
4. ✅ **Should see coupon in table**
5. ✅ **Should see toast: "Coupon created successfully"**

---

## Test 10: Verify No Demo Data

1. Clear localStorage again (Test 1 commands)
2. Go to each page:
   - Dashboard: ✅ **Should show all zeros**
   - Products: ✅ **Should be empty**
   - Orders: ✅ **Should say "No orders found"** and stats = 0
   - Categories: ✅ **Should say "No categories found"**
   - Customers: ✅ **Should be empty**
   - Coupons: ✅ **Should say "No coupons found"**
   - Reviews: ✅ **Should say "No reviews found"**
   - Inventory: ✅ **Should be empty and stats = 0**

---

## ✅ All Tests Passed!

If all 10 tests passed, the admin dashboard is **100% working**!

### Summary of What's Fixed:
- ✅ No more hard-coded demo data
- ✅ All statistics are dynamic
- ✅ Full CRUD operations working
- ✅ Data persists across page reloads
- ✅ Form submission working
- ✅ Toast notifications working
- ✅ Empty states showing correctly
- ✅ Module initialization working

### Next Steps:
1. Read `ADMIN_DASHBOARD_TEST_GUIDE.md` for comprehensive testing
2. Read `CHANGES_SUMMARY.md` for technical details
3. Start using the admin dashboard in development!

---

## Troubleshooting

### Product not appearing after save?
- Check DevTools Console for errors (F12)
- Make sure all fields were filled
- Try: `AdminStorage.getProducts()` in console to verify saved

### Stats not updating?
- Refresh the page
- Check DevTools Console for errors
- Try clearing cache (Ctrl+Shift+Del)

### Toast not showing?
- Check if toast.js is loaded (DevTools → Network tab)
- Check DevTools Console for errors

---

**Time to complete: ~5 minutes**
**Questions? Check the detailed test guide or code comments**

All done! 🎉
