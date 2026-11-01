import { Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, any>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, any>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // case-insensitive search across fields
  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm || this.query?.search;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as any,
        ),
      });
    }
    return this;
  }

  // convert comparison keywords to mongoose operators
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'search', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.modelQuery = this.modelQuery.find(JSON.parse(queryStr) as any);

    return this;
  }

  sort() {
    const sort = (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate() {
    const page = Math.max(Number(this.query?.page) || 1, 1);
    const limit = Math.max(Number(this.query?.limit) || 10, 1);
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields = (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  populate(options: string | any) {
    if (options) {
      this.modelQuery = this.modelQuery.populate(options);
    }
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();

    const total = await this.modelQuery.model.countDocuments(totalQueries);

    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
    };
  }
}

export default QueryBuilder;
