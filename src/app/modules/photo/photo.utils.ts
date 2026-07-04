export const bufferToBase64 = (buffer: Buffer): string => {
  const base64 = buffer.toString('base64');
  return base64;
};