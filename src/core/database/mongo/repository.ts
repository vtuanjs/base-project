import { mongo, model, Document, Schema, Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository, UpdateOptions, FindAllOption, FindAllResponse } from '../interfaces';
import { AlreadyExistsError } from '../../errors';

export abstract class MongoBaseRepo<T> implements IBaseRepository<T> {
  protected model: Model<T & Document>;

  constructor(name: string, schema: Schema, collection: string) {
    this.model = model<T & Document>(name, schema, collection);
  }

  protected createObjectID(): string {
    return new mongo.ObjectId().toHexString();
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      const _entity = await this.model.create(entity);
      const doc = _entity.toObject();
      return doc as T;
    } catch (error) {
      if (error.code == 11000) {
        throw new AlreadyExistsError();
      }

      throw new Error(error);
    }
  }

  async updateById(id: string, doc: Partial<T>): Promise<boolean> {
    const raw = await this.model.updateOne({ _id: id as any }, doc as UpdateQuery<T & Document>);
    if (raw.ok === 0) {
      throw new Error('Update failed');
    }
    return raw.nModified === 0 ? false : true;
  }

  async findOne(cond: FilterQuery<T & Document>): Promise<T> {
    const entity = await this.model.findOne(cond as FilterQuery<T & Document>).lean();
    return entity as T;
  }

  async findMany(cond: FilterQuery<T & Document>): Promise<T[]> {
    const entity = await this.model.find(cond as FilterQuery<T & Document>).lean();
    return entity as T[];
  }

  async findOneAndUpdate(
    cond: FilterQuery<T & Document>,
    doc: Partial<T>,
    options?: UpdateOptions
  ): Promise<T> {
    const entity = await this.model
      .findOneAndUpdate(cond, doc as UpdateQuery<T & Document>, {
        new: true,
        ...options
      })
      .lean();
    return entity as T;
  }

  async findAll(
    cond: FilterQuery<T & Document>,
    option: Partial<FindAllOption>
  ): Promise<FindAllResponse<T>> {
    if (!option) option = {};
    const { fields } = option;
    let { limit = 50, page = 1 } = option;
    const { sort = 'id' } = option;

    if (limit > 50 || limit < 1) limit = 50;
    if (page < 1) page = 1;

    const count = await this.model.countDocuments(cond);

    const items = await this.model
      .find(cond)
      .select(selectFieldsShow(fields))
      .limit(limit)
      .skip(limit * (page - 1))
      .sort(sort)
      .lean();

    return {
      total: count,
      limit,
      page,
      totalPages: Math.ceil(count / limit),
      data: items as T[]
    };
  }

  async deleteById(id: string): Promise<boolean> {
    const raw = await this.model.deleteOne({ _id: id as any });

    if (raw.ok === 0) {
      throw new Error('Delete failed');
    }
    return raw.n === 0 ? false : true;
  }

  async count(cond: FilterQuery<T & Document>): Promise<number> {
    const count = await this.model.countDocuments(cond);
    return count;
  }
}

function selectFieldsShow(fields: string) {
  if (fields) {
    return fields.split(',').join(' ');
  }

  return '';
}
