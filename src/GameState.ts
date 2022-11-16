
export class GameState{
    tournamentId: string;
    gameId: string;
    round: number;
    betIndex: number;
    smallBlind: number;
    current_buy_in:number;
    pot: number;
    minimum_raise: number;
    dealer: number;
    orbits: number;
    inAction: number;
    players: {
        id: number;
        name: string;
        status: string;
        version: string;
        stack: number;
        bet: number;
    }
    communityCards: {
        rank: string;
        suit: string;
    }
}