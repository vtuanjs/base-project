import { FilterQuery, Document } from 'mongoose';

export type FindAllOption = {
  fields: string;
  limit: number;
  page: number;
  sort: any;
};

export type FindAllResponse<T> = {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  data: T[];
};

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
