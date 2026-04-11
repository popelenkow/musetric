import { createCallEvery } from './callEvery.js';

type MessagePortLike = {
  // eslint-disable-next-line no-restricted-syntax
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent<unknown>) => unknown) | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortMethods = Record<string, (message: any) => unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyPortMethods = {};

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

const bindMethods = <Methods extends PortMethods>(
  instance: MessagePortLike,
  handlers: Methods,
) => {
  const onmessage = async (event: MessageEvent<PortMessage<Methods>>) => {
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
};

export type TypedMessagePort<
  Port extends MessagePortLike,
  Methods extends PortMethods,
  HandlerMethods extends PortMethods,
> = {
  instance: Port;
  methods: Methods;
  bindBoot: (boot: HandlerMethods['boot']) => void;
  bindMethods: (handlers: Omit<HandlerMethods, 'boot'>) => void;
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
    bindBoot: (boot) => bindMethods(instance, { boot }),
    bindMethods: (handlers) => bindMethods(instance, handlers),
  };
};
