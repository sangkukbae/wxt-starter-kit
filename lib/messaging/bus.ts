import { browser } from 'wxt/browser';

import type { MessageTopics, MessagePayloads } from './schema';

type RuntimeMessageEnvelope = { topic: MessageTopics; payload: unknown };

function isRuntimeMessageEnvelope(value: unknown): value is RuntimeMessageEnvelope {
  return typeof value === 'object' && value !== null && 'topic' in value;
}

type RuntimeResponseEnvelope<T> = { ok: true; payload: T } | { ok: false; error: string };

type Handler<T extends MessageTopics> = (
  payload: MessagePayloads[T] extends { request: infer Req }
    ? Req
    : MessagePayloads[T] extends { payload: infer Pay }
      ? Pay
      : undefined,
) =>
  | Promise<MessagePayloads[T] extends { response: infer Res } ? Res : void>
  | (MessagePayloads[T] extends { response: infer Res } ? Res : void);

type Subscriber<T extends MessageTopics> = (message: {
  topic: T;
  payload: MessagePayloads[T] extends { payload: infer Pay }
    ? Pay
    : MessagePayloads[T] extends { response: infer Res }
      ? Res
      : unknown;
}) => void;

class MessageBus {
  private handlers = new Map<MessageTopics, Handler<MessageTopics>>();
  private subscribers = new Map<MessageTopics, Set<Subscriber<MessageTopics>>>();

  constructor() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isRuntimeMessageEnvelope(message)) {
        sendResponse({ ok: false, error: 'Invalid message' });
        return true;
      }

      const { topic, payload } = message;
      const maybeHandler = this.handlers.get(topic);

      if (!maybeHandler) {
        this.notify(topic, payload as Parameters<Subscriber<typeof topic>>[0]['payload']);
        sendResponse({ ok: true, payload: undefined });
        return true;
      }

      const typedHandler = maybeHandler as Handler<typeof topic>;

      Promise.resolve(typedHandler(payload as Parameters<Handler<typeof topic>>[0]))
        .then((result) => {
          sendResponse({ ok: true, payload: result });
        })
        .catch((error) => {
          console.error('[message-bus] handler error', error);
          sendResponse({ ok: false, error: String(error) });
        });

      return true;
    });
  }

  register<T extends MessageTopics>(topic: T, handler: Handler<T>): void {
    this.handlers.set(topic, handler as Handler<MessageTopics>);
  }

  async emit<T extends MessageTopics>(
    topic: T,
    payload?: MessagePayloads[T] extends { request: infer Req }
      ? Req
      : MessagePayloads[T] extends { payload: infer Pay }
        ? Pay
        : undefined,
  ): Promise<MessagePayloads[T] extends { response: infer Res } ? Res : void> {
    type ResponseType = MessagePayloads[T] extends { response: infer Res } ? Res : void;
    const response = (await browser.runtime.sendMessage({ topic, payload })) as
      | RuntimeResponseEnvelope<ResponseType>
      | undefined;
    if (response?.ok) {
      return response.payload;
    }
    throw new Error(response?.error ?? 'Unknown message error');
  }

  notify<T extends MessageTopics>(
    topic: T,
    payload: Parameters<Subscriber<T>>[0]['payload'],
  ): void {
    const listeners = this.subscribers.get(topic);
    if (!listeners?.size) return;

    const envelope = { topic, payload } as Parameters<Subscriber<T>>[0];

    listeners.forEach((listener) => {
      try {
        (listener as Subscriber<T>)(envelope);
      } catch (error) {
        console.error('[message-bus] subscriber failure', error);
      }
    });
  }

  subscribe<T extends MessageTopics>(topic: T, subscriber: Subscriber<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    const bucket = this.subscribers.get(topic)!;
    bucket.add(subscriber as Subscriber<MessageTopics>);
    return () => bucket.delete(subscriber as Subscriber<MessageTopics>);
  }
}

export const messageBus = new MessageBus();
