import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedQuizGameEntities1706334856386
  implements MigrationInterface
{
  name = 'CreatedQuizGameEntities1706334856386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quiz_games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "pair_created_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "start_game_date" TIMESTAMP WITH TIME ZONE, "finish_game_date" TIMESTAMP WITH TIME ZONE, "finishing_expiration_date" TIMESTAMP WITH TIME ZONE, "playerOneId" uuid, "playerTwoId" uuid, CONSTRAINT "REL_c76779ee9ba962b7dff24c4c74" UNIQUE ("playerOneId"), CONSTRAINT "REL_2a6fc666de40ae1bcce54cd055" UNIQUE ("playerTwoId"), CONSTRAINT "PK_662adf6950bee0fca58585a52a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying NOT NULL, "correct_answers" jsonb NOT NULL DEFAULT '[]', "published" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ec0447fd30d9f5c182e7653bfd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "answer_status" character varying NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "playerId" uuid, "questionId" uuid, CONSTRAINT "PK_3fefbc8a840a41b6a15a4f9ca5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer NOT NULL, "userId" integer, CONSTRAINT "PK_ee917f657868b9fd80aa5c13f19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_games" ADD CONSTRAINT "FK_c76779ee9ba962b7dff24c4c740" FOREIGN KEY ("playerOneId") REFERENCES "quiz_players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_games" ADD CONSTRAINT "FK_2a6fc666de40ae1bcce54cd0553" FOREIGN KEY ("playerTwoId") REFERENCES "quiz_players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answers" ADD CONSTRAINT "FK_aed21e4153bb7722fdd14d779bf" FOREIGN KEY ("playerId") REFERENCES "quiz_players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answers" ADD CONSTRAINT "FK_78f9544421d6fd1dfa11b1f5f37" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_players" ADD CONSTRAINT "FK_b6f6392f79305291b1992c91cd3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_players" DROP CONSTRAINT "FK_b6f6392f79305291b1992c91cd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answers" DROP CONSTRAINT "FK_78f9544421d6fd1dfa11b1f5f37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_answers" DROP CONSTRAINT "FK_aed21e4153bb7722fdd14d779bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_games" DROP CONSTRAINT "FK_2a6fc666de40ae1bcce54cd0553"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_games" DROP CONSTRAINT "FK_c76779ee9ba962b7dff24c4c740"`,
    );
    await queryRunner.query(`DROP TABLE "quiz_players"`);
    await queryRunner.query(`DROP TABLE "quiz_answers"`);
    await queryRunner.query(`DROP TABLE "quiz_questions"`);
    await queryRunner.query(`DROP TABLE "quiz_games"`);
  }
}
