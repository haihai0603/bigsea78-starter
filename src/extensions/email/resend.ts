// Email service using Resend
// Free tier: 100 emails/day

import { siteConfig } from '@/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!siteConfig.resend_api_key) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + siteConfig.resend_api_key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: siteConfig.email_from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }

  return response.json();
}

// Pre-built email templates
export function orderConfirmationEmail(data: {
  productName: string;
  orderNo: string;
  downloadUrl: string;
  amount: number;
  currency: string;
}) {
  const sym = data.currency === 'cny' ? '\u00a5' : '$';
  const price = (data.amount / 100).toFixed(2);
  const subject = 'Order Confirmed - ' + data.productName;
  const html = [
    '<div style="max-width:600px;margin:0 auto;font-family:sans-serif">',
    '<h2>Order Confirmation</h2>',
    '<p>Thank you for your purchase!</p>',
    '<p>Product: ' + data.productName + '</p>',
    '<p>Order: ' + data.orderNo + '</p>',
    '<p>Amount: ' + sym + price + '</p>',
    '<p><a href="' + data.downloadUrl + '">Download Product</a></p>',
    '</div>',
  ].join('');
  return { subject, html };
}
