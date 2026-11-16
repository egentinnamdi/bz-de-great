/**
 * Client-side photo compression helper tailored for mobile field uploads
 * at car stands and property sites on 3G/4G mobile networks.
 */

export interface CompressedPhotoResult {
  blob: Blob;
  filename: string;
  originalBytes: number;
  compressedBytes: number;
  usedCompression: boolean;
}

export async function compressImageForUpload(
  file: File,
  maxDimension = 1400,
  quality = 0.8
): Promise<CompressedPhotoResult> {
  const safeBaseName = (file.name || 'photo').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');

  if (typeof window === 'undefined' || typeof document === 'undefined' || !file.type.startsWith('image/')) {
    return {
      blob: file,
      filename: file.name || `${safeBaseName}.jpg`,
      originalBytes: file.size,
      compressedBytes: file.size,
      usedCompression: false,
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          URL.revokeObjectURL(objectUrl);
          resolve({
            blob: file,
            filename: file.name,
            originalBytes: file.size,
            compressedBytes: file.size,
            usedCompression: false,
          });
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({
            blob: file,
            filename: file.name,
            originalBytes: file.size,
            compressedBytes: file.size,
            usedCompression: false,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (compressedBlob) => {
            URL.revokeObjectURL(objectUrl);
            if (!compressedBlob || compressedBlob.size >= file.size) {
              resolve({
                blob: file,
                filename: file.name,
                originalBytes: file.size,
                compressedBytes: file.size,
                usedCompression: false,
              });
              return;
            }
            resolve({
              blob: compressedBlob,
              filename: `${safeBaseName}.jpg`,
              originalBytes: file.size,
              compressedBytes: compressedBlob.size,
              usedCompression: true,
            });
          },
          'image/jpeg',
          quality
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve({
          blob: file,
          filename: file.name,
          originalBytes: file.size,
          compressedBytes: file.size,
          usedCompression: false,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        blob: file,
        filename: file.name,
        originalBytes: file.size,
        compressedBytes: file.size,
        usedCompression: false,
      });
    };

    img.src = objectUrl;
  });
}

export function formatBytesCompact(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
