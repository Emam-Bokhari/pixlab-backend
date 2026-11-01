# PixLab Backend

## Overview
Public image processing REST API built with Node.js, Express, TypeScript, Sharp, and MongoDB.

Base API URL: `http://localhost:5000/api/v1`

## Endpoints Summary

| Feature | Method | Endpoint |
|---|---|---|
| Background Removal | POST | /api/v1/bg-remove |
| Image Upscaling | POST | /api/v1/upscales |
| Image Size Reduction | POST | /api/v1/reduce |
| Image Resizing | POST | /api/v1/resize |
| Support Ticket | POST | /api/v1/supports |

## Image Processing Specifications

* Request format: `multipart/form-data`
* File field name: `image`
* Supported formats: PNG, JPEG, JPG, WEBP, BMP, TIFF, GIF, AVIF
* Multer upload limit: 50 MB
* Upscale max file size: 20 MB
* Resize max file size: 25 MB
* Response body: Raw binary image data
* Metadata delivery: Custom HTTP response headers

## API Reference

### 1. Background Removal

`POST /api/v1/bg-remove`

Removes image background and returns a PNG. Optionally fills the background with a solid hex color.

Request Body (`multipart/form-data`):

| Field | Type | Required | Description |
|---|---|---|---|
| image | File | Yes | Image file to process |
| bgColor | String | No | Hex color code (example: FFFFFF or #FFFFFF) |

Response:
* Content-Type: `image/png`
* Body: Binary PNG data

Response Headers:

| Header | Description |
|---|---|
| Content-Disposition | attachment; filename="bg-removed.png" |
| X-Background-Color | Applied hex color code (present if bgColor was passed) |

Request Example:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('bgColor', '#FFFFFF');

const response = await fetch('http://localhost:5000/api/v1/bg-remove', {
  method: 'POST',
  body: formData,
});

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 2. Image Upscaling

`POST /api/v1/upscales`

Enlarges image by a scale factor using Lanczos3 resampling and sharpening.

Request Body (`multipart/form-data`):

| Field | Type | Required | Description |
|---|---|---|---|
| image | File | Yes | Image file up to 20 MB |
| scale | Number | No | Scale multiplier: 1 to 4 (default: 2) |

Response:
* Content-Type: Matches input format
* Body: Binary image data

Response Headers:

| Header | Description |
|---|---|
| Content-Disposition | attachment; filename="upscaled.<ext>" |
| X-Scale | Applied scale factor |
| X-Original-Width | Original width in pixels |
| X-Original-Height | Original height in pixels |
| X-Original-Size-KB | Original file size in KB |
| X-Original-Size-MB | Original file size in MB |
| X-Upscaled-Width | Output width in pixels |
| X-Upscaled-Height | Output height in pixels |
| X-Upscaled-Size-KB | Output file size in KB |
| X-Upscaled-Size-MB | Output file size in MB |
| X-Width-Increase-Percent | Width increase percentage |
| X-Height-Increase-Percent | Height increase percentage |
| X-Size-Increase-Percent | File size increase percentage |
| X-Size-MB-Diff | File size difference in MB |

Request Example:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('scale', '2');

const response = await fetch('http://localhost:5000/api/v1/upscales', {
  method: 'POST',
  body: formData,
});

const scale = response.headers.get('X-Scale');
const upscaledWidth = response.headers.get('X-Upscaled-Width');
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 3. Image Size Reduction

`POST /api/v1/reduce`

Compresses image to reach a target file size in kilobytes.

Request Body (`multipart/form-data`):

| Field | Type | Required | Description |
|---|---|---|---|
| image | File | Yes | Image file to compress |
| targetSizeKb | Number | Yes | Target size in kilobytes (positive number) |

Response:
* Content-Type: Matches input format
* Body: Binary image data

Response Headers:

| Header | Description |
|---|---|
| Content-Disposition | attachment; filename="reduced.<ext>" |
| X-Original-Width | Original width in pixels |
| X-Original-Height | Original height in pixels |
| X-Original-Size-KB | Original file size in KB |
| X-Original-Size-MB | Original file size in MB |
| X-Reduced-Width | Output width in pixels |
| X-Reduced-Height | Output height in pixels |
| X-Reduced-Size-KB | Output file size in KB |
| X-Reduced-Size-MB | Output file size in MB |
| X-Reduction-Percent | Size reduction percentage |
| X-Target-Size-KB | Target size requested in KB |

Request Example:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('targetSizeKb', '150');

const response = await fetch('http://localhost:5000/api/v1/reduce', {
  method: 'POST',
  body: formData,
});

const reductionPercent = response.headers.get('X-Reduction-Percent');
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 4. Image Resizing

`POST /api/v1/resize`

Resizes image to specific dimensions with cover fit mode and attention cropping.

Request Body (`multipart/form-data`):

| Field | Type | Required | Description |
|---|---|---|---|
| image | File | Yes | Image file up to 25 MB |
| width | Number | Yes | Target width in pixels (8 to 8000) |
| height | Number | Yes | Target height in pixels (8 to 8000) |

Response:
* Content-Type: Matches input format
* Body: Binary image data

Response Headers:

| Header | Description |
|---|---|
| Content-Disposition | attachment; filename="resized.<ext>" |
| X-Original-Width | Original width in pixels |
| X-Original-Height | Original height in pixels |
| X-Original-Size-KB | Original file size in KB |
| X-Original-Size-MB | Original file size in MB |
| X-Resized-Width | Output width in pixels |
| X-Resized-Height | Output height in pixels |
| X-Resized-Size-KB | Output file size in KB |
| X-Resized-Size-MB | Output file size in MB |

Request Example:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('width', '800');
formData.append('height', '600');

const response = await fetch('http://localhost:5000/api/v1/resize', {
  method: 'POST',
  body: formData,
});

const resizedWidth = response.headers.get('X-Resized-Width');
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### 5. Support Ticket

`POST /api/v1/supports`

Submits a support request to MongoDB and adds an email notification job to BullMQ queue.

Request Body (`application/json`):

| Field | Type | Required | Validation |
|---|---|---|---|
| name | String | Yes | 2 to 100 characters |
| email | String | Yes | Valid email address |
| subject | String | Yes | 5 to 150 characters |
| message | String | Yes | 10 to 2000 characters |

Payload Example:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Inquiry about batch operations",
  "message": "Hello, I would like to know if batch resize is supported."
}
```

Response Body (`application/json`, 201 Created):

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Support request created successfully",
  "data": {
    "_id": "6722026abc1234567890ef01",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Inquiry about batch operations",
    "message": "Hello, I would like to know if batch resize is supported.",
    "status": "OPEN",
    "isDeleted": false
  }
}
```

