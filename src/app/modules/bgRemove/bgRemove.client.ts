import axios from 'axios';
import FormData from 'form-data';
import config from '../../config';

// Add this to your project config, pointing at the running Python
// microservice, e.g. BG_REMOVER_API_URL=http://10.10.26.181:8000
const BG_REMOVER_API_URL = config.bg_remover_api_url;

/**
 * Calls the local BG Remover microservice and returns the processed
 * image as a Buffer — replaces the previous Cutout Pro flow of
 * (1) axios.post with base64 payload, (2) downloadImageAsBuffer(resultUrl).
 * This does it in one HTTP call and returns bytes directly.
 *
 * @param imageBuffer  the original uploaded photo (before bg removal)
 * @param bgColorHex   e.g. "FFFFFF" — omit for a transparent PNG
 */
export const removeBackground = async (imageBuffer: Buffer, bgColorHex?: string): Promise<Buffer> => {
  const form = new FormData();
  form.append('file', imageBuffer, { filename: 'photo.jpg', contentType: 'image/jpeg' });
  if (bgColorHex) {
    form.append('bg_color', bgColorHex.replace('#', ''));
  }

  const response = await axios.post(`${BG_REMOVER_API_URL}/remove-bg`, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 60000, // first call after a cold start can be slow (model load)
  });

  return Buffer.from(response.data);
};