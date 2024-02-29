import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateManyToOneOnBlogEntityWithBlogMainImageEntity1709218061978
  implements MigrationInterface
{
  name = 'CreateManyToOneOnBlogEntityWithBlogMainImageEntity1709218061978';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_main_images" ADD "blogId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_main_images" ADD CONSTRAINT "FK_5c249b97815558de973fed20b98" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_main_images" DROP CONSTRAINT "FK_5c249b97815558de973fed20b98"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_main_images" DROP COLUMN "blogId"`,
    );
  }
}
