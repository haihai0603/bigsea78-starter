// Download API route
// GET: handle file downloads with token or product_id

import { NextRequest, NextResponse } from 'next/server';
import {
  getDownloadByToken,
  incrementDownloadCount,
  getProductById,
} from '@/core/db/queries';
import { getOrderByNo } from '@/core/db/queries';
import { respErr } from '@/shared/lib/resp';
import { siteConfig } from '@/config';

// Runtime: edge for better performance
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET handler for downloads
 * Query parameters:
 * - token: download token (from paid orders)
 * - product_id: for free products
 * - user: user ID for free products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const productId = searchParams.get('product_id');
    const userId = searchParams.get('user');

    // Case 1: Token-based download (paid orders)
    if (token) {
      return await handleTokenDownload(token);
    }

    // Case 2: Free product download
    if (productId) {
      return await handleFreeDownload(productId, userId, request);
    }

    return respErr('Missing required parameters: token or product_id', 400);
  } catch (error: any) {
    console.error('Download error:', error);
    return respErr(error.message || 'Download failed', 500);
  }
}

/**
 * Handle token-based download (paid orders)
 */
async function handleTokenDownload(token: string): Promise<NextResponse> {
  // Get download record by token
  const download = await getDownloadByToken(token);
  
  if (!download) {
    return NextResponse.json(
      { error: '下载链接无效或已过期' },
      { status: 403 }
    );
  }

  // Check if download has expired
  if (new Date(download.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: '下载链接无效或已过期' },
      { status: 403 }
    );
  }

  // Check download count
  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.json(
      { error: '下载次数已达上限' },
      { status: 403 }
    );
  }

  // Get order to find product
  const order = await getOrderByNo(download.orderId);
  if (!order) {
    return respErr('Order not found', 404);
  }

  // Get product to find download URL
  const product = await getProductById(order.productId);
  if (!product || !product.downloadUrl) {
    return respErr('Product download not available', 404);
  }

  // Increment download count
  await incrementDownloadCount(token);

  // Return file stream
  return await streamFile(product.downloadUrl, product.name);
}

/**
 * Handle free product download
 * For free products, user needs to sign up first
 */
async function handleFreeDownload(
  productId: string,
  userId: string | null,
  request: NextRequest
): Promise<NextResponse> {
  // Get product
  const product = await getProductById(productId);
  if (!product) {
    return respErr('Product not found', 404);
  }

  // Check if product is free
  if (product.price > 0) {
    return respErr('This product requires payment', 402);
  }

  // For free products, user should be logged in
  if (!userId) {
    // Redirect to sign up with callback
    const callbackUrl = `/api/download?product_id=${productId}`;
    return NextResponse.redirect(
      new URL(`/api/auth/sign-up/email?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
    );
  }

  if (!product.downloadUrl) {
    return respErr('Product download not available', 404);
  }

  // Return file stream for free product
  return await streamFile(product.downloadUrl, product.name);
}

/**
 * Stream file from R2 or local path
 * Uses AWS SDK for R2 or direct response for local files
 */
async function streamFile(
  downloadUrl: string,
  filename: string
): Promise<NextResponse> {
  // Check if it's an R2 URL or local path
  if (downloadUrl.startsWith('http')) {
    // For R2 or external URLs, proxy the file
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      return respErr('Failed to fetch file', 500);
    }

    // Get content type and stream
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const fileStream = response.body;

    if (!fileStream) {
      return respErr('Failed to read file stream', 500);
    }

    // Return stream with appropriate headers
    return new NextResponse(fileStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } else {
    // For local files, read from R2 using AWS SDK
    // This assumes downloadUrl is an R2 key
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

      // Convert ReadableStream to Node.js stream
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
}
