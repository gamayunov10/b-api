import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTgBlogSubscriberEntity1709545545264
  implements MigrationInterface
{
  name = 'AddTgBlogSubscriberEntity1709545545264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tg_blog_subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscribe_status" character varying NOT NULL, "telegram_code" uuid, "telegram_id" bigint, "blogId" integer, "userId" integer, CONSTRAINT "PK_7823bb62f59327ccc4cee8f867c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tg_blog_subscribers" ADD CONSTRAINT "FK_dae0877e6553c0b3c2e3ef4f7c2" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tg_blog_subscribers" ADD CONSTRAINT "FK_92a05887f931a138be73131ccdc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tg_blog_subscribers" DROP CONSTRAINT "FK_92a05887f931a138be73131ccdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tg_blog_subscribers" DROP CONSTRAINT "FK_dae0877e6553c0b3c2e3ef4f7c2"`,
    );
    await queryRunner.query(`DROP TABLE "tg_blog_subscribers"`);
  }
}
