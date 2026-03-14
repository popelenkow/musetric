import {
  createMessageHandler,
  type MessageHandlers,
} from './messageHandler.js';

type MessagePortLike = {
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: unknown, transfer: Transferable[]): void;
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  onmessage: ((event: MessageEvent<unknown>) => unknown) | null;
};

export type TypedMessagePort<Port extends MessagePortLike, In, Out> = Omit<
  Port,
  'postMessage' | 'onmessage'
> & {
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: Out, transfer: Transferable[]): void;
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: Out, options?: StructuredSerializeOptions): void;
  onmessage: ((this: Port, event: MessageEvent<In>) => unknown) | null;
};

export const wrapMessagePort = <Port extends MessagePortLike>(port: Port) => ({
  typed: <In, Out>(): TypedMessagePort<Port, In, Out> =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    port as TypedMessagePort<Port, In, Out>,
});

export const createPortMessageHandler = <Message extends { type: string }>(
  handlers: MessageHandlers<Message>,
) => {
  const handle = createMessageHandler(handlers);
  return async (event: MessageEvent<Message>): Promise<void> => {
    const ok = await handle(event.data);
    if (!ok) {
      console.error('Unhandled port message type', {
        type: event.data.type,
        expectedTypes: Object.keys(handlers),
        message: event.data,
      });
    }
  };
};
