/**
 * WhatsApp Widget Global Initialization
 * Include this script in all pages that need the WhatsApp widget
 */

// Auto-initialize widget on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if whatsapp-widget.js has loaded
  if (typeof WhatsAppWidget !== 'undefined' && !window.whatsappWidget) {
    window.whatsappWidget = new WhatsAppWidget({
      businessPhone: '923156204745',
      businessName: 'Takanj',
      enableAnalytics: true,
      showOnlineStatus: true,
      workingHours: {
        enabled: false,
        startHour: 9,
        endHour: 18,
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    });
  }
});
