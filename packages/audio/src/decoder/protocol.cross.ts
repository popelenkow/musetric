export type DecoderCommandMethods = {
  boot: (message: {
    playerPort: MessagePort;
    spectrogramPort: MessagePort;
  }) => void;
  mount: (message: { projectId: number; sampleRate: number }) => void;
  unmount: () => void;
};

export type DecoderEventMethods = {
  state: (message: { status: 'error' }) => void;
  mounted: (message: { frameCount: number }) => void;
  unmounted: () => void;
};
