import { Resend } from 'resend';
// You will need to add RESEND_API_KEY to your .env.local
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || 're_mock_123';
export const resend = new Resend(resendApiKey);
export const sendOrderConfirmation = async (email, orderId, items, total, storeName = 'Boutique') => {
    try {
        // In actual production, you would use a verified domain.
        // For local dev, we use the mock behavior or log to console.
        if (resendApiKey === 're_mock_123') {
            console.log('MOCK EMAIL SENDING:', {
                to: email,
                subject: `Order Confirmation - #${orderId}`,
                itemsCount: items.length,
                total: total
            });
            return { success: true };
        }
        const { data, error } = await resend.emails.send({
            from: `${storeName} <orders@your-store.com>`,
            to: [email],
            subject: `Your ${storeName} Order #${orderId} is Confirmed!`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="border-bottom: 2px solid #000; padding-bottom: 10px;">${storeName.toUpperCase()}</h1>
          <h2>Thanks for your purchase!</h2>
          <p>We're getting your order ready for shipment. Your order number is <strong>${orderId}</strong>.</p>
          <hr />
          <p><strong>Order Summary:</strong></p>
          <ul>
            ${items.map(item => `<li>${item.product.name} - ${item.size}/${item.color} x ${item.quantity}</li>`).join('')}
          </ul>
          <p><strong>Total: $${total.toFixed(2)}</strong></p>
          <hr />
          <p>You can track your order status in your ${storeName} profile.</p>
          <p style="color: #666; font-size: 12px;">This is an automated message. No need to reply.</p>
        </div>
      `,
        });
        if (error)
            throw error;
        return { success: true, data };
    }
    catch (err) {
        console.error('Email failed to send:', err);
        return { success: false, error: err };
    }
};
