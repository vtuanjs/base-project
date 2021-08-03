import { FilterQuery, Document } from 'mongoose';
import { FindAllOption, FindAllResponse } from '../types';
export { FindAllOption, FindAllResponse } from '../types';

export interface IMongoConfig {
  connectionString?: string;
  user?: string;
  password?: string;
}

export type UpdateOptions = {
  new?: boolean;
  upsert?: boolean;
};

export interface IBaseRepository<T> {
  create(entity: Partial<T>): Promise<T>;
  updateById(id: string, doc: Partial<T>): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;

  findOne(cond: FilterQuery<T & Document>): Promise<T>;
  findOneAndUpdate(
    cond: FilterQuery<T & Document>,
    doc: Partial<T>,
    options?: UpdateOptions
  ): Promise<T>;
  findMany(cond: FilterQuery<T & Document>): Promise<T[]>;
  findAll(
    cond: FilterQuery<T & Document>,
    option: Partial<FindAllOption>
  ): Promise<FindAllResponse<T>>;
}
