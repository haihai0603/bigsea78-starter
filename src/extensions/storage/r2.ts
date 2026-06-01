// Cloudflare R2 Storage - S3-compatible, free egress

import { siteConfig } from '@/config';

// R2 uses S3 API, we call it via fetch for zero dependencies
const R2_BASE = 'https://{account_id}.r2.cloudflarestorage.com';

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  // Minimal S3 PutObject via fetch
  // For production, use @aws-sdk/client-s3
  const url = R2_BASE.replace('{account_id}', siteConfig.r2_account_id) + '/' + siteConfig.r2_bucket_name + '/' + key;

  // TODO: implement proper AWS Signature V4 signing
  // For now, use presigned URLs from your backend
  console.log('Upload to R2:', url, 'contentType:', contentType);
  return { key, url };
}

export function getFileUrl(key: string): string {
  // If using custom domain for R2
  return 'https://files.bigsea78.top/' + key;
}

export async function generateDownloadToken(fileUrl: string, expiresIn = 3600): Promise<string> {
  // Generate a time-limited download URL
  // In production, use R2 presigned URLs
  const token = crypto.randomUUID();
  return token;
}
