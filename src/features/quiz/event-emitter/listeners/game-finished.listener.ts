import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { GameFinishedEvent } from '../events/game-finished.event';
import { GameRepository } from '../../infrastructure/game.repository';

@Injectable()
export class GameFinishedListener {
  constructor(private readonly gameRepository: GameRepository) {}

  @OnEvent('game.finished')
  handleGameFinished(event: GameFinishedEvent) {
    const { gameId, expDate, date } = event;

    if (expDate !== null && date < expDate) {
      setTimeout(async () => {
        await this.gameRepository.finishGame(gameId, expDate);
      }, 10000);
    }
  }
}
