// Client-side image compression before upload

export interface CompressionOptions {
  maxWidthOrHeight: number;
  quality: number;
  mimeType: string;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1200,
  quality: 0.85,
  mimeType: "image/jpeg",
};

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const max = opts.maxWidthOrHeight;

      if (width > max || height > max) {
        if (width > height) {
          height = Math.round((height * max) / width);
          width = max;
        } else {
          width = Math.round((width * max) / height);
          height = max;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        opts.mimeType,
        opts.quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
