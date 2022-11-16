
import e = require('express');
import { GameState, Card } from './GameState';

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
    if(this.isPair(this.findMe(gameState).hole_cards)){
      betCallback(gameState.minimum_raise);
    } else {
      betCallback(0);
    }
    betCallback(gameState.minimum_raise);
  }

  isPair(card: Card[]): Boolean{
    return card[0].suit === card[1].suit || card[0].rank === card[1].rank
  }

  potBet(gameState: GameState): number {
    // pot + all players minus us )*2
    let allPlayers = 0;
    gameState.players.forEach(player => {
      if(player.hole_cards?.length === 0){
        allPlayers += player.bet
      }
    });
    const bet = (gameState.pot + allPlayers)*2;
    return bet;
  }

  public showdown(gameState: any): void {

  }

  findMe(gameState: GameState){
    return gameState.players[gameState.in_action];
  }

  rank(gameState:GameState): number {
    let holeCards = this.findMe(gameState).hole_cards;
    let community_cards = gameState.community_cards;
    if (this.straighFlush(holeCards, community_cards)) {
    } else if (this.fourOfAKind(holeCards, community_cards)) {
    } else if (this.fullHouse(holeCards, community_cards)) {

    } else if (this.flush(holeCards, community_cards)) {
    } else if (this.straight(holeCards, community_cards)) {
    } else if (this.tripple(holeCards, community_cards)) {
    } else if (this.twopair(holeCards, community_cards)) {
    } else if (this.onepair(holeCards, community_cards)) {

    }
    return 0;
  }

  straighFlush(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  fourOfAKind(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  fullHouse(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  flush(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  straight(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  tripple(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  twopair(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  onepair(holeCards: Card[], community_cards: Card[]): boolean {

    return false;
  }

};

export default Player;
function straighFlush(holeCards: Card[], community_cards: Card[]) {
  throw new Error('Function not implemented.');
}

function fourOfAKind(holeCards: Card[], community_cards: Card[]) {
  throw new Error('Function not implemented.');
}

