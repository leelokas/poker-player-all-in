
import { GameState } from './GameState';
export class Player {
  public betRequest(gameState: GameState, betCallback: (bet: number) => void): void {
    console.log('Game state is:', gameState);
    betCallback(gameState.current_buy_in + gameState.minimum_raise);
    if (gameState.community_cards && gameState.community_cards.length < 1) {
      this.preflop(gameState, betCallback);
    } else {
      betCallback(gameState.current_buy_in + gameState.minimum_raise);
    }
  }

  preflop(gameState: GameState, betCallback: (bet: number) => void) {
    betCallback(gameState.minimum_raise);
  }

  potBet(gameState: GameState): number {
    return gameState.minimum_raise;
  }

  public showdown(gameState: any): void {

  }
};

export default Player;
