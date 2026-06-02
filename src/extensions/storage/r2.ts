// Cloudflare R2 Storage - S3-compatible, free egress
// Uses @aws-sdk/client-s3 for proper AWS Signature V4

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { siteConfig } from '@/config';

function getS3Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${siteConfig.r2_account_id}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: siteConfig.r2_access_key_id,
      secretAccessKey: siteConfig.r2_secret_access_key,
    },
  });
}

export async function uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: siteConfig.r2_bucket_name,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return { key, url: getFileUrl(key) };
}

export function getFileUrl(key: string): string {
  // Custom domain for R2 (if configured)
  return `https://files.bigsea78.top/${key}`;
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: siteConfig.r2_bucket_name,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function uploadProductFile(productId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const key = `products/${productId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(key, buffer, file.type);
  return key;
}
