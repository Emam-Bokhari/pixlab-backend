import { Schema, Query, Aggregate, Document, Model } from 'mongoose';

export interface ISoftDeleteMethods {
  softDelete(): Promise<Document>;
  restore(): Promise<Document>;
}

export interface ISoftDeleteStatics<T> extends Model<T> {
  softDeleteById(id: string): Promise<T | null>;
  restoreById(id: string): Promise<T | null>;
  softDeleteMany(filter: any): Promise<any>;
  restoreMany(filter: any): Promise<any>;
}

export function softDeletePlugin<T>(schema: Schema<T>) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, index: true },
  } as any);

  // filter out soft-deleted records by default
  const excludeDeletedFilter = function (this: Query<any, any>) {
    const filters = this.getFilter();
    if (filters.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  const queryMethods = [
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndReplace',
    'findOneAndUpdate',
    'countDocuments',
    'distinct',
  ];
  queryMethods.forEach((method) => {
    schema.pre(method as any, excludeDeletedFilter);
  });

  schema.pre(/update/i, function (this: Query<any, any>) {
    const filters = this.getFilter();
    if (filters.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  schema.pre('aggregate', function (this: Aggregate<any>) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.softDeleteById = function (id: string) {
    return (this as any).findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );
  };

  schema.statics.restoreById = function (id: string) {
    return (this as any).findOneAndUpdate(
      { _id: id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true },
    );
  };

  schema.statics.softDeleteMany = function (filter: any) {
    return (this as any).updateMany(
      { ...filter, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
  };

  schema.statics.restoreMany = function (filter: any) {
    return (this as any).updateMany(
      { ...filter, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
    );
  };
}
