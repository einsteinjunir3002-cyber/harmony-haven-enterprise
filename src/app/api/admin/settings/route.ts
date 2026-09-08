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
    const {
      contentBlocks,
      deliveryZones,
      newDeliveryZones,
      deletedZoneIds,
    } = body;

    // 1. Update or create content blocks
    if (contentBlocks && Array.isArray(contentBlocks)) {
      for (const block of contentBlocks) {
        if (block.key) {
          await prisma.contentBlock.upsert({
            where: { key: block.key },
            update: {
              title: block.title,
              contentJson:
                typeof block.contentJson === 'string'
                  ? block.contentJson
                  : JSON.stringify(block.contentJson),
            },
            create: {
              key: block.key,
              title: block.title,
              section: block.section || 'general',
              contentJson:
                typeof block.contentJson === 'string'
                  ? block.contentJson
                  : JSON.stringify(block.contentJson),
            },
          });
        }
      }
    }

    // 2. Update existing delivery zones
    if (deliveryZones && Array.isArray(deliveryZones)) {
      for (const zone of deliveryZones) {
        if (zone.id) {
          await prisma.deliveryZone.update({
            where: { id: zone.id },
            data: {
              name: zone.name,
              region: zone.region,
              fee: parseFloat(zone.fee),
              estimatedTime: zone.estimatedTime,
              active: zone.active !== undefined ? Boolean(zone.active) : true,
            },
          });
        }
      }
    }

    // 3. Create new delivery zones if provided
    if (newDeliveryZones && Array.isArray(newDeliveryZones)) {
      for (const newZone of newDeliveryZones) {
        if (newZone.name && newZone.fee !== undefined) {
          await prisma.deliveryZone.create({
            data: {
              name: newZone.name.trim(),
              region: newZone.region ? newZone.region.trim() : 'Greater Accra',
              fee: parseFloat(newZone.fee),
              estimatedTime: newZone.estimatedTime || 'Same Day (2-4 hrs)',
              active: true,
            },
          });
        }
      }
    }

    // 4. Delete delivery zones if requested
    if (deletedZoneIds && Array.isArray(deletedZoneIds) && deletedZoneIds.length > 0) {
      await prisma.deliveryZone.deleteMany({
        where: { id: { in: deletedZoneIds } },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        action: 'UPDATE_ENTERPRISE_SETTINGS',
        entity: 'Setting',
        entityId: 'global',
      },
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (type === 'deliveryZone' && id) {
      await prisma.deliveryZone.delete({ where: { id } });
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'DELETE_DELIVERY_ZONE',
          entity: 'DeliveryZone',
          entityId: id,
        },
      });
      return NextResponse.json({ success: true, message: 'Delivery zone deleted' });
    }

    return NextResponse.json({ error: 'Invalid deletion parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
  }
}
