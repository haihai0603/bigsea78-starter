// Download API route
// GET: handle file downloads with token or product_id
// For large files (OSS URLs), uses 302 redirect instead of proxying

import { NextRequest, NextResponse } from 'next/server';
import {
  getDownloadByToken,
  incrementDownloadCount,
  getProductById,
} from '@/core/db/queries';
import { getOrderByNo } from '@/core/db/queries';
import { getCurrentUser } from '@/core/auth';
import { respErr } from '@/shared/lib/resp';
import { siteConfig } from '@/config';

// Use node runtime for large file handling (edge has 30s timeout)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const productId = searchParams.get('product_id');

    if (token) {
      return await handleTokenDownload(token);
    }

    if (productId) {
      const user = await getCurrentUser(request);
      return await handleFreeDownload(productId, user, request);
    }

    return respErr('Missing required parameters: token or product_id', 400);
  } catch (error: any) {
    console.error('Download error:', error);
    return respErr(error.message || 'Download failed', 500);
  }
}

async function handleTokenDownload(token: string): Promise<NextResponse> {
  const download = await getDownloadByToken(token);
  
  if (!download) {
    return NextResponse.json({ error: '下载链接无效或已过期' }, { status: 403 });
  }

  if (new Date(download.expiresAt) < new Date()) {
    return NextResponse.json({ error: '下载链接无效或已过期' }, { status: 403 });
  }

  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.json({ error: '下载次数已达上限' }, { status: 403 });
  }

  const order = await getOrderByNo(download.orderId);
  if (!order) {
    return respErr('Order not found', 404);
  }

  const product = await getProductById(order.productId);
  if (!product || !product.downloadUrl) {
    return respErr('Product download not available', 404);
  }

  await incrementDownloadCount(token);

  // For HTTP URLs (OSS), redirect directly
  if (product.downloadUrl.startsWith('http')) {
    return NextResponse.redirect(product.downloadUrl);
  }

  return await streamFile(product.downloadUrl, product.name);
}

async function handleFreeDownload(
  productId: string,
  user: any,
  request: NextRequest
): Promise<NextResponse> {
  const product = await getProductById(productId);
  if (!product) {
    return respErr('Product not found', 404);
  }

  if (product.price > 0) {
    return respErr('This product requires payment', 402);
  }

  if (!user) {
    const callbackUrl = `/api/download?product_id=${productId}`;
    return NextResponse.redirect(
      new URL(`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
    );
  }

  if (!product.downloadUrl) {
    return respErr('Product download not available', 404);
  }

  // For HTTP URLs (OSS), redirect directly
  if (product.downloadUrl.startsWith('http')) {
    return NextResponse.redirect(product.downloadUrl);
  }

  return await streamFile(product.downloadUrl, product.name);
}

async function streamFile(
  downloadUrl: string,
  filename: string
): Promise<NextResponse> {
  if (downloadUrl.startsWith('http')) {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return respErr('Failed to fetch file', 500);
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const fileStream = response.body;
    if (!fileStream) {
      return respErr('Failed to read file stream', 500);
    }
    return new NextResponse(fileStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  }

  // R2/local path
  try {
    const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3');
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${siteConfig.r2_account_id}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: siteConfig.r2_access_key_id,
        secretAccessKey: siteConfig.r2_secret_access_key,
      },
    });
    const command = new GetObjectCommand({
      Bucket: siteConfig.r2_bucket_name,
      Key: downloadUrl,
    });
    const response = await s3Client.send(command);
    if (!response.Body) {
      return respErr('File not found in storage', 404);
    }
    const stream = response.Body as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': response.ContentLength?.toString() || '',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('R2 download error:', error);
    return respErr('Failed to download file from storage', 500);
  }
}
