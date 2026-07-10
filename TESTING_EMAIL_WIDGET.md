# 🧪 Email Widget Testing Guide

## Quick Test URLs

### 1. **Automated Test Page**
```
http://localhost:8888/test-email-widget.html
```
Opens a test page that checks:
- ✅ Widget container exists
- ✅ Email button loaded
- ✅ Tooltip visible
- ✅ Click handlers attached
- ✅ CSS styling applied
- ✅ Bootstrap icons loaded
- ✅ Global widget object initialized

**Click "Run Tests" button to start automated tests**

---

### 2. **Manual Testing on Live Pages**

#### **Desktop Browser Test:**
1. Open: `http://localhost:8888/index.html`
2. Scroll down and look for **blue envelope icon** in bottom-right corner
3. **Hover over it** → Should see "Email Us" tooltip
4. **Click it** → Your default email client should open
5. Email should be pre-filled: `aliahmadameer789@gmail.com`

#### **Mobile Browser Test:**
1. Open browser DevTools (F12)
2. Click responsive design mode (or Ctrl+Shift+M)
3. Test on different device sizes (iPhone, iPad, Android, etc.)
4. Click email button → Mail app should open (or fallback notification)
5. Verify position is correct on mobile

#### **Test All Pages:**
```
✅ http://localhost:8888/index.html
✅ http://localhost:8888/shop.html
✅ http://localhost:8888/product.html
✅ http://localhost:8888/cart.html
✅ http://localhost:8888/checkout.html
✅ http://localhost:8888/about.html
✅ http://localhost:8888/contact.html
✅ http://localhost:8888/login.html
✅ http://localhost:8888/register.html
```

---

## What Should Happen

### ✅ **Success Indicators:**

1. **Widget appears on page**
   - Blue envelope button visible in bottom-right
   - Above WhatsApp widget (if on same page)
   - Fixed position (stays visible while scrolling)

2. **Hover Effect**
   - Button scales up slightly
   - Tooltip "Email Us" appears
   - Pulse animation visible

3. **Click Behavior**
   - Button clicked → Email client opens OR
   - No client available → Toast notification shows: "📧 Email us at: aliahmadameer789@gmail.com"

4. **Email Client Opens With:**
   - To: `aliahmadameer789@gmail.com`
   - Subject: Empty (user fills in)
   - Body: Empty (user fills in)
   - Ready to compose and send

5. **Mobile Responsiveness**
   - Button size adjusts on mobile
   - Button position correct on all screen sizes
   - Tooltip fits on screen

---

## Console Logs to Check

Open Browser DevTools (F12) → Console tab

You should see:
```
✅ Email Contact Widget Initialized
```

---

## Troubleshooting

### **Problem: Widget not visible**
- **Check:** Is the file loaded? Look for script tag in page source
- **Fix:** Ensure `email-contact.js` is loaded in HTML

### **Problem: Button doesn't respond to clicks**
- **Check:** Open DevTools → Click button → See errors?
- **Check:** Is Bootstrap Icons loaded? Look in page source
- **Fix:** Verify `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons...`

### **Problem: Email client doesn't open**
- **Note:** This is expected on some browsers/systems
- **Expected:** Toast notification should show email address
- **Workaround:** User can manually copy email from notification

### **Problem: Multiple widgets on page**
- **Check:** Should only appear once (widget checks for duplicates)
- **Expected:** `✅ Email Contact Widget Initialized` logs once
- **If multiple:** Check if script loaded multiple times

---

## Testing Checklist

- [ ] Test on Firefox
- [ ] Test on Chrome
- [ ] Test on Safari (if Mac available)
- [ ] Test on Edge
- [ ] Test on mobile browser (iOS/Android)
- [ ] Test responsive mode (mobile, tablet, desktop)
- [ ] Hover over button → Tooltip appears
- [ ] Click button → Email opens or toast shows
- [ ] Email pre-filled correctly
- [ ] Button positioned correctly
- [ ] No console errors
- [ ] Pulse animation visible
- [ ] Works above/below content
- [ ] Test all 17 pages

---

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ✅ | ✅ | Full support |
| Edge | ✅ | ✅ | Full support |
| IE 11 | ⚠️ | ❌ | Partial support |

---

## File Sizes

- `email-contact.js` - ~3KB
- Inline CSS - ~1KB
- Total: ~4KB

---

## Performance

- ⚡ Loads instantly
- 💾 Minimal memory footprint
- 🔋 No impact on page performance
- 📱 Responsive and smooth animations

---

## Next Steps

1. **Run automated test:** Visit test page and click "Run Tests"
2. **Manual test:** Click email button on index.html
3. **Test all pages:** Verify on all 17 pages
4. **Check console:** Look for any errors
5. **Ready to deploy?** Commit to GitHub when all tests pass

---

**Status:** Ready for Testing ✅
**Last Updated:** July 6, 2026
