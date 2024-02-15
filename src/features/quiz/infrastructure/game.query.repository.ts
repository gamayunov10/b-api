import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { QuizGame } from '../domain/quiz-game.entity';
import { GameStatuses } from '../../../base/enums/game-statuses';
import { GamePairViewModel } from '../api/models/output/game-pair-view-model';
import { QuizPlayer } from '../domain/quiz-player';
import { AnswerViewModel } from '../api/models/output/answer-view-model';
import { QuizAnswer } from '../domain/quiz-answer.entity';
import { MyStatisticViewModel } from '../api/models/output/my-statistic-view-model';
import { GameQueryModel } from '../api/models/input/game.query.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { PlayerTopQueryModel } from '../api/models/input/player-top.query.model';
import { TopGamePlayerViewModel } from '../api/models/output/top-game-player-view-model';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly gameRepository: Repository<QuizGame>,
    @InjectRepository(QuizPlayer)
    private readonly playersRepository: Repository<QuizPlayer>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findCurrentGame(userId: number): Promise<GamePairViewModel> {
    const games = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatuses.PENDING_SECOND_PLAYER,
        active: GameStatuses.ACTIVE,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    const mappedGames = await this.gamesMapping(games);
    return mappedGames[0];
  }

  async getTop(
    query: PlayerTopQueryModel,
  ): Promise<Paginator<TopGamePlayerViewModel[]>> {
    const top = this.playersRepository
      .createQueryBuilder('pl')
      .select('pl.user', 'u_id')
      .addSelect('u.login', 'u_login')
      .addSelect((qb) => {
        return qb
          .select('sum(p.score)')
          .from(QuizPlayer, 'p')
          .where(`p.userId = pl.user`);
      }, 'sumScore')
      .addSelect((qb) => {
        return (
          qb
            .select(
              'case when avg("p"."score") % 1 = 0 then cast(avg("p"."score") as integer) else round(avg("p"."score"), 2) end',
            )
            // .select('round(avg("p"."score"), 2)')
            .from(QuizPlayer, 'p')
            .where(`p.userId = pl.user`)
        );
      }, 'avgScores')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`po.userId = pl.user or pt.userId = pl.user`);
      }, 'gamesCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score > pt.score or pt.userId = pl.user and pt.score > po.score)`,
          );
      }, 'winsCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score < pt.score or pt.userId = pl.user and pt.score < po.score)`,
          );
      }, 'lossesCount')
      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = pl.user or pt.userId = pl.user)`)
          .andWhere(
            `(po.userId = pl.user and po.score = pt.score or pt.userId = pl.user and pt.score = po.score)`,
          );
      }, 'drawsCount')
      .leftJoin('pl.user', 'u')
      .groupBy('u_id, u_login');

    const topResult = await this.addOrderByAndGet(top, query);

    const totalCount = await this.playersRepository
      .createQueryBuilder('pl')
      .select('count(distinct "userId")', 'pl_count')
      .getRawOne();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: Number(totalCount.pl_count),
      items: await this.topMapping(topResult),
    });
  }

  async findGameForConnection(
    userId: number,
    manager: EntityManager,
  ): Promise<QuizGame | null> {
    return manager
      .createQueryBuilder(QuizGame, 'game')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('pt.user', 'ptu')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatuses.PENDING_SECOND_PLAYER,
        active: GameStatuses.ACTIVE,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId,
      })
      .getOne();
  }

  async findGameById(gameId: number): Promise<GamePairViewModel> {
    try {
      const games = await this.gameRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.questions', 'gq')
        .leftJoinAndSelect('game.playerOne', 'po')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('po.answers', 'poa')
        .leftJoinAndSelect('poa.question', 'poaq')
        .leftJoinAndSelect('game.playerTwo', 'pt')
        .leftJoinAndSelect('pt.user', 'ptu')
        .leftJoinAndSelect('pt.answers', 'pta')
        .leftJoinAndSelect('pta.question', 'ptaq')
        .where(`game.id = :gameId`, {
          gameId: gameId,
        })
        .orderBy('gq.createdAt', 'DESC')
        .addOrderBy('poa.addedAt')
        .addOrderBy('pta.addedAt')
        .getMany();

      if (games.length === 0) {
        return null;
      }

      const mappedGames = await this.gamesMapping(games);
      return mappedGames[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findPlayerIdByUserId(userId: number): Promise<number | null> {
    const id = await this.dataSource
      .createQueryBuilder()
      .select(['p.id as id'])
      .from(QuizPlayer, 'p')
      .where('p.userId = :userId', {
        userId,
      })
      .execute();

    if (id.length === 0) {
      return null;
    }

    return id[0].id;
  }

  async findGameForAnswer(
    userId: number,
    manager: EntityManager,
  ): Promise<QuizGame | null> {
    return manager
      .createQueryBuilder(QuizGame, 'game')
      .setLock('pessimistic_write', undefined, ['game'])
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where('game.status = :active', {
        active: GameStatuses.ACTIVE,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId })
      .orderBy('gq.created_at', 'DESC')
      .addOrderBy('poa.added_at')
      .addOrderBy('pta.added_at')
      .getOne();
  }

  async findGameInfo(playerId: number): Promise<QuizGame | null> {
    return this.dataSource
      .createQueryBuilder()
      .select(['game.id', 'game.status', 'game.finishingExpirationDate'])
      .from(QuizGame, 'game')
      .where('(game.playerOneId = :playerId or game.playerTwoId = :playerId)', {
        playerId,
      })
      .getOne();
  }

  async findAnswerInGame(
    gameId: string,
    userId: string,
  ): Promise<AnswerViewModel> {
    const games = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: userId,
      })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    let answers = games[0].playerOne.answers;
    if (+games[0].playerTwo.user.id === +userId) {
      answers = games[0].playerTwo.answers;
    }

    const mappedAnswers = await this.answersMapping(answers);
    return mappedAnswers[mappedAnswers.length - 1];
  }

  async getStatistics(userId: number): Promise<MyStatisticViewModel> {
    const stats = await this.playersRepository
      .createQueryBuilder('p')
      .select('p.id', 'p_id')
      .addSelect('p.user', 'u_id')

      .addSelect((qb) => {
        return qb
          .select('sum(p.score)')
          .from(QuizPlayer, 'p')
          .where(`(p.userId = :userId)`, {
            userId,
          });
      }, 'sumScore')

      .addSelect((qb) => {
        return (
          qb
            .select(
              'case when avg("p"."score") % 1 = 0 then cast(avg("p"."score") as integer) else round(avg("p"."score"), 2) end',
            )
            // .select('round(avg("p"."score"), 2)')
            .from(QuizPlayer, 'p')
            .where(`(p.userId = :userId)`, {
              userId,
            })
        );
      }, 'avgScores')

      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId,
          });
      }, 'gamesCount')

      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId: userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score > pt.score or pt.userId = :userId and pt.score > po.score)`,
            {
              userId,
            },
          );
      }, 'winsCount')

      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score < pt.score or pt.userId = :userId and pt.score < po.score)`,
            {
              userId,
            },
          );
      }, 'lossesCount')

      .addSelect((qb) => {
        return qb
          .select('count(*)')
          .from(QuizGame, 'g')
          .leftJoin('g.playerOne', 'po')
          .leftJoin('g.playerTwo', 'pt')
          .where(`(po.userId = :userId or pt.userId = :userId)`, {
            userId,
          })
          .andWhere(
            `(po.userId = :userId and po.score = pt.score or pt.userId = :userId and pt.score = po.score)`,
            {
              userId,
            },
          );
      }, 'drawsCount')
      .leftJoin('p.user', 'u')
      .where(`u.id = :userId`, {
        userId,
      })
      .limit(1)
      .getRawMany();

    const mappedStats = await this.statsMapping(stats);
    return mappedStats[0];
  }

  async findMyGames(
    query: GameQueryModel,
    userId: number,
  ): Promise<Paginator<GamePairViewModel[]>> {
    const sortDirection = query.sortDirection.toUpperCase();

    const games = await this.gameRepository
      .createQueryBuilder('game')
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('po_score', pos, 'po_user_id', pouid, 'po_user_login', poul, 'po_answers', p_one_answers)
                       )`,
            )
            .from((qb) => {
              return qb
                .select(`pou.id`, 'pouid')
                .addSelect(`pou.login`, 'poul')
                .addSelect(`po.score`, 'pos')
                .addSelect(
                  (qb) =>
                    qb
                      .select(
                        `jsonb_agg(json_build_object('q_id', poaqid, 'a_status', poaas, 'a_added_at', to_char(
            poaaa::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
                         )`,
                      )
                      .from((qb) => {
                        return qb
                          .select(`a.questionId`, 'poaqid')
                          .addSelect(`a.playerId`, 'poapid')
                          .addSelect(`a.answerStatus`, 'poaas')
                          .addSelect(`a.addedAt`, 'poaaa')
                          .from(QuizAnswer, 'a')
                          .where('a.playerId = po.id')
                          .orderBy('poaaa');
                      }, 'poa_agg'),

                  'p_one_answers',
                )
                .from(QuizGame, 'g')
                .leftJoin('g.playerOne', 'po')
                .leftJoin('po.user', 'pou')
                .leftJoin('po.answers', 'poa')
                .leftJoin('poa.question', 'poaq')
                .where('g.id = game.id')
                .limit(1);
            }, 'p_one_agg'),
        'p_one',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('pt_score', pts, 'pt_user_id', ptuid, 'pt_user_login', ptul, 'pt_answers', p_two_answers)
                       )`,
            )
            .from((qb) => {
              return qb
                .select(`ptu.id`, 'ptuid')
                .addSelect(`ptu.login`, 'ptul')
                .addSelect(`pt.score`, 'pts')
                .addSelect(
                  (qb) =>
                    qb
                      .select(
                        `jsonb_agg(json_build_object('q_id', ptaqid, 'a_status', ptaas, 'a_added_at', to_char(
            ptaaa::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
                         )`,
                      )
                      .from((qb) => {
                        return qb
                          .select(`a.questionId`, 'ptaqid')
                          .addSelect(`a.playerId`, 'ptapid')
                          .addSelect(`a.answerStatus`, 'ptaas')
                          .addSelect(`a.addedAt`, 'ptaaa')
                          .from(QuizAnswer, 'a')
                          .where('a.playerId = pt.id')
                          .orderBy('ptaaa');
                      }, 'pta_agg'),

                  'p_two_answers',
                )
                .from(QuizGame, 'g')
                .leftJoin('g.playerTwo', 'pt')
                .leftJoin('pt.user', 'ptu')
                .leftJoin('pt.answers', 'pta')
                .leftJoin('pta.question', 'ptaq')
                .where('g.id = game.id')
                .limit(1);
            }, 'p_two_agg'),

        'p_two',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('q_id', qid, 'q_body', qbody)
                       )`,
            )
            .from((qb) => {
              return qb
                .select(`q.id`, 'qid')
                .addSelect(`q.body`, 'qbody')
                .addSelect(`q.createdAt`, 'qca')
                .from(QuizQuestion, 'q')
                .leftJoin('q.games', 'qg')
                .where('qg.id = game.id')
                .orderBy('qca', 'DESC');
            }, 'q_agg'),

        'questions',
      )
      .leftJoin('game.playerOne', 'po')
      .leftJoin('po.user', 'pou')
      .leftJoin('game.playerTwo', 'pt')
      .leftJoin('pt.user', 'ptu')
      .where('pou.id = :userId or ptu.id = :userId', {
        userId,
      })
      // .orderBy(`game."${query.sortBy}"`, `${query.sortDirection}`)
      .orderBy(`game."${query.sortBy}"`, sortDirection as 'ASC' | 'DESC')
      .addOrderBy(`game.pair_created_date`, 'DESC')
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .getRawMany();

    const totalCount = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where('(pou.id = :userId or ptu.id = :userId)', { userId })
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.gamesRawMapping(games),
    });
  }

  private async statsMapping(array: any[]): Promise<MyStatisticViewModel[]> {
    return array.map((a) => {
      return {
        sumScore: +a.sumScore,
        avgScores: +a.avgScores,
        gamesCount: +a.gamesCount,
        winsCount: +a.winsCount,
        lossesCount: +a.lossesCount,
        drawsCount: +a.drawsCount,
      };
    });
  }

  private async answersMapping(
    array: QuizAnswer[],
  ): Promise<AnswerViewModel[]> {
    return array.map((a) => {
      return {
        questionId: a.question.id.toString(),
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      };
    });
  }

  private async gamesMapping(games: QuizGame[]): Promise<GamePairViewModel[]> {
    let playersCount = 1;
    if (games[0].playerTwo) {
      playersCount = 2;
    }

    let secondPlayerProgress = null;
    let questions = null;

    return games.map((g) => {
      if (playersCount === 2) {
        secondPlayerProgress = {
          answers: g.playerTwo.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerTwo.user.id.toString(),
            login: g.playerTwo.user.login,
          },
          score: g.playerTwo.score,
        };
        questions = g.questions.map((q) => {
          return {
            id: q.id.toString(),
            body: q.body,
          };
        });
      }

      return {
        id: g.id.toString(),
        firstPlayerProgress: {
          answers: g.playerOne.answers.map((a) => {
            return {
              questionId: a.question.id.toString(),
              answerStatus: a.answerStatus,
              addedAt: a.addedAt,
            };
          }),
          player: {
            id: g.playerOne.user.id.toString(),
            login: g.playerOne.user.login,
          },
          score: g.playerOne.score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: g.status,
        pairCreatedDate: g.pairCreatedDate,
        startGameDate: g.startGameDate,
        finishGameDate: g.finishGameDate,
      };
    });
  }

  private async addOrderByAndGet(
    builder: SelectQueryBuilder<QuizPlayer>,
    query: PlayerTopQueryModel,
  ): Promise<any[]> {
    if (query?.sort?.length === 1) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query?.sort?.length === 2) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query?.sort?.length === 3) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query?.sort?.length === 4) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query?.sort?.length === 5) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .addOrderBy(`"${query.sort[4][0]}"`, query.sort[4][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    if (query?.sort?.length === 6) {
      return builder
        .orderBy(`"${query.sort[0][0]}"`, query.sort[0][1])
        .addOrderBy(`"${query.sort[1][0]}"`, query.sort[1][1])
        .addOrderBy(`"${query.sort[2][0]}"`, query.sort[2][1])
        .addOrderBy(`"${query.sort[3][0]}"`, query.sort[3][1])
        .addOrderBy(`"${query.sort[4][0]}"`, query.sort[4][1])
        .addOrderBy(`"${query.sort[5][0]}"`, query.sort[5][1])
        .limit(query.pageSize)
        .offset((query.pageNumber - 1) * query.pageSize)
        .getRawMany();
    }

    return builder
      .orderBy(`"avgScores"`, 'DESC')
      .addOrderBy(`"sumScore"`, 'DESC')
      .limit(query.pageSize)
      .offset((query.pageNumber - 1) * query.pageSize)
      .getRawMany();
  }

  private async gamesRawMapping(games: any[]): Promise<GamePairViewModel[]> {
    let secondPlayerProgress = null;
    let questions = null;
    let playerOneAnswers = [];
    let playerTwoAnswers = [];

    return games.map((g) => {
      let playersCount = 1;
      if (g.p_two) {
        playersCount = 2;
      }

      if (g.p_one[0].po_answers) {
        playerOneAnswers = g.p_one[0].po_answers?.map((a) => {
          return {
            questionId: a.q_id?.toString(),
            answerStatus: a.a_status,
            addedAt: a.a_added_at,
          };
        });
      }

      if (playersCount === 2) {
        if (g.p_two[0].pt_answers) {
          playerTwoAnswers = g.p_two[0].pt_answers?.map((a) => {
            return {
              questionId: a.q_id?.toString(),
              answerStatus: a.a_status,
              addedAt: a.a_added_at,
            };
          });
        }
        secondPlayerProgress = {
          answers: playerTwoAnswers,
          player: {
            id: g.p_two[0].pt_user_id?.toString(),
            login: g.p_two[0].pt_user_login,
          },
          score: g.p_two[0].pt_score,
        };
        questions = g.questions?.map((q) => {
          return {
            id: q.q_id.toString(),
            body: q.q_body,
          };
        });
      }

      return {
        id: g.game_id?.toString(),
        firstPlayerProgress: {
          answers: playerOneAnswers,
          player: {
            id: g.p_one[0].po_user_id?.toString(),
            login: g.p_one[0].po_user_login,
          },
          score: g.p_one[0].po_score,
        },
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: g.game_status,
        pairCreatedDate: g.game_pair_created_date,
        startGameDate: g.game_start_game_date,
        finishGameDate: g.game_finish_game_date,
      };
    });
  }

  private async topMapping(array: any[]): Promise<TopGamePlayerViewModel[]> {
    return array.map((a) => {
      return {
        gamesCount: +a.gamesCount,
        winsCount: +a.winsCount,
        lossesCount: +a.lossesCount,
        drawsCount: +a.drawsCount,
        sumScore: +a.sumScore,
        avgScores: +a.avgScores,
        player: {
          id: a.u_id?.toString(),
          login: a.u_login,
        },
      };
    });
  }
}
