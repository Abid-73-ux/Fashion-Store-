# Quick Test Checklist - White Input Fields

## Before Testing: Hard Refresh Your Browser
**Windows/Linux:** `Ctrl+F5`
**Mac:** `Cmd+Shift+R`

---

## Visual Checklist

### ✅ Checkout Page (checkout.html)
- [ ] Shipping address fields are WHITE
- [ ] City, postal code fields are WHITE  
- [ ] Phone number input is WHITE
- [ ] Click on field → see BLACK border
- [ ] Placeholder text is visible

### ✅ Shop Page (shop.html)
- [ ] Price filter inputs are WHITE
- [ ] Min price input is WHITE
- [ ] Max price input is WHITE
- [ ] Search box is WHITE
- [ ] Category dropdown is WHITE

### ✅ Cart Page (cart.html)
- [ ] Quantity input is WHITE
- [ ] Coupon code input is WHITE
- [ ] Up/down spinners on quantity input work

### ✅ Login Page (login.html)
- [ ] Email input is WHITE
- [ ] Password input is WHITE
- [ ] Text is BLACK and readable

### ✅ Contact Page (contact.html)
- [ ] Name input is WHITE
- [ ] Email input is WHITE
- [ ] Subject input is WHITE
- [ ] Message textarea is WHITE
- [ ] All text is BLACK

### ✅ Profile Page (profile.html)
- [ ] Profile form inputs are WHITE
- [ ] Address fields are WHITE
- [ ] Phone input is WHITE

### ✅ Admin Dashboard (admin/dashboard.html)
- [ ] All form inputs are WHITE
- [ ] Search/filter inputs are WHITE

### ✅ Admin Products (admin/products.html)
- [ ] Product name input is WHITE
- [ ] Price input is WHITE
- [ ] Description textarea is WHITE
- [ ] Category dropdown is WHITE

---

## Focus State Test (VERY IMPORTANT)

**Test each input:**
1. Click on an input field
2. **Expected:** Black border appears
3. **Expected:** Subtle shadow appears
4. **NOT Expected:** Blue outline (that's old styling)

**If you see blue outline:**
- Hard refresh browser again: `Ctrl+F5`
- Clear browser cache completely
- Try incognito/private window

---

## Special Input Tests

### Dropdown/Select Fields
- [ ] Click dropdown → arrow icon visible
- [ ] Options show white background
- [ ] Selected option is highlighted

### Number Inputs  
- [ ] Up/down spinner buttons visible
- [ ] Can click to increase/decrease number
- [ ] Field shows WHITE background

### Textareas
- [ ] Background is WHITE
- [ ] Text is BLACK
- [ ] Border is light gray
- [ ] Can resize if enabled

### Checkboxes
- [ ] Background WHITE when unchecked
- [ ] Blue when checked (this is fine)
- [ ] Label text is BLACK

---

## Color Reference

**Expected Colors:**
- Input Background: `#ffffff` (pure white)
- Input Text: `#000000` (black)
- Border: `#dcdcdc` (very light gray)
- Focus Border: `#000000` (black)
- Focus Shadow: subtle gray

**NOT Expected Colors:**
- Dark gray background
- Dark blue background
- Brown/tan background
- Anything with low contrast

---

## All Pages That Should Show White Inputs

**Frontend (Customer Site):**
- ✅ Home (index.html)
- ✅ Shop (shop.html)
- ✅ Checkout (checkout.html)
- ✅ Cart (cart.html)
- ✅ Login (login.html)
- ✅ Register (register.html)
- ✅ Contact (contact.html)
- ✅ Profile (profile.html)
- ✅ Wishlist (wishlist.html)
- ✅ Orders (orders.html)
- ✅ Product Details (product.html)
- ✅ About (about.html)
- ✅ Shipping Info (shipping.html)
- ✅ Returns (returns.html)
- ✅ FAQ (faq.html)

**Admin (Backend):**
- ✅ Dashboard (admin/dashboard.html)
- ✅ Login (admin/login.html)
- ✅ Products (admin/products.html)
- ✅ Categories (admin/categories.html)
- ✅ Coupons (admin/coupons.html)
- ✅ Orders (admin/orders.html)
- ✅ Customers (admin/customers.html)
- ✅ Inventory (admin/inventory.html)
- ✅ Reviews (admin/reviews.html)
- ✅ Analytics (admin/analytics.html)
- ✅ Settings (admin/settings.html)
- ✅ WhatsApp Support (admin/whatsapp-support.html)

---

## Issues to Report

If you find an input field that is NOT white:
1. Note the page name (e.g., "checkout.html")
2. Note the field name (e.g., "city input")
3. Describe the color (e.g., "gray background")
4. Try a different browser to confirm
5. Try incognito/private mode
6. Report the issue with these details

---

## Success Criteria ✅

**ALL OF THESE MUST BE TRUE:**
- [ ] Every input field is WHITE background
- [ ] All text in inputs is BLACK
- [ ] Borders are light gray
- [ ] Focus state shows BLACK border
- [ ] Placeholders are visible
- [ ] Dropdowns have arrow icon
- [ ] Number spinners work
- [ ] Textareas are full WHITE
- [ ] Works on Chrome/Firefox/Safari
- [ ] Works on mobile browsers
- [ ] Admin pages also have white inputs
- [ ] No dark/gray/blue backgrounds anywhere

---

## If Something Looks Wrong

### Problem: Still Seeing Dark Inputs
**Solution:**
1. Press: `Ctrl+Shift+Delete` (clear all cache)
2. Or use Incognito/Private mode
3. Or try different browser

### Problem: Seeing Blue Outline on Focus
**Solution:**
1. This is Bootstrap default (old styling)
2. Hard refresh should fix it: `Ctrl+F5`
3. If persists, check CSS is loading

### Problem: Placeholder Text Invisible
**Solution:**
1. Different browsers show differently
2. Text should be visible at 60% opacity
3. If not, try different browser
4. Check if zoom is at 100%

### Problem: Dropdown Arrow Missing
**Solution:**
1. Hard refresh browser
2. Try different browser
3. SVG arrow might not load
4. Fallback styling should show box anyway

---

## Quick Verification

Run this in browser console to check CSS loaded:
```javascript
// Check if inputs.css is loaded
const links = document.querySelectorAll('link[rel="stylesheet"]');
let found = false;
links.forEach(link => {
  if (link.href.includes('inputs.css')) {
    console.log('✅ inputs.css is loaded!');
    found = true;
  }
});
if (!found) console.log('❌ inputs.css NOT found - hard refresh needed');
```

---

## Final Status

✅ **All changes complete and ready for testing!**

**Files Created:**
- `frontend/assets/css/inputs.css` ← Main CSS file

**Files Updated:**
- 25+ HTML pages with the CSS link

**Ready to test now!** 🚀

Hard refresh with `Ctrl+F5` and visit each page to verify white input fields.
