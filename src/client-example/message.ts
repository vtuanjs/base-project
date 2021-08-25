import { makeRequestConfig, sendRequest } from './common';

export interface IClientMessageParam {
  recipient: {
    id: string;
  };
  message: IClientMessageRequest;
  options: {
    message_tag: 'CONFIRMED_EVENT_UPDATE';
  };
}

export interface IClientMessageResponse {
  recipient_id: string;
  message_id: string;
}

export interface IClientMessageRequestButton {
  title: string;
  value: string;
  payload?: {
    goToBlock: string;
  };
}

export interface IClientMessageRequest {
  text?: string;
  buttons?: IClientMessageRequestButton[];
}

export function sendClientMessage(param: {
  accessToken: string;
  message: Partial<IClientMessageParam>;
  delay?: number;
}): Promise<IClientMessageResponse> {
  const { accessToken, message, delay } = param;
  const config = makeRequestConfig({
    path: `/messages`,
    method: 'POST',
    accessToken,
    data: message,
    delay
  });

  return sendRequest(config);
}
