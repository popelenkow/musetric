import { playerProcessorName } from '@musetric/audio/player';
import { PlayerProcessor } from '@musetric/audio/player/worklet';

registerProcessor(playerProcessorName, PlayerProcessor);
