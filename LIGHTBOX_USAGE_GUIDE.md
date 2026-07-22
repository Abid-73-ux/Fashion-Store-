# Payment Proof Lightbox - User & Developer Guide

## For Users

### Opening the Lightbox

1. Navigate to **Payment Verification** page in admin dashboard
2. Click **View** button on any pending order
3. In the order detail modal, you'll see the payment proof thumbnail
4. Click either:
   - The thumbnail image itself
   - The **"View Full Size"** button

### Using Lightbox Controls

#### Zoom
- **Zoom In**: Click `+` button or use mouse wheel up or press `+` key
- **Zoom Out**: Click `-` button or use mouse wheel down or press `-` key
- **Zoom Slider**: Drag slider left/right for precise zoom (10% - 500%)
- **Current Zoom**: Displayed as percentage in bottom-right area

#### Pan (Move around zoomed image)
- **Mouse**: Click and drag the image when zoomed in (> 100%)
- **Touch**: Swipe/drag on mobile devices
- **Keyboard**: Use arrow keys or WASD keys to pan
  - ⬆️ / W: Pan up
  - ⬇️ / S: Pan down
  - ⬅️ / A: Pan left
  - ➡️ / D: Pan right

#### Rotate
- **Rotate Left**: Click `↲` button or press `[` key (90° counter-clockwise)
- **Rotate Right**: Click `↳` button or press `]` key (90° clockwise)
- Rotations are cumulative (you can rotate 360°)

#### Reset View
- Click **Home** icon to reset zoom, rotation, and pan back to defaults
- Or press **R** key
- Zoom returns to 100%, rotation to 0°, no pan

#### Download
- Click **Download** icon to save the full payment proof to your computer
- Filename format: `order_{OrderID}_{Timestamp}.jpg`
- Example: `order_ORD-12345_1699564800000.jpg`

#### Close
- Click **X** button in top-right corner
- Or press **ESC** key
- Or click outside the lightbox area (if available)

### Keyboard Shortcuts (Complete List)

| Keyboard Shortcut | Action |
|---|---|
| ESC | Close lightbox |
| + or = | Zoom in |
| - or _ | Zoom out |
| Arrow Up or W | Pan up (when zoomed) |
| Arrow Down or S | Pan down (when zoomed) |
| Arrow Left or A | Pan left (when zoomed) |
| Arrow Right or D | Pan right (when zoomed) |
| R | Reset to original view |
| [ | Rotate 90° counter-clockwise |
| ] | Rotate 90° clockwise |

### Mobile Considerations

- Touch gestures: Use one finger to drag/pan
- Pinch zoom: Currently uses button controls
- Landscape orientation recommended for better viewing
- All buttons are touch-friendly (large tap targets)

---

## For Developers

### Integration in Your Page

#### Step 1: Include the Script

```html
<!-- In your HTML head or body -->
<script src="../assets/js/components/paymentProofLightbox.js"></script>
```

#### Step 2: Show the Lightbox

```javascript
// Basic usage
PaymentProofLightbox.show(
  imageUrl,          // string: URL to the payment proof image
  fileName,           // string: Display filename (e.g., "payment_receipt.jpg")
  uploadDate,         // string: ISO date string (e.g., "2024-01-15T10:30:00Z")
  orderId             // optional string: Order ID for download filename
);

// Example
PaymentProofLightbox.show(
  'https://api.example.com/uploads/payment_proofs/proof123.jpg',
  'Bank_Receipt_Jan_2024.jpg',
  '2024-01-15T10:30:00Z',
  'ORD-12345'
);
```

#### Step 3: Handle Results

The lightbox runs entirely within the browser. Actions are handled by:

```javascript
// Download is automatic when user clicks download button
// Approval/rejection is handled in the modal component

// Close lightbox (if needed programmatically)
PaymentProofLightbox.closeLightbox();
```

### API Reference

#### Public Methods

##### `show(imageUrl, fileName, uploadDate, orderId)`
Opens the lightbox with a payment proof image.

**Parameters:**
- `imageUrl` (string, required): Full URL to the image file
- `fileName` (string, required): Display name of the file (shown in header)
- `uploadDate` (string, required): ISO 8601 date string (shown in header)
- `orderId` (string, optional): Used for download filename formatting

**Example:**
```javascript
PaymentProofLightbox.show(
  '/uploads/payment_proofs/img123.png',
  'Payment_Proof.png',
  '2024-01-15T10:30:00Z',
  'ORD-67890'
);
```

