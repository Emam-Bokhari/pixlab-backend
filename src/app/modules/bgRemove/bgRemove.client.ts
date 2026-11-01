import axios from 'axios';
import FormData from 'form-data';
import config from '../../config';

const BG_REMOVER_API_URL = config.bg_remover_api_url;

// send image buffer to background removal microservice
export const removeBackground = async (
  imageBuffer: Buffer,
  bgColorHex?: string,
): Promise<Buffer> => {
  const form = new FormData();

  form.append('file', imageBuffer, {
    filename: 'photo.jpg',
    contentType: 'image/jpeg',
  });

  // attach background color if provided
  if (typeof bgColorHex === 'string' && bgColorHex.trim().length > 0) {
    form.append('bg_color', bgColorHex.trim().replace(/^#/, '').toUpperCase());
  }

  const response = await axios.post(`${BG_REMOVER_API_URL}/remove-bg`, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  return Buffer.from(response.data);
};
