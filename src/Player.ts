
import e = require('express');
import { GameState, Card } from './GameState';

export class Player {
  public betRequest(gameState: GameState, betCallback: (bet: number) => void): void {
    console.log('Game state is:', gameState);
    if (gameState.community_cards && gameState.community_cards.length < 1) {
      this.preflop(gameState, betCallback);
    } else {
      this.postFlop(gameState, betCallback);
    }
  }
  
  postFlop(gameState: GameState, betCallback: (bet: number) => void) {
    let r = this.rank(gameState);
    if (r > 30) {
      betCallback(this.potBet(gameState));
    } else if (r > 0) {
      betCallback(this.checkCallAmount(gameState));
    } else {
      betCallback(0);
    }
  }

  preflop(gameState: GameState, betCallback: (bet: number) => void) {
    let me = this.findMe(gameState);
    if (me.bet > (gameState.small_blind*2)) {
      // 3bet
      if (me.hole_cards[0].rank === me.hole_cards[1].rank) {
        betCallback(this.potBet(gameState));
      } else {
        betCallback(this.checkCallAmount(gameState));        
      }
    } else {
      if(this.isPreflopBetHand(this.findMe(gameState).hole_cards)){
        betCallback(this.potBet(gameState));
      } else {
        betCallback(0);
      }  
    }
  }

  isPreflopBetHand(card: Card[]): Boolean{
    return this.isJQKA(card[0]) && this.isJQKA(card[1])
        || card[0].rank === card[1].rank
  }

  isJQKA(card: Card): boolean{
    return card.rank === "J"
        || card.rank === "Q"
        || card.rank === "K"
        || card.rank === "A";
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

  checkCallAmount(gameState: GameState): number {
    return gameState.current_buy_in - this.findMe(gameState).bet;
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
      return 100;
    } else if (this.fourOfAKind(holeCards, community_cards)) {
      return 90;
    } else if (this.fullHouse(holeCards, community_cards)) {
      return 80;
    } else if (this.flush(holeCards, community_cards)) {
      return 70;
    } else if (this.straight(holeCards, community_cards)) {
      return 60;
    } else if (this.tripple(holeCards, community_cards)) {
      return 50;
    } else if (this.twopair(holeCards, community_cards)) {
      return 40;
    } else if (this.onepair(holeCards, community_cards)) {
      return 30;
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
    const ranks = this.mapRanks(holeCards, community_cards);
    return ranks.length === 3;
  }
  twopair(holeCards: Card[], community_cards: Card[]): boolean {
    const pairs = this.mapRanks(holeCards, community_cards);
    return pairs.length === 2;
  }
  onepair(holeCards: Card[], community_cards: Card[]): boolean {
    const pairs = this.mapRanks(holeCards, community_cards);
    return pairs.length >= 1;
  }

  private mapRanks(holeCards: Card[], community_cards: Card[]) {
    const allCards = holeCards.concat(community_cards);
    const ranks = allCards.map(card => card.rank);
    return ranks.filter((item, index) => ranks.indexOf(item) != index);
  }
};

export default Player;
function straighFlush(holeCards: Card[], community_cards: Card[]) {
  throw new Error('Function not implemented.');
}

function fourOfAKind(holeCards: Card[], community_cards: Card[]) {
  throw new Error('Function not implemented.');
}

