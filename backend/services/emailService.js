const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer
 * Sends confirmation and notification emails
 */

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'muhammadabid5067hgg@gmail.com',
    pass: process.env.GMAIL_PASSWORD // App password from Gmail
  }
});

/**
 * Send confirmation email to customer
 */
async function sendConfirmationEmail(customerEmail, customerName, referenceNumber) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || 'muhammadabid5067hgg@gmail.com',
      to: customerEmail,
      subject: '✅ We have received your message - Takanj Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ea4335 0%, #fbbc04 25%, #34a853 50%, #4285f4 75%, #ea4335 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">📧 Support Request Received</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd;">
            <h2>Hello ${customerName},</h2>
            
            <p>Thank you for contacting <strong>Takanj</strong> support!</p>
            
            <p>We have successfully received your support request and our team will review it shortly.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #ea4335; margin: 20px 0;">
              <p><strong>Reference Number:</strong> <span style="color: #ea4335; font-size: 18px; font-weight: bold;">${referenceNumber}</span></p>
              <p><strong>Submitted on:</strong> ${new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul style="line-height: 1.8;">
              <li>We will review your message within 24 hours</li>
              <li>Our support team will respond via email to: <strong>${customerEmail}</strong></li>
              <li>Keep your reference number for tracking: <strong>${referenceNumber}</strong></li>
            </ul>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you have any urgent issues, please contact us via WhatsApp: 
              <a href="https://wa.me/923704969460" style="color: #25d366; text-decoration: none; font-weight: bold;">+92 370 496 9460</a>
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f0f0f0; font-size: 12px; color: #666;">
            <p style="margin: 0;">© 2026 Takanj. All rights reserved.<br>
            <a href="https://takanj.com" style="color: #ea4335; text-decoration: none;">Visit our website</a></p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to:', customerEmail);
    return { success: true, message: 'Email sent successfully' };

  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send notification email to admin
 */
async function sendAdminNotification(supportRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'muhammadabid5067hgg@gmail.com';
    
    const mailOptions = {
      from: process.env.GMAIL_USER || 'muhammadabid5067hgg@gmail.com',
      to: adminEmail,
      subject: `🔔 New Support Request - ${supportRequest.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ea4335; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">🔔 New Support Request</h1>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #ddd;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; width: 30%; background: #f5f5f5;">Name:</td>
                <td style="padding: 10px;">${supportRequest.full_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Email:</td>
                <td style="padding: 10px;">
                  <a href="mailto:${supportRequest.email}" style="color: #ea4335; text-decoration: none;">
                    ${supportRequest.email}
                  </a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Phone:</td>
                <td style="padding: 10px;">${supportRequest.phone || 'Not provided'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Subject:</td>
                <td style="padding: 10px;">${supportRequest.subject}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Order Number:</td>
                <td style="padding: 10px;">${supportRequest.order_number || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold; background: #f5f5f5;">Reference:</td>
                <td style="padding: 10px; color: #ea4335; font-weight: bold;">
                  TKJ-${String(supportRequest.id).substring(0, 6).toUpperCase()}
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #ea4335;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; white-space: pre-wrap;">${supportRequest.message}</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="http://localhost:5000/admin/support/${supportRequest.id}" 
                 style="display: inline-block; background: #ea4335; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Full Request
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');
    return { success: true, message: 'Notification sent to admin' };

  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send reply email to customer
 */
async function sendReplyEmail(customerEmail, customerName, replyMessage, referenceNumber) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || 'muhammadabid5067hgg@gmail.com',
      to: customerEmail,
      subject: `📧 We replied to your support request - ${referenceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #34a853; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">✅ Support Response</h1>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #ddd;">
            <h2>Hello ${customerName},</h2>
            
            <p>Our support team has replied to your request!</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #34a853; margin: 20px 0;">
              <p><strong>Reference Number:</strong> <span style="color: #34a853;">${referenceNumber}</span></p>
            </div>
            
            <div style="background: white; padding: 15px; border: 1px solid #ddd; margin: 20px 0;">
              <h3>Response:</h3>
              <p style="line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Thank you for choosing Takanj!
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reply email sent to:', customerEmail);
    return { success: true, message: 'Reply sent successfully' };

  } catch (error) {
    console.error('❌ Error sending reply email:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendConfirmationEmail,
  sendAdminNotification,
  sendReplyEmail
};
