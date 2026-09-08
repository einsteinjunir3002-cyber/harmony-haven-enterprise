import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const [contentBlocks, settings, deliveryZones] = await Promise.all([
      prisma.contentBlock.findMany(),
      prisma.setting.findMany(),
      prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } }),
    ]);

    return NextResponse.json({ contentBlocks, settings, deliveryZones });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const body = await request.json();
    const { contentBlocks, deliveryZones } = body;

    if (contentBlocks && Array.isArray(contentBlocks)) {
      for (const block of contentBlocks) {
        if (block.key) {
          await prisma.contentBlock.upsert({
            where: { key: block.key },
            update: {
              title: block.title,
              contentJson: typeof block.contentJson === 'string' ? block.contentJson : JSON.stringify(block.contentJson),
            },
            create: {
              key: block.key,
              title: block.title,
              section: block.section || 'general',
              contentJson: typeof block.contentJson === 'string' ? block.contentJson : JSON.stringify(block.contentJson),
            },
          });
        }
      }
    }

    if (deliveryZones && Array.isArray(deliveryZones)) {
      for (const zone of deliveryZones) {
        if (zone.id) {
          await prisma.deliveryZone.update({
            where: { id: zone.id },
            data: {
              fee: parseFloat(zone.fee),
              estimatedTime: zone.estimatedTime,
              active: Boolean(zone.active),
            },
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        action: 'UPDATE_CMS_SETTINGS',
        entity: 'Setting',
        entityId: 'global',
      },
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
