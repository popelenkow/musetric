/* eslint-disable no-restricted-syntax */
import {
  playerChannel,
  playerDataChannel,
  playerProcessorName,
} from '@musetric/audio/player';
import { createPlayerRuntime } from '@musetric/audio/player/worklet';

export class PlayerProcessor
  extends AudioWorkletProcessor
  implements AudioWorkletProcessorImpl
{
  constructor() {
    super();
    const port = playerChannel.inbound(this.port);
    port.bindBoot((message) => {
      const runtime = createPlayerRuntime({
        port,
        dataPort: playerDataChannel.inbound(message.dataPort),
      });
      this.handleProcess = (output: Float32Array[]) => {
        runtime.process(output);
        return true;
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleProcess = (_output: Float32Array[]) => {
    return true;
  };

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    return this.handleProcess(outputs[0]);
  }
}

registerProcessor(playerProcessorName, PlayerProcessor);
