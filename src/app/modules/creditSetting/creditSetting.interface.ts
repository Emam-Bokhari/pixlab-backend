export type TCreditSetting = {
  key: string; // unique identifier, e.g. 'photo_resize', 'upscale', 'clothes_change'
  credits: number; // credit cost
  displayName: string; // e.g. 'Photo Resize'
  description?: string; // e.g. 'Credit cost for photo resizing (passport size, etc.)'
};
