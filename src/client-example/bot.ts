import { makeRequestConfig, sendRequest } from './common';

export interface IBotResponse {
  id: string;
  name: string;
  team_name: string;
}

export function getBotStarBots(param: {
  accessToken: string;
  delay?: number;
}): Promise<IBotResponse[]> {
  const { accessToken, delay } = param;
  const config = makeRequestConfig({
    path: `/bots`,
    method: 'GET',
    accessToken,
    delay
  });
  return sendRequest(config);
}