**Download Filename Generated:**
- If `orderId` is provided: `order_ORD-67890_1705318200000.png`
- If `orderId` is not provided: Uses original `fileName`

##### `closeLightbox()`
Closes the lightbox and removes it from the DOM.

**Example:**
```javascript
// Close programmatically
PaymentProofLightbox.closeLightbox();
```

### Styling Customization

The lightbox uses inline styles. To override, add CSS after the script:

```css
/* Override background darkness */
#paymentProofLightbox {
    background: rgba(0, 0, 0, 0.9) !important;
}

/* Override button colors */
#paymentProofLightbox button {
    background: rgba(255, 255, 255, 0.15) !important;
}

/* Override button hover */
#paymentProofLightbox button:hover {
    background: rgba(255, 255, 255, 0.25) !important;
}

/* Override text colors */
#paymentProofLightbox {
    color: #fff !important;
}
```

### Event Handling

The lightbox uses standard DOM events. You can listen for lightbox state changes:

```javascript
// Listen for lightbox opening (you'd need to modify the component)
// Currently: components don't emit events, but you can add them

// Example of extending for custom events:
const originalShow = PaymentProofLightbox.show;
PaymentProofLightbox.show = function(imageUrl, fileName, uploadDate, orderId) {
    // Custom logic before opening
    window.dispatchEvent(new CustomEvent('lightbox-opened', {
        detail: { imageUrl, fileName, uploadDate, orderId }
    }));
    
    // Call original show
    return originalShow.call(this, imageUrl, fileName, uploadDate, orderId);
};
```

### Browser Support

```javascript
// Check if lightbox will work
const isSupported = () => {
  return (
    typeof fetch !== 'undefined' &&           // Fetch API
    typeof Promise !== 'undefined' &&         // Promises
    'ontouchstart' in window ||               // Touch support
    navigator.maxTouchPoints > 0              // Modern touch detection
  );
};

if (isSupported()) {
  // Safe to use lightbox
  PaymentProofLightbox.show(url, name, date, id);
}
```

### Integration with Order Detail Modal

The lightbox is pre-integrated with `OrderDetailModal`:

```javascript
// Already configured in orderDetailModal.js
// When user clicks "View Full Size" or the thumbnail:
PaymentProofLightbox.show(
  order.paymentProof.fileUrl,
  order.paymentProof.fileName,
  order.paymentProof.uploadedAt,
  order.orderId  // <-- This is automatically passed
);
```

### State Management

The lightbox maintains the following state:

```javascript
// Internal state (cannot be directly accessed)
{
  currentImageUrl: '',          // Currently displayed image URL
  currentFileName: '',          // Display name
  currentUploadDate: '',        // Upload date
  currentOrderId: '',           // Order ID
  currentZoom: 100,             // 10-500
  currentRotation: 0,           // 0, 90, 180, 270 (degrees)
  isDragging: false,            // Pan in progress?
  panX: 0,                      // Horizontal pan offset (pixels)
  panY: 0,                      // Vertical pan offset (pixels)
  dragStartX: 0,                // Mouse/touch drag start X
  dragStartY: 0                 // Mouse/touch drag start Y
}
```

To read state, you'd need to extend the component or use browser dev tools to inspect the DOM.

### Advanced Usage: Custom Controls

Add custom controls to the lightbox:

```javascript
// Extend the lightbox (after including the script)
const OriginalPaymentProofLightbox = PaymentProofLightbox;

// Create wrapper with additional features
window.PaymentProofLightbox = {
  ...OriginalPaymentProofLightbox,
  
  showWithCustomControls: function(imageUrl, fileName, uploadDate, orderId, customControls) {
    // Open the original lightbox
    OriginalPaymentProofLightbox.show(imageUrl, fileName, uploadDate, orderId);
    
    // Add custom controls to footer
    const footer = document.querySelector('#paymentProofLightbox > div:last-child');
    if (footer && customControls) {
      const customContainer = document.createElement('div');
      customContainer.innerHTML = customControls;
      footer.appendChild(customContainer);
    }
  }
};

// Usage
PaymentProofLightbox.showWithCustomControls(
  url, 
  name, 
  date, 
  orderId,
  '<button onclick="alert(\'Custom button clicked!\')">Custom</button>'
);
```

### Performance Tips

