/* eslint-disable no-restricted-syntax */
import { createPlayerWorkletPort } from './port.worklet.js';
import {
  createPlayerWorkletRuntime,
  type PlayerWorkletRuntime,
} from './runtime.worklet.js';

export class PlayerProcessor
  extends AudioWorkletProcessor
  implements AudioWorkletProcessorImpl
{
  private readonly runtime: PlayerWorkletRuntime;
  constructor() {
    super();
    const port = createPlayerWorkletPort(this.port);
    this.runtime = createPlayerWorkletRuntime(port);
  }
  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    return this.runtime.process(outputs[0]);
  }
}
