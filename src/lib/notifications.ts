import { API_BASE_URL, APP_URL } from '../config/api';

export const NotificationService = {
  sendEmail: async (to: string, subject: string, body: string, attachment?: any, details?: { serviceType: string, date: string, providerName: string, amount: string, orderId: string }) => {
    console.log(`[EMAIL DISPATCHED] To: ${to} | Subject: ${subject}`);
    
    try {
      let finalAttachment = null;
      if (attachment) {
        if (attachment instanceof Blob) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => { resolve((reader.result as string).split(',')[1]); };
          });
          reader.readAsDataURL(attachment);
          const base64Content = await base64Promise;
          finalAttachment = { filename: `Receipt_${details?.orderId || Date.now()}.pdf`, content: base64Content, contentType: 'application/pdf' };
        } else {
          finalAttachment = attachment;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: `
            <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 50px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.05em;">CARE AT EASE</h1>
                  <p style="color: rgba(255, 255, 255, 0.8); margin-top: 10px; font-size: 16px; font-weight: 500;">Your Wellness, Our Priority</p>
                </div>
                
                <div style="padding: 40px;">
                  <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0;">Booking Confirmed</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                    Hi there, your appointment has been successfully scheduled and paid. Here are your booking details:
                  </p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Service</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">${details?.serviceType || 'Healthcare Service'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Professional</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">${details?.providerName || 'Assigned Professional'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Scheduled For</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: 700; text-align: right;">${details?.date || 'As Scheduled'}</td>
                      </tr>
                      <tr><td colspan="2"><hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;"></td></tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Amount Paid</td>
                        <td style="padding: 8px 0; color: #4f46e5; font-size: 20px; font-weight: 800; text-align: right;">${details?.amount || 'Paid'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 12px;">Order ID</td>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; font-weight: 500; text-align: right;">#${details?.orderId || 'N/A'}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align: center;">
                    <a href="${APP_URL}/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 18px 36px; font-weight: 700; text-decoration: none; border-radius: 14px; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">
                      Track Your Appointment
                    </a>
                  </div>
                </div>
                
                <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 600;">CARE AT EASE – Healthcare Delivered</p>
                  <p style="font-size: 12px; color: #94a3b8; margin-top: 10px; line-height: 1.5;">
                    This receipt is for your records. A PDF version is attached to this email.<br>
                    Need help? Contact us at support@careatease.com
                  </p>
                </div>
              </div>
            </div>
          `,
          attachments: finalAttachment ? [finalAttachment] : []
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('[SMTP] Success: Real email sent via Backend!');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('[SMTP] Error:', err);
    }

    if (attachment) console.log(`[ATTACHMENT] PDF Receipt successfully generated.`);
    
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('app-notification', {
          detail: { type: 'email', message: `Email sent to ${to}: ${subject}` }
        });
        window.dispatchEvent(event);
      }
    } catch (e) {}
  },

  sendSMS: (phone: string, message: string) => {
    console.log(`[SMS DISPATCHED] To: ${phone} | Message: ${message}`);
    // In a real app, this would hit Twilio/SNS via a backend queue.
    try {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('app-notification', {
          detail: { type: 'sms', message: `SMS sent to ${phone}` }
        });
        window.dispatchEvent(event);
      }
    } catch (e) {}
  }
};
