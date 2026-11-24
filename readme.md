# aiSnapStudio Backend

High-performance image processing REST API built with Node.js, Express, TypeScript, Sharp, and @imgly/background-removal-node.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Dual Response Modes](#dual-response-modes)
  - [1. Background Removal](#1-background-removal)
  - [2. Image Upscaling](#2-image-upscaling)
  - [3. Image Size Reduction](#3-image-size-reduction)
  - [4. Image Resizing](#4-image-resizing)
- [Error Handling](#error-handling)
- [Available Scripts](#available-scripts)
- [Logging and Monitoring](#logging-and-monitoring)
- [License](#license)

---

## Overview

aiSnapStudio Backend provides a robust, scalable backend suite designed for on-the-fly and batch image operations, including background removal, deep scaling, target-size compression, and dimension transformations. 

The architecture supports dual consumption modes:
1. **JSON Data Mode (Default)**: Delivers image metadata alongside Base64 data URLs for immediate frontend previews and dashboard rendering.
2. **Binary Stream Mode**: Transmits raw binary image streams with rich metadata populated into HTTP response headers for instant download or file piping.

---

## Key Features

- **Background Removal**: Neural-network-assisted segmentation powered by `@imgly/background-removal-node` with optional hex background color replacement.
- **Image Upscaling**: High-fidelity enlargement using the Lanczos3 resampling kernel coupled with adaptive sharpening filters.
- **Target Size Reduction**: Iterative image compression allowing users to compress images to reach an exact file size target in kilobytes (KB).
- **Dimension Resizing**: Precise aspect-ratio-aware dimension scaling, custom crop modes, and attention strategies.
- **Dual Output Delivery**: Choose between JSON payload responses (with Base64 preview strings) or raw binary downloads using query parameters.
- **Enterprise-Grade Logging**: Daily rotating file logs managed by Winston, paired with Morgan HTTP request tracing.
- **Strict Request Validation**: Comprehensive schema validation for inputs and payloads via Zod.
- **Graceful Shutdown**: Controlled teardown of HTTP servers on system termination signals.

---

## System Architecture

```
[ Client Applications ]
       │
       ▼ (HTTP / Multipart / JSON)
[ Express 5 / Node.js Engine ]
  ├── Morgan HTTP Request Logging
  ├── CORS & JSON Body Parsing
  ├── Global Error & Validation Handlers (Zod)
  └── Memory Storage Upload Handler (Multer - 50MB Limit)
       │
       └── Image Processing Subsystem (Sharp / Imgly)
             ├── Background Removal Service
             ├── Upscaling Service (Lanczos3 + Sharpening)
             ├── Target Size Reduction Service
             └── Dimension Resizing Service
                   │
                   ├── Mode 1: JSON Payload (Base64 + Metadata)
                   └── Mode 2: Binary Image Stream + Custom HTTP Headers
```

---

## Project Directory Structure

```
aiSnapStudio-backend/
├── src/
│   ├── app.ts                          # Express application setup, middlewares, and routes
│   ├── server.ts                       # Server entry point, listener, and graceful shutdown
│   ├── app/
│   │   ├── config/                     # Configuration loaders
│   │   │   └── index.ts                # Environment variable mapping
│   │   ├── errors/                     # Custom error definitions and validation handlers
│   │   │   ├── HttpError.ts            # Custom HTTP error class
│   │   │   └── handleZodValidationError.ts # Zod error parser
│   │   ├── helpers/                    # Helper services
│   │   │   └── socketHelper.ts         # Real-time socket utilities
│   │   ├── interface/                  # Global TypeScript interfaces
│   │   │   ├── error.ts                # Standardized error interfaces
│   │   │   └── index.d.ts              # Global type augmentations
│   │   ├── middlewares/                # Express middleware functions
│   │   │   ├── fileUploadHandler.ts    # Multer file upload filter and memory buffer storage
│   │   │   ├── globalErrorHandler.ts   # Centralized error formatting middleware
│   │   │   ├── notFound.ts             # 404 Route Not Found middleware
│   │   │   └── validateRequestSchema.ts# Generic Zod validation middleware
│   │   ├── modules/                    # Feature domain modules
│   │   │   ├── bgRemove/               # Background removal endpoints and services
│   │   │   │   ├── bgRemove.client.ts
│   │   │   │   ├── bgRemove.controller.ts
│   │   │   │   ├── bgRemove.interface.ts
│   │   │   │   ├── bgRemove.route.ts
│   │   │   │   ├── bgRemove.service.ts
│   │   │   │   └── bgRemove.utils.ts
│   │   │   ├── reduce/                 # Target size reduction endpoints and services
│   │   │   │   ├── reduce.controller.ts
│   │   │   │   ├── reduce.interface.ts
│   │   │   │   ├── reduce.route.ts
│   │   │   │   ├── reduce.service.ts
│   │   │   │   └── reduce.utils.ts
│   │   │   ├── resize/                 # Dimension resizing endpoints and services
│   │   │   │   ├── resize.constant.ts
│   │   │   │   ├── resize.controller.ts
│   │   │   │   ├── resize.interface.ts
│   │   │   │   ├── resize.route.ts
│   │   │   │   ├── resize.service.ts
│   │   │   │   └── resize.utils.ts
│   │   │   └── upscale/                # Image upscaling endpoints and services
│   │   │       ├── upscale.controller.ts
│   │   │       ├── upscale.interface.ts
│   │   │       ├── upscale.route.ts
│   │   │       ├── upscale.service.ts
│   │   │       └── upscale.utils.ts
│   │   ├── routes/                     # Central API route index
│   │   │   ├── index.ts
│   │   │   └── v1.routes.ts            # Route table for /api/v1
│   │   ├── shared/                     # Reusable utilities
│   │   │   ├── catchAsync.ts           # Asynchronous controller wrapper
│   │   │   ├── logger.ts               # Winston logger configuration
│   │   │   ├── morgan.ts               # Morgan HTTP request logging setup
│   │   │   ├── sendBinaryResponse.ts   # Binary stream and custom header sender
│   │   │   ├── sendResponse.ts         # Standard JSON response formatter
│   │   │   └── unlinkFile.ts           # Filesystem cleanup utility
├── logs/                               # Rotated output log directory
├── uploads/                            # Temporary upload processing directory
├── .env.example                        # Example environment template
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── tsconfig.json
└── readme.md
```

---

## Technology Stack

- **Runtime & Language**: Node.js (v18+ or v20+ recommended), TypeScript
- **Framework**: Express 5
- **Image Processing**: Sharp, `@imgly/background-removal-node`
- **File Uploads**: Multer (In-Memory buffer storage)
- **Validation**: Zod
- **Logging**: Winston, Winston Daily Rotate File, Morgan
- **Code Quality**: ESLint, Prettier, ts-node-dev

---

## Prerequisites

Before starting the application, ensure the following dependencies are installed on your environment:

1. **Node.js**: Version 18.x, 20.x, or higher.
2. **NPM**: Version 9.x or higher (or Yarn / PNPM).

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd aiSnapStudio-backend
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the sample template:

```bash
cp .env.example .env
```

Open `.env` in an editor and update the placeholders with your environment-specific configuration details.

---

## Environment Configuration

Use placeholders when configuring your `.env` file. Never commit real credentials, sensitive secrets, or production connection strings to version control.

Below is the standard `.env` configuration template:

```env
# Server Configuration
PORT=5000
IP=127.0.0.1
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# External API Services
BG_REMOVER_API_URL=
```

### Environment Variables Reference Table

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Number | `5000` | Port on which the HTTP server listens |
| `IP` | String | `127.0.0.1` | Network interface to bind (optional) |
| `NODE_ENV` | String | `development` | Runtime environment (`development`, `production`, `test`) |
| `FRONTEND_URL` | String | `http://localhost:3000` | Allowed frontend origin for CORS policies |
| `BG_REMOVER_API_URL` | String | - | External background remover endpoint (if used) |

---

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

All public endpoints are mounted under `/api/v1`. Root health route is accessible at `GET /`.

### Dual Response Modes

Each image processing endpoint supports two distinct output formats:

1. **Default JSON Mode** (No query param needed):
   Returns HTTP 200 with JSON payload containing metadata (`widthPx`, `heightPx`, `sizeBytes`, `sizeKB`, `sizeMB`, `format`) and base64 data URLs (`imageUrl`) for both the original and processed images.

2. **Binary Stream Mode** (Pass `?type=binary` or `?download=true`):
   Returns raw binary file stream (`image/png`, `image/jpeg`, etc.) with `Content-Disposition: attachment; filename="<name>"` along with custom metadata exposed via HTTP response headers (`X-Original-*`, `X-Upscaled-*`, `X-Reduced-*`, `X-Resized-*`).

---

### 1. Background Removal

Isolates the primary subject, strips the background into transparency, and optionally overlays a solid background color.

- **Route**: `POST /api/v1/bg-remove`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `type` (optional): Set to `binary` for raw image stream.
  - `download` (optional): Set to `true` for raw image stream.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Image file (PNG, JPEG, WEBP, BMP, TIFF, GIF, AVIF). Max 50 MB. |
| `bgColor` | String | No | Target background hex color (e.g., `#FFFFFF` or `FFFFFF`). |

#### Mode A: JSON Response Example (Default)

`POST /api/v1/bg-remove`

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Background removed successfully",
  "data": {
    "original": {
      "widthPx": 1200,
      "heightPx": 800,
      "sizeBytes": 245000,
      "sizeKB": 239.26,
      "sizeMB": 0.23,
      "format": "png"
    },
    "current": {
      "widthPx": 1200,
      "heightPx": 800,
      "sizeBytes": 198000,
      "sizeKB": 193.36,
      "sizeMB": 0.19,
      "format": "png"
    },
    "bgColor": "FFFFFF"
  }
}
```

#### Mode B: Binary Response Example

`POST /api/v1/bg-remove?type=binary`

- **Content-Type**: `image/png`
- **Body**: Binary PNG image data
- **Response Headers**:
  - `Content-Disposition`: `attachment; filename="bg-removed.png"`
  - `X-Background-Color`: `FFFFFF` (if requested)
  - `X-Original-Width`: `1200`
  - `X-Original-Height`: `800`
  - `X-Original-Size-KB`: `239.26`
  - `X-Original-Size-MB`: `0.23`
  - `X-Current-Width`: `1200`
  - `X-Current-Height`: `800`
  - `X-Current-Size-KB`: `193.36`
  - `X-Current-Size-MB`: `0.19`

---

### 2. Image Upscaling

Enlarges an image by a configurable multiplier using high-order Lanczos3 resampling and adaptive sharpening.

- **Route**: `POST /api/v1/upscales`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `type` (optional): `binary`
  - `download` (optional): `true`

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Image file to upscale. Maximum size limit is 20 MB. |
| `scale` | Number | No | Scale multiplier factor between `1` and `4` (default: `2`). |

#### Mode A: JSON Response Example (Default)

`POST /api/v1/upscales`

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image upscaled successfully",
  "data": {
    "original": {
      "widthPx": 800,
      "heightPx": 600,
      "sizeBytes": 125400,
      "sizeKB": 122.46,
      "sizeMB": 0.12,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    },
    "current": {
      "widthPx": 1600,
      "heightPx": 1200,
      "sizeBytes": 420800,
      "sizeKB": 410.94,
      "sizeMB": 0.40,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    },
    "scale": 2,
    "increase": {
      "widthPercent": 100,
      "heightPercent": 100,
      "sizeBytesPercent": 235.57,
      "sizeMBDiff": 0.28
    }
  }
}
```

#### Mode B: Binary Response Example

`POST /api/v1/upscales?type=binary`

- **Content-Type**: Matches original MIME type (e.g., `image/jpeg`, `image/png`)
- **Body**: Binary image data
- **Response Headers**:
  - `Content-Disposition`: `attachment; filename="upscaled.jpg"`
  - `X-Scale`: `2`
  - `X-Width-Increase-Percent`: `100`
  - `X-Height-Increase-Percent`: `100`
  - `X-Size-Increase-Percent`: `235.57`
  - `X-Size-MB-Diff`: `0.28`
  - `X-Original-Width`: `800`
  - `X-Original-Height`: `600`
  - `X-Original-Size-KB`: `122.46`
  - `X-Upscaled-Width`: `1600`
  - `X-Upscaled-Height`: `1200`
  - `X-Upscaled-Size-KB`: `410.94`

---

### 3. Image Size Reduction

Compresses images to meet an explicit target file size threshold in kilobytes.

- **Route**: `POST /api/v1/reduce`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `type` (optional): `binary`
  - `download` (optional): `true`

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Input image file to compress. |
| `targetSizeKb` | Number | Yes | Positive number specifying target output size in KB. |

#### Mode A: JSON Response Example (Default)

`POST /api/v1/reduce`

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image reduced successfully",
  "data": {
    "original": {
      "widthPx": 1920,
      "heightPx": 1080,
      "sizeBytes": 850000,
      "sizeKB": 830.08,
      "sizeMB": 0.81,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    },
    "current": {
      "widthPx": 1920,
      "heightPx": 1080,
      "sizeBytes": 204000,
      "sizeKB": 199.22,
      "sizeMB": 0.19,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    },
    "targetSizeKb": 200,
    "reductionPercentage": 76.0
  }
}
```

#### Mode B: Binary Response Example

`POST /api/v1/reduce?type=binary`

- **Content-Type**: Matches processed MIME type
- **Body**: Binary compressed image
- **Response Headers**:
  - `Content-Disposition`: `attachment; filename="reduced.jpg"`
  - `X-Reduction-Percent`: `76.0`
  - `X-Target-Size-KB`: `200`
  - `X-Original-Width`: `1920`
  - `X-Original-Height`: `1080`
  - `X-Original-Size-KB`: `830.08`
  - `X-Reduced-Width`: `1920`
  - `X-Reduced-Height`: `1080`
  - `X-Reduced-Size-KB`: `199.22`

---

### 4. Image Resizing

Resizes an image to specified pixel dimensions with cover fit and attention-aware cropping.

- **Route**: `POST /api/v1/resize`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `type` (optional): `binary`
  - `download` (optional): `true`

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `image` | File | Yes | Input image file. Maximum size limit is 25 MB. |
| `width` | Number | Yes | Target width in pixels (between 8 and 8000). |
| `height` | Number | Yes | Target height in pixels (between 8 and 8000). |

#### Mode A: JSON Response Example (Default)

`POST /api/v1/resize`

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image resized successfully",
  "data": {
    "original": {
      "widthPx": 2400,
      "heightPx": 1600,
      "sizeBytes": 980000,
      "sizeKB": 957.03,
      "sizeMB": 0.93,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    },
    "current": {
      "widthPx": 800,
      "heightPx": 600,
      "sizeBytes": 112000,
      "sizeKB": 109.38,
      "sizeMB": 0.11,
      "format": "jpeg",
      "imageUrl": "data:image/jpeg;base64,..."
    }
  }
}
```

#### Mode B: Binary Response Example

`POST /api/v1/resize?type=binary`

- **Content-Type**: Matches processed MIME type
- **Body**: Binary resized image
- **Response Headers**:
  - `Content-Disposition`: `attachment; filename="resized.jpg"`
  - `X-Original-Width`: `2400`
  - `X-Original-Height`: `1600`
  - `X-Original-Size-KB`: `957.03`
  - `X-Resized-Width`: `800`
  - `X-Resized-Height`: `600`
  - `X-Resized-Size-KB`: `109.38`

---

## Client Usage Examples

### JavaScript (Fetch API - Default JSON Mode)

```javascript
const formData = new FormData();
formData.append('image', imageFileInput.files[0]);
formData.append('scale', '2');

const response = await fetch('http://localhost:5000/api/v1/upscales', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
if (!response.ok) {
  throw new Error(result.message || 'Operation failed');
}

// Access Base64 preview data directly
console.log('Processed image preview URL:', result.data.current.imageUrl);
console.log('New dimensions:', result.data.current.widthPx, result.data.current.heightPx);
```

### JavaScript (Fetch API - Binary Stream Download Mode)

```javascript
const formData = new FormData();
formData.append('image', imageFileInput.files[0]);
formData.append('targetSizeKb', '150');

const response = await fetch('http://localhost:5000/api/v1/reduce?type=binary', {
  method: 'POST',
  body: formData,
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

// Read custom headers
const reductionPercent = response.headers.get('X-Reduction-Percent');
console.log(`Reduction achieved: ${reductionPercent}%`);

// Create a local blob URL for download
const blob = await response.blob();
const downloadUrl = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = downloadUrl;
link.download = 'reduced-image.jpg';
link.click();
```

### cURL Example

```bash
# Upload and download directly as a binary file
curl -X POST "http://localhost:5000/api/v1/resize?type=binary" \
  -F "image=@/path/to/local/photo.jpg" \
  -F "width=800" \
  -F "height=600" \
  -o "resized-photo.jpg"
```

---

## Error Handling

All uncaught exceptions, validation failures, and HTTP errors are intercepted by the global error middleware and normalized into a consistent JSON response:

```json
{
  "success": false,
  "message": "Validation Error",
  "statusCode": 400,
  "error": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ],
  "stack": null
}
```

### Common HTTP Status Codes

| Status Code | Description |
|---|---|
| `200 OK` | Request completed successfully. |
| `400 Bad Request` | Validation failure, missing required fields, or unsupported image format. |
| `404 Not Found` | The requested route does not exist. |
| `500 Internal Server Error` | Unexpected server or processing error. |

---

## Available Scripts

The project includes predefined NPM scripts in `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Starts development server with live reload via `ts-node-dev`. |
| `npm run build` | Compiles TypeScript source files into JavaScript in the `/dist` folder. |
| `npm run start` | Runs the compiled distribution build using `nodemon`. |
| `npm run start:prod` | Runs compiled server in production mode (`node ./dist/server.js`). |
| `npm run lint` | Runs ESLint over all TypeScript files in `src/`. |
| `npm run lint:fix` | Automatically fixes ESLint rule violations. |
| `npm run format` | Formats all code files using Prettier. |

---

## Logging and Monitoring

The backend implements structured logging using Winston and daily rotating files:

- **Access Logs**: Handled via Morgan and piped to Winston streams.
- **Success Logs**: Output to stdout in development; recorded to daily log files in production.
- **Error Logs**: Saved into the `/logs` directory (`logs/errors/error-YYYY-MM-DD-HH.log`) with stack traces and request contexts.
- **Log Rotation**: Automatic compression, maximum retention window of 30 days, and maximum file size limits per rotation chunk.

---

## License

This project is licensed under the ISC License.