## Error Handling

All errors return JSON structured by the global error handler:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": [
    {
      "path": "",
      "message": "Error description"
    }
  ],
  "stack": null
}
```

Status Codes:

| Code | Meaning |
|---|---|
| 400 | Bad request (validation error, invalid file type, missing required fields) |
| 404 | Route not found |
| 500 | Internal server error |

Client Handling Example:

```javascript
const response = await fetch('http://localhost:5000/api/v1/resize', {
  method: 'POST',
  body: formData,
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message);
}

const blob = await response.blob();
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, TypeScript |
| Framework | Express 5 |
| Image Processing | Sharp, @imgly/background-removal-node |
| Database | MongoDB, Mongoose |
| File Upload | Multer |
| Queue System | BullMQ, Redis |
| Email Service | Nodemailer, Resend |
| Validation | Zod |
| Logging | Winston, Morgan |

## Environment Variables

Configuration options for `.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/pixlab
SUPPORT_EMAIL=support@pixlab.com

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

EMAIL_FROM=no-reply@pixlab.com
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-pass
EMAIL_PORT=587
EMAIL_HOST=smtp.gmail.com

RESEND_API_KEY=re_xxxxxxxxxxxx
DEFAULT_EMAIL_FROM=no-reply@pixlab.com

BG_REMOVER_API_URL=http://localhost:8000
```

## Setup and Commands

Install dependencies:

```bash
npm install
```

Development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production server:

```bash
npm run start:prod
```

Linting and formatting:

```bash
npm run lint
npm run lint:fix
npm run format
```

## Project Structure

```
src/
├── app.ts
├── server.ts
├── app/
│   ├── config/
│   │   └── index.ts
│   ├── errors/
│   │   ├── HttpError.ts
│   │   └── handleZodValidationError.ts
│   ├── interface/
│   │   └── error.ts
│   ├── middlewares/
│   │   ├── fileUploadHandler.ts
│   │   ├── globalErrorHandler.ts
│   │   └── validateRequestSchema.ts
│   ├── modules/
│   │   ├── bgRemove/
│   │   ├── reduce/
│   │   ├── resize/
│   │   ├── support/
│   │   └── upscale/
│   ├── routes/
│   │   ├── index.ts
│   │   └── v1.routes.ts
│   └── shared/
│       ├── catchAsync.ts
│       ├── emailTemplate.ts
│       ├── logger.ts
│       ├── morgan.ts
│       └── sendResponse.ts
└── queues/
    ├── index.ts
    └── email/
        ├── email.queue.ts
        └── email.worker.ts
```
