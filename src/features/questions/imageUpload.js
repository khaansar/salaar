import { questionsApi } from '@/services/adminService';

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates and uploads one question image through a signed upload intent.
 * Resolves to `{ url, publicId }`; throws an Error with a user-facing message.
 */
export async function uploadQuestionImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: use JPEG, PNG, WebP, or GIF.`);
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error(`${file.name}: maximum size is 10 MB.`);
  }

  const intent = await questionsApi.createImageUploadIntent();

  if (
    !intent?.uploadUrl ||
    !intent?.apiKey ||
    !intent?.signature ||
    !intent?.publicId ||
    !intent?.timestamp
  ) {
    throw new Error('The image upload intent response is incomplete.');
  }

  const body = new FormData();

  for (const [key, value] of Object.entries(intent.uploadParameters || {})) {
    if (value != null) body.append(key, String(value));
  }

  body.set('file', file);
  body.set('api_key', intent.apiKey);
  body.set('timestamp', String(intent.timestamp));
  body.set('signature', intent.signature);
  body.set('public_id', intent.publicId);

  if (intent.assetFolder) {
    body.set('asset_folder', intent.assetFolder);
  }

  const response = await fetch(intent.uploadUrl, {
    method: 'POST',
    body,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result?.error?.message || `Cloudinary upload failed for ${file.name}.`);
  }

  return { url: result.secure_url, publicId: result.public_id };
}
