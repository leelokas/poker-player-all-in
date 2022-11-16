
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
    const shortHanded = gameState.players.length < 4;
    if (me.bet > (gameState.small_blind*2)) {
      // 3bet
      if (this.is3Bet(me.hole_cards, shortHanded)) {
        betCallback(this.potBet(gameState));
      } else {
        // call
        betCallback(this.checkCallAmount(gameState));
      }
    } else {
      if(this.isPreflopBetHand(this.findMe(gameState).hole_cards, shortHanded)){
        betCallback(this.potBet(gameState));
      } else {
        betCallback(0);// fold
      }
    }
  }

  is3Bet(card: Card[], shorhanded: boolean) {
    if (shorhanded) {
      return card[0].rank === card[1].rank;
    }
    return card[0].rank === card[1].rank && this.isJQKA(card[0]) && this.isJQKA(card[1]);
  }

  isPreflopBetHand(card: Card[], shortHanded: boolean): Boolean{
    return this.isJQKA(card[0]) && this.isJQKA(card[1])
        || this.is3Bet(card, shortHanded)
        || (this.hasAce(card) && this.isSuited(card))
        || (shortHanded && this.hasAce(card))
        || (shortHanded && this.hasKing(card) && this.isSuited(card))
        || (shortHanded && this.is9OrBetter(card[0]) && this.is9OrBetter(card[1]));
  }

  isSuited(card: Card[]): boolean{
    return card[0].suit === card[1].suit;
  }

  hasKing(card: Card[]): boolean{
    return card[0].rank === "K" || card[1].rank === "K";
  }

  hasAce(card: Card[]): boolean{
    return card[0].rank === "A" || card[1].rank === "A";
  }

  is9OrBetter(card: Card): boolean {
    return this.isJQKA(card) || card.rank === '10' || card.rank === '9';
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
    } else if (this.threeOfAKind(holeCards, community_cards)) {
      return 50;
    } else if (this.twopair(holeCards, community_cards)) {
      return 40;
    } else if (this.onepair(holeCards, community_cards)) {
      if(this.isJQKA(this.findMe(gameState).hole_cards[0])
      || this.isJQKA(this.findMe(gameState).hole_cards[1])){
        return 35;
      }
      return 30; 
    }
    return 0;
  }

  straighFlush(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  fourOfAKind(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    return ranks.length === 4;
  }
  fullHouse(holeCards: Card[], community_cards: Card[]): boolean {
    const allCards = holeCards.concat(community_cards);
    if (allCards.length < 5 || !this.threeOfAKind(holeCards, community_cards)) {
      false;
    }
    // TODO
    return false;
  }
  flush(holeCards: Card[], community_cards: Card[]): boolean {
    return false;
  }
  straight(holeCards: Card[], community_cards: Card[]): boolean {
    let mapped  = [];
    const allCards = holeCards.concat(community_cards);
    allCards.forEach(c => {
      if (c.rank === 'J') {
        mapped.push(11);
      } else if (c.rank === 'Q') {
          mapped.push(12);
      } else if (c.rank === 'K') {
          mapped.push(13);
      } else if (c.rank === 'A') {
          mapped.push(14);
      } else {
        mapped.push(Number(c.rank))
      }
    });
    mapped.sort((a,b)=>a-b);
    let curr = mapped[0];
    let count  = 1;
    for (let i = 1; i< mapped.length; i++) {
      const r = mapped[i];
      if (curr === r || (curr+1) === r) {
        count++
      } else {
        count = 1;
      }
      curr = r;
    }
    return count > 4;
  }
  threeOfAKind(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    let threeOfAKindFound = false;
    ranks.forEach(rank => {
      if(countOccurrences(ranks, rank) >= 3){
        threeOfAKindFound = true;
      }
    });
    return threeOfAKindFound;
  }
  twopair(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    return ranks.filter((item, index) => ranks.indexOf(item) != index).length === 2;
  }
  onepair(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    return ranks.filter((item, index) => ranks.indexOf(item) != index).length >= 1;
  }

  private mapRanks(holeCards: Card[], community_cards: Card[]) {
    const allCards = holeCards.concat(community_cards);
    return allCards.map(card => card.rank);
  }
};

