import { createCallEvery } from './callEvery.js';

type MessagePortLike = {
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent<unknown>) => unknown) | null;
};

type PortMethods = Record<string, (...args: never[]) => unknown>;

type PortMessage<Methods extends PortMethods> = {
  [Type in keyof Methods]: {
    type: Type;
    payload: Parameters<Methods[Type]>[0];
  };
}[keyof Methods];

type PortTransfers<Methods extends PortMethods> = Partial<{
  [Type in keyof Methods]: (
    payload: Parameters<Methods[Type]>[0],
  ) => Transferable[];
}>;

const createPortMethods = <Methods extends PortMethods>(
  instance: MessagePortLike,
  methodKeys: readonly (keyof Methods)[],
  transfers: PortTransfers<Methods>,
): Methods => {
  const methods: Partial<Record<keyof Methods, unknown>> = {};

  for (const type of methodKeys) {
    methods[type] = (...args: Parameters<Methods[typeof type]>) => {
      const payload = args[0];
      const transfer = transfers[type]?.(payload);
      instance.postMessage({ type, payload }, transfer);
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return methods as Methods;
};

export type TypedMessagePort<
  Port extends MessagePortLike,
  Methods extends PortMethods,
  HandlerMethods extends PortMethods,
> = {
  instance: Port;
  methods: Methods;
  bindMethods: (handlers: HandlerMethods) => void;
};

export const createTypedPort = <
  Port extends MessagePortLike,
  Methods extends PortMethods,
  HandlerMethods extends PortMethods,
>(
  instance: Port,
  methodKeys: readonly (keyof Methods)[],
  methodTransfers: PortTransfers<Methods> = {},
): TypedMessagePort<Port, Methods, HandlerMethods> => {
  return {
    instance,
    methods: createPortMethods(instance, methodKeys, methodTransfers),
    bindMethods: (handlers) => {
      const onmessage = async (
        event: MessageEvent<PortMessage<HandlerMethods>>,
      ) => {
        const message = event.data;
        const handler = handlers[message.type];
        if (!handler) {
          console.error('Unhandled port method', message);
          return;
        }
        const { payload } = message;
        await handler(payload);
      };
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      instance.onmessage = createCallEvery(
        onmessage,
      ) as MessagePortLike['onmessage'];
    },
  };
};
