import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { categoryService } from '@/lib/services/categoryService';
import { productService } from '@/lib/services/productService';
import { clientService } from '@/lib/services/clientService';
import { projectService } from '@/lib/services/projectService';

/**
 * On-demand Revalidation API
 * 
 * Usage:
 * POST /api/revalidate
 * Body: { secret: "your-secret", tag?: "categories|products|clients|projects", path?: "/some-path" }
 * 
 * Example:
 * curl -X POST http://localhost:3000/api/revalidate \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret":"your-secret","tag":"products"}'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tag, path } = body;

    // Verify secret
    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid or missing secret' },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag, 'max');
      revalidated.push(`tag:${tag}`);

      // Also invalidate memory cache for the corresponding service
      switch (tag) {
        case 'categories':
          categoryService.invalidateCache();
          break;
        case 'products':
          productService.invalidateCache();
          break;
        case 'clients':
          clientService.invalidateCache();
          break;
        case 'projects':
          projectService.invalidateCache();
          break;
        default:
          console.warn(`[Revalidation] Unknown tag: ${tag}`);
      }
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      revalidated.push(`path:${path}`);
    }

    if (revalidated.length === 0) {
      return NextResponse.json(
        { error: 'No tag or path specified' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      revalidated: true,
      items: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidation] Error:', error);
    return NextResponse.json(
      {
        error: 'Error revalidating',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({
    message: 'Revalidation API is running',
    usage: 'POST with { secret, tag?, path? }',
  });
}
