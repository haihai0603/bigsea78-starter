// Email verification service using Resend API
import { siteConfig } from '@/config';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_csVoXT6G_9XCavEoi1FJWEoB1MzD7tWWY';
const FROM_EMAIL = 'noreply@bigsea78.top';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();
    return res.ok && data.id;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export function sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean> {
  const baseUrl = siteConfig.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://bigsea78.top';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: '验证您的邮箱 - BigSea78',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">您好，${name || '用户'}！</h2>
        <p style="color: #666; line-height: 1.6;">
          感谢您注册 BigSea78。请点击下方按钮验证您的邮箱地址：
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            验证邮箱
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          如果按钮无法点击，请复制以下链接到浏览器：<br>
          <a href="${verifyUrl}" style="color: #0070f3; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `,
  });
}
