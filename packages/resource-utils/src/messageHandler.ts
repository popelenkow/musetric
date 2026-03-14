export type MessageHandler<Message, Type> = (
  message: Extract<Message, { type: Type }>,
) => void | Promise<void>;

export type MessageHandlers<Message extends { type: string }> = {
  [Type in Message['type']]: MessageHandler<Message, Type>;
};

export const createMessageHandler = <Message extends { type: string }>(
  handlers: MessageHandlers<Message>,
) => {
  return (message: Message): boolean => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const type = message.type as keyof typeof handlers;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const handler = handlers[type] as (message: Message) => void;
    if (!handler) return false;
    handler(message);
    return true;
  };
};
