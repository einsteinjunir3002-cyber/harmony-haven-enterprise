import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth('STAFF');

    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { title, originalName, url, category, brandId, mimeType, size } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required.' }, { status: 400 });
    }

    const isVideo = mimeType?.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp|ts)$/i.test(url);
    const resolvedCategory = category || (isVideo ? 'VIDEOS' : 'UPLOADS');

    const item = await prisma.media.create({
      data: {
        title: title.trim(),
        originalName: (originalName || title).trim(),
        url,
        category: resolvedCategory,
        mimeType: mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
        size: size || 0,
        brandId: brandId || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        action: 'UPLOAD_MEDIA',
        entity: 'Media',
        entityId: item.id,
        newStateJson: JSON.stringify(item),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save media item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    if (!id && !url) {
      return NextResponse.json({ error: 'Media ID or URL is required.' }, { status: 400 });
    }

    const item = await prisma.media.findFirst({
      where: {
        OR: [{ id: id || undefined }, { url: url || undefined }],
      },
    });

    if (item) {
      await prisma.media.delete({ where: { id: item.id } });
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'DELETE_MEDIA',
          entity: 'Media',
          entityId: item.id,
          previousStateJson: JSON.stringify(item),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Media removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}
