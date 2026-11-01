import { Schema } from 'mongoose';

export const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  });

  schema.pre('find', function () {
    this.where({ isDeleted: { $ne: true } });
  });

  schema.pre('findOne', function () {
    this.where({ isDeleted: { $ne: true } });
  });

  schema.pre('countDocuments', function () {
    this.where({ isDeleted: { $ne: true } });
  });
};

