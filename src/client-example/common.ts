import axios, { Method } from 'axios';
// import axiosRetry from 'axios-retry';
import {
  ClientError,
  ClientNotFoundError,
  ClientUnauthorizedError,
  ClientInvalidArgError,
  ClientPermissionDeniedError
} from './errors';

// axiosRetry(axios, { retries: 3 });
const BASE_API = 'https://apis.client.com/v1';
const DELAY = 0;

export function makeRequestConfig(param: {
  path: string;
  method: Method;
  accessToken: string;
  data?: any;
  rootField?: string;
  delay?: number;
  query?: string;
}): {
  url: string;
  method: Method;
  headers: any;
  data: any;
  rootField: string;
  delay: number;
} {
  let url = `${BASE_API}${param.path}`;
  if (typeof param.query === 'string') {
    url += `?${param.query}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Beare ${param.accessToken}`
  };

  return {
    url,
    method: param.method,
    headers,
    data: param.data,
    rootField: param.rootField,
    delay: param.delay
  };
}

export async function sendRequest({
  url,
  method,
  headers,
  data,
  rootField,
  delay = DELAY
}: {
  url?: string;
  method: Method;
  headers: any;
  data?: any;
  rootField?: string;
  delay?: number;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios({ url, method, headers, data })
        .then((response: any) => {
          resolve(handleResponse(response, rootField));
        })
        .catch((error: any) => {
          handleError(error);
        })
        .catch((error: any) => {
          reject(error);
        });
    }, delay);
  });
}

function handleResponse(response: any, rootField?: string) {
  if (typeof rootField === 'string') {
    return response.data[rootField];
  }
  return response.data;
}

function handleError(error: any) {
  if (error.response) {
    const status = error.response.status;
    const message = error.response?.data?.message || error.response.statusText;
    switch (status) {
      case 401:
        throw new ClientUnauthorizedError(message);
      case 403:
        throw new ClientPermissionDeniedError(message);
      case 404:
        throw new ClientNotFoundError(message);
      case 422: {
        throw new ClientInvalidArgError(message);
      }
      default:
        throw new ClientError(message);
    }
  }

  throw new ClientError();
}
