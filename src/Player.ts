
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
    console.log("Preflop: " + shortHanded + " " + me.bet) ;
    if (me.bet > (gameState.small_blind*2)) {
      // 3bet
      if (this.is3Bet(me.hole_cards, shortHanded)) {
        console.log("Preflop 3bet bet: " + this.potBet(gameState)) ;
        betCallback(this.potBet(gameState));
      } else if (this.isPair(me.hole_cards) || (this.hasAce(me.hole_cards) && this.hasKing(me.hole_cards)) {
        console.log("Preflop 3bet call: " + this.checkCallAmount(gameState)) ;
        betCallback(this.checkCallAmount(gameState));
      } else {
        // call
        console.log("Preflop 3bet fold: " + this.checkCallAmount(gameState)) ;
        betCallback(0);
      }
    } else {
      console.log("Preflop bet: " + shortHanded + " " + me.bet) ;
      if(this.isPreflopBetHand(this.findMe(gameState).hole_cards, shortHanded)){
        betCallback(this.potBet(gameState));
      } else {
        betCallback(0);// fold
      }
    }
  }

  isPair(card: Card[]) : boolean {
    return card[0].rank === card[1].rank
  }

  is3Bet(card: Card[], shorhanded: boolean) {
    if (shorhanded) {
      return this.isPair(card) || (this.hasAce(card) && this.hasKing(card));
    }
    return this.isPair(card) && this.isJQKA(card[0]) && this.isJQKA(card[1]);
  }

  isPreflopBetHand(card: Card[], shortHanded: boolean): Boolean{
    return this.isJQKA(card[0]) && this.isJQKA(card[1])
        || this.isPair(card)
        || (this.hasAce(card) && this.isSuited(card))
        || (shortHanded && this.hasPaint(card))
        || (shortHanded && this.is9OrBetter(card[0]) && this.is9OrBetter(card[1]));
  }

  isSuited(card: Card[]): boolean{
    return card[0].suit === card[1].suit;
  }

  hasKing(card: Card[]): boolean{
    return card[0].rank === "K" || card[1].rank === "K";
  }

  hasPaint(card: Card[]): boolean{
    return this.isJQKA(card[0]) || this.isJQKA(card[1])
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

  isDealerOrSmallBtnAndOnlyOneLeft(gameState: GameState): boolean{
    return (gameState.dealer === gameState.in_action
      || (gameState.dealer+1)%(gameState.players.length) === gameState.in_action)
      && this.onlyOneLeft(gameState);
  }

  private onlyOneLeft(gameState: GameState) {
    return gameState.players.filter(player => {
      player.status === "active";
    }).length === 1;
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
    return this.straight(holeCards, community_cards) && this.flush(holeCards, community_cards);
  }
  fourOfAKind(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    return ranks.length === 4;
  }
  fullHouse(holeCards: Card[], community_cards: Card[]): boolean {
    const allCards = holeCards.concat(community_cards);
    if (allCards.length < 5) {
      return false;
    }
    const ranks = this.mapRanks(holeCards, community_cards); // E.g. ['1', '1', 'A', 'A', 'A', '2']
    let countRanks = {}; // E.g. {'1': 2, '2': 1, 'A': 3}
    for (let rank of ranks){
      countRanks[rank] = (countRanks[rank] || 0) + 1;
    }
    const vals = Object.keys(countRanks).map(key => countRanks[key]).sort(); // [1, 2, 3]
    return (vals.indexOf(2) > -1 && vals.indexOf(3) > -1);
  }

  flush(holeCards: Card[], community_cards: Card[]): boolean {
    const suits = this.mapSuits(holeCards, community_cards);
    return this.mapFlush(suits);
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

  /**
   * Returns true when there are exactly 2 pairs
   * @param holeCards
   * @param community_cards
   */
  twopair(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards); // E.g. ['1', '1', 'A', '2', 'Q', '2']
    let countRanks = {}; // E.g. {'1': 2, '2': 2, 'A': 1, 'Q': 1}
    for (let rank of ranks){
      countRanks[rank] = (countRanks[rank] || 0) + 1;
    }
    const vals = Object.keys(countRanks).map(key => countRanks[key]).sort(); // [1, 1, 2, 2]
    return vals.filter(val => val === 2).length === 2;
  }

  /**
   * Returns true when there's exactly 1 pair, excluding community card pairs
   * @param holeCards
   * @param community_cards
   */
  onepair(holeCards: Card[], community_cards: Card[]): boolean {
    const ranks = this.mapRanks(holeCards, community_cards);
    if (this.hasPair(holeCards)) {
      return true;
    }
    if (this.hasPair(ranks)) {
      return !this.hasPair(community_cards);
    }
    return false;
  }

  /**
   * Returns true when there's exactly 1 pair
   * @param ranks
   */
  hasPair(ranks) {
    let countRanks = {}; // E.g. {'1': 1, '2': 2, 'A': 1, 'Q': 1, '5': 1}
    for (let rank of ranks){
      countRanks[rank] = (countRanks[rank] || 0) + 1;
    }
    const vals = Object.keys(countRanks).map(key => countRanks[key]).sort(); // [1, 1, 1, 1, 2]
    return vals.filter(val => val === 2).length === 1;
  }

  /**
   * Return array of strings with rank of each card
   * @param holeCards
   * @param community_cards
   * @private
   */
  private mapRanks(holeCards: Card[], community_cards: Card[]): string[] {
    const allCards = holeCards.concat(community_cards);
    return allCards.map(card => card.rank);
  }

  private mapSuits(holeCards: Card[], community_cards: Card[]) {
    const allCards = holeCards.concat(community_cards);
    return allCards.map(card => card.suit);
  }

  private mapFlush(suits): boolean{
    let coincidences = [0,0,0,0];
    suits.forEach(suit => {
      if(suit==='spades'){
        coincidences[0] += 1;
      }else if(suit==='hearts'){
        coincidences[1] += 1;
      }else if(suit==='diamonds'){
        coincidences[2] += 1;
      }if(suit==='clubs'){
        coincidences[3] += 1;
      }
    });
    return (coincidences.filter(c => c >= 5).length > 0);
  }

};

