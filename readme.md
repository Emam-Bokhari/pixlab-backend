# AiSnapStudio — Backend API & Architecture Documentation

> **Public Image Processing REST API**  
> *Base API URL: `http://localhost:5000/api/v1`*  
> *All endpoints are 100% public — no registration, login, token, or session required.*

---

## 1. Overview

**AiSnapStudio** is a fast, lightweight, and completely public image processing backend built with Node.js, Express, TypeScript, Sharp, and MongoDB.

### Core Capabilities:
1. **Background Removal (`/api/v1/bg-remove`)**: AI-powered background removal with optional background color replacement.
2. **Image Upscaling (`/api/v1/upscales`)**: Free, high-performance image upscaling using Lanczos3 resampling and edge unsharp masking.
3. **Image Size Reduction (`/api/v1/reduce`)**: Compress images to meet strict target file size limits (in KB) while preserving maximum visual quality.
4. **Image Resizing (`/api/v1/resize`)**: Precision pixel dimension resizing with smart cropping and cover aspect ratio preservation.
5. **Support Form (`/api/v1/supports`)**: Public contact and support inquiry submission with automated email notifications.

---

## 2. API Reference

All requests accept standard multipart/form-data or application/json payloads. No authorization headers are needed.

### 2.1 Background Removal

- **`POST /api/v1/bg-remove`**
  - **Body** (multipart/form-data):
    - `image`: File (PNG, JPEG, WebP, etc.)
    - `bgColorHex` (optional): Hex code for background color (e.g. `FFFFFF` or `#FFFFFF`). Omit for transparent background.
  - **Response**:
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Background removed successfully",
      "data": {
        "bgRemovePhotoId": "BG-REMOVE-PHOTO-2026-0001",
        "originalImage": "/uploads/bg-remove/BG-REMOVE-PHOTO-2026-0001-original.png",
        "processedImage": "/uploads/bg-remove/BG-REMOVE-PHOTO-2026-0001-processed.png",
        "bgColorHex": "FFFFFF",
        "status": "success"
      }
    }
    ```

- **`GET /api/v1/bg-remove`**
  - Returns all background removal jobs sorted by most recent first.

- **`GET /api/v1/bg-remove/:jobId`**
  - Returns a specific background removal job by MongoDB ID.

---

### 2.2 Image Upscaler

- **`POST /api/v1/upscales`**
  - **Body** (multipart/form-data):
    - `image`: File (PNG, JPEG, WebP, etc.)
    - `scale` (optional): Scale factor (`2` to `4`, default: `2`)
  - **Response**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Image upscaled successfully",
      "data": {
        "upscaledPhotoId": "UPSCALED-PHOTO-2026-0001",
        "originalImage": "/uploads/upscaleOriginal/UPSCALED-PHOTO-2026-0001-original.png",
        "upscaledImage": "/uploads/upscaledImage/UPSCALED-PHOTO-2026-0001.png",
        "scale": 2,
        "original": {
          "widthPx": 800,
          "heightPx": 600,
          "sizeBytes": 120400,
          "sizeKB": 117.58,
          "sizeMB": 0.115
        },
        "upscaled": {
          "widthPx": 1600,
          "heightPx": 1200,
          "sizeBytes": 420800,
          "sizeKB": 410.94,
          "sizeMB": 0.401
        },
        "increase": {
          "widthPercent": 100,
          "heightPercent": 100,
          "sizeBytesPercent": 249.5,
          "sizeMBDiff": 0.286
        },
        "didUpscale": true,
        "status": "success"
      }
    }
    ```

- **`GET /api/v1/upscales`**
  - Returns all upscaled images sorted by most recent first.

---

### 2.3 Image Size Reducer

- **`POST /api/v1/reduce`**
  - **Body** (multipart/form-data):
    - `image`: File
    - `data`: JSON string `{"targetSizeKb": 150}`
  - **Response**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Image size reduced successfully",
      "data": {
        "reducedPhotoId": "REDUCED-PHOTO-2026-0001",
        "originalImageName": "input.jpg",
        "reducedImageUrl": "/uploads/reduce/REDUCED-PHOTO-2026-0001.jpg",
        "original": {
          "widthPx": 2400,
          "heightPx": 1600,
          "sizeBytes": 2048576,
          "sizeKB": 2000.56,
          "sizeMB": 1.954
        },
        "reduced": {
          "widthPx": 1200,
          "heightPx": 800,
          "sizeBytes": 149800,
          "sizeKB": 146.29,
          "sizeMB": 0.143
        },
        "reductionPercentage": 92.69,
        "targetSizeKb": 150,
        "format": "jpg"
      }
    }
    ```

- **`GET /api/v1/reduce`**
  - Returns all reduced images sorted by most recent first.

---

### 2.4 Image Dimension Resizer

- **`POST /api/v1/resize`**
  - **Body** (multipart/form-data):
    - `image`: File
    - `width`: Number (e.g. `1200`)
    - `height`: Number (e.g. `800`)
  - **Response**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Image resized successfully",
      "data": {
        "resizedPhotoId": "RESIZED-PHOTO-2026-0001",
        "originalImage": "/uploads/resize-original/RESIZED-PHOTO-2026-0001.png",
        "resizedImage": "/uploads/resize/RESIZED-PHOTO-2026-0001.png",
        "original": {
          "widthPx": 1920,
          "heightPx": 1080,
          "sizeBytes": 1540000,
          "sizeKB": 1503.91,
          "sizeMB": 1.469,
          "format": "png"
        },
        "resized": {
          "widthPx": 1200,
          "heightPx": 800,
          "sizeBytes": 850000,
          "sizeKB": 830.08,
          "sizeMB": 0.811,
          "format": "png"
        },
        "resizeParams": {
          "width": 1200,
          "height": 800,
          "fit": "cover",
          "cropStrategy": "attention"
        },
        "status": "success"
      }
    }
    ```

- **`GET /api/v1/resize`**
  - Returns all resized images sorted by most recent first.

---

### 2.5 Support / Contact

- **`POST /api/v1/supports`**
  - **Body** (application/json):
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subject": "Inquiry about batch operations",
      "message": "Hello, I would like to know if batch resize is supported."
    }
    ```
  - **Response**:
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
        "status": "open"
      }
    }
    ```

---

## 3. Technology Stack

- **Runtime**: Node.js, TypeScript
- **Framework**: Express.js
- **Database**: MongoDB, Mongoose
- **Image Processing**: Sharp (libvips)
- **Queues**: Redis, BullMQ (email queue worker)
- **Static Assets**: Hosted under `/uploads`

---

## 4. Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables (`.env`)**:
   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/aisnapstudio
   NODE_ENV=development
   SUPPORT_EMAIL=support@aisnapstudio.com
   FRONTEND_URL=http://localhost:3000
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   EMAIL_FROM=no-reply@aisnapstudio.com
   EMAIL_USER=your-smtp-user
   EMAIL_PASS=your-smtp-pass
   EMAIL_PORT=587
   EMAIL_HOST=smtp.gmail.com
   BG_REMOVER_API_URL=http://localhost:8000
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build & Production**:
   ```bash
   npm run build
   npm run start:prod
   ```