1. **Image Optimization**: Ensure images are optimized (compressed JPEG/PNG)
2. **Lazy Loading**: Don't pre-load images, only load when lightbox opens
3. **Cache Busting**: Add timestamp to image URLs if needed: `image.jpg?v=timestamp`
4. **CDN Usage**: Serve images from CDN for faster delivery
5. **Progressive Enhancement**: Works without JavaScript (fallback needed)

### Common Patterns

#### Pattern 1: Gallery Navigation
```javascript
const payments = [
  { url: 'img1.jpg', name: 'Payment1', date: '2024-01-15', id: 'ORD-1' },
  { url: 'img2.jpg', name: 'Payment2', date: '2024-01-16', id: 'ORD-2' }
];

let currentIndex = 0;

function showPayment(index) {
  const payment = payments[index];
  PaymentProofLightbox.show(
    payment.url,
    payment.name,
    payment.date,
    payment.id
  );
}

showPayment(0);
```

#### Pattern 2: Error Handling
```javascript
async function showPaymentSafely(orderId) {
  try {
    const response = await fetch(`/api/payment/${orderId}`);
    const payment = await response.json();
    
    PaymentProofLightbox.show(
      payment.fileUrl,
      payment.fileName,
      payment.uploadedAt,
      orderId
    );
  } catch (error) {
    console.error('Failed to load payment proof:', error);
    Toast.error('Failed to load payment proof');
  }
}
```

#### Pattern 3: Programmatic Control
```javascript
// Store reference for programmatic control
let isLightboxOpen = false;

const OriginalShow = PaymentProofLightbox.show;
PaymentProofLightbox.show = function(...args) {
  isLightboxOpen = true;
  return OriginalShow.apply(this, args);
};

const OriginalClose = PaymentProofLightbox.closeLightbox;
PaymentProofLightbox.closeLightbox = function(...args) {
  isLightboxOpen = false;
  return OriginalClose.apply(this, args);
};

// Usage
if (!isLightboxOpen) {
  PaymentProofLightbox.show(url, name, date, id);
}
```

---

## Troubleshooting

### Lightbox Won't Open
- Check browser console for errors
- Verify image URL is accessible
- Ensure script is loaded before calling show()
- Check CORS headers if image is from different domain

### Image Not Displaying
- Verify image URL is correct
- Check CORS policy
- Ensure image format is supported (JPG, PNG, WebP, GIF)
- Check browser console for 404 or CORS errors

### Zoom Not Working
- Zoom only works on images > 100%
- Check browser console for JavaScript errors
- Verify mouse wheel and buttons are clickable

### Pan Not Working
- Pan only works when zoomed > 100%
- Ensure you're clicking and dragging on the image, not the background
- On touch devices, ensure you're using one finger

### Download Not Working
- Check browser console for errors
- Verify download permissions in browser
- Check if image is CORS-enabled for download
- Some browsers block downloads from data URIs

### Keyboard Shortcuts Not Working
- Ensure lightbox is active (click on it)
- Some keyboard shortcuts may be intercepted by other code
- Check if caps lock affects alphanumeric keys

---

## Contributing & Maintenance

### Code Structure
```
paymentProofLightbox.js (534 lines)
├── Module Pattern (IIFE)
├── State Variables
├── Configuration Constants
├── Public Methods
│   ├── show()
│   └── closeLightbox()
├── Private Methods
│   ├── createLightbox()
│   ├── updateImageTransform()
│   ├── zoomIn/Out()
│   ├── rotateLeft/Right()
│   ├── startDrag/endDrag()
│   ├── downloadImage()
│   └── handleKeyboard()
└── Export Return Object
```

### Adding New Features

1. **Add new control button**:
   ```javascript
   const newBtn = createControlButton('Label', () => customAction());
   footer.appendChild(newBtn);
   ```

2. **Add new keyboard shortcut**:
   ```javascript
   case 'x':
     customAction();
     break;
   ```

3. **Add new transformation**:
   ```javascript
   // Add state variable
   let customTransform = 0;
   
   // Add method
   const applyCustomTransform = (value) => {
     customTransform = value;
     updateImageTransform();
   };
   
   // Update transform calculation
   img.style.transform = `... customTransform ...`;
   ```

---

## Version & Compatibility

- **Version**: 1.0
- **Created**: January 2024
- **Compatible Browsers**: Chrome, Firefox, Safari, Edge (latest)
- **Mobile Support**: iOS Safari, Chrome Mobile, Firefox Mobile
- **Requires**: Bootstrap 5.3.0, Bootstrap Icons 1.11.0

