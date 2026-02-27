import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { secret, tag, path } = body;

        if (!secret || secret !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json(
                { error: 'Invalid or missing secret' },
                { status: 401 }
            );
        }

        const revalidated: string[] = [];

        if (tag) {
            revalidateTag(tag, 'everything');
            revalidated.push(`tag:${tag}`);
        }

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
            { error: 'Error revalidating', message: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Revalidation API is running',
        usage: 'POST with { secret, tag?, path? }',
    });
}