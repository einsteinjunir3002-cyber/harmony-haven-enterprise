import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Supported video extensions for any format
const VIDEO_EXTENSIONS = [
  '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv',
  '.wmv', '.m4v', '.3gp', '.ts', '.mts', '.m2ts', '.vob',
  '.ogv', '.qt', '.mpeg', '.mpg', '.asf', '.rm',
];

const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;  // 25MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const isVideo = file.type.startsWith('video/') || VIDEO_EXTENSIONS.includes(ext);
    const isImage = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
    const isPdf = file.type === 'application/pdf' || ext === '.pdf';

    if (!isVideo && !isImage && !isPdf) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload an image or video file.' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File size exceeds the allowable limit of ${maxMb}MB.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const mimeType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');

    // Generate collision-proof randomized filename preserving true extension
    const finalExt = ext || (isVideo ? '.mp4' : '.jpg');
    const randomHash = crypto.randomBytes(12).toString('hex');
    const safeFilename = `${Date.now()}_${randomHash}${finalExt}`;

    let publicUrl = `/uploads/${safeFilename}`;
    let diskSaved = false;

    // Attempt to persist to filesystem (works on local/persistent servers)
    try {
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
      diskSaved = true;
    } catch (fsErr: any) {
      // Serverless environments (like Vercel AWS Lambda) have read-only file systems
      console.warn('Filesystem write not supported in current environment, falling back to data URL:', fsErr?.message);
      diskSaved = false;
    }

    // If writing to disk failed (e.g. read-only serverless environment), return Data URL for instant rendering
    if (!diskSaved) {
      const base64Data = buffer.toString('base64');
      publicUrl = `data:${mimeType};base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      mimeType,
      isVideo,
      diskSaved,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file upload. Please select a smaller photo or retry.' },
      { status: 500 }
    );
  }
}
