import { messageBus } from './bus';
import type { MessageTopics, MessagePayloads } from './schema';

class MessageClient {
  emit<T extends MessageTopics>(
    topic: T,
    payload?: MessagePayloads[T] extends { request: infer Req }
      ? Req
      : MessagePayloads[T] extends { payload: infer Pay }
        ? Pay
        : undefined,
  ) {
    return messageBus.emit(topic, payload);
  }

  on<T extends MessageTopics>(
    topic: T,
    callback: (message: {
      topic: T;
      payload: MessagePayloads[T] extends { payload: infer Pay }
        ? Pay
        : MessagePayloads[T] extends { response: infer Res }
          ? Res
          : unknown;
    }) => void,
  ) {
    return messageBus.subscribe(topic, callback);
  }
}

export const messageClient = new MessageClient();
