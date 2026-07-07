// import mongoose, { Schema } from 'mongoose';
// import { PAPER_SIZE, PHOTO_STATUS, PHOTO_TYPE } from './photo.constant';
// import { PhotoDocument } from './photo.interface';
// import { RENDER_VERSION } from './layouts/layouts.constant';

// const printOptionsSchema = new Schema(
//   {
//     paperSize: {
//       type: String,
//       enum: PAPER_SIZE,
//       default: PAPER_SIZE.FOUR_R,
//     },
//     templateName: {
//       type: String,
//       required: true,
//     },
//     rows: {
//       type: Number,
//       required: true,
//     },
//     columns: {
//       type: Number,
//       required: true,
//     },
//     marginMm: {
//       type: Number,
//       required: true,
//     },
//     gapMm: {
//       type: Number,
//       required: true,
//     },
//     dpi: {
//       type: Number,
//       default: 300,
//     },
//     renderVersion: {
//       type: String,
//       default: RENDER_VERSION,
//     },
//   },
//   { _id: false }
// );

// const photoSchema = new Schema<PhotoDocument>(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     originalImage: {
//       type: String,
//       required: true,
//     },

//     country: {
//       type: String,
//       default: 'Bangladesh',
//     },

//     photoType: {
//       type: String,
//       enum: PHOTO_TYPE,
//       required: true,
//     },

//     sizeInfo: {
//       name: {
//         type: String,
//         required: true,
//       },
//       mmWidth: {
//         type: Number,
//         required: true,
//       },
//       mmHeight: {
//         type: Number,
//         required: true,
//       },
//     },

//     bgColor: {
//       type: String,
//       default: 'FFFFFF',
//     },

//     copies: {
//       type: Number,
//       default: 1,
//     },

//     // Cutout Pro Response
//     idPhotoImage: {
//       type: String,
//     },
//     printLayoutImage: {
//       type: String,
//     },

//     status: {
//       type: String,
//       enum: PHOTO_STATUS,
//       default: PHOTO_STATUS.PENDING,
//     },

//     errorMessage: {
//       type: String,
//     },

//     creditsUsed: {
//       type: Number,
//     },

//     isDownloaded: {
//       type: Boolean,
//       default: false,
//     },

//     pngUrl: {
//       type: String,
//       default: '',
//     },

//     jpgUrl: {
//       type: String,
//       default: '',
//     },

//     webpUrl: {
//       type: String,
//       default: '',
//     },

//     pdfUrl: {
//       type: String,
//       default: '',
//     },

//     printOptions: {
//       type: printOptionsSchema,
//       required: true,
//     },

//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },

//     expiresAt: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// photoSchema.index({ userId: 1, createdAt: -1 });
// photoSchema.index({ status: 1 });

// export const Photo = mongoose.model<PhotoDocument>('Photo', photoSchema);

import mongoose, { Schema } from 'mongoose';
import { PAPER_SIZE, PHOTO_STATUS, PHOTO_TYPE } from './photo.constant';
import { RENDER_VERSION } from './layouts/layouts.constant';
import { IPhoto } from './photo.interface';

const printOptionsSchema = new Schema(
  {
    paperSize: {
      type: String,
      enum: PAPER_SIZE,
      default: PAPER_SIZE.FOUR_R,
    },
    templateName: {
      type: String,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
    columns: {
      type: Number,
      required: true,
    },
    marginMm: {
      type: Number,
      required: true,
    },
    gapMm: {
      type: Number,
      required: true,
    },
    orientation: {
      type: String,
      enum: ['landscape', 'portrait'],
      required: true,
    },
    dpi: {
      type: Number,
      default: 300,
    },
    renderVersion: {
      type: String,
      default: RENDER_VERSION,
    },
  },
  { _id: false },
);

const photoSchema = new Schema<IPhoto>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalImage: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: 'Bangladesh',
    },

    photoType: {
      type: String,
      enum: PHOTO_TYPE,
      required: true,
    },

    sizeInfo: {
      name: {
        type: String,
        required: true,
      },
      mmWidth: {
        type: Number,
        required: true,
      },
      mmHeight: {
        type: Number,
        required: true,
      },
    },

    bgColor: {
      type: String,
      default: 'FFFFFF',
    },

    copies: {
      type: Number,
      default: 1,
    },

    paperSize: {
      type: String,
      enum: PAPER_SIZE,
      default: PAPER_SIZE.FOUR_R,
    },

    // Cutout Pro Response
    idPhotoImage: {
      type: String,
    },
    printLayoutImage: {
      type: String,
    },

    status: {
      type: String,
      enum: PHOTO_STATUS,
      default: PHOTO_STATUS.PENDING,
    },

    errorMessage: {
      type: String,
    },

    creditsUsed: {
      type: Number,
    },

    isDownloaded: {
      type: Boolean,
      default: false,
    },

    pngUrl: {
      type: String,
      default: '',
    },

    jpgUrl: {
      type: String,
      default: '',
    },

    webpUrl: {
      type: String,
      default: '',
    },

    pdfUrl: {
      type: String,
      default: '',
    },

    printOptions: {
      type: printOptionsSchema,
      required: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

photoSchema.index({ userId: 1, createdAt: -1 });
photoSchema.index({ status: 1 });

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);
