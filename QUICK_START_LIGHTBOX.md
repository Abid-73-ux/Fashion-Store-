# Quick Start: Payment Proof Lightbox

## For Users - Open & Use the Lightbox

### 1. Open the Lightbox
From Payment Verification page:
1. Click **View** on any pending order
2. Click the payment proof thumbnail OR **View Full Size** button

### 2. Control the Image

| Action | How to Do It |
|--------|------------|
| **Zoom In** | Click `+` button OR scroll mouse wheel up OR press `+` key |
| **Zoom Out** | Click `-` button OR scroll mouse wheel down OR press `-` key |
| **Zoom Precisely** | Drag the zoom slider |
| **Move Around (Pan)** | Click and drag the image (when zoomed) |
| **Rotate** | Click `↲` (left) or `↳` (right) buttons |
| **Rotate Keyboard** | Press `[` (left) or `]` (right) |
| **Reset** | Click home icon or press `R` |
| **Download** | Click download icon |
| **Close** | Click `X` button or press `ESC` |

### 3. Mobile Users
- **Pinch zoom**: Use zoom buttons instead
- **Swipe to pan**: Drag with one finger when zoomed
- **Landscape**: Turn device sideways for better viewing
- **All buttons** are large and touch-friendly

---

## For Developers - Integrate into Your Code

### Quick Integration (3 steps)

**Step 1: Include the script**
```html
<script src="../assets/js/components/paymentProofLightbox.js"></script>
```

**Step 2: Open the lightbox**
```javascript
PaymentProofLightbox.show(
  'https://api.example.com/proof.jpg',  // Image URL
  'payment_proof.jpg',                   // Filename
  '2024-01-15T10:30:00Z',               // Upload date
  'ORD-12345'                            // Order ID (optional)
);
```

**Step 3: That's it!**
The lightbox automatically handles all interactions.

### Common Use Cases

#### Use Case 1: Show Payment Proof from Order
```javascript
// From OrderDetailModal component
PaymentProofLightbox.show(
  order.paymentProof.fileUrl,
  order.paymentProof.fileName,
  order.paymentProof.uploadedAt,
  order.orderId
);
```

#### Use Case 2: Show with Error Handling
```javascript
async function viewPaymentProof(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    const order = await response.json();
    
    PaymentProofLightbox.show(
      order.paymentProof.fileUrl,
      order.paymentProof.fileName,
      order.paymentProof.uploadedAt,
      orderId
    );
  } catch (error) {
    Toast.error('Failed to load payment proof');
  }
}
```

#### Use Case 3: Close Programmatically
```javascript
// Close the lightbox
PaymentProofLightbox.closeLightbox();
```

---

## Features at a Glance

### Zoom
- Range: 10% to 500%
- Controls: Buttons, slider, mouse wheel, keyboard
- Display: Shows current percentage

### Pan (Move)
- Desktop: Click and drag
- Mobile: Swipe/drag
- Keyboard: Arrow keys or WASD
- Only works when zoomed > 100%

### Rotate
- Options: 90° left/right increments
- Buttons: Left/right rotation icons
- Keyboard: `[` for left, `]` for right

### Download
- Filename: `order_{OrderID}_{Timestamp}.jpg`
- Preserves original image format
- One click download

### Keyboard Shortcuts
```
ESC     → Close
+/-     → Zoom in/out
↑↓←→    → Pan (when zoomed)
W/A/S/D → Pan alternative
R       → Reset
[/]     → Rotate
```

---

## Troubleshooting

### Image Won't Load
1. Check image URL is correct
2. Verify CORS is enabled
3. Check browser console for errors

### Zoom Not Working
- Image must be > 100% to zoom
- Check browser console
- Try different zoom controls

### Pan Not Working
- Zoom must be > 100% to pan
- Click on image, not background
- Try keyboard arrows

### Download Not Working
- Check CORS headers
- Verify image format is supported
- Check browser download settings

### Keyboard Not Working
- Click on lightbox first to focus
- Check for browser extensions blocking keys
- Some keyboard shortcuts may conflict

---

## API Reference (Minimal)

```javascript
// Public Methods
PaymentProofLightbox.show(url, name, date, orderId)
PaymentProofLightbox.closeLightbox()

// That's it! Everything else is automatic.
```

The lightbox handles all interactions internally:
- Zoom calculations
- Pan transformations
- Rotation angles
- Download filename generation
- Keyboard event handling
- Touch event handling

---

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)
✅ iOS Safari, Chrome Mobile
✅ All modern mobile browsers
⚠️ IE 11 (with polyfills)

---

## Files You Need

- `frontend/assets/js/components/paymentProofLightbox.js`
- `frontend/admin/payment-verification.html`
- Bootstrap 5.3.0 (CSS/JS)
- Bootstrap Icons 1.11.0

---

## Quick Tips

1. **For Accessibility**: All features work without mouse
2. **For Mobile**: Use landscape orientation
3. **For Speed**: Images are loaded on-demand
4. **For Accuracy**: Use zoom slider for precise viewing
5. **For Sharing**: Download with order ID in filename

---

## Common Parameters

| Parameter | Example | Notes |
|-----------|---------|-------|
| `url` | `/uploads/proof.jpg` | Must be CORS-enabled |
| `name` | `payment_receipt.jpg` | Displayed in header |
| `date` | `2024-01-15T10:30:00Z` | ISO format required |
| `orderId` | `ORD-12345` | Optional, used for download |

---

## All Keyboard Shortcuts

| Key | Function |
|-----|----------|
| ESC | Close lightbox |
| `+` or `=` | Zoom in |
| `-` or `_` | Zoom out |
| ↑ or `W` | Pan up |
| ↓ or `S` | Pan down |
| ← or `A` | Pan left |
| → or `D` | Pan right |
| `R` | Reset zoom/rotation/pan |
| `[` | Rotate 90° left |
| `]` | Rotate 90° right |

---

## What You Get

✅ Full-screen image viewer
✅ 10%-500% zoom with smooth transitions
✅ Pan/drag to explore zoomed images
✅ 90° rotation controls
✅ Download with smart naming
✅ Keyboard shortcuts for power users
✅ Mobile/touch support
✅ Automatic cleanup on close
✅ CORS-safe image loading
✅ Error handling

---

## Need More Info?

- **Full Documentation**: See `PAYMENT_VERIFICATION_IMPLEMENTATION.md`
- **User Guide**: See `LIGHTBOX_USAGE_GUIDE.md`
- **Developer Guide**: See `LIGHTBOX_USAGE_GUIDE.md` (Developer section)
- **Troubleshooting**: See `LIGHTBOX_USAGE_GUIDE.md` (Troubleshooting section)

