
export class gameState{
    tournamentId: string;
    gameId: string;
    round: number;
    betIndex: number;
    smallBlind: number;
    currentBuyIn:number;
    pot: number;
    minimumRais: number;
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