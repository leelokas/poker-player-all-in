
import { GameState } from './GameState';
export class Player {
  public betRequest(gameState: GameState, betCallback: (bet: number) => void): void {
    betCallback(gameState.current_buy_in + gameState.minimum_raise);
  }

  public showdown(gameState: any): void {

  }
};

export default Player;
