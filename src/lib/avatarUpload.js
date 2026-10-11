import axios from 'axios';
import apiClient from '@/lib/apiClient';

export const uploadAvatar = async (file) => {
  if (!(file instanceof File)) {
    throw new Error('Please select an image file.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error('Image size must not exceed 5 MB.');
  }

  // Ask Baahubali for a signed Cloudinary upload intent.
  const intent = await apiClient.post('/auth-api/users/me/avatar/upload-intent');

  const uploadUrl = intent?.uploadUrl;
  const uploadParameters = intent?.uploadParameters;

  if (!uploadUrl || !intent?.apiKey || !uploadParameters || !intent?.signature) {
    throw new Error('The server returned an incomplete upload intent.');
  }

  // Upload the image directly to Cloudinary. Never send the API secret here.
  const formData = new FormData();

  Object.entries(uploadParameters).forEach(([key, value]) => {
    formData.append(key, String(value));
  });


  formData.set('api_key', intent.apiKey);
  formData.set('signature', intent.signature);
  formData.set('file', file);

  const cloudinaryResponse = await axios.post(uploadUrl, formData);

  const secureUrl = cloudinaryResponse.data?.secure_url;
  const publicId = cloudinaryResponse.data?.public_id;

  if (!secureUrl || !publicId) {
    throw new Error('Cloudinary did not return a valid uploaded image.');
  }

  // Persist the uploaded URL against the authenticated user in Baahubali.
  const updatedUser = await apiClient.put('/auth-api/users/me/avatar', {
    avatarUrl: secureUrl,
  });

  return updatedUser;
};