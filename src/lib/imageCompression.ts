/**
 * Client-side image compression utility
 * Resizes and optimizes images before network transmission or storage
 * Prevents Vercel 4.5MB payload limit errors and ensures rapid uploads on mobile networks.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: string; // 'image/jpeg' | 'image/webp' | 'image/png'
}

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  file: File;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  // If already an SVG, return as is since vector images do not need pixel rasterization
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          blob: file,
          dataUrl,
          file,
          width: 0,
          height: 0,
          originalSize: file.size,
          compressedSize: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions while strictly preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Apply smooth bilinear image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background with white for transparent PNGs converted to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed image blob'));
              return;
            }

            const cleanExt = mimeType === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}_optimized${cleanExt}`, {
              type: mimeType,
              lastModified: Date.now(),
            });

            resolve({
              blob,
              dataUrl,
              file: compressedFile,
              width,
              height,
              originalSize: file.size,
              compressedSize: blob.size,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to read image file. Please check that the file is a valid picture.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Could not open the selected file.'));
    };
  });
}
