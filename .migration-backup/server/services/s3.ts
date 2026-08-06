import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!S3_BUCKET || !AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
  console.warn('⚠️  AWS S3 credentials not configured. Image uploads will not work.');
  console.warn('   Required: AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
}

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY || '',
    secretAccessKey: AWS_SECRET_KEY || '',
  },
});

export interface PresignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  s3Key: string;
  expiresIn: number;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(mimeType: string, fileSize?: number): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export async function generatePresignedUploadUrl(
  folder: string,
  fileName: string,
  contentType: string
): Promise<PresignedUploadUrl> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }

  const validation = validateImageFile(contentType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileExtension = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const s3Key = `${folder}/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;

  return {
    uploadUrl,
    publicUrl,
    s3Key,
    expiresIn: 900,
  };
}

export async function deleteS3Object(s3Key: string): Promise<void> {
  if (!S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  });

  await s3Client.send(command);
}

export interface UploadMetadata {
  stylistId: string;
  contentType: string;
  fileName: string;
  fileSize?: number;
}

export async function generateStylistPortfolioUploadUrl(
  metadata: UploadMetadata
): Promise<PresignedUploadUrl> {
  const folder = `stylists/${metadata.stylistId}/portfolio`;
  return generatePresignedUploadUrl(folder, metadata.fileName, metadata.contentType);
}

export async function generateStylistAvatarUploadUrl(
  stylistId: string,
  fileName: string,
  contentType: string
): Promise<PresignedUploadUrl> {
  const folder = `stylists/${stylistId}/avatar`;
  return generatePresignedUploadUrl(folder, fileName, contentType);
}

export async function generateStylistCoverUploadUrl(
  stylistId: string,
  fileName: string,
  contentType: string
): Promise<PresignedUploadUrl> {
  const folder = `stylists/${stylistId}/cover`;
  return generatePresignedUploadUrl(folder, fileName, contentType);
}
