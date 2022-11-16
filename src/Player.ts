export class Player {
  public betRequest(gameState: any, betCallback: (bet: number) => void): void {
    betCallback(gameState.current_buy_in - gameState.players.in_action.bet + gameState.minimum_raise);
  }

  public showdown(gameState: any): void {

  }
};

export default Player;
