
import e = require('express');
import { GameState } from './GameState';
export class Player {
  public betRequest(gameState: GameState, betCallback: (bet: number) => void): void {
    console.log('Game state is:', gameState);
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
    // pot + all players minus us )*2
    let allPlayers = 0;
    gameState.players.forEach(player => {
      if(player.hole_cards.length == 0){
        allPlayers += player.bet
      }
    });
    const bet = (gameState.pot - allPlayers)*2
    return bet;
  }

  public showdown(gameState: any): void {

  }

  findMe(gameState: GameState){
    return gameState.players[gameState.in_action];
  }
};

export default Player;
