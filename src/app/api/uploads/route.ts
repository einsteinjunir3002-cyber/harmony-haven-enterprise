import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowable limit of 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate collision-proof randomized filename
    const ext = path.extname(file.name) || '.jpg';
    const randomHash = crypto.randomBytes(12).toString('hex');
    const safeFilename = `${Date.now()}_${randomHash}${ext}`;

    const publicUploadDir = path.join(process.cwd(), 'public', 'uploads');
    const sunflowerUploadDir = path.join(process.cwd(), 'Sunflower Media', 'uploads');

    if (!fs.existsSync(publicUploadDir)) {
      fs.mkdirSync(publicUploadDir, { recursive: true });
    }
    if (!fs.existsSync(sunflowerUploadDir)) {
      fs.mkdirSync(sunflowerUploadDir, { recursive: true });
    }

    // Save in public uploads for immediate web serving
    const publicFilePath = path.join(publicUploadDir, safeFilename);
    fs.writeFileSync(publicFilePath, buffer);

    // Also mirror to central Sunflower Media repository
    const sunflowerFilePath = path.join(sunflowerUploadDir, safeFilename);
    fs.writeFileSync(sunflowerFilePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
