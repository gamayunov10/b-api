import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostMainImageEntity1709298884038
  implements MigrationInterface
{
  name = 'CreatePostMainImageEntity1709298884038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_main_images" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" bigint NOT NULL, "postId" integer, CONSTRAINT "PK_9cf332b5df95a02f1fd382a46c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_main_images" ADD CONSTRAINT "FK_1d9251614ab443b70d1bd2855a2" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_main_images" DROP CONSTRAINT "FK_1d9251614ab443b70d1bd2855a2"`,
    );
    await queryRunner.query(`DROP TABLE "post_main_images"`);
  }
}
