export interface ICache {
  getAsync: (key: string) => Promise<string>;
  setAsync: (
    key: string,
    value: string,
    mode?: 'EX' | 'PX' | 'KEEPTTL',
    duration?: number
  ) => Promise<unknown>;
  delAsync: (key: string) => Promise<number>;
  expireAsync: (key: string, second: number) => Promise<number>;
  incrByAsync: (key: string, increment: number) => Promise<number>;
  decrByAsync: (key: string, decrement: number) => Promise<number>;
}
