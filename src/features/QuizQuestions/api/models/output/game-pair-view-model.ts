import { GameStatuses } from '../../../../../base/enums/game-statuses';

import { GamePlayerProgressViewModel } from './game-player-progress-view-model';
import { QuestionViewModel } from './question-view-model';

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel;
  questions: QuestionViewModel[] | null;
  status: GameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
